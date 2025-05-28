import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { montoInicial } = await req.json()

  // Verificar si ya hay una caja abierta
  const cajaAbierta = await prisma.caja.findFirst({
    where: { estado: 'ABIERTA' },
  })

  if (cajaAbierta) {
    return NextResponse.json(
      { error: 'Ya hay una caja abierta' },
      { status: 400 }
    )
  }

  // Crear nueva caja
  const nuevaCaja = await prisma.caja.create({
    data: {
      fechaApertura: new Date(),
      montoInicial: Number(montoInicial),
      estado: 'ABIERTA',
    },
  })

  return NextResponse.json(nuevaCaja)
}