// src/app/api/caja/estado/route.ts
import { prisma } from 'lala/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const cajaAbierta = await prisma.caja.findFirst({
    where: { abierta: true },
    include: { usuario: true }
  })

  if (!cajaAbierta) {
    return NextResponse.json({ abierta: false })
  }

  return NextResponse.json({
    abierta: true,
    usuario: cajaAbierta.usuario.nombre,
    fecha: cajaAbierta.fechaApertura,
    efectivoInicial: cajaAbierta.efectivoInicial
  })
}