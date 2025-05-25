import { prisma } from 'lala/lib/db'
import { NextResponse } from 'next/server'

// Listar artículos
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

  const totalPaginas = Math.max(1, Math.ceil(total / porPagina))

  return NextResponse.json({ articulos, totalPaginas })
}

// Crear artículo
export async function POST(req: Request) {
  const data = await req.json()

  if (
    !data.codigo ||
    !data.descripcion ||
    typeof data.costo !== 'number' ||
    typeof data.margen !== 'number' ||
    typeof data.precioVenta !== 'number' ||
    !data.proveedorId ||
    !data.categoriaId
  ) {
    return NextResponse.json({ message: 'Datos incompletos' }, { status: 400 })
  }

  try {
    const producto = await prisma.producto.create({
      data: {
        codigo: String(data.codigo),
        descripcion: data.descripcion,
        costo: data.costo,
        margen: data.margen,
        precioVenta: data.precioVenta,
        proveedorId: Number(data.proveedorId),
        categoriaId: Number(data.categoriaId),
        variantes: data.variantes && Array.isArray(data.variantes)
          ? {
              create: data.variantes.map((v: any) => ({
                talle: v.talle,
                color: v.color,
                stock: v.stock ?? 0,
                codBarra: String(v.codBarra),
              }))
            }
          : undefined
      }
    })
    return NextResponse.json(producto)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Error al crear producto' }, { status: 500 })
  }
}
