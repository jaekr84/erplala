'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type MedioPago = {
    id: number
    nombre: string
}

export default function MediosPagoPage() {
    const [medios, setMedios] = useState<MedioPago[]>([])
    const [nombreNuevo, setNombreNuevo] = useState('')
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const cargarMedios = async () => {
        const res = await fetch('/api/medios-pago')
        const data = await res.json()
        setMedios(data)
    }

    useEffect(() => {
        cargarMedios()
    }, [])

    const crearMedio = async () => {
        setError(null)
        const res = await fetch('/api/medios-pago', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: nombreNuevo }),
        })

        if (res.ok) {
            setNombreNuevo('')
            await cargarMedios()
        } else {
            const data = await res.json()
            setError(data.message || 'Error al crear el medio de pago')
        }
    }

    const eliminarMedio = async (id: number) => {
        if (!confirm('¿Eliminar este medio de pago?')) return

        const res = await fetch(`/api/medios-pago/${id}`, {
            method: 'DELETE',
        })

        if (res.ok) {
            await cargarMedios()
        } else {
            const data = await res.json()
            setError(data.message || 'Error al eliminar')
        }
    }

    return (
  <div className="p-6 max-w-2xl mx-auto space-y-6">
    <h1 className="text-2xl font-bold">Medios de Pago</h1>

    <div className="flex gap-2">
      <Input
        type="text"
        placeholder="Nombre del medio"
        value={nombreNuevo}
        onChange={(e) => setNombreNuevo(e.target.value)}
      />
      <Button onClick={crearMedio}>+ Agregar</Button>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
        ← Volver al inicio
      </Button>
    </div>

    {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

    <div className="border rounded-md overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="text-left p-3">Nombre</th>
            <th className="text-right p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {medios.map((medio) => (
            <tr key={medio.id} className="border-t hover:bg-muted/50">
              <td className="p-3">{medio.nombre}</td>
              <td className="p-3">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => eliminarMedio(medio.id)}
                  className='float-right'
                >
                  Eliminar
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