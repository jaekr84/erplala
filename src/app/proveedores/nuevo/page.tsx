'use client'

import { useRouter } from 'next/navigation'
import FormProveedor from '@/components/FormProveedor'

export default function CrearProveedorPage() {
  const router = useRouter()

return (
  <div className="p-8 max-w-lg mx-auto">
    <h1 className="text-2xl font-semibold text-gray-800 mb-6">Nuevo Proveedor</h1>

    <FormProveedor
      modo="page"
      onSuccess={() => {
        router.push('/proveedores')
      }}
    />

    <div className="flex gap-4 mt-6">
      <button
        type="button"
        className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded text-sm"
        onClick={() => router.push('/proveedores')}
      >
        ← Volver al listado
      </button>
    </div>
  </div>
)
}