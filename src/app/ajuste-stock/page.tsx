'use client'

import { useState } from 'react'
import { Variante } from '@/types'
import { useRouter } from 'next/navigation'

export default function AjusteStockPage() {
  const router = useRouter()
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState<Variante[]>([])
  const [detalle, setDetalle] = useState<any[]>([])

  const buscarArticulo = async () => {
    if (!busqueda.trim()) return
    const res = await fetch(`/api/variantes?query=${encodeURIComponent(busqueda)}`)
    const data = await res.json()
    if (Array.isArray(data) && data.length > 0) {
      setDetalle(data.map(v => ({
        varianteId: v.id,
        codigo: v.producto.codigo,
        descripcion: v.producto.descripcion,
        talle: v.talle,
        color: v.color,
        stockActual: v.stock,
        ajuste: 0,
        stockNuevo: v.stock
      })))
    } else {
      alert('Artículo no encontrado')
    }
  }

  const confirmarAjuste = async () => {
    const ajustes = detalle.filter(d => d.ajuste !== 0)
    if (ajustes.length === 0) return alert('No hay cambios para guardar')

    const payload = ajustes.map(d => ({
      varianteId: d.varianteId,
      stockNuevo: d.stockActual + d.ajuste,
      diferencia: d.ajuste
    }))

    const res = await fetch('/api/ajuste-stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (res.ok) {
      alert('Ajuste guardado correctamente')
      router.push('/')
    } else {
      alert('Error al guardar el ajuste')
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto text-sm">
      <h1 className="text-2xl font-bold mb-4">Ajuste de Stock</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Buscar artículo por código"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="border p-2 flex-1"
        />
        <button
          onClick={buscarArticulo}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Buscar
        </button>
      </div>

      {detalle.length > 0 && (
        <table className="w-full border text-xs">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-1 text-left">Código</th>
              <th className="px-2 py-1 text-left">Descripción</th>
              <th className="px-2 py-1 text-left">Talle</th>
              <th className="px-2 py-1 text-left">Color</th>
              <th className="px-2 py-1 text-left">Stock actual</th>
              <th className="px-2 py-1 text-left">Agregar / Quitar</th>
              <th className="px-2 py-1 text-left">Stock final</th>
            </tr>
          </thead>
          <tbody>
            {detalle.map((item, i) => (
              <tr key={i} className="border-t">
                <td className="px-2 py-1 font-mono text-left">{item.codigo}</td>
                <td className="px-2 py-1 text-left">{item.descripcion}</td>
                <td className="px-2 py-1 text-left">{item.talle}</td>
                <td className="px-2 py-1 text-left">{item.color}</td>
                <td className="px-2 py-1 text-right">{item.stockActual}</td>
                <td className="px-2 py-1 text-right">
                  <input
                    type="number"
                    className="w-20 border p-1 text-right"
                    value={item.ajuste ?? 0}
                    onChange={(e) => {
                      const ajuste = parseInt(e.target.value)
                      const valid = isNaN(ajuste) ? 0 : ajuste
                      setDetalle(prev => prev.map((d, j) => j === i ? {
                        ...d,
                        ajuste: valid,
                        stockNuevo: d.stockActual + valid
                      } : d))
                    }}
                  />
                </td>
                <td className="px-2 py-1 text-right">{item.stockNuevo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {detalle.length > 0 && (
        <div className="flex justify-between mt-6">
          <button
            onClick={() => router.push('/')}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Cancelar
          </button>
          <button
            onClick={confirmarAjuste}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Confirmar ajuste
          </button>
        </div>
      )}
    </div>
  )
}