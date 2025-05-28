'use client'

import { Dialog } from '@headlessui/react'
import { X } from 'lucide-react'

type Props = {
  caja: {
    id: number
    fechaApertura: string
    fechaCierre: string
    montoInicial?: number
    totalReal: number
    diferencia: number
    detallesPago?: Record<string, number>
    observaciones: string | null
  }
  onClose: () => void
}

export default function ModalCajaDetalle({ caja, onClose }: Props) {
  const totalMedios = Object.values(caja.detallesPago || {}).reduce((s, m) => s + m, 0)

  const iconos: Record<string, string> = {
    Efectivo: '',
    Tarjeta: '',
    Transferencia: '',
    'Mercado Pago': '',
    Qr: '',
    Débito: '',
  }

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl space-y-4 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black">
            <X size={20} />
          </button>

          <Dialog.Title className="text-xl font-bold text-gray-800">Detalle de Cierre</Dialog.Title>

          <p><strong>Apertura:</strong> {new Date(caja.fechaApertura).toLocaleString()}</p>
          <p><strong>Cierre:</strong> {new Date(caja.fechaCierre).toLocaleString()}</p>
          {caja.montoInicial !== undefined && (
            <p><strong>Monto inicial:</strong> ${caja.montoInicial.toLocaleString('es-AR')}</p>
          )}

          <div className="space-y-1">
            <h3 className="font-semibold">Medios de pago:</h3>
            {Object.entries(caja.detallesPago || {}).map(([medio, monto]) => (
              <p key={medio}>
                {iconos[medio] || ''} <strong>{medio}:</strong> ${monto.toLocaleString('es-AR')}
              </p>
            ))}
            <p className="mt-2 font-semibold text-blue-800">
              Total por medios: ${totalMedios.toLocaleString('es-AR')}
            </p>
          </div>

          <p><strong>Total contado:</strong> ${caja.totalReal.toLocaleString('es-AR')}</p>
          <p><strong>Diferencia:</strong> ${caja.diferencia.toLocaleString('es-AR')}</p>

          {caja.observaciones && (
            <p className="italic text-sm text-gray-700 mt-2">{caja.observaciones}</p>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}