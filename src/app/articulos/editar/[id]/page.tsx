'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ModalProveedor from '@/components/ModalProveedor'
import ModalCategoria from '@/components/ModalCategoria'
import { v4 as uuidv4 } from 'uuid' // Instala uuid si no lo tienes: npm install uuid

type Variante = {
  id: number | string
  talle: string
  color: string
  stock: number
  codBarra: string
}

export default function EditarArticuloPage() {
  const { id } = useParams()
  const router = useRouter()

  const [descripcion, setDescripcion] = useState('')
  const [proveedorId, setProveedorId] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [costo, setCosto] = useState(0)
  const [margen, setMargen] = useState(0)
  const [precioVenta, setPrecioVenta] = useState(0)
  const [variantes, setVariantes] = useState<Variante[]>([])

  const [proveedores, setProveedores] = useState<{ id: number; nombre: string }[]>([])
  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([])
  const [modalProv, setModalProv] = useState(false)
  const [modalCat, setModalCat] = useState(false)
  const [nuevaVariante, setNuevaVariante] = useState({ talle: '', color: '', stock: 0, codBarra: '' })
  const [tallesInput, setTallesInput] = useState('')
  const [coloresInput, setColoresInput] = useState('')
  const [codigo, setCodigo] = useState('')

  useEffect(() => {
    const fetchDatos = async () => {
      const [articuloRes, provRes, catRes] = await Promise.all([
        fetch(`/api/articulos/${id}`),
        fetch('/api/proveedores'),
        fetch('/api/categorias'),
      ])

      const articulo = await articuloRes.json()
      const provData = await provRes.json()
      const catData = await catRes.json()

      setCodigo(articulo.codigo)
      setDescripcion(articulo.descripcion)
      setProveedorId(articulo.proveedorId.toString())
      setCategoriaId(articulo.categoriaId.toString())
      setCosto(articulo.costo)
      setMargen(articulo.margen)
      setPrecioVenta(articulo.precioVenta)
      setVariantes(articulo.variantes)
      setProveedores(provData)
      setCategorias(catData)
    }

    fetchDatos()
  }, [id])

  useEffect(() => {
    const precio = costo * (1 + margen / 100)
    const redondeado = Math.ceil(precio / 1000) * 1000
    setPrecioVenta(redondeado)
  }, [costo, margen])

  // Agregar variante
  const handleAgregarVariante = () => {
    if (!nuevaVariante.talle || !nuevaVariante.color || !nuevaVariante.codBarra) return
    setVariantes([
      ...variantes,
      {
        id: uuidv4(), // id temporal para el frontend
        talle: nuevaVariante.talle,
        color: nuevaVariante.color,
        stock: nuevaVariante.stock,
        codBarra: nuevaVariante.codBarra,
      },
    ])
    setNuevaVariante({ talle: '', color: '', stock: 0, codBarra: '' })
  }

  // Quitar variante
  const handleQuitarVariante = (id: number | string) => {
    setVariantes(variantes.filter(v => v.id !== id))
  }

  // Generar variantes combinando talles y colores
  const handleGenerarVariantes = () => {
    const talles = tallesInput.split(',').map(t => t.trim()).filter(Boolean)
    const colores = coloresInput.split(',').map(c => c.trim()).filter(Boolean)
    if (!talles.length || !colores.length) return

    const nuevas = []
    for (const talle of talles) {
      for (const color of colores) {
        // Evitar duplicados exactos
        if (!variantes.some(v => v.talle === talle && v.color === color)) {
          nuevas.push({
            id: uuidv4(),
            talle,
            color,
            stock: 0,
            codBarra: `${codigo}-${talle}-${color}`.replace(/\s+/g, '').toLowerCase(),
          })
        }
      }
    }
    setVariantes([...variantes, ...nuevas])
    setTallesInput('')
    setColoresInput('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await fetch(`/api/articulos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        descripcion,
        proveedorId,
        categoriaId,
        costo,
        margen,
        precioVenta,
        variantes, // enviar variantes al backend
      }),
    })

    router.push('/articulos')
  }

  return (
  <div className="p-8 max-w-5xl mx-auto">
    <h1 className="text-2xl font-semibold text-gray-800 mb-6">
      Editar Artículo <span className="text-gray-500">({codigo})</span>
    </h1>

    <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div>
        <label className="block text-sm font-medium text-gray-700">Descripción</label>
        <input
          className="w-full mt-1 border border-gray-300 rounded px-4 py-2 text-sm"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Proveedor</label>
          <select
            className="w-full mt-1 border border-gray-300 rounded px-4 py-2 text-sm"
            value={proveedorId}
            onChange={(e) => setProveedorId(e.target.value)}
          >
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
          <label className="block text-sm font-medium text-gray-700">Categoría</label>
          <select
            className="w-full mt-1 border border-gray-300 rounded px-4 py-2 text-sm"
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
          >
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
          <label className="block text-sm font-medium text-gray-700">Costo</label>
          <input
            type="number"
            className="w-full mt-1 border border-gray-300 rounded px-4 py-2 text-sm"
            value={costo}
            onChange={(e) => setCosto(Number(e.target.value))}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">% Margen</label>
          <input
            type="number"
            className="w-full mt-1 border border-gray-300 rounded px-4 py-2 text-sm"
            value={margen}
            onChange={(e) => setMargen(Number(e.target.value))}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">Precio de venta</label>
          <input
            type="number"
            disabled
            className="w-full mt-1 bg-gray-100 border border-gray-300 rounded px-4 py-2 text-sm"
            value={precioVenta}
          />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Variantes</h2>

        <div className="flex gap-2 mb-4">
          <input
            className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
            value={tallesInput}
            onChange={e => setTallesInput(e.target.value)}
            placeholder="Talles (ej: S,M,L,XL)"
          />
          <input
            className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
            value={coloresInput}
            onChange={e => setColoresInput(e.target.value)}
            placeholder="Colores (ej: Rojo,Azul,Negro)"
          />
          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
            onClick={handleGenerarVariantes}
          >
            Generar
          </button>
        </div>

        <table className="w-full text-sm border border-gray-200 rounded overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Talle</th>
              <th className="p-2 text-left">Color</th>
              <th className="p-2 text-left">Stock</th>
              <th className="p-2 text-left">Cod. Barra</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {variantes.map((v, i) => (
              <tr key={v.id} className="border-t">
                <td className="p-2">{v.talle}</td>
                <td className="p-2">{v.color}</td>
                <td className="p-2">
                  <input
                    type="number"
                    className="border border-gray-300 rounded px-2 py-1 w-20 text-sm"
                    value={v.stock}
                    onChange={e => {
                      const nuevoStock = Number(e.target.value)
                      setVariantes(variantes.map((variante, idx) =>
                        idx === i ? { ...variante, stock: nuevoStock } : variante
                      ))
                    }}
                  />
                </td>
                <td className="p-2">{v.codBarra}</td>
                <td className="p-2">
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-800 text-sm"
                    onClick={() => handleQuitarVariante(v.id)}
                  >
                    Quitar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-4 pt-4">
        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded text-sm">
          Guardar cambios
        </button>
        <button type="button" onClick={() => router.push('/articulos')} className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded text-sm">
          Cancelar
        </button>
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