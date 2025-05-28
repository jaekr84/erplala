// src/app/api/auditoria-caja/route.ts
import { prisma } from 'lala/lib/db'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const desde = searchParams.get('desde')
  const hasta = searchParams.get('hasta')
  const usuarioId = searchParams.get('usuarioId')
  const accion = searchParams.get('accion')

  const filtros: any = {}

  if (desde && hasta) {
    filtros.fecha = {
      gte: new Date(desde),
      lte: new Date(hasta + 'T23:59:59')
    }
  }

  if (usuarioId) {
    filtros.usuarioId = Number(usuarioId)
  }

  if (accion) {
    filtros.accion = accion
  }

  const auditoria = await prisma.auditoriaCaja.findMany({
    where: filtros,
    include: {
      usuario: true,
      caja: true
    },
    orderBy: { fecha: 'desc' }
  })

  return NextResponse.json(auditoria)
}