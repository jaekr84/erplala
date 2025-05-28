import { prisma } from 'lala/lib/db'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const tipo = searchParams.get('tipo')
  const accion = searchParams.get('accion')
  const usuarioId = searchParams.get('usuarioId')
  const desde = searchParams.get('desde')
  const hasta = searchParams.get('hasta')

  const filtros: any = {}

  if (tipo) filtros.tipo = tipo
  if (accion) filtros.accion = accion
  if (usuarioId) filtros.usuarioId = Number(usuarioId)
  if (desde && hasta) {
    filtros.fecha = {
      gte: new Date(desde),
      lte: new Date(hasta + 'T23:59:59')
    }
  }

  const auditorias = await prisma.auditoriaOperacion.findMany({
    where: filtros,
    include: { usuario: true },
    orderBy: { fecha: 'desc' }
  })

  return NextResponse.json(auditorias)
}