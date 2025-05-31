'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { VentaConDetalles } from '@/types'

type Props = {
  venta: VentaConDetalles
  onClose: () => void
}

export default function ModalDetalleVenta({ venta, onClose }: Props) {
  const [seleccionados, setSeleccionados] = useState<number[]>([])
  const [showModal, setShowModal] = useState(false)
  const [clienteEmail, setClienteEmail] = useState(venta.emailEnviadoA || '')

  const toggleProducto = (detalleId: number) => {
    setSeleccionados(prev =>
      prev.includes(detalleId)
        ? prev.filter(id => id !== detalleId)
        : [...prev, detalleId]
    )
  }

  const toggleTodos = () => {
    if (seleccionados.length === venta.detalles.length) {
      setSeleccionados([])
    } else {
      setSeleccionados(venta.detalles.map(d => d.id))
    }
  }

  const enviarComprobantes = async () => {
    if (!clienteEmail) {
      toast.error('⚠️ Email faltante', {
        description: 'Debes ingresar un email válido.'
      })
      return
    }

    const fecha = new Date()
    const fechaStr = fecha.toISOString().slice(0, 10)
    const nro = venta.nroComprobante.toString().padStart(7, '0')

    const resVenta = await fetch(`/api/tickets/venta/${venta.id}/txt`)
    const contenidoVenta = await resVenta.text()

    let contenidoCambio = ''
    if (seleccionados.length > 0) {
      const params = new URLSearchParams()
      params.set('ventaId', venta.id.toString())
      seleccionados.forEach(id => params.append('detalleId', id.toString()))

      const resCambio = await fetch(`/api/tickets/cambio?${params.toString()}`)
      contenidoCambio = await resCambio.text()
    }

    const res = await fetch('/api/enviar-comprobante', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailDestino: clienteEmail,
        contenidoVenta,
        contenidoCambio: contenidoCambio || null,
        nombreVenta: `venta_${fechaStr}_V${nro}.pdf`,
        nombreCambio: contenidoCambio ? `cambio_${fechaStr}_V${nro}.pdf` : null
      })
    })

    if (res.ok) {
      toast.success('📧 Enviado correctamente', {
        description: 'El comprobante fue enviado al cliente.'
      })
      setShowModal(false)
    } else {
      toast.error('❌ Error al enviar', {
        description: 'No se pudo enviar el comprobante. Reintentá más tarde.'
      })
    }
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
          {venta.emailEnviadoA && (
            <p><strong>Email enviado:</strong> {venta.emailEnviadoA}</p>
          )}
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

          <Button onClick={() => setShowModal(true)}>
            📤 Enviar comprobante por email
          </Button>
        </div>

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>📧 Enviar comprobante</DialogTitle>
            </DialogHeader>

            <Input
              type="email"
              placeholder="Email del cliente"
              value={clienteEmail}
              onChange={(e) => setClienteEmail(e.target.value)}
            />

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button onClick={enviarComprobantes}>Enviar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}