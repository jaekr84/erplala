'use client'

import { Dialog } from '@headlessui/react'
import { useState } from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

export default function ModalProveedor({ isOpen, onClose, onCreated }: Props) {
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
    onCreated()
    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white p-6 rounded shadow">
          <Dialog.Title className="text-lg font-bold mb-4">Nuevo Proveedor</Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input className="w-full border p-2" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            <input className="w-full border p-2" placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
            <input className="w-full border p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="w-full border p-2" placeholder="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Guardar</button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
