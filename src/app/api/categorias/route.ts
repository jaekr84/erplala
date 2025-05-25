import { prisma } from "lala/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Limpiar y validar nombre
    const nombreLimpio = typeof data.nombre === "string" ? data.nombre.trim() : "";

    if (!nombreLimpio) {
      return NextResponse.json(
        { message: "El nombre de la categoría es obligatorio" },
        { status: 400 }
      );
    }

    // Verificar duplicado insensible a mayúsculas
    const existente = await prisma.categoria.findFirst({
      where: {
        nombre: {
          equals: nombreLimpio,
          mode: "insensitive",
        },
      },
    });

    if (existente) {
      return NextResponse.json(
        { message: "La categoría ya existe" },
        { status: 409 }
      );
    }

    // Crear categoría
    const categoria = await prisma.categoria.create({
      data: {
        nombre: nombreLimpio,
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
      nombre: "asc",
    },
  });

  return NextResponse.json(categorias);
}