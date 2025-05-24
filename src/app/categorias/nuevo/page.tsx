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
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-4">Nueva Categoría</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full p-2 border"
          placeholder="Nombre de categoría"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <div className="flex gap-4">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 text-black rounded"
            onClick={() => router.push('/categorias')}
          >
            ← Volver
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