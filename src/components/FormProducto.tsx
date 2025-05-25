'use client'

import { useEffect, useState } from 'react'
import ModalCategoria from '@/components/ModalCategoria'

type Categoria = {
  id: number
  nombre: string
}

export default function FormProducto() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [categoriaId, setCategoriaId] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)

  // Obtener categorías
  const fetchCategorias = async () => {
    const res = await fetch('/api/categorias')
    const data = await res.json()
    setCategorias(data)
  }

  useEffect(() => {
    fetchCategorias()
  }, [])

  return (
    <div className="space-y-4">
      {/* Select de categoría */}
      <div>
        <label className="block text-sm font-medium">Categoría</label>
        <div className="flex gap-2 items-center">
          <select
            className="border p-2 rounded w-full"
            value={categoriaId ?? ''}
            onChange={(e) => setCategoriaId(Number(e.target.value))}
          >
            <option value="" disabled>
              Seleccionar categoría
            </option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            +
          </button>
        </div>
      </div>

      {/* Modal de nueva categoría */}
      {showModal && (
        <ModalCategoria
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onCreated={() => {
            fetchCategorias()
            setShowModal(false)
          }}
        />
      )}
    </div>
  )
}