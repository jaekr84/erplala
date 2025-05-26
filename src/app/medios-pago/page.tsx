'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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
        <div className="p-6 max-w-2xl mx-auto">
            <div className="mb-4">
                <button
                    onClick={() => window.location.href = '/'}
                    className="bg-gray-500 text-white px-3 py-1 rounded"
                >
                    ← Volver al inicio
                </button>
            </div>
            <h1 className="text-2xl font-bold mb-4">Medios de Pago</h1>

            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    placeholder="Nombre del medio"
                    value={nombreNuevo}
                    onChange={(e) => setNombreNuevo(e.target.value)}
                    className="border p-2 flex-1"
                />
                <button
                    onClick={crearMedio}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                >
                    + Agregar
                </button>
            </div>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            <table className="w-full border text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="text-left p-2">Nombre</th>
                        <th className="text-left p-2">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {medios.map((medio) => (
                        <tr key={medio.id} className="border-t">
                            <td className="p-2">{medio.nombre}</td>
                            <td className="p-2">
                                <button
                                    onClick={() => eliminarMedio(medio.id)}
                                    className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                                >
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}