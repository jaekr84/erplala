import { prisma } from "lala/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Validación básica
    if (!data.nombre || typeof data.nombre !== "string") {
      return NextResponse.json(
        { message: "El nombre del proveedor es obligatorio" },
        { status: 400 }
      );
    }

    const proveedor = await prisma.proveedor.create({
      data: {
        nombre: data.nombre,
        telefono: data.telefono || null,
        email: data.email || null,
        direccion: data.direccion || null,
      },
    });

    return NextResponse.json(proveedor);
  } catch (error) {
    console.error("Error en POST /api/proveedores:", error);
    return NextResponse.json(
      { message: "Error interno al guardar proveedor" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const proveedores = await prisma.proveedor.findMany({
    select: {
      id: true,
      nombre: true,
    },
    orderBy: {
      nombre: 'asc',
    },
  });

  return NextResponse.json(proveedores);
}