'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

type Articulo = {
  codigo: string
  descripcion: string
  ventas: number
  posicion: number
  anterior: number | null
  tendencia: string
  proveedor?: string
  fechaAlta?: string
  variantes?: { talle: string; color: string; cantidad: number; stock?: number }[]
}

export default function RankingPage() {
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [desde, setDesde] = useState(firstDay.toISOString().split('T')[0])
  const [hasta, setHasta] = useState(lastDay.toISOString().split('T')[0])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [detalleArticulo, setDetalleArticulo] = useState<Articulo | null>(null)

  const buscar = async () => {
    if (!desde || !hasta) return alert('Completar fechas')
    const res = await fetch('/api/dashboard/ranking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fechaDesde: desde, fechaHasta: hasta })
    })
    const data = await res.json()
    setArticulos(data)
  }

  useEffect(() => {
    buscar()
  }, [])

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800">🏆 Ranking de Artículos</h1>

      <div className="flex gap-4 items-end">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Desde</label>
          <Input type="date" value={desde} onChange={e => setDesde(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Hasta</label>
          <Input type="date" value={hasta} onChange={e => setHasta(e.target.value)} />
        </div>
        <Button onClick={buscar}>Buscar</Button>
      </div>

      {articulos.length > 0 && (
        <table className="w-full text-sm border mt-6">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Código</th>
              <th className="p-2 text-left">Descripción</th>
              <th className="p-2 text-left">Proveedor</th>
              <th className="p-2 text-left">Fecha Alta</th>
              <th className="p-2 text-center">Ventas</th>
              <th className="p-2 text-center">Anterior</th>
              <th className="p-2 text-center">Tendencia</th>
            </tr>
          </thead>
          <tbody>
            {articulos.map((a, i) => (
              <tr key={a.codigo} className="border-t">
                <td className="p-2">{a.posicion}</td>
                <td
                  className="p-2 text-blue-600 cursor-pointer hover:underline"
                  onClick={() => { setDetalleArticulo(a); setModalAbierto(true); }}
                >
                  {a.codigo}
                </td>
                <td className="p-2">{a.descripcion}</td>
                <td className="p-2">{a.proveedor || '-'}</td>
                <td className="p-2">{a.fechaAlta ? `${new Date(a.fechaAlta).getDate().toString().padStart(2, '0')}-${(new Date(a.fechaAlta).getMonth() + 1).toString().padStart(2, '0')}-${new Date(a.fechaAlta).getFullYear()}` : '-'}</td>
                <td className="p-2 text-center">{a.ventas}</td>
                <td className="p-2 text-center">{a.anterior ?? '-'}</td>
                <td className="p-2 text-center text-xl">{a.tendencia}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>📦 Detalle por Variante</DialogTitle>
          </DialogHeader>

          <div className="text-sm space-y-1">
            <p><strong>Código:</strong> {detalleArticulo?.codigo}</p>
            <p><strong>Descripción:</strong> {detalleArticulo?.descripcion}</p>
            <p><strong>Proveedor:</strong> {detalleArticulo?.proveedor}</p>
            <p><strong>Fecha de alta:</strong> {detalleArticulo?.fechaAlta ? `${new Date(detalleArticulo.fechaAlta).getDate().toString().padStart(2, '0')}-${(new Date(detalleArticulo.fechaAlta).getMonth() + 1).toString().padStart(2, '0')}-${new Date(detalleArticulo.fechaAlta).getFullYear()}` : '-'}</p>
          </div>

          <table className="w-full text-sm border mt-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Talle</th>
                <th className="p-2 text-left">Color</th>
                <th className="p-2 text-center">Vendidas</th>
                <th className="p-2 text-center">Stock</th>
              </tr>
            </thead>
            <tbody>
              {detalleArticulo?.variantes?.map((v, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{v.talle}</td>
                  <td className="p-2">{v.color}</td>
                  <td className="p-2 text-center">{v.cantidad ?? 0}</td>
                  <td className="p-2 text-center">{v.stock ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <DialogFooter>
            <Button onClick={() => setModalAbierto(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}