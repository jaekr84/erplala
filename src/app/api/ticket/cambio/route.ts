import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { PDFDocument, StandardFonts } from 'pdf-lib'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const ventaId = Number(searchParams.get('ventaId'))
    if (isNaN(ventaId)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 })

    const venta = await prisma.venta.findUnique({ where: { id: ventaId } })
    if (!venta) return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 })

    const datos = await prisma.datosNegocio.findUnique({ where: { id: 1 } })

    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([250, 400])
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

    let y = 380
    const drawText = (text: string, size = 10, spacing = 14) => {
      page.drawText(text, { x: 20, y, size, font })
      y -= spacing
    }

    drawText('TICKET DE CAMBIO', 12, 18)
    drawText('')
    if (datos?.nombre) drawText(datos.nombre, 11)
    if (datos?.direccion) drawText(datos.direccion)
    if (datos?.telefono) drawText(`Tel: ${datos.telefono}`)
    if (datos?.cuit) drawText(`CUIT: ${datos.cuit}`)
    drawText('')

    drawText(`Comprobante: ${venta.nroComprobante}`)
    drawText(`Fecha: ${new Date().toLocaleString('es-AR')}`)
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
        'Content-Disposition': 'inline; filename="ticket-cambio.pdf"',
      },
    })
  } catch (error) {
    console.error('Error generando ticket de cambio:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}