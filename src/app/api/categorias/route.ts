import { prisma } from "lala/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Validación mínima
    if (!data.nombre || typeof data.nombre !== "string") {
      return NextResponse.json(
        { message: "El nombre de la categoría es obligatorio" },
        { status: 400 }
      );
    }

    const categoria = await prisma.categoria.create({
      data: {
        nombre: data.nombre,
      },
    });

    return NextResponse.json(categoria);
  } catch (error) {
    console.error("Error en POST /api/categorias:", error);
    return NextResponse.json(
      { message: "Error interno al guardar categoría" },
      { status: 500 }
    );
  }
}
export async function GET() {
  const categorias = await prisma.categoria.findMany({
    select: {
      id: true,
      nombre: true,
    },
    orderBy: {
      nombre: 'asc',
    },
  });

  return NextResponse.json(categorias);
}
