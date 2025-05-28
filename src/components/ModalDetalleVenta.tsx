import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { VentaConDetalles } from '@/types'

type Props = {
  venta: VentaConDetalles
  onClose: () => void
}

export default function ModalDetalleVenta({ venta, onClose }: Props) {
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
              {venta.detalles.map((d) => (
                <tr key={d.id} className="border-t">
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
          <Button variant="outline" onClick={() => alert('Reimprimir ticket de cambio')}>
            Ticket de cambio
          </Button>
          <Button onClick={() => alert('Reimprimir ticket de venta')}>
            Ticket de venta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}