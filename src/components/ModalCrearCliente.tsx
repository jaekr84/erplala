'use client'

import { Dialog } from '@headlessui/react'
import { useState } from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

export default function ModalCrearCliente({ isOpen, onClose, onCreated }: Props) {
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [dni, setDni] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre.trim()) {
      alert('El nombre es obligatorio')
      return
    }

    const res = await fetch('/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, apellido, dni, telefono, email })
    })

    if (res.ok) {
      onCreated()
      onClose()
    } else {
      const err = await res.json()
      alert(err.message || 'No se pudo crear el cliente')
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white p-6 rounded shadow">
          <Dialog.Title className="text-lg font-bold mb-4">Nuevo Cliente</Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input className="w-full border p-2" placeholder="Nombre*" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            <input className="w-full border p-2" placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} />
            <input className="w-full border p-2" placeholder="DNI" value={dni} onChange={(e) => setDni(e.target.value)} />
            <input className="w-full border p-2" placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
            <input className="w-full border p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
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