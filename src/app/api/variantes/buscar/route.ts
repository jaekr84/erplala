import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.toLowerCase()

  if (!q) return NextResponse.json([])

  const variantes = await prisma.variante.findMany({
    where: {
      producto: {
        OR: [
          { codigo: { contains: q } },
          { descripcion: { contains: q, mode: 'insensitive' } }
        ]
      }
    },
    include: { producto: true }
  })

  return NextResponse.json(variantes)
}