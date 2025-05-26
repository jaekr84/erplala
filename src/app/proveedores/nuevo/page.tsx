'use client'

import { useRouter } from 'next/navigation'
import FormProveedor from '@/components/FormProveedor'

export default function CrearProveedorPage() {
  const router = useRouter()

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center mb-4">
        <h1 className="text-xl font-bold">Nuevo Proveedor</h1>
      </div>

      <FormProveedor
        modo="page"
        onSuccess={() => {
          router.push('/proveedores')
        }}
      />

      <div className="flex gap-4 mt-6">
        <button
          type="button"
          className="bg-gray-400 text-white px-4 py-2 rounded"
          onClick={() => router.push('/proveedores')}
        >
          ← Volver al listado
        </button>
      </div>
    </div>
  )
}