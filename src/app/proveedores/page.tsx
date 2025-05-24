'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Proveedor = {
  id: number
  nombre: string
  telefono?: string
  email?: string
}

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([])

  useEffect(() => {
    const fetchProveedores = async () => {
      const res = await fetch('/api/proveedores')
      const data = await res.json()
      setProveedores(data)
    }

    fetchProveedores()
  }, [])

  const handleEliminar = (id: number) => {
    if (typeof window !== 'undefined') {
      const confirmar = window.confirm("¿Eliminar proveedor?")
      if (confirmar) {
        fetch(`/api/proveedores/${id}`, { method: "DELETE" })
          .then(() => window.location.reload())
      }
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Listado de Proveedores</h1>
        <div className="flex gap-4">
          <Link href="/">
            <button className="bg-gray-400 text-white px-4 py-2 rounded">← Home</button>
          </Link>
          <Link href="/proveedores/nuevo">
            <button className="bg-blue-600 text-white px-4 py-2 rounded">+ Nuevo</button>
          </Link>
        </div>
      </div>
      {proveedores.length === 0 ? (
        <p>No hay proveedores cargados.</p>
      ) : (
        <ul className="space-y-2">
          {proveedores.map((prov) => (
            <li key={prov.id} className="border p-2 rounded flex justify-between items-center">
              <div>
                <strong>{prov.nombre}</strong><br />
                {prov.telefono || 'Sin teléfono'} — {prov.email || 'Sin email'}
              </div>
              <button
                onClick={() => handleEliminar(prov.id)}
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
