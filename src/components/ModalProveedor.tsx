'use client'

import { Dialog } from '@headlessui/react'
import FormProveedor from './FormProveedor'

type Props = {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

export default function ModalProveedor({ isOpen, onClose, onCreated }: Props) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-white p-6 rounded shadow">
          <Dialog.Title className="text-lg font-bold mb-4">Nuevo Proveedor</Dialog.Title>

          <FormProveedor
            modo="modal"
            onSuccess={() => {
              onCreated()
              onClose()
            }}
          />
          <div className="flex justify-end mt-4">
            <button onClick={onClose} className="ml-2 px-4 py-2 bg-gray-300 rounded">
              Cancelar
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}