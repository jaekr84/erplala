'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ModalDetalleCompra from '@/components/ModalDetalleCompra'
import { CompraConDetalles } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"
import { Printer, Ticket, Eye, TagIcon } from 'lucide-react'

// Función para formatear moneda
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(value)

// Obtener primer y último día del mes actual
const getInicioMes = () => {
  const hoy = new Date()
  return new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0]
}
const getFinMes = () => {
  const hoy = new Date()
  return new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0]
}

export default function ComprasPage() {
  const [compras, setCompras] = useState<CompraConDetalles[]>([])
  const [error, setError] = useState<string | null>(null)
  const [compraSeleccionada, setCompraSeleccionada] = useState<CompraConDetalles | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [fechaDesde, setFechaDesde] = useState(getInicioMes())
  const [fechaHasta, setFechaHasta] = useState(getFinMes())

  const buscarCompras = () => {
    console.log('🔎 Buscando compras con:', {
      desde: fechaDesde,
      hasta: fechaHasta,
      comprobante: busqueda
    })
    const params = new URLSearchParams()
    if (fechaDesde) params.append('desde', fechaDesde)
    if (fechaHasta) params.append('hasta', fechaHasta)
    if (busqueda.trim()) params.append('comprobante', busqueda.trim())

    fetch(`/api/compras?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error('No se pudo obtener el listado de compras')
        return res.json()
      })
      .then(data => {
        setCompras(data)
      })
      .catch(err => setError(err.message))
  }

  // Eliminado el useEffect que llamaba a buscarCompras automáticamente

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Listado de Compras</h1>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex flex-wrap gap-4 items-end justify-between">
        <div className="flex gap-2 items-end flex-wrap">
          <div>
            <label className="block text-xs text-gray-600">Desde</label>
            <Input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Hasta</label>
            <Input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Comprobante</label>
            <Input
              type="text"
              placeholder="Buscar por comprobante..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-64"
            />
          </div>
          <Button onClick={buscarCompras} className="mt-4">
            Buscar
          </Button>
        </div>

        <Button asChild>
          <Link href="/compras/nueva">+ Crear compra</Link>
        </Button>
      </div>

      <div className="border rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="p-3 text-left">Comprobante</th>
              <th className="p-3 text-left">Fecha</th>
              <th className="p-3 text-left">Proveedor</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Imprimir Etiquetas / Ver Detalle</th>
            </tr>
          </thead>
          <tbody>
            {compras.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No hay compras registradas.
                </td>
              </tr>
            ) : (
              compras.map(compra => (
                <tr key={compra.id} className="border-t hover:bg-muted/50">
                  <td
                    className="p-3 font-mono text-black-600 hover:underline cursor-pointer"
                    onClick={() => setCompraSeleccionada(compra)}
                  >
                    {compra.nroComprobante}
                  </td>
                  <td className="p-3">
                    {`${new Date(compra.fecha).getDate().toString().padStart(2, '0')}-${(new Date(compra.fecha).getMonth() + 1).toString().padStart(2, '0')}-${new Date(compra.fecha).getFullYear()}`}
                  </td>
                  <td className="p-3">{compra.proveedor?.nombre}</td>
                  <td className="p-3">{formatCurrency(compra.total)}</td>
                  <td className="p-2 fixed space-x-10 flex justify-right">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/etiquetas?compraId=${compra.id}`}><TagIcon className="w-4 h-4" /></Link>
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      className="no-underline text-black-600 hover:text-blue-800"
                      onClick={() => setCompraSeleccionada(compra)}
                    >
                      <Eye className="w-4 h-4" /> Ver Detalle
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {compraSeleccionada && (
        <ModalDetalleCompra
          compra={compraSeleccionada}
          onClose={() => setCompraSeleccionada(null)}
        />
      )}
    </div>
  )
}