'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ModalProveedor from '@/components/ModalProveedor'
import ModalCategoria from '@/components/ModalCategoria'
import { v4 as uuidv4 } from 'uuid' // Instala uuid si no lo tienes: npm install uuid
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

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

  const handleGenerarVariantes = async () => {
    const talles = tallesInput.split(',').map(t => t.trim()).filter(Boolean)
    const colores = coloresInput.split(',').map(c => c.trim()).filter(Boolean)
    if (!talles.length || !colores.length) return

    const combinaciones = talles.flatMap(talle =>
      colores.map(color => ({ talle, color }))
    )

    // Filtrar las combinaciones que ya existen
    const nuevasCombinaciones = combinaciones.filter(combo =>
      !variantes.some(v => v.talle === combo.talle && v.color === combo.color)
    )

    // Pedir códigos únicos al contador
    const promesas = nuevasCombinaciones.map(() =>
      fetch('/api/contador/incrementar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: 'codigoBarras' }) // 👈 asegurate que sea 'codigoBarras' exacto
      }).then(res => res.json())
    )

    const codigos = await Promise.all(promesas)

    const nuevas = nuevasCombinaciones.map((combo, i) => ({
      id: uuidv4(),
      talle: combo.talle,
      color: combo.color,
      stock: 0,
      codBarra: String(codigos[i].valor)
    }))

    setVariantes(prev => [...prev, ...nuevas])
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
      <h1 className="text-2xl font-semibold mb-6">
        Editar Artículo <span className="text-muted-foreground">({codigo})</span>
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white border rounded-lg p-6 shadow">
        <div className="space-y-2">
          <Label>Descripción</Label>
          <Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Proveedor</Label>
            <Select value={proveedorId} onValueChange={setProveedorId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar proveedor" />
              </SelectTrigger>
              <SelectContent>
                {proveedores.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="link" size="sm" onClick={() => setModalProv(true)}>
              + Nuevo proveedor
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select value={categoriaId} onValueChange={setCategoriaId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="link" size="sm" onClick={() => setModalCat(true)}>
              + Nueva categoría
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Costo</Label>
            <Input type="number" value={costo === 0 ? '' : costo} onChange={(e) => setCosto(e.target.value === '' ? 0 : Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>% Margen</Label>
            <Input type="number" value={margen === 0 ? '' : margen} onChange={(e) => setMargen(e.target.value === '' ? 0 : Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Precio de venta</Label>
            <Input type="number" disabled value={precioVenta} className="bg-muted" />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mt-6 mb-2">Variantes</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
            <Input value={tallesInput} onChange={e => setTallesInput(e.target.value)} placeholder="Talles (ej: S,M,L,XL)" />
            <Input value={coloresInput} onChange={e => setColoresInput(e.target.value)} placeholder="Colores (ej: Rojo,Azul,Negro)" />
            <Button type="button" onClick={handleGenerarVariantes}>Generar</Button>
          </div>

          <div className="border rounded-md overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
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
                      <Input
                        type="number"
                        className="w-20"
                        value={v.stock === 0 ? '' : v.stock}
                        onChange={e => {
                          const nuevoStock = e.target.value === '' ? 0 : Number(e.target.value)
                          setVariantes(variantes.map((variante, idx) =>
                            idx === i ? { ...variante, stock: nuevoStock } : variante
                          ))
                        }}
                      />
                    </td>
                    <td className="p-2">{v.codBarra}</td>
                    <td className="p-2">
                      <Button variant="link" size="sm" className="text-red-600" type="button" onClick={() => handleQuitarVariante(v.id)}>
                        Quitar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit">Guardar cambios</Button>
          <Button variant="secondary" type="button" onClick={() => router.push('/articulos')}>
            Cancelar
          </Button>
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