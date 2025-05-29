'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { VentaConDetalles } from '@/types'

type Props = {
  venta: VentaConDetalles
  onClose: () => void
}

export default function ModalDetalleVenta({ venta, onClose }: Props) {
  const [seleccionados, setSeleccionados] = useState<number[]>([])

  const toggleProducto = (detalleId: number) => {
    setSeleccionados(prev =>
      prev.includes(detalleId)
        ? prev.filter(id => id !== detalleId)
        : [...prev, detalleId]
    )
  }

  const toggleTodos = () => {
    if (seleccionados.length === venta.detalles.length) {
      setSeleccionados([]) // deseleccionar todos
    } else {
      setSeleccionados(venta.detalles.map(d => d.id)) // seleccionar todos
    }
  }

  const imprimirTicketVenta = () => {
    window.open(`/api/tickets/venta?ventaId=${venta.id}`, '_blank')
  }

  const imprimirTicketCambio = () => {
    if (seleccionados.length === 0) {
      alert('Debes seleccionar al menos un producto para el ticket de cambio')
      return
    }

    const params = new URLSearchParams()
    params.set('ventaId', venta.id.toString())
    seleccionados.forEach(id => params.append('detalleId', id.toString()))

    window.open(`/api/tickets/cambio?${params.toString()}`, '_blank')
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>🧾 Venta #{venta.nroComprobante}</DialogTitle>
        </DialogHeader>

        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>Fecha:</strong> {new Date(venta.fecha).toLocaleDateString()}</p>
          <p><strong>Cliente:</strong> {venta.cliente?.nombre || 'Consumidor final'}</p>
          <p><strong>Total:</strong> ${venta.total.toLocaleString('es-AR')}</p>
        </div>

        <div className="mt-4 overflow-auto">
          <table className="w-full text-sm border rounded-md overflow-hidden">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="p-2 text-center">
                  <input
                    type="checkbox"
                    checked={seleccionados.length === venta.detalles.length}
                    onChange={toggleTodos}
                  />
                </th>
                <th className="p-2 text-left">Código</th>
                <th className="p-2 text-left">Descripción</th>
                <th className="p-2 text-left">Talle</th>
                <th className="p-2 text-left">Color</th>
                <th className="p-2 text-right">Cantidad</th>
                <th className="p-2 text-right">Precio</th>
                <th className="p-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {venta.detalles.map(d => (
                <tr key={d.id} className="border-t">
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      checked={seleccionados.includes(d.id)}
                      onChange={() => toggleProducto(d.id)}
                    />
                  </td>
                  <td className="p-2 font-mono">{d.variante.producto.codigo}</td>
                  <td className="p-2">{d.variante.producto.descripcion}</td>
                  <td className="p-2">{d.variante.talle}</td>
                  <td className="p-2">{d.variante.color}</td>
                  <td className="p-2 text-right">{d.cantidad}</td>
                  <td className="p-2 text-right">${d.precio}</td>
                  <td className="p-2 text-right">
                    ${(d.precio * d.cantidad).toLocaleString('es-AR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
          <Button variant="outline" onClick={imprimirTicketCambio}>
            🎟️ Ticket de cambio
          </Button>
          <Button onClick={imprimirTicketVenta}>
            🖨️ Ticket de venta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}