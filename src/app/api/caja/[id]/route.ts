import { NextRequest, NextResponse } from 'next/server'
import { prisma } from 'lala/lib/db'

type Context = {
  params: {
    id: string
  }
}

export async function GET(_req: NextRequest, context: Context) {
  const id = Number(context.params.id)

  if (isNaN(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
  }

  const caja = await prisma.caja.findUnique({
    where: { id },
    include: {
      usuario: true,
      detalles: {
        include: { medioPago: true },
      },
    },
  })

  if (!caja) {
    return NextResponse.json({ error: 'Caja no encontrada' }, { status: 404 })
  }

  return NextResponse.json(caja)
}