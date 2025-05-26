import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const ventaId = Number(searchParams.get('ventaId'))
    if (isNaN(ventaId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

    const venta = await prisma.venta.findUnique({
      where: { id: ventaId },
      include: {
        cliente: true,
        detalles: {
          include: {
            variante: {
              include: {
                producto: true,
              },
            },
          },
        },
        pagos: {
          include: { medioPago: true },
        },
      },
    })

    if (!venta) return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 })

    const datos = await prisma.datosNegocio.findUnique({ where: { id: 1 } })

    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([250, 600])
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

    let y = 580
    const drawText = (text: string, size = 10, spacing = 14) => {
      page.drawText(text, { x: 20, y, size, font })
      y -= spacing
    }

    // Encabezado
    if (datos?.nombre) drawText(datos.nombre, 12)
    if (datos?.direccion) drawText(datos.direccion)
    if (datos?.telefono) drawText(`Tel: ${datos.telefono}`)
    if (datos?.cuit) drawText(`CUIT: ${datos.cuit}`)
    drawText('')

    drawText(`Comprobante: ${venta.nroComprobante}`)
    drawText(`Fecha: ${new Date(venta.fecha).toLocaleString('es-AR')}`)
    if (venta.cliente?.nombre) drawText(`Cliente: ${venta.cliente.nombre}`)
    drawText('')

    drawText('Productos:', 10, 16)
    for (const item of venta.detalles) {
      const linea = `${item.variante.producto.descripcion} (${item.variante.talle}/${item.variante.color})`
      drawText(linea)
      drawText(`${item.cantidad} x $${item.precio.toLocaleString('es-AR')} = $${(item.cantidad * item.precio).toLocaleString('es-AR')}`)
    }

    drawText('')
    drawText(`Subtotal: $${venta.subtotal.toLocaleString('es-AR')}`)
    drawText(`Descuento: $${venta.descuento.toLocaleString('es-AR')}`)
    drawText(`Total: $${venta.total.toLocaleString('es-AR')}`, 11)
    drawText('')

    drawText('Pagos:', 10, 16)
    for (const pago of venta.pagos) {
      drawText(`${pago.medioPago.nombre}: $${pago.monto.toLocaleString('es-AR')}`)
    }

    const totalUnidades = venta.detalles.reduce((sum, d) => sum + d.cantidad, 0)
    drawText(`Unidades: ${totalUnidades}`)
    drawText('')

    if (datos?.pieTicket) {
      drawText('---')
      const lineas = datos.pieTicket.split('\n')
      for (const l of lineas) drawText(l, 8, 12)
    }

    const pdfBytes = await pdfDoc.save()
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="ticket.pdf"',
      },
    })
  } catch (error) {
    console.error('Error generando ticket:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}