import { prisma } from "lala/lib/db"
import { NextResponse } from "next/server"

type Params = {
  params: { id: string }
}

export async function GET(_req: Request, { params }: Params) {
  const id = Number(params.id)

  const articulo = await prisma.producto.findUnique({
    where: { id },
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
        orderBy: { id: 'asc' }
      },
    },
  })

  if (!articulo) {
    return NextResponse.json({ message: "Artículo no encontrado" }, { status: 404 })
  }

  return NextResponse.json(articulo)
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  const data = await req.json()
  const { descripcion, proveedorId, categoriaId, costo, margen, precioVenta, variantes } = data

  try {
    // Actualiza el producto principal
    await prisma.producto.update({
      where: { id },
      data: {
        descripcion,
        proveedorId: Number(proveedorId),
        categoriaId: Number(categoriaId),
        costo,
        margen,
        precioVenta,
        updatedAt: new Date(),
      },
    })

    // Procesa variantes
    for (const variante of variantes) {
      if (typeof variante.id === 'number') {
        // Variante existente: actualizar
        await prisma.variante.update({
          where: { id: variante.id },
          data: {
            talle: variante.talle,
            color: variante.color,
            stock: variante.stock,
            codBarra: variante.codBarra,
          },
        })
      } else {
        // Variante nueva: crear
        await prisma.variante.create({
          data: {
            productoId: id,
            talle: variante.talle,
            color: variante.color,
            stock: variante.stock,
            codBarra: variante.codBarra,
          },
        })
      }
    }

    // (Opcional) Eliminar variantes que ya no están en el array
    // const idsEnviado = variantes.filter(v => typeof v.id === 'number').map(v => v.id)
    // await prisma.variante.deleteMany({
    //   where: {
    //     productoId: id,
    //     id: { notIn: idsEnviado },
    //   },
    // })

    return NextResponse.json({ message: "Artículo actualizado correctamente" })
  } catch (error) {
    console.error("Error al actualizar artículo:", error)
    return NextResponse.json({ message: "Error al actualizar" }, { status: 500 })
  }
}

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
        codigo: String(data.codigo), // 👈 fuerza a string
        descripcion: data.descripcion,
        costo: data.costo,
        margen: data.margen,
        precioVenta: data.precioVenta,
        proveedorId: Number(data.proveedorId),
        categoriaId: Number(data.categoriaId),
        // variantes: { create: [...] }
      }
    })
    return NextResponse.json(producto)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: 'Error al crear producto' }, { status: 500 })
  }
}