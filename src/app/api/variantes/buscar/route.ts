import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('query')?.toLowerCase()

  if (!q) return NextResponse.json([])

  const variantes = await prisma.variante.findMany({
    where: {
      OR: [
        { codBarra: { contains: q, mode: 'insensitive' } },
        { producto: { codigo: { contains: q, mode: 'insensitive' } } },
        { producto: { descripcion: { contains: q, mode: 'insensitive' } } }
      ]
    },
    include: { producto: true }
  })

  return NextResponse.json(variantes)
}