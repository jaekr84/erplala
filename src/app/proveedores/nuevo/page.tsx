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
  </div>
)
}