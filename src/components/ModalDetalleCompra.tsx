// src/components/ModalDetalleCompra.tsx
import { formatCurrency } from '@/utils/format'

type CompraConDetalles = {
  nroComprobante: string
  id: number
  fecha: string
  proveedor: { nombre: string }
  total: number
  detalles: {
    id: number
    cantidad: number
    costo: number
    variante: {
      talle: string
      color: string
      producto: {
        descripcion: string
        codigo: string
      }
    }
  }[]
}

export default function ModalDetalleCompra({
  compra,
  onClose,
}: {
  compra: CompraConDetalles
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
        >×</button>

        <h2 className="text-xl font-bold mb-2">
          Detalle de Compra {compra.nroComprobante}
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Fecha: {new Date(compra.fecha).toLocaleDateString()}<br />
          Proveedor: {compra.proveedor.nombre}<br />
          Total: {formatCurrency(compra.total)}
        </p>

        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Código</th>
              <th className="p-2 text-left">Descripción</th>
              <th className="p-2 text-left">Talle</th>
              <th className="p-2 text-left">Color</th>
              <th className="p-2 text-left">Cantidad</th>
              <th className="p-2 text-left">Costo</th>
              <th className="p-2 text-left">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {compra.detalles.map((d) => (
              <tr key={d.id} className="border-t">
                <td className="p-2">{d.variante.producto.codigo}</td>
                <td className="p-2">{d.variante.producto.descripcion}</td>
                <td className="p-2">{d.variante.talle}</td>
                <td className="p-2">{d.variante.color}</td>
                <td className="p-2">{d.cantidad}</td>
                <td className="p-2">{formatCurrency(d.costo)}</td>
                <td className="p-2">{formatCurrency(d.cantidad * d.costo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
