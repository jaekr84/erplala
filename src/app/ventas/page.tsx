'use client'

import { useEffect, useState } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import ModalDetalleVenta from 'lala/components/ModalDetalleVenta'
import { VentaConDetalles } from '@/types'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Printer, Ticket, Eye } from 'lucide-react'

export default function VentasPage() {
  const [ventas, setVentas] = useState<VentaConDetalles[]>([])
  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaConDetalles | null>(null)
  const [desde, setDesde] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [hasta, setHasta] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'))
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)

  useEffect(() => {
    const fetchVentas = async () => {
      const params = new URLSearchParams({ desde, hasta, busqueda, pagina: pagina.toString() })
      const res = await fetch(`/api/ventas?${params.toString()}`)
      if (!res.ok) return alert('Error al cargar ventas')
      const data = await res.json()
      setVentas(data.ventas)
      setTotalPaginas(data.totalPaginas)
    }
    fetchVentas()
  }, [desde, hasta, busqueda, pagina])

  const imprimirTicket = (ventaId: number) => {
    window.open(`/api/ticket/venta?ventaId=${ventaId}`, '_blank')
  }

  const imprimirCambio = (ventaId: number) => {
    window.open(`/api/ticket/cambio?ventaId=${ventaId}`, '_blank')
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Listado de Ventas</h1>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4">
        <Input
          type="date"
          value={desde}
          onChange={e => setDesde(e.target.value)}
          className="w-[160px]"
        />
        <Input
          type="date"
          value={hasta}
          onChange={e => setHasta(e.target.value)}
          className="w-[160px]"
        />
        <Input
          type="text"
          placeholder="Buscar por comprobante"
          value={busqueda}
          onChange={e => {
            setBusqueda(e.target.value)
            setPagina(1)
          }}
          className="flex-1 min-w-[200px]"
        />
      </div>

      {/* Tabla de ventas */}
      <div className="border rounded-md overflow-full shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="p-3 text-left">Comprobante</th>
              <th className="p-3 text-left">Fecha</th>
              <th className="p-3 text-left">Cliente</th>
              <th className="p-3 text-left">Total</th>

            </tr>
          </thead>
          <tbody>
            {ventas.map(v => (
              <tr key={v.id} className="border-t hover:bg-muted/50">
                <td
                  className="p-3 font-mono  text-black-600">
                  {v.nroComprobante}
                </td>
                <td className="p-3">{new Date(v.fecha).toLocaleDateString()}</td>
                <td className="p-3">{v.cliente?.nombre || 'Consumidor final'}</td>
                <td className="p-3">${v.total.toLocaleString('es-AR')}</td>
                <td className="flex p-3 space-x-2">
                  <div className="flex gap-2">
                    <Button
                      variant="link"
                      size="sm"
                      className="flex items-center gap-1 text-black-600 hover:text-red-600 [text-decoration:none]"
                      onClick={() => setVentaSeleccionada(v)}
                    >
                      <Eye className="w-4 h-4" />
                      Ver detalle
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex justify-center items-center gap-6">
        <Button
          variant="outline"
          size="sm"
          disabled={pagina <= 1}
          onClick={() => setPagina(p => p - 1)}
        >
          ← Anterior
        </Button>
        <span className="text-sm text-muted-foreground">
          Página {pagina} de {totalPaginas}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={pagina >= totalPaginas}
          onClick={() => setPagina(p => p + 1)}
        >
          Siguiente →
        </Button>
      </div>

      {/* Modal detalle */}
      {ventaSeleccionada && (
        <ModalDetalleVenta
          venta={ventaSeleccionada}
          onClose={() => setVentaSeleccionada(null)}
        />
      )}
    </div>
  )
}