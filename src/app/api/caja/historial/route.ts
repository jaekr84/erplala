// src/app/api/caja/historial/route.ts
import { prisma } from 'lala/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const cajas = await prisma.caja.findMany({
    orderBy: { fechaApertura: 'desc' },
    include: {
      usuario: true
    }
  })

  return NextResponse.json(cajas)
}