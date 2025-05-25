'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Contador = {
  nombre: string
  valor: number
}

export default function PaginaContadores() {
  const [contadores, setContadores] = useState<Contador[]>([])
  const [loading, setLoading] = useState(true)

  const nombres = ['articulo', 'venta', 'compra']

  const fetchContadores = async () => {
    try {
      const resultados = await Promise.all(
        nombres.map(async (nombre) => {
          const res = await fetch(`/api/contador/proximo?nombre=${nombre}`)
          // Corregido: Si no existe el contador, devolver valor 0 pero no lanzar error
          if (!res.ok) {
            console.warn(`No se pudo cargar el contador "${nombre}". Se usará valor 0.`)
            return { nombre, valor: 0 }
          }
          const data = await res.json()
          return { nombre, valor: data.valor ?? 0 }
        })
      )
      setContadores(resultados)
    } catch (error) {
      console.error("Error al cargar contadores:", error)
      // Si ocurre un error general, inicializar todos en 0
      setContadores(nombres.map((nombre) => ({ nombre, valor: 0 })))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (nombre: string, valor: number) => {
    setContadores((prev) =>
      prev.map((c) => (c.nombre === nombre ? { ...c, valor } : c))
    )
  }

  const handleGuardar = async (nombre: string, valor: number) => {
    const res = await fetch('/api/contador/modificar', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, valor }),
    })
    if (res.ok) {
      alert(`Contador "${nombre}" actualizado`)
    } else {
      alert(`Error al actualizar contador "${nombre}"`)
    }
  }

  useEffect(() => {
    fetchContadores()
  }, [])

  if (loading) return <p className="p-6">Cargando contadores...</p>

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Configuración de Contadores</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-2">Nombre</th>
            <th className="text-left p-2">Valor</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {contadores.map((c) => (
            <tr key={c.nombre} className="border-t">
              <td className="p-2 capitalize">{c.nombre}</td>
              <td className="p-2">
                <input
                  type="number"
                  value={c.valor}
                  onChange={(e) => handleChange(c.nombre, parseInt(e.target.value) || 0)}
                  className="border p-1 w-24"
                />
              </td>
              <td className="p-2">
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={() => handleGuardar(c.nombre, c.valor)}
                >
                  Guardar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link href="/">
        <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
          ← Volver al inicio
        </button>
      </Link>
    </div>
  )
}