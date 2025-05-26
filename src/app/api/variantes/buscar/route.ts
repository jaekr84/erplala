import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('query')?.trim()

  if (!query) {
    return NextResponse.json([], { status: 200 })
  }

  const variantes = await prisma.variante.findMany({
    where: {
      OR: [
        { codBarra: { contains: query } },
        { producto: {
            OR: [
              { descripcion: { contains: query, mode: 'insensitive' } },
              { codigo: { contains: query } }
            ]
          }
        }
      ]
    },
    include: {
      producto: true
    },
    take: 20
  })

  return NextResponse.json(variantes)
}