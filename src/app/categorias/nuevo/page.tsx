'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CrearCategoriaPage() {
  const [nombre, setNombre] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/categorias', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nombre }),
    })
    router.push('/categorias')
  }

  return (
  <div className="p-8 max-w-lg mx-auto">
    <h1 className="text-2xl font-semibold text-gray-800 mb-6">Nueva Categoría</h1>

    <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <input
        type="text"
        className="w-full border border-gray-300 rounded px-4 py-2 text-sm"
        placeholder="Nombre de categoría"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
      />

      <div className="flex gap-4 pt-2">
        <button
          type="button"
          className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded text-sm"
          onClick={() => router.push('/categorias')}
        >
          ← Volver
        </button>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded text-sm"
        >
          Guardar
        </button>
      </div>
    </form>
  </div>
)
}