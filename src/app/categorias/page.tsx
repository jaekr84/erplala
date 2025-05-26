'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Categoria = {
  id: number
  nombre: string
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])

  useEffect(() => {
    const fetchCategorias = async () => {
      const res = await fetch('/api/categorias')
      const data = await res.json()
      setCategorias(data)
    }

    fetchCategorias()
  }, [])

  const handleEliminar = (id: number) => {
    if (typeof window !== 'undefined') {
      const confirmar = window.confirm("¿Eliminar categoría?")
      if (confirmar) {
        fetch(`/api/categorias/${id}`, { method: "DELETE" })
          .then(() => window.location.reload())
      }
    }
  }

  return (
  <div className="p-8 max-w-4xl mx-auto">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold text-gray-800">Listado de Categorías</h1>
      <div className="flex gap-2">
        <Link href="/" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm">
          ← Home
        </Link>
        <Link href="/categorias/nuevo" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
          + Nueva
        </Link>
      </div>
    </div>

    {categorias.length === 0 ? (
      <p className="text-gray-500">No hay categorías cargadas.</p>
    ) : (
      <ul className="space-y-2">
        {categorias.map((cat) => (
          <li key={cat.id} className="border border-gray-200 bg-white p-3 rounded flex justify-between items-center shadow-sm">
            <span className="text-sm text-gray-800">{cat.nombre}</span>
            <button
              onClick={() => handleEliminar(cat.id)}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
)
}