'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CrearProveedorPage() {
  const [nombre, setNombre] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/proveedores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nombre }),
    })
    router.push('/proveedores')
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center mb-4">
        <h1 className="text-xl font-bold">Nuevo Proveedor</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full p-2 border"
          placeholder="Nombre del Proveedor"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <div className="flex gap-4">
          <button
            type="button"
            className="bg-gray-400 text-white px-4 py-2 rounded"
            onClick={() => router.push('/proveedores')}
          >
            ← Volver al listado
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  )
}
