'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Cliente } from '@/types'

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const clientesFiltrados = clientes.filter(c => {
    const texto = `${c.nombre} ${c.apellido} ${c.dni || ''}`.toLowerCase()
    return texto.includes(busqueda.trim().toLowerCase())
  })

  const porPagina = 25
  const totalPaginas = Math.max(1, Math.ceil(clientesFiltrados.length / porPagina))
  const clientesPagina = clientesFiltrados.slice((pagina - 1) * porPagina, pagina * porPagina)

  useEffect(() => {
    fetch('/api/clientes')
      .then(res => res.json())
      .then(data => setClientes(data))
      .catch(err => {
        console.error(err)
        setError('Error al cargar clientes')
      })
  }, [])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <div className="flex gap-2">
          <Link href="/">
            <button className="bg-gray-400 text-white px-3 py-1 rounded">← Inicio</button>
          </Link>
          <Link href="/clientes/nuevo">
            <button className="bg-green-600 text-white px-3 py-1 rounded">+ Nuevo</button>
          </Link>
        </div>
      </div>

      <input
        type="text"
        placeholder="Buscar por nombre o DNI"
        value={busqueda}
        onChange={(e) => {
          setPagina(1)
          setBusqueda(e.target.value)
        }}
        className="border px-3 py-2 mb-4 w-full max-w-md rounded"
      />

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Nombre</th>
            <th className="p-2 text-left">DNI</th>
            <th className="p-2 text-left">Teléfono</th>
            <th className="p-2 text-left">Email</th>
          </tr>
        </thead>
        <tbody>
          {clientesPagina.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">
                No se encontraron clientes.
              </td>
            </tr>
          ) : (
            clientesPagina.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-2">{c.nombre} {c.apellido}</td>
                <td className="p-2">{c.dni || '—'}</td>
                <td className="p-2">{c.telefono || '—'}</td>
                <td className="p-2">{c.email || '—'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="mt-4 flex justify-center gap-4">
        <button
          onClick={() => setPagina(p => Math.max(1, p - 1))}
          disabled={pagina === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          ← Anterior
        </button>
        <span>Página {pagina} de {totalPaginas}</span>
        <button
          onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
          disabled={pagina === totalPaginas}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Siguiente →
        </button>
      </div>
    </div>
  )
}