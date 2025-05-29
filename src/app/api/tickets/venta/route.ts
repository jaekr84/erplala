import { prisma } from '@/lib/db'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const ventaId = Number(searchParams.get('ventaId'))

  if (!ventaId) {
    return NextResponse.json({ error: 'Parámetro ventaId requerido' }, { status: 400 })
  }

  const venta = await prisma.venta.findUnique({
    where: { id: ventaId },
    include: {
      cliente: true,
      detalles: {
        include: {
          variante: {
            include: {
              producto: true
            }
          }
        }
      },
      pagos: {
        include: {
          medioPago: true  // ✅ Este es el campo correcto
        }
      }
    }
  })

  const datos = await prisma.datosNegocio.findUnique({ where: { id: 1 } })

  if (!venta || !datos) {
    return NextResponse.json({ error: 'Venta o datos no encontrados' }, { status: 404 })
  }

  const pdf = await PDFDocument.create()
  const alto = 150 + venta.detalles.length * 30
  const page = pdf.addPage([180, alto])
  const font = await pdf.embedFont(StandardFonts.Courier)
  let y = alto - 20

  const draw = (text: string, size = 9, indent = 10) => {
    page.drawText(text, { x: indent, y, size, font })
    y -= size + 2
  }

  // Cabecera
  draw(datos.nombre.toUpperCase(), 10, 20)
  draw(datos.direccion, 8)
  draw('CUIT: ' + datos.cuit, 8)
  y -= 5
  draw('-------------------------', 8)
  draw(`Comprobante Nº ${venta.nroComprobante}`, 8)
  draw(`Fecha: ${new Date(venta.fecha).toLocaleDateString()}`, 8)
  draw(`Cliente: ${venta.cliente?.nombre || 'Consumidor final'}`, 8)
  draw('-------------------------', 8)

  // Productos
  venta.detalles.forEach((d) => {
    draw(`${d.variante.producto.descripcion}`, 8)
    draw(`${d.variante.talle} / ${d.variante.color}  x${d.cantidad}  $${d.precio.toLocaleString('es-AR')}`, 8)
    draw(`Subtotal: $${(d.precio * d.cantidad).toLocaleString('es-AR')}`, 8)
    draw('-------------------------', 8)
  })

  // Totales
  draw(`SUBTOTAL: $${venta.subtotal.toLocaleString('es-AR')}`, 8)
  if (venta.descuento > 0) {
    draw(`DESCUENTO: $${venta.descuento.toLocaleString('es-AR')}`, 8)
  }
  draw(`TOTAL: $${venta.total.toLocaleString('es-AR')}`, 10)
  y -= 5

  // Medios de pago
  venta.pagos.forEach((p) => {
    draw(`${p.medioPago.nombre}: $${p.monto.toLocaleString('es-AR')}`, 8)
  })

  y -= 10
  draw(datos.pieTicket || 'Gracias por su compra', 8)

  const pdfBytes = await pdf.save()

  return new NextResponse(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="ticket-venta.pdf"'
    }
  })
}