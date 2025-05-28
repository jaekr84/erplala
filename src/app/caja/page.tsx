'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type Caja = {
  id: number
  fechaApertura: string
  fechaCierre: string | null
  montoInicial: number
  totalEfectivo: number | null
  totalTarjeta: number | null
  totalOtro: number | null
  totalReal: number | null
  diferencia: number | null
  observaciones: string | null
  estado: 'ABIERTA' | 'CERRADA'
  detallesPago?: Record<string, number>
}

export default function CajaPage() {
  const [caja, setCaja] = useState<Caja | null>(null)
  const [montoInicial, setMontoInicial] = useState('')
  const [totalReal, setTotalReal] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    fetch('/api/caja/estado')
      .then(res => res.json())
      .then(data => setCaja(data))
  }, [])

  const abrirCaja = async () => {
    setMensaje('')
    const res = await fetch('/api/caja/abrir', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ montoInicial: parseFloat(montoInicial) }),
    })

    if (res.ok) {
      const nueva = await res.json()
      setCaja(nueva)
      setMensaje('✅ Caja abierta correctamente')
    } else {
      const data = await res.json()
      setMensaje(data.error || 'Error al abrir caja')
    }
  }

  const cerrarCaja = async () => {
    setMensaje('')
    const res = await fetch('/api/caja/cerrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        totalReal: parseFloat(totalReal),
        observaciones,
      }),
    })

    let data: any = {}
    const contentType = res.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      data = await res.json()
    }

    if (res.ok) {
      setCaja(data)
      setMensaje('✅ Caja cerrada correctamente')
    } else {
      setMensaje(data?.error || 'Error al cerrar caja')
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6 space-y-6">
      <h1 className="text-xl font-bold">Control de Caja</h1>

      {caja ? (
        caja.estado === 'ABIERTA' ? (
          <>
            <div className="space-y-1">
              <p><strong>Fecha de apertura:</strong> {new Date(caja.fechaApertura).toLocaleString()}</p>
              <p><strong>Monto inicial:</strong> ${caja.montoInicial.toLocaleString()}</p>
            </div>

            <div className="mt-6 space-y-4">
              <h2 className="text-lg font-semibold">Cerrar caja</h2>
              <Input
                placeholder="Total contado"
                type="number"
                value={totalReal}
                onChange={(e) => setTotalReal(e.target.value)}
              />
              <Textarea
                placeholder="Observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
              <Button onClick={cerrarCaja}>Cerrar caja</Button>
            </div>
          </>
        ) : (
          <>
            <p><strong>Caja cerrada el:</strong> {new Date(caja.fechaCierre!).toLocaleString()}</p>

            {caja?.detallesPago && (
              <div className="mt-4 space-y-1">
                <h3 className="font-semibold text-gray-800">Detalle por medio de pago:</h3>

                {Object.entries(caja.detallesPago).map(([medio, monto]) => {
                  const iconos: Record<string, string> = {
                    Efectivo: '',
                    Tarjeta: '',
                    Transferencia: '',
                    'Mercado Pago': '',
                    Qr: '',
                    Débito: '',
                  }
                  const icono = iconos[medio] || '💲'

                  return (
                    <p key={medio}>
                      {icono} <strong>{medio}:</strong> ${monto.toLocaleString('es-AR')}
                    </p>
                  )
                })}

                <p className="mt-2 font-semibold text-blue-800">
                  💰 Total por medios: ${Object.values(caja.detallesPago).reduce((s, m) => s + m, 0).toLocaleString('es-AR')}
                </p>
              </div>
            )}

            <p><strong>Total real contado:</strong> ${caja.totalReal?.toLocaleString('es-AR')}</p>
            <p><strong>Diferencia:</strong> ${caja.diferencia?.toLocaleString('es-AR')}</p>
          </>
        )
      ) : (
        <div className="space-y-4">
          <p>No hay caja abierta. Ingrese el monto inicial para comenzar:</p>
          <Input
            placeholder="Monto inicial"
            type="number"
            value={montoInicial}
            onChange={(e) => setMontoInicial(e.target.value)}
          />
          <Button onClick={abrirCaja}>Abrir caja</Button>
        </div>
      )}

      {mensaje && <p className="text-sm text-blue-600">{mensaje}</p>}
    </div>
  )
}