import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_: NextRequest, context: any) {
  const id = Number(context.params.id)

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

  const negocio = await prisma.datosNegocio.findUnique({ where: { id: 1 } })

  if (!venta || !negocio) {
    return NextResponse.json({ error: 'Venta o datos de negocio no encontrados' }, { status: 404 })
  }

  const lines: string[] = []

  // ENCABEZADO
  lines.push(negocio.nombre)
  lines.push(negocio.direccion)
  lines.push(`CUIT: ${negocio.cuit}`)
  lines.push('------------------------')
  lines.push('TICKET DE CAMBIO')
  lines.push('------------------------')

  const fecha = new Date(venta.fecha)
  lines.push(`FECHA:`)
  lines.push(`${fecha.getDate().toString().padStart(2, '0')}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${fecha.getFullYear()}`)
  lines.push(`${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`)
  lines.push(`CLIENTE:`)
  lines.push(venta.cliente?.nombre || 'Consumidor Final')
  lines.push(`COMPROBANTE:`)
  lines.push(`V${venta.nroComprobante.toString().padStart(7, '0')}`)
  lines.push('------------------------')

  // DETALLES SIN PRECIOS
  venta.detalles.forEach((item) => {
    if (item.paraCambio) {
      const desc = item.variante.producto.descripcion
      const talle = item.variante.talle
      const color = item.variante.color
      lines.push(`${desc}`)
      lines.push(`- ${talle} ${color}`)
      lines.push(`  Cantidad: ${item.cantidad}`)
      lines.push('------------------------')
    }
  })

  lines.push('Este ticket es válido solo para cambio.')

  if (negocio.pieTicket) {
    lines.push('------------------------')
    negocio.pieTicket.split('\n').forEach(line => lines.push(line))
  }

  const contenido = lines.join('\n')

  return new NextResponse(contenido, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename=ticket_cambio_${id}.txt`,
    },
  })
}