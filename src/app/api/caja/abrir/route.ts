// src/app/api/caja/abrir/route.ts
import { prisma } from 'lala/lib/db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { usuarioId, efectivoInicial } = await req.json()

  if (!usuarioId || typeof efectivoInicial !== 'number') {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
  }

  const existeCajaAbierta = await prisma.caja.findFirst({
    where: { abierta: true }
  })

  if (existeCajaAbierta) {
    return NextResponse.json({ error: 'Ya hay una caja abierta' }, { status: 400 })
  }

  const nuevaCaja = await prisma.caja.create({
    data: {
      usuarioId,
      efectivoInicial
    }
  })

  await prisma.auditoriaCaja.create({
  data: {
    cajaId: nuevaCaja.id,
    usuarioId,
    accion: 'apertura',
    detalle: `Caja abierta con $${efectivoInicial} inicial`
  }
})

  return NextResponse.json(nuevaCaja)
}