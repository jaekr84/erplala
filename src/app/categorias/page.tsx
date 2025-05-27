'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"


type Categoria = {
  id: number
  nombre: string
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [busqueda, setBusqueda] = useState('')

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
  const categoriasFiltradas = categorias.filter((cat) =>
    cat.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Listado de Categorías</h1>
        <div className="flex gap-2">
          <Button asChild variant="default" >
            <Link href="/" >
              ← Home
            </Link>
          </Button>
            <Button asChild variant="default">
          <Link href="/categorias/nuevo" >
              + Nueva
          </Link>
            </Button>
        </div>
      </div>
      <input
        type="text"
        placeholder="Buscar categoría..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="border rounded px-3 py-2 w-full md:w-1/2 text-sm"
      />
      {categoriasFiltradas.length === 0 ? (
        <p className="text-gray-500">No hay categorías cargadas.</p>
      ) : (
        <ul className="space-y-2">
          {categoriasFiltradas.map((cat) => (
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