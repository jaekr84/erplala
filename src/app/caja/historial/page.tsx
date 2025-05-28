'use client'

import { useEffect, useState } from 'react'

type Caja = {
  id: number
  fechaApertura: string
  fechaCierre: string | null
  efectivoInicial: number
  efectivoFinal: number | null
  diferencia: number | null
  observaciones: string | null
  abierta: boolean 
  usuario: {
    nombre: string
  }
}

export default function HistorialCajaPage() {
  const [cajas, setCajas] = useState<Caja[]>([])

  useEffect(() => {
    fetch('/api/caja/historial')
      .then(res => res.json())
      .then(setCajas)
  }, [])


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📚 Historial de Cajas</h1>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1 text-left">Fecha apertura</th>
              <th className="border px-2 py-1 text-left">Fecha cierre</th>
              <th className="border px-2 py-1 text-left">Usuario</th>
              <th className="border px-2 py-1 text-right">Inicial</th>
              <th className="border px-2 py-1 text-right">Final</th>
              <th className="border px-2 py-1 text-right">Diferencia</th>
              <th className="border px-2 py-1">Obs</th>
            </tr>
          </thead>
          <tbody>
            {cajas.map((caja, index) => (
              <tr key={caja.id}>
                <td className="border px-2 py-1">{new Date(caja.fechaApertura).toLocaleString('es-AR')}</td>
                <td className="border px-2 py-1">{caja.fechaCierre ? new Date(caja.fechaCierre).toLocaleString('es-AR') : '—'}</td>
                <td className="border px-2 py-1">{caja.usuario.nombre}</td>
                <td className="border px-2 py-1 text-right">${caja.efectivoInicial.toLocaleString('es-AR')}</td>
                <td className="border px-2 py-1 text-right">{caja.efectivoFinal != null ? `$${caja.efectivoFinal.toLocaleString('es-AR')}` : '—'}</td>
                <td className={`border px-2 py-1 text-right ${caja.diferencia === 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {caja.diferencia != null ? `$${caja.diferencia.toLocaleString('es-AR')}` : '—'}
                </td>
                <td className="border px-2 py-1 text-xs italic text-gray-600">
                  {caja.observaciones || '—'}

                  {/* ✅ Botón de reabrir dentro de la celda de observaciones */}
                  {index === 0 && !caja.abierta && (
                    <button
                      className="text-blue-600 underline text-xs ml-2"
                      onClick={async () => {
                        const res = await fetch('/api/caja/reabrir', { method: 'POST' })
                        const data = await res.json()
                        if (res.ok) alert('✅ Caja reabierta correctamente')
                        else alert(`⚠️ ${data.error}`)
                        location.reload()
                      }}
                    >
                      Reabrir
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}