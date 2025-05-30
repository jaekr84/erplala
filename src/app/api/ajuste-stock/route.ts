import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('query')?.toLowerCase()

  if (!q) return NextResponse.json([])

  const productos = await prisma.producto.findMany({
    where: {
      OR: [
        { codigo: { contains: q } },
        { descripcion: { contains: q, mode: 'insensitive' } }
      ]
    },
    include: {
      variantes: true
    }
  })

  const variantes = productos.flatMap(producto =>
    producto.variantes.map(vari => ({
      ...vari,
      producto: {
        codigo: producto.codigo,
        descripcion: producto.descripcion
      }
    }))
  )

  return NextResponse.json(variantes)
}