import { NextResponse } from 'next/server'
import { prisma } from 'lala/lib/db'

// ✅ GET: Listar artículos con búsqueda y paginación
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('query') || ''
  const pagina = parseInt(searchParams.get('pagina') || '1', 10)
  const porPagina = 10
  const skip = (pagina - 1) * porPagina

  try {
    const [articulos, total] = await Promise.all([
      prisma.producto.findMany({
        where: {
          OR: [
            { descripcion: { contains: query, mode: 'insensitive' } },
            { codigo: { contains: query, mode: 'insensitive' } },
          ]
        },
        include: {
          proveedor: { select: { nombre: true } },
          categoria: { select: { nombre: true } },
          variantes: {
            select: {
              id: true,
              talle: true,
              color: true,
              stock: true,
              codBarra: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: porPagina,
        skip
      }),
      prisma.producto.count({
        where: {
          OR: [
            { descripcion: { contains: query, mode: 'insensitive' } },
            { codigo: { contains: query, mode: 'insensitive' } },
          ]
        }
      })
    ])

    const totalPaginas = Math.max(1, Math.ceil(total / porPagina))

    return NextResponse.json({ articulos, totalPaginas })
  } catch (error) {
    console.error('❌ Error en GET /api/articulos:', error)
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
  }
}

// ✅ POST: Crear nuevo artículo
export async function POST(req: Request) {
  const data = await req.json()

  if (
    !data.codigo || // ← ahora validamos también que venga el código generado desde el form
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
        variantes: Array.isArray(data.variantes) && data.variantes.length > 0
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
    console.error('❌ Error al crear producto:', error)
    return NextResponse.json({ message: 'Error al crear producto' }, { status: 500 })
  }
}