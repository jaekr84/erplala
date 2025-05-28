'use client'

import { Dialog } from '@headlessui/react'
import { useEffect, useState } from 'react'

type VarianteDetalle = {
  talle: string
  color: string
  stock: number
  cantidadVendida: number
}

type DetalleArticulo = {
  descripcion: string
  proveedor: string
  fechaAlta: string
  variantes: VarianteDetalle[]
}

type Props = {
  codBarra: string
  onClose: () => void
}

export default function ModalDetalleArticulo({ codBarra, onClose }: Props) {
  const [detalle, setDetalle] = useState<DetalleArticulo | null>(null)

  useEffect(() => {
    fetch(`/api/reportes/detalleArticulo?codBarra=${encodeURIComponent(codBarra)}`)
      .then(res => res.json())
      .then(setDetalle)
  }, [codBarra])

  return (
    <Dialog open={true} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl shadow-lg w-full max-w-lg h-[90vh] flex flex-col overflow-hidden">
          
          {/* Encabezado */}
          <div className="px-6 pt-6 pb-2">
            <Dialog.Title className="text-lg font-bold">Detalle del Artículo</Dialog.Title>
          </div>

          {/* Contenido scrollable */}
          <div className="flex-1 overflow-auto px-6 space-y-2">
            {detalle ? (
              <>
                <p><strong>Descripción:</strong> {detalle.descripcion}</p>
                <p><strong>Proveedor:</strong> {detalle.proveedor}</p>
                <p><strong>Fecha de alta:</strong> {new Date(detalle.fechaAlta).toLocaleDateString()}</p>

                <h4 className="font-semibold mt-4 mb-2">Variantes:</h4>
                <table className="w-full text-sm border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left">Talle</th>
                      <th className="p-2 text-left">Color</th>
                      <th className="p-2 text-right">Stock</th>
                      <th className="p-2 text-right">Vendidas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalle.variantes.map((v, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2">{v.talle}</td>
                        <td className="p-2">{v.color}</td>
                        <td className="p-2 text-right">{v.stock}</td>
                        <td className="p-2 text-right">{v.cantidadVendida}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p className="text-gray-500">Cargando información...</p>
            )}
          </div>

          {/* Pie con botón */}
          <div className="border-t p-4">
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition"
            >
              Cerrar
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}