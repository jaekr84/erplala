'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

type MedioPago = {
  nombre: string
}

type CajaDetalle = {
  total: number
  medioPago: MedioPago
}

type Caja = {
  id: number
  fechaApertura: string
  fechaCierre: string | null
  efectivoInicial: number
  efectivoFinal: number | null
  diferencia: number | null
  observaciones: string | null
  usuario: { nombre: string }
  detalles: CajaDetalle[]
}

export default function DetalleCajaPage() {
  const { id } = useParams()
  const [caja, setCaja] = useState<Caja | null>(null)
  const [auditoria, setAuditoria] = useState<any[]>([])

  useEffect(() => {
    fetch(`/api/caja/${id}/auditoria`)
      .then(res => res.json())
      .then(setAuditoria)
  }, [id])

  useEffect(() => {
    fetch(`/api/caja/${id}`)
      .then(res => res.json())
      .then(setCaja)
  }, [id])

  if (!caja) return <p className="p-6">Cargando caja...</p>

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">📦 Caja #{caja.id}</h1>
      <h2 className="text-lg font-semibold mb-2">📑 Auditoría</h2>
      <ul className="text-sm text-gray-800 space-y-1">
        {auditoria.map((log, i) => (
          <li key={i}>
            <span className="font-semibold">{log.usuario.nombre}</span> realizó <strong>{log.accion}</strong> el{' '}
            {new Date(log.fecha).toLocaleString('es-AR')} — {log.detalle}
          </li>
        ))}
      </ul>

      <div className="space-y-1 text-sm text-gray-700">
        <p>👤 Usuario: <strong>{caja.usuario.nombre}</strong></p>
        <p>📅 Apertura: {new Date(caja.fechaApertura).toLocaleString('es-AR')}</p>
        <p>📅 Cierre: {caja.fechaCierre ? new Date(caja.fechaCierre).toLocaleString('es-AR') : '—'}</p>
        <p>💰 Inicial: ${caja.efectivoInicial.toLocaleString('es-AR')}</p>
        <p>💵 Final: {caja.efectivoFinal != null ? `$${caja.efectivoFinal.toLocaleString('es-AR')}` : '—'}</p>
        <p>📊 Diferencia:
          <span className={caja.diferencia === 0 ? 'text-green-600' : 'text-red-600'}>
            {' '}{caja.diferencia != null ? `$${caja.diferencia.toLocaleString('es-AR')}` : '—'}
          </span>
        </p>
        <p>📝 Observaciones: {caja.observaciones || '—'}</p>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold">💳 Detalles por medio de pago</h2>
        <ul className="text-sm mt-2">
          {caja.detalles.map((d, i) => (
            <li key={i}>• {d.medioPago.nombre}: ${d.total.toLocaleString('es-AR')}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}