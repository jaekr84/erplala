import { prisma } from '@/lib/db'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const ventaId = Number(searchParams.get('ventaId'))
  const detalleIds = searchParams.getAll('detalleId').map(Number)

  if (!ventaId || detalleIds.length === 0) {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 })
  }

  const venta = await prisma.venta.findUnique({
    where: { id: ventaId },
    include: {
      cliente: true,
      detalles: {
        where: { id: { in: detalleIds } },
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
    return NextResponse.json({ error: 'Venta o datos no encontrados' }, { status: 404 })
  }

  const pdf = await PDFDocument.create()
  const alto = 150 + venta.detalles.length * 25
  const page = pdf.addPage([180, alto])
  const font = await pdf.embedFont(StandardFonts.Courier)
  let y = alto - 20

  const draw = (text: string, size = 9, indent = 10) => {
    page.drawText(text, { x: indent, y, size, font })
    y -= size + 2
  }

  // Encabezado
  draw(datos.nombre.toUpperCase(), 10, 20)
  draw(datos.direccion, 8)
  draw('CUIT: ' + datos.cuit, 8)
  y -= 5
  draw('-------------------------', 8)
  draw(`TICKET DE CAMBIO`, 9, 35)
  draw(`Comprobante Nº ${venta.nroComprobante}`, 8)
  draw(`Fecha: ${new Date(venta.fecha).toLocaleDateString()}`, 8)
  draw('-------------------------', 8)

  // Productos sin precio
  venta.detalles.forEach((d) => {
    draw(`${d.variante.producto.descripcion}`, 8)
    draw(`${d.variante.talle} / ${d.variante.color} - Cant: ${d.cantidad}`, 8)
    draw('-------------------------', 8)
  })

  y -= 5
  draw(datos.pieTicket || 'Cambios dentro de los 15 días con ticket y etiqueta', 8)

  const pdfBytes = await pdf.save()

  return new NextResponse(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="ticket-cambio.pdf"'
    }
  })
}