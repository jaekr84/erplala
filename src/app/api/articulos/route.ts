import { NextResponse, NextRequest } from "next/server";
import { prisma } from "lala/lib/db";

// ✅ GET: Listar artículos con búsqueda y paginación
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "";
  const pagina = parseInt(searchParams.get("pagina") || "1", 10);
  const porPagina = 10;
  const skip = (pagina - 1) * porPagina;

  try {
    const [articulos, total] = await Promise.all([
      prisma.producto.findMany({
        where: {
          OR: [
            { descripcion: { contains: query, mode: "insensitive" } },
            { codigo: { contains: query, mode: "insensitive" } },
          ],
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
              codBarra: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: porPagina,
        skip,
      }),
      prisma.producto.count({
        where: {
          OR: [
            { descripcion: { contains: query, mode: "insensitive" } },
            { codigo: { contains: query, mode: "insensitive" } },
          ],
        },
      }),
    ]);

    const totalPaginas = Math.max(1, Math.ceil(total / porPagina));

    return NextResponse.json({ articulos, totalPaginas });
  } catch (error) {
    console.error("❌ Error en GET /api/articulos:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json()

  console.log('📥 Datos recibidos:', data)

  const proveedorId = Number(data.proveedorId)
  const categoriaId = Number(data.categoriaId)

  if (
    !data.codigo ||
    !data.descripcion ||
    typeof data.costo !== 'number' ||
    typeof data.margen !== 'number' ||
    typeof data.precioVenta !== 'number' ||
    isNaN(proveedorId) ||
    isNaN(categoriaId)
  ) {
    console.warn('⚠️ Datos incompletos o mal formateados', data)
    return NextResponse.json({ message: 'Datos incompletos o inválidos' }, { status: 400 })
  }

  try {
    const hoy = new Date();
    const fecha = new Date(`${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}T00:00:00`);

    const producto = await prisma.producto.create({
      data: {
        codigo: String(data.codigo),
        descripcion: data.descripcion,
        costo: data.costo,
        margen: data.margen,
        precioVenta: data.precioVenta,
        proveedorId,
        categoriaId,
        createdAt: fecha,
        variantes: {
          create: data.variantes.map((v: any) => ({
            talle: v.talle,
            color: v.color,
            stock: v.stock ?? 0,
            codBarra: String(v.codBarra),
          }))
        }
      }
    })

    return NextResponse.json(producto)
  } catch (error: any) {
    console.error('❌ Error al crear producto:', error.message, error)
    return NextResponse.json({ message: 'Error al crear producto', error: error.message }, { status: 500 })
  }
}