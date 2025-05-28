import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const desde = searchParams.get('desde')
  const hasta = searchParams.get('hasta')

  const fechaInicio = desde ? new Date(desde) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const fechaFin = hasta ? new Date(hasta + 'T23:59:59') : new Date()

  const cajas = await prisma.caja.findMany({
    where: {
      estado: 'CERRADA',
      fechaCierre: {
        gte: fechaInicio,
        lte: fechaFin,
      },
    },
    orderBy: { fechaCierre: 'desc' },
  })

  return NextResponse.json(cajas)
}