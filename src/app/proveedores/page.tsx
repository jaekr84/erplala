'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"

type Proveedor = {
  id: number
  nombre: string
  telefono?: string
  email?: string
}

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [busqueda, setBusqueda] = useState('')

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

  const proveedoresFiltrados = proveedores.filter((prov) =>
    prov.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Listado de Proveedores</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/">← Home</Link>
          </Button>
          <Button asChild>
            <Link href="/proveedores/nuevo">+ Nuevo</Link>
          </Button>
        </div>
      </div>

      <input
        type="text"
        placeholder="Buscar proveedor..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="border rounded px-3 py-2 w-full md:w-1/2 text-sm"
      />

      {proveedoresFiltrados.length === 0 ? (
        <p className="text-muted-foreground">No hay proveedores que coincidan.</p>
      ) : (
        <ul className="space-y-2">
          {proveedoresFiltrados.map((prov) => (
            <li key={prov.id} className="border p-4 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">{prov.nombre}</p>
                <p className="text-sm text-muted-foreground">
                  {prov.telefono || 'Sin teléfono'} — {prov.email || 'Sin email'}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-red-600"
                onClick={() => handleEliminar(prov.id)}
              >
                Eliminar
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}