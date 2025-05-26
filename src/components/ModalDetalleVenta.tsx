'use client'

import { VentaConDetalles } from '@/types'

export default function ModalDetalleVenta({ venta, onClose }: {
  venta: VentaConDetalles
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl shadow relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
        >×</button>

        <h2 className="text-xl font-bold mb-2">Venta #{venta.nroComprobante}</h2>
        <p className="text-sm text-gray-600 mb-4">
          Fecha: {new Date(venta.fecha).toLocaleDateString()}<br />
          Cliente: {venta.cliente?.nombre || 'Consumidor final'}<br />
          Total: ${venta.total.toLocaleString('es-AR')}
        </p>

        <table className="w-full border text-sm mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Código</th>
              <th className="p-2">Descripción</th>
              <th className="p-2">Talle</th>
              <th className="p-2">Color</th>
              <th className="p-2">Cantidad</th>
              <th className="p-2">Precio</th>
              <th className="p-2">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {venta.detalles.map(d => (
              <tr key={d.id} className="border-t">
                <td className="p-2 font-mono">{d.variante.producto.codigo}</td>
                <td className="p-2">{d.variante.producto.descripcion}</td>
                <td className="p-2">{d.variante.talle}</td>
                <td className="p-2">{d.variante.color}</td>
                <td className="p-2">{d.cantidad}</td>
                <td className="p-2">${d.precio}</td>
                <td className="p-2">${(d.precio * d.cantidad).toLocaleString('es-AR')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cerrar</button>
          <button onClick={() => alert('Reimprimir ticket de cambio')} className="px-4 py-2 bg-yellow-500 text-white rounded">
            Ticket de cambio
          </button>
          <button onClick={() => alert('Reimprimir ticket de venta')} className="px-4 py-2 bg-blue-600 text-white rounded">
            Ticket de venta
          </button>
        </div>
      </div>
    </div>
  )
}