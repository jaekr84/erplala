import { prisma } from 'lala/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const caja = await prisma.caja.findFirst({
    where: { abierta: true },
    include: {
      detalles: {
        include: {
          medioPago: true
        }
      }
    }
  })

  if (!caja) {
    return NextResponse.json({ error: 'No hay caja abierta' }, { status: 400 })
  }

  const detalles = caja.detalles.map(det => ({
    nombre: det.medioPago.nombre,
    total: det.total
  }))

  return NextResponse.json({
    efectivoInicial: caja.efectivoInicial,
    detalles
  })
}