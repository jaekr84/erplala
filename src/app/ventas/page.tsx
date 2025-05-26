'use client'

import { useEffect, useState } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import ModalDetalleVenta from 'lala/components/ModalDetalleVenta'
import { VentaConDetalles } from '@/types'

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
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Listado de Ventas</h1>

      <div className="flex gap-4 mb-6">
        <input
          type="date"
          value={desde}
          onChange={e => setDesde(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 text-sm"
        />
        <input
          type="date"
          value={hasta}
          onChange={e => setHasta(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 text-sm"
        />
        <input
          type="text"
          placeholder="Buscar por comprobante"
          value={busqueda}
          onChange={e => {
            setBusqueda(e.target.value)
            setPagina(1)
          }}
          className="flex-1 border border-gray-300 rounded px-4 py-2 text-sm"
        />
      </div>

      <table className="w-full border border-gray-200 text-sm rounded overflow-hidden">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-2 text-left">Comprobante</th>
            <th className="p-2 text-left">Fecha</th>
            <th className="p-2 text-left">Cliente</th>
            <th className="p-2 text-left">Total</th>
            <th className="p-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map(v => (
            <tr key={v.id} className="border-t hover:bg-gray-50">
              <td className="p-2 font-mono cursor-pointer" onClick={() => setVentaSeleccionada(v)}>{v.nroComprobante}</td>
              <td className="p-2">{new Date(v.fecha).toLocaleDateString()}</td>
              <td className="p-2">{v.cliente?.nombre || 'Consumidor final'}</td>
              <td className="p-2">${v.total.toLocaleString('es-AR')}</td>
              <td className="p-2 space-x-2">
                <button
                  onClick={() => imprimirTicket(v.id)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm"
                >
                  🖨 Imprimir
                </button>
                <button
                  onClick={() => imprimirCambio(v.id)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm"
                >
                  🎟 Ticket de Cambio
                </button>
                <button
                  className="text-blue-600 hover:underline text-sm"
                  onClick={() => setVentaSeleccionada(v)}
                >
                  Ver detalle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-center items-center gap-4 mt-6 text-sm">
        <button
          disabled={pagina <= 1}
          onClick={() => setPagina(p => p - 1)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
        >
          ← Anterior
        </button>
        <span className="text-gray-700">Página {pagina} de {totalPaginas}</span>
        <button
          disabled={pagina >= totalPaginas}
          onClick={() => setPagina(p => p + 1)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
        >
          Siguiente →
        </button>
      </div>

      {ventaSeleccionada && (
        <ModalDetalleVenta
          venta={ventaSeleccionada}
          onClose={() => setVentaSeleccionada(null)}
        />
      )}
    </div>
  )
}