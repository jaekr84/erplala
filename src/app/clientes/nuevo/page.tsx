'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

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
    <div className="p-8 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Nuevo Cliente</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <Input
          placeholder="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
        />
        <Input
          placeholder="Apellido"
          value={apellido}
          onChange={e => setApellido(e.target.value)}
          required
        />
        <Input
          placeholder="DNI"
          value={dni}
          onChange={e => setDni(e.target.value)}
        />
        <Input
          placeholder="Teléfono"
          value={telefono}
          onChange={e => setTelefono(e.target.value)}
        />
        <Input
          placeholder="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <Input
          type="date"
          value={fechaNac}
          onChange={e => setFechaNac(e.target.value)}
        />

        {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

        <div className="flex gap-4 pt-2 justify-end">
          <Button type="submit">Guardar</Button>
          <Button type="button" variant="outline" onClick={() => router.push('/clientes')}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )

}