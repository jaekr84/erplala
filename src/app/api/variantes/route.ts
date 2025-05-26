import { NextResponse } from 'next/server'
import { prisma } from 'lala/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('query') || ''

  if (!query) return NextResponse.json([])

  const variantes = await prisma.variante.findMany({
    where: {
      OR: [
        { codBarra: { contains: query } },
        { producto: { codigo: { contains: query } } },
        { producto: { descripcion: { contains: query, mode: 'insensitive' } } }
      ]
    },
    include: {
      producto: { select: { codigo: true, descripcion: true, precioVenta: true } }
    },
    take: 25
  })

  return NextResponse.json(variantes)
}