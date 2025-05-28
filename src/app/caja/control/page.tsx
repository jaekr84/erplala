'use client'

import { useEffect, useState } from 'react'
import ModalAperturaCaja from '@/components/ModalAperturaCaja'
import ModalCierreCaja from '@/components/ModalCierreCaja'

export default function ControlCajaPage() {
  const [caja, setCaja] = useState<any>(null)
  const [mostrarAbrir, setMostrarAbrir] = useState(false)
  const [mostrarCerrar, setMostrarCerrar] = useState(false)

  const cargarEstado = async () => {
    const res = await fetch('/api/caja/estado')
    const data = await res.json()
    if (data.abierta) {
      setCaja(data)
    } else {
      setCaja(null)
    }
  }

  useEffect(() => {
    cargarEstado()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🧾 Control de Caja</h1>

      {caja ? (
        <div className="space-y-2 mb-6 text-sm text-gray-700">
          <p><strong>Estado:</strong> Abierta</p>
          <p><strong>Usuario:</strong> {caja.usuario}</p>
          <p><strong>Fecha apertura:</strong> {new Date(caja.fecha).toLocaleString('es-AR')}</p>
          <p><strong>Efectivo inicial:</strong> ${caja.efectivoInicial.toLocaleString('es-AR')}</p>

          <button
            onClick={() => setMostrarCerrar(true)}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow"
          >
            🔒 Cerrar Caja
          </button>
        </div>
      ) : (
        <div className="text-gray-700 mb-6">
          <p><strong>Estado:</strong> No hay caja abierta</p>
          <button
            onClick={() => setMostrarAbrir(true)}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
          >
            🔓 Abrir Caja
          </button>
        </div>
      )}

      {/* Modales */}
      {mostrarAbrir && (
        <ModalAperturaCaja onClose={() => {
          setMostrarAbrir(false)
          cargarEstado()
        }} />
      )}
      {mostrarCerrar && (
        <ModalCierreCaja onClose={() => {
          setMostrarCerrar(false)
          cargarEstado()
        }} />
      )}
    </div>
  )
}