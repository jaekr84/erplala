// src/components/FormArticulo.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ModalProveedor from '@/components/ModalProveedor'
import ModalCategoria from '@/components/ModalCategoria'

type Props = {
  modo?: 'modal' | 'page'
  onClose?: () => void
  onArticuloCreado?: () => void
}

export default function FormArticulo({ modo = 'page', onClose, onArticuloCreado }: Props) {
  const [codigo, setCodigo] = useState<number | null>(null)
  const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0])
  const [descripcion, setDescripcion] = useState('')
  const [proveedorId, setProveedorId] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [proveedores, setProveedores] = useState<{ id: number; nombre: string }[]>([])
  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([])
  const [modalProv, setModalProv] = useState(false)
  const [modalCat, setModalCat] = useState(false)
  const [costo, setCosto] = useState(0)
  const [margen, setMargen] = useState(0)
  const [precioVenta, setPrecioVenta] = useState(0)
  const [talles, setTalles] = useState('')
  const [colores, setColores] = useState('')
  const [variantes, setVariantes] = useState<{ talle: string; color: string; stock: number; codBarra: string }[]>([])
  const [errorVariantes, setErrorVariantes] = useState('')

  const router = useRouter()

  useEffect(() => {
    const obtenerCodigo = async () => {
      const res = await fetch('/api/contador/proximo?nombre=articulo')
      const data = await res.json()
      setCodigo(data.valor)
    }

    const cargarOpciones = async () => {
      const [provRes, catRes] = await Promise.all([
        fetch('/api/proveedores'),
        fetch('/api/categorias'),
      ])
      const [provData, catData] = await Promise.all([provRes.json(), catRes.json()])
      setProveedores(provData)
      setCategorias(catData)
    }

    obtenerCodigo()
    cargarOpciones()
  }, [])

  useEffect(() => {
    const precio = costo * (1 + margen / 100)
    const redondeado = Math.ceil(precio / 1000) * 1000
    setPrecioVenta(redondeado)
  }, [costo, margen])

  const generarVariantes = () => {
    const t = talles.split(',').map(x => x.trim()).filter(Boolean)
    const c = colores.split(',').map(x => x.trim()).filter(Boolean)

    const nuevas = []
    for (const talle of t) {
      for (const color of c) {
        nuevas.push({
          talle,
          color,
          stock: 0,
          codBarra: `${codigo}-${talle}-${color}`
        })
      }
    }
    setVariantes(nuevas)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (variantes.length === 0) {
      setErrorVariantes('Debe generar al menos una variante antes de guardar el artículo.')
      return
    }

    setErrorVariantes('')

    await fetch('/api/contador/incrementar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'articulo' }),
    })

    await fetch('/api/articulos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo,
        fecha,
        descripcion,
        proveedorId,
        categoriaId,
        costo,
        margen,
        precioVenta,
        variantes,
      }),
    })

    onArticuloCreado?.()
    if (modo === 'modal') {
      onClose?.()
    } else {
      router.push('/articulos')
    }
  }

  const actualizarVariante = (index: number, campo: keyof typeof variantes[0], valor: string | number) => {
    setVariantes(prev => {
      const copia = [...prev]
      copia[index] = { ...copia[index], [campo]: campo === 'stock' ? Number(valor) : valor }
      return copia
    })
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {modo === 'page' && <h1 className="text-xl font-bold mb-6">Nuevo Artículo</h1>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium">Código</label>
            <input value={codigo ?? ''} disabled className="w-full border p-2 bg-gray-100" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium">Fecha</label>
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="w-full border p-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Descripción</label>
          <input className="w-full border p-2" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium">Proveedor</label>
            <select className="w-full border p-2" value={proveedorId} onChange={(e) => setProveedorId(e.target.value)}>
              <option value="">Seleccionar</option>
              {proveedores.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
            <button type="button" className="text-sm text-blue-600 mt-1" onClick={() => setModalProv(true)}>
              + Nuevo proveedor
            </button>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium">Categoría</label>
            <select className="w-full border p-2" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
              <option value="">Seleccionar</option>
              {categorias.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            <button type="button" className="text-sm text-blue-600 mt-1" onClick={() => setModalCat(true)}>
              + Nueva categoría
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium">Costo</label>
            <input type="number" className="w-full border p-2" value={costo} onChange={(e) => setCosto(Number(e.target.value))} />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium">% Margen</label>
            <input type="number" className="w-full border p-2" value={margen} onChange={(e) => setMargen(Number(e.target.value))} />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium">Precio de venta</label>
            <input type="number" disabled className="w-full border p-2 bg-gray-100" value={precioVenta} />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium">Talles (separados por coma)</label>
            <input className="w-full border p-2" value={talles} onChange={(e) => setTalles(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium">Colores (separados por coma)</label>
            <input className="w-full border p-2" value={colores} onChange={(e) => setColores(e.target.value)} />
          </div>
        </div>

        <button type="button" onClick={generarVariantes} className="bg-gray-700 text-white px-4 py-2 rounded">
          Generar variantes
        </button>

        {variantes.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mt-6 mb-2">Variantes generadas</h2>
            <table className="w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2">Talle</th>
                  <th className="p-2">Color</th>
                  <th className="p-2">Stock</th>
                  <th className="p-2">Código de barra</th>
                </tr>
              </thead>
              <tbody>
                {variantes.map((v, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{v.talle}</td>
                    <td className="p-2">{v.color}</td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={v.stock}
                        onChange={(e) => actualizarVariante(i, 'stock', e.target.value)}
                        className="w-20 border p-1"
                      />
                    </td>
                    <td className="p-2">{v.codBarra}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div>
          {errorVariantes && (
            <p className="text-red-600 font-semibold">{errorVariantes}</p>
          )}
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded mt-4">
            Guardar artículo
          </button>
          {modo === 'modal' && (
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-400 text-white px-6 py-2 rounded ml-2"
            >
              Cancelar
            </button>
          )}
        </div>

      </form>

      <ModalProveedor
        isOpen={modalProv}
        onClose={() => setModalProv(false)}
        onCreated={async () => {
          const res = await fetch('/api/proveedores')
          const data = await res.json()
          setProveedores(data)
        }}
      />

      <ModalCategoria
        isOpen={modalCat}
        onClose={() => setModalCat(false)}
        onCreated={async () => {
          const res = await fetch('/api/categorias')
          const data = await res.json()
          setCategorias(data)
        }}
      />
    </div>
  )
}
