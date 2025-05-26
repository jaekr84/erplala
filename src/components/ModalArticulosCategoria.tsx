'use client'

import { useEffect, useState } from 'react'
import { Dialog } from '@headlessui/react'
import ModalDetalleArticulo from './ModalDetalleArticulo'

type Articulo = {
  codBarra: string
  descripcion: string
  cantidadVendida: number
}

type Props = {
  categoria: string
  onClose: () => void
}

export default function ModalArticulosCategoria({ categoria, onClose }: Props) {
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [detalleCodBarra, setDetalleCodBarra] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/reportes/articulosPorCategoria?categoria=${encodeURIComponent(categoria)}`)
      .then(res => res.json())
      .then(setArticulos)
  }, [categoria])

  return (
    <>
      <Dialog open={true} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xl max-h-[80vh] overflow-auto flex flex-col">
            <Dialog.Title className="text-lg font-bold mb-4">
              Artículos vendidos - {categoria}
            </Dialog.Title>

            <div className="flex-1 overflow-auto">
              {articulos.length === 0 ? (
                <p className="text-gray-500">No hay ventas registradas.</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {articulos.map((a, idx) => (
                    <li
                      key={idx}
                      className="py-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setDetalleCodBarra(a.codBarra)}
                    >
                      <p className="font-semibold">{a.descripcion}</p>
                      <p className="text-sm">Vendidas: {a.cantidadVendida}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="sticky bottom-0 bg-white pt-4">
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

      {detalleCodBarra && (
        <ModalDetalleArticulo
          codBarra={detalleCodBarra}
          onClose={() => setDetalleCodBarra(null)}
        />
      )}
    </>
  )
}