import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_: Request, context: { params: { id: string } }) {
  const id = Number(context.params.id)

  const venta = await prisma.venta.findUnique({
    where: { id },
    include: {
      cliente: true,
      detalles: {
        include: {
          variante: {
            include: { producto: true }
          }
        }
      },
      pagos: {
        include: { medioPago: true }
      }
    }
  })

  const negocio = await prisma.datosNegocio.findUnique({ where: { id: 1 } })

  if (!venta || !negocio) {
    return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 })
  }

  // Función para cortar líneas largas a 32 caracteres
  const cortar = (texto: string, largo = 32): string[] => {
    const resultado = []
    for (let i = 0; i < texto.length; i += largo) {
      resultado.push(texto.slice(i, i + largo))
    }
    return resultado
  }

  const lines: string[] = []

  // ENCABEZADO
  cortar(negocio.nombre).forEach(line => lines.push(line))
  cortar(negocio.direccion).forEach(line => lines.push(line))
  lines.push(`CUIT: ${negocio.cuit}`)
  lines.push('='.repeat(32))

  // FECHA + CLIENTE + COMPROBANTE
  const fecha = new Date(venta.fecha)
  lines.push(`FECHA:`)
  lines.push(`${fecha.toLocaleDateString('es-AR')}`)
  lines.push(`${fecha.toLocaleTimeString('es-AR')}`)
  lines.push(`CLIENTE:`)
  lines.push(venta.cliente?.nombre || 'Consumidor Final')
  lines.push(`COMPROBANTE:`)
  lines.push(`V${venta.nroComprobante.toString().padStart(7, '0')}`)
  lines.push('-'.repeat(32))

  // DETALLES
  venta.detalles.forEach((item) => {
    cortar(item.variante.producto.descripcion).forEach(line => lines.push(line))
    lines.push(`- ${item.variante.talle} ${item.variante.color}`)
    const precioUnit = item.precio.toLocaleString('es-AR')
    const totalItem = (item.precio * item.cantidad).toLocaleString('es-AR')
    lines.push(`${item.cantidad} x $${precioUnit} =`)
    lines.push(`$${totalItem}`)
    lines.push('-'.repeat(32))
  })

  // TOTALES
  lines.push(`SUBTOTAL:`)
  lines.push(`$${(venta.total + venta.descuento).toLocaleString('es-AR')}`)
  lines.push(`DESCUENTO: $${venta.descuento.toLocaleString('es-AR')}`)
  lines.push(`TOTAL: $${venta.total.toLocaleString('es-AR')}`)

  // MEDIOS DE PAGO
  venta.pagos.forEach(p => {
    lines.push(`${p.medioPago.nombre}:`)
    lines.push(`$${p.monto.toLocaleString('es-AR')}`)
  })

  lines.push('='.repeat(32))

  // PIE
  if (negocio.pieTicket) {
    cortar(negocio.pieTicket).forEach(line => lines.push(line))
  }

  const contenido = lines.join('\n')

  return new NextResponse(contenido, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename=ticket_${venta.nroComprobante}.txt`,
    },
  })
}