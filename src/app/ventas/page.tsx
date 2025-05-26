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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Listado de Ventas</h1>

      <div className="flex gap-4 mb-4">
        <input type="date" value={desde} onChange={e => setDesde(e.target.value)} className="border p-2" />
        <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="border p-2" />
        <input
          type="text"
          placeholder="Buscar por comprobante"
          value={busqueda}
          onChange={e => {
            setBusqueda(e.target.value)
            setPagina(1)
          }}
          className="border p-2 flex-1"
        />
      </div>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
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
            <tr key={v.id} className="border-t cursor-pointer hover:bg-gray-50">
              <td className="p-2 font-mono">{v.nroComprobante}</td>
              <td className="p-2">{new Date(v.fecha).toLocaleDateString()}</td>
              <td className="p-2">{v.cliente?.nombre || 'Consumidor final'}</td>
              <td className="p-2">${v.total.toLocaleString('es-AR')}</td>
              <td className="p-2">
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => setVentaSeleccionada(v)}
                >
                  Ver detalle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-center items-center gap-4 mt-4">
        <button disabled={pagina <= 1} onClick={() => setPagina(p => p - 1)} className="px-3 py-1 bg-gray-200 rounded">
          ← Anterior
        </button>
        <span>Página {pagina} de {totalPaginas}</span>
        <button disabled={pagina >= totalPaginas} onClick={() => setPagina(p => p + 1)} className="px-3 py-1 bg-gray-200 rounded">
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