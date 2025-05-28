import { prisma } from 'lala/lib/db'
import { NextResponse } from 'next/server'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const cajaId = Number(params.id)

  const auditoria = await prisma.auditoriaCaja.findMany({
    where: { cajaId },
    orderBy: { fecha: 'asc' },
    include: { usuario: true }
  })

  return NextResponse.json(auditoria)
}