'use client'

import { useEffect, useState } from 'react'
import GraficoCategorias from '@/components/GraficoCategorias'


export default function DashboardPage() {
  const [resumen, setResumen] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/resumen')
      .then(res => res.json())
      .then(data => setResumen(data))
      .catch(err => {
        console.error(err)
        setError('No se pudo cargar el resumen')
      })
  }, [])

  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!resumen) return <div className="p-6">Cargando...</div>

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Dashboard de Ventas</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-sm text-gray-500">Total Hoy</h2>
          <p className="text-lg font-bold text-green-600">
            ${resumen.totalHoy.toLocaleString('es-AR')}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-sm text-gray-500">Total Semana</h2>
          <p className="text-lg font-bold text-green-600">
            ${resumen.totalSemana.toLocaleString('es-AR')}
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-sm text-gray-500">Total Mes</h2>
          <p className="text-lg font-bold text-green-600">
            ${resumen.totalMes.toLocaleString('es-AR')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-sm text-gray-500">Unidades Hoy</h2>
          <p className="text-lg font-bold">{resumen.unidadesHoy}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-sm text-gray-500">Unidades Semana</h2>
          <p className="text-lg font-bold">{resumen.unidadesSemana}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-sm text-gray-500">Unidades Mes</h2>
          <p className="text-lg font-bold">{resumen.unidadesMes}</p>
        </div>
      </div>
      <div className="p-0">
        <GraficoCategorias />
        {/* Aquí irán los modales si hacés clic en una barra */}
      </div>
    </div>
  )
}

