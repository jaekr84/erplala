'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

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
        if (!res.ok) {
          console.warn(`No se pudo cargar el contador "${nombre}". Se usará valor 0.`)
          return { nombre, valor: 0 }
        }
        const data = await res.json()
        const valor = typeof data.valor === 'number' ? data.valor : parseInt(data.valor) || 0
        return { nombre, valor }
      })
    )
    setContadores(resultados)
  } catch (error) {
    console.error("Error al cargar contadores:", error)
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
  <div className="p-6 max-w-2xl mx-auto space-y-6">
    <h1 className="text-2xl font-bold">Configuración de Contadores</h1>

    <div className="border rounded-md overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="text-left p-3">Nombre</th>
            <th className="text-left p-3">Valor</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {contadores.map((c) => (
            <tr key={c.nombre} className="border-t hover:bg-muted/50">
              <td className="p-3 capitalize">{c.nombre}</td>
              <td className="p-3">
                <Input
                  type="number"
                  value={c.valor}
                  onChange={(e) => handleChange(c.nombre, parseInt(e.target.value) || 0)}
                  className="w-24"
                />
              </td>
              <td className="p-3">
                <Button onClick={() => handleGuardar(c.nombre, c.valor)}>
                  Guardar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)
}