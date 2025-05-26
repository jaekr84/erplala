'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NuevoClientePage() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [dni, setDni] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [fechaNac, setFechaNac] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!nombre.trim() || !apellido.trim()) {
      setError('Nombre y apellido son obligatorios')
      return
    }

    const res = await fetch('/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, apellido, dni, telefono, email, fechaNac })
    })

    if (res.ok) {
      router.push('/clientes')
    } else {
      const data = await res.json()
      setError(data.message || 'Error al crear el cliente')
    }
  }

  return (
  <div className="p-8 max-w-xl mx-auto">
    <h1 className="text-2xl font-semibold text-gray-800 mb-6">Nuevo Cliente</h1>

    <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <input
        className="w-full border border-gray-300 rounded px-4 py-2 text-sm"
        placeholder="Nombre"
        value={nombre}
        onChange={e => setNombre(e.target.value)}
        required
      />
      <input
        className="w-full border border-gray-300 rounded px-4 py-2 text-sm"
        placeholder="Apellido"
        value={apellido}
        onChange={e => setApellido(e.target.value)}
        required
      />
      <input
        className="w-full border border-gray-300 rounded px-4 py-2 text-sm"
        placeholder="DNI"
        value={dni}
        onChange={e => setDni(e.target.value)}
      />
      <input
        className="w-full border border-gray-300 rounded px-4 py-2 text-sm"
        placeholder="Teléfono"
        value={telefono}
        onChange={e => setTelefono(e.target.value)}
      />
      <input
        className="w-full border border-gray-300 rounded px-4 py-2 text-sm"
        placeholder="Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        className="w-full border border-gray-300 rounded px-4 py-2 text-sm"
        type="date"
        value={fechaNac}
        onChange={e => setFechaNac(e.target.value)}
      />

      {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

      <div className="flex gap-4 pt-2">
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded text-sm"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={() => router.push('/clientes')}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded text-sm"
        >
          Cancelar
        </button>
      </div>
    </form>
  </div>
)
}