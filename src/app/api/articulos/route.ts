import { prisma } from 'lala/lib/db'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('query')?.toLowerCase() || ''
  const pagina = parseInt(searchParams.get('pagina') || '1', 10)
  const porPagina = 25
  const skip = (pagina - 1) * porPagina

  const where: any = query
    ? {
        OR: [
          { codigo: { contains: query, mode: 'insensitive' } },
          { descripcion: { contains: query, mode: 'insensitive' } },
        ],
      }
    : {}

  const [articulos, total] = await Promise.all([
    prisma.producto.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: porPagina,
      include: {
        proveedor: { select: { nombre: true } },
        variantes: true,
      },
    }),
    prisma.producto.count({ where }),
  ])

  const totalPaginas = Math.ceil(total / porPagina)

  return NextResponse.json({ articulos, totalPaginas })
}
