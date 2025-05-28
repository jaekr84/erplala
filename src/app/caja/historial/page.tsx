'use client'

import { useEffect, useState } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import Modal from '@/components/ModalCajaDetalle'
import { Input } from '@/components/ui/input'

type Caja = {
  id: number
  fechaApertura: string
  fechaCierre: string
  totalReal: number
  diferencia: number
  detallesPago?: Record<string, number>
  observaciones: string | null
}

export default function HistorialCajaPage() {
  const [cajas, setCajas] = useState<Caja[]>([])
  const [seleccionada, setSeleccionada] = useState<Caja | null>(null)

  const hoy = new Date()
  const [desde, setDesde] = useState(format(startOfMonth(hoy), 'yyyy-MM-dd'))
  const [hasta, setHasta] = useState(format(endOfMonth(hoy), 'yyyy-MM-dd'))

  const obtenerCajas = async () => {
    const res = await fetch(`/api/caja/historial?desde=${desde}&hasta=${hasta}`)
    const data = await res.json()
    setCajas(data)
  }

  useEffect(() => {
    obtenerCajas()
  }, [desde, hasta])

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Historial de Cierres de Caja</h1>

      <div className="flex gap-4 items-center">
        <div>
          <label className="block text-sm font-semibold text-gray-700">Desde</label>
          <Input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">Hasta</label>
          <Input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
      </div>

      <ul className="space-y-4">
        {cajas.map((caja) => (
          <li
            key={caja.id}
            className="p-4 bg-white shadow rounded cursor-pointer hover:bg-gray-50"
            onClick={() => setSeleccionada(caja)}
          >
            <p><strong>Fecha:</strong> {new Date(caja.fechaCierre).toLocaleString()}</p>
            <p><strong>Total:</strong> ${caja.totalReal.toLocaleString('es-AR')}</p>
            <p><strong>Diferencia:</strong> ${caja.diferencia.toLocaleString('es-AR')}</p>
          </li>
        ))}
      </ul>

      {seleccionada && (
        <Modal caja={seleccionada} onClose={() => setSeleccionada(null)} />
      )}
    </div>
  )
}