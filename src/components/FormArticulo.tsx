// src/components/FormArticulo.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ModalProveedor from '@/components/ModalProveedor'
import ModalCategoria from '@/components/ModalCategoria'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import Link from "next/link"

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

    // ✅ Solo una vez: incrementar contador y obtener el valor real
    const resContador = await fetch('/api/contador/incrementar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: 'articulo' }),
    })
    const { valor } = await resContador.json()
    const codigoFinal = valor.toString()

    // ✅ Crear artículo con el código que acabás de generar
    await fetch('/api/articulos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo: codigoFinal, // <-- clave corregida
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
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {modo === 'page' && <h1 className="text-xl font-bold">Nuevo Artículo</h1>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm text-muted-foreground">Código</label>
            <Input value={codigo ?? ''} disabled className="bg-muted" />
          </div>
          <div className="flex-1">
            <label className="text-sm text-muted-foreground">Fecha</label>
            <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="text-sm text-muted-foreground">Descripción</label>
          <Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm text-muted-foreground">Proveedor</label>
            <Select value={proveedorId} onValueChange={setProveedorId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar proveedor" />
              </SelectTrigger>
              <SelectContent>
                {proveedores.map(p => (
                  <SelectItem key={p.id} value={p.id.toString()}>{p.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" variant="link" size="sm" className="mt-1 text-blue-600" onClick={() => setModalProv(true)}>
              + Nuevo proveedor
            </Button>
          </div>

          <div className="flex-1">
            <label className="text-sm text-muted-foreground">Categoría</label>
            <Select value={categoriaId} onValueChange={setCategoriaId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map(c => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" variant="link" size="sm" className="mt-1 text-blue-600" onClick={() => setModalCat(true)}>
              + Nueva categoría
            </Button>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm text-muted-foreground">Costo</label>
            <Input type="number" value={costo} onChange={(e) => setCosto(Number(e.target.value))} />
          </div>
          <div className="flex-1">
            <label className="text-sm text-muted-foreground">% Margen</label>
            <Input type="number" value={margen} onChange={(e) => setMargen(Number(e.target.value))} />
          </div>
          <div className="flex-1">
            <label className="text-sm text-muted-foreground">Precio de venta</label>
            <Input type="number" disabled value={precioVenta} className="bg-muted" />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm text-muted-foreground">Talles (separados por coma)</label>
            <Input value={talles} onChange={(e) => setTalles(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="text-sm text-muted-foreground">Colores (separados por coma)</label>
            <Input value={colores} onChange={(e) => setColores(e.target.value)} />
          </div>
        </div>

        <Button type="button" variant="default" onClick={generarVariantes}>
          Generar variantes
        </Button>

        {variantes.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mt-6 mb-2">Variantes generadas</h2>
            <table className="w-full border text-sm">
              <thead className="bg-muted">
                <tr>
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
                      <Input
                        type="number"
                        value={v.stock}
                        onChange={(e) => actualizarVariante(i, 'stock', e.target.value)}
                        className="w-20"
                      />
                    </td>
                    <td className="p-2">{v.codBarra}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {errorVariantes && <p className="text-red-600 font-semibold">{errorVariantes}</p>}

        <div className=" justify-end gap-2 mt-6">
          <Button variant="default" type="submit" className="">
            Guardar artículo
          </Button>
          {modo === 'modal' && (
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
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