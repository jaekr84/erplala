import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const cajaAbierta = await prisma.caja.findFirst({
    where: { estado: 'ABIERTA' },
    orderBy: { fechaApertura: 'desc' },
  })

  return NextResponse.json(cajaAbierta)
}