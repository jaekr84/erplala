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

  // ✅ FILTRAR solo las prendas marcadas para cambio
  const prendasParaCambio = venta.detalles.filter(d => d.paraCambio)

  if (prendasParaCambio.length === 0) {
    return NextResponse.json({ error: 'No hay prendas marcadas para cambio' }, { status: 400 })
  }

  const contenido: string[] = []

  contenido.push(datos.nombre.toUpperCase())
  contenido.push(datos.direccion)
  contenido.push(`CUIT: ${datos.cuit}`)
  contenido.push('----- TICKET DE CAMBIO -----')
  contenido.push(`Fecha: ${new Date(venta.fecha).toLocaleDateString('es-AR')}`)
  contenido.push(`Comprobante: ${venta.nroComprobante}`)
  contenido.push(`Cliente: ${venta.cliente?.nombre || 'Consumidor Final'}`)
  contenido.push('---------------------------')

  prendasParaCambio.forEach(item => {
    const { producto, talle, color } = item.variante
    const linea = `${item.cantidad} x ${producto.descripcion} (${talle} - ${color})`
    contenido.push(linea)
  })

  contenido.push('---------------------------')
  contenido.push('Válido para cambios por 30 días con este ticket.')
  contenido.push(datos.pieTicket)

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
      'Content-Disposition': `inline; filename=ticket-cambio-${venta.nroComprobante}.pdf`
    }
  })
}