import { prisma } from "lala/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const {
      codigo,
      fecha,
      descripcion,
      proveedorId,
      categoriaId,
      costo,
      margen,
      precioVenta,
      variantes,
    } = data;

    if (!codigo || !descripcion || !proveedorId || !categoriaId) {
      return NextResponse.json({ message: "Faltan campos obligatorios" }, { status: 400 });
    }

    const producto = await prisma.producto.create({
      data: {
        codigo: String(codigo),
        descripcion,
        costo,
        precioVenta,
        proveedorId: Number(proveedorId),
        categoriaId: Number(categoriaId),
        createdAt: new Date(fecha),
        variantes: {
          create: variantes.map((v: any) => ({
            talle: v.talle,
            color: v.color,
            stock: v.stock ?? 0,
            codBarra: v.codBarra,
          })),
        },
      },
      include: {
        variantes: true,
      },
    });

    return NextResponse.json(producto);
  } catch (error) {
    console.error("Error al crear artículo:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
