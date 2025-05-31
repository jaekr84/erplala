

import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { startOfDay, endOfDay } from 'date-fns'

export async function GET() {
  const hoy = new Date()

  const caja = await prisma.caja.findFirst({
    where: {
      fechaCierre: null
    }
  })

  if (!caja) {
    return NextResponse.json({ abierta: false })
  }

  const esDeHoy =
    caja.fechaApertura >= startOfDay(hoy) && caja.fechaApertura <= endOfDay(hoy)

  return NextResponse.json({
    abierta: true,
    requiereCierre: !esDeHoy,
    caja
  })
}