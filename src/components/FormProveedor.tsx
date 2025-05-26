
'use client'

import { useState } from 'react'

type Props = {
  onSuccess?: () => void
  modo?: 'modal' | 'page'
}

export default function FormProveedor({ onSuccess, modo = 'page' }: Props) {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [direccion, setDireccion] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/proveedores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, telefono, email, direccion }),
    })
    setNombre('')
    setTelefono('')
    setEmail('')
    setDireccion('')
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input className="w-full border p-2" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      <input className="w-full border p-2" placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
      <input className="w-full border p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full border p-2" placeholder="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} />

      <div className="flex justify-end mt-4">
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          Guardar
        </button>
      </div>
    </form>
  )
}