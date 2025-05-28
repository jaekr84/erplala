
'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="nombre">Nombre</Label>
        <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      </div>

      <div className="space-y-1">
        <Label htmlFor="telefono">Teléfono</Label>
        <Input id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div className="space-y-1">
        <Label htmlFor="direccion">Dirección</Label>
        <Input id="direccion" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  )
}