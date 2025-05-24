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
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Listado de Categorías</h1>
        <div className="flex gap-4">
          <Link href="/">
            <button className="bg-gray-400 text-white px-4 py-2 rounded">← Home</button>
          </Link>
          <Link href="/categorias/nuevo">
            <button className="bg-blue-600 text-white px-4 py-2 rounded">+ Nueva</button>
          </Link>
        </div>
      </div>
      {categorias.length === 0 ? (
        <p>No hay categorías cargadas.</p>
      ) : (
        <ul className="space-y-2">
          {categorias.map((cat) => (
            <li key={cat.id} className="border p-2 rounded flex justify-between items-center">
              <span>{cat.nombre}</span>
              <button
                onClick={() => handleEliminar(cat.id)}
                className="text-sm text-red-600 hover:underline"
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
