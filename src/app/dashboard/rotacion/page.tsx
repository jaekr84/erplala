'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'

type Variante = {
  id: number
  talle: string
  color: string
  fechaAlta: string
  stock: number
  ventas: number
  ultimaVenta: string
  rotacionSemanal: number
}

type Articulo = {
  codigo: string
  descripcion: string
  fechaAlta: string
  diasActivos: number
  ventasTotales: number
  rotacionSemanal: number
  ultimaVenta: string
  stockTotal: number
  alerta: boolean
  etiqueta: string
  variantes: Variante[]
}

export default function RotacionPage() {
  const [desde, setDesde] = useState(format(new Date(), 'yyyy-MM-01'))
  const [hasta, setHasta] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [categoria, setCategoria] = useState<string>('')

  const [modalAbierto, setModalAbierto] = useState(false)
  const [variantesSeleccionadas, setVariantesSeleccionadas] = useState<Variante[] | null>(null)
  const [tituloModal, setTituloModal] = useState('')

  const buscar = async () => {
    const res = await fetch(`/api/dashboard/rotacion?desde=${desde}&hasta=${hasta}`)
    const data = await res.json()
    setArticulos(data)
  }

  // Filtrado y ordenamiento
  const articulosFiltrados = articulos
    .filter(a => !categoria || a.descripcion.toLowerCase().includes(categoria.toLowerCase()))
    .sort((a, b) => b.rotacionSemanal - a.rotacionSemanal)

  const Tabla = ({ titulo, data }: { titulo: string; data: Articulo[] }) => (
    <Card className="p-4 space-y-2 text-sm">
      <h2 className="text-lg font-semibold">{titulo}</h2>
      <table className="w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Código</th>
            <th className="p-2 text-left">Descripción</th>
            <th className="p-2 text-center">Fecha Alta</th>
            <th className="p-2 text-center">Ventas</th>
            <th className="p-2 text-center">Rot. Semanal</th>
            <th className="p-2 text-center">Stock</th>
            <th className="p-2 text-center">Últ. Venta</th>
            <th className="p-2 text-center">Nivel</th>
            <th className="p-2 text-center">🔽</th>
          </tr>
        </thead>
        <tbody>
          {data.map(a => (
            <tr
              key={a.codigo}
              className={`cursor-pointer ${a.alerta ? 'bg-red-100 font-semibold' : ''} hover:bg-gray-100`}
              onClick={() => {
                setVariantesSeleccionadas(a.variantes)
                setTituloModal(`${a.codigo} - ${a.descripcion}`)
                setModalAbierto(true)
              }}
            >
              <td className="p-2 text-blue-600">{a.codigo}</td>
              <td className="p-2">{a.descripcion}</td>
              <td className="p-2 text-center">{`${new Date(a.fechaAlta).getDate().toString().padStart(2, '0')}-${(new Date(a.fechaAlta).getMonth() + 1).toString().padStart(2, '0')}-${new Date(a.fechaAlta).getFullYear()}`}</td>
              <td className="p-2 text-center">{a.ventasTotales}</td>
              <td className="p-2 text-center">{a.rotacionSemanal.toFixed(2)}</td>
              <td className="p-2 text-center">{a.stockTotal}</td>
              <td className="p-2 text-center">
                {a.ultimaVenta ? `${new Date(a.ultimaVenta).getDate().toString().padStart(2, '0')}-${(new Date(a.ultimaVenta).getMonth() + 1).toString().padStart(2, '0')}-${new Date(a.ultimaVenta).getFullYear()}` : '-'}
              </td>
              <td className="p-2 text-center">
                {a.etiqueta === 'altisima' ? '🔥'
                  : a.etiqueta === 'alta' ? '⚡'
                  : a.etiqueta === 'media' ? '⏳'
                  : a.etiqueta === 'baja' ? '💤'
                  : '🛑'}
              </td>
              <td className="p-2 text-center">
                <button>
                  ▼
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )

  useEffect(() => {
    buscar()
  }, [])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">📊 Análisis de Rotación</h1>

      <div className="flex items-center gap-4">
        <Input type="date" value={desde} onChange={e => setDesde(e.target.value)} />
        <Input type="date" value={hasta} onChange={e => setHasta(e.target.value)} />
        <Input placeholder="Filtrar por categoría" value={categoria} onChange={e => setCategoria(e.target.value)} />
        <Button onClick={buscar}>Buscar</Button>
      </div>

      {articulos.length > 0 && (
        <div className="space-y-6">
          <Tabla titulo="📦 Todos los artículos (ordenados por rotación)" data={articulosFiltrados} />
        </div>
      )}

      {modalAbierto && variantesSeleccionadas && (
        <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>📦 Variantes de {tituloModal}</DialogTitle>
            </DialogHeader>
            <table className="w-full text-xs border mt-2">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-1">Talle</th>
                  <th className="p-1">Color</th>
                  <th className="p-1">Stock</th>
                  <th className="p-1">Ventas</th>
                  <th className="p-1">Rot. Semanal</th>
                  <th className="p-1">Últ. Venta</th>
                </tr>
              </thead>
              <tbody>
                {variantesSeleccionadas.map(v => (
                  <tr key={v.id}>
                    <td className="p-1 text-center">{v.talle}</td>
                    <td className="p-1 text-center">{v.color}</td>
                    <td className="p-1 text-center">{v.stock}</td>
                    <td className="p-1 text-center">{v.ventas}</td>
                    <td className="p-1 text-center">{v.rotacionSemanal.toFixed(2)}</td>
                    <td className="p-1 text-center">
                      {v.ultimaVenta ? `${new Date(v.ultimaVenta).getDate().toString().padStart(2, '0')}-${(new Date(v.ultimaVenta).getMonth() + 1).toString().padStart(2, '0')}-${new Date(v.ultimaVenta).getFullYear()}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <DialogFooter>
              <Button onClick={() => setModalAbierto(false)}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}