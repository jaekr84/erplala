import { prisma } from "lala/lib/db"
import { NextResponse, NextRequest } from "next/server"

export async function GET(_req: NextRequest, context: any) {
  const id = Number(context.params.id)

  // Validar que el id sea un número válido
  if (isNaN(id)) {
    return NextResponse.json({ message: "ID inválido" }, { status: 400 })
  }

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

export async function PUT(req: NextRequest, context: any) {
  const id = Number(context.params.id)
  const data = await req.json()
  const { descripcion, proveedorId, categoriaId, costo, margen, precioVenta, variantes } = data

  try {
    // Registrar la fecha fija del día en updatedAt (sin hora)
    const hoy = new Date();
    const fecha = new Date(`${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}T00:00:00`);
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
        updatedAt: fecha,
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
