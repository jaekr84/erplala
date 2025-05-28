import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { startOfDay, endOfDay } from 'date-fns'

export async function GET() {
  const hoy = new Date()

  const pagos = await prisma.ventaMedioPago.groupBy({
    by: ['medioPagoId'],
    where: {
      venta: {
        fecha: {
          gte: startOfDay(hoy),
          lte: endOfDay(hoy),
        },
      },
    },
    _sum: {
      monto: true,
    },
  })

  const medios = await prisma.medioPago.findMany()

  const resultado = pagos.map(p => {
    const medio = medios.find(m => m.id === p.medioPagoId)
    return {
      medio: medio?.nombre || `ID ${p.medioPagoId}`,
      total: p._sum.monto || 0,
    }
  })

  return NextResponse.json(resultado)
}