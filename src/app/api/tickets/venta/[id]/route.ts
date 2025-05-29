import { NextResponse } from 'next/server'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import { prisma } from '@/lib/db'

type Params = { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
  const id = Number(params.id)

  const venta = await prisma.venta.findUnique({
    where: { id },
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
      }
    }
  })

  const datos = await prisma.datosNegocio.findUnique({ where: { id: 1 } })

  if (!venta || !datos) {
    return NextResponse.json({ error: 'Datos no encontrados' }, { status: 404 })
  }

  // Armar líneas del ticket
  const contenido: string[] = []

  contenido.push(datos.nombre.toUpperCase())
  contenido.push(datos.direccion)
  contenido.push(`CUIT: ${datos.cuit}`)
  contenido.push('---------------------------')

  contenido.push(`Fecha: ${new Date(venta.fecha).toLocaleDateString('es-AR')}`)
  contenido.push(`Comprobante: ${venta.nroComprobante}`)
  contenido.push(`Cliente: ${venta.cliente?.nombre || 'Consumidor Final'}`)
  contenido.push('---------------------------')

  venta.detalles.forEach(item => {
    const { producto, talle, color } = item.variante
    const linea = `${item.cantidad} x ${producto.descripcion} (${talle} - ${color}) $${item.precio.toLocaleString('es-AR')}`
    contenido.push(linea)
  })

  contenido.push('---------------------------')

  const subtotal = venta.subtotal
  const descuento = venta.descuento || 0
  const total = venta.total
  const iva = subtotal * 0.21

  contenido.push(`Subtotal: $${subtotal.toLocaleString('es-AR')}`)
  contenido.push(`IVA (21%): $${iva.toLocaleString('es-AR')}`)
  if (descuento > 0) contenido.push(`Descuento: $${descuento.toLocaleString('es-AR')}`)
  contenido.push(`Total: $${total.toLocaleString('es-AR')}`)
  contenido.push('---------------------------')
  contenido.push(datos.pieTicket)

  // Calcular altura exacta según líneas
  const altura = contenido.length * 12 + 20

  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([300, altura])
  const font = await pdfDoc.embedFont(StandardFonts.Courier)
  let y = altura - 20

  contenido.forEach(linea => {
    page.drawText(linea, { x: 10, y, size: 9, font })
    y -= 12
  })

  const pdfBytes = await pdfDoc.save()

  return new NextResponse(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=ticket-${venta.nroComprobante}.pdf`
    }
  })
}