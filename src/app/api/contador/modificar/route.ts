import { prisma } from "lala/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const { nombre, valor } = await req.json();

  if (!nombre || typeof valor !== "number") {
    return NextResponse.json({ message: "Datos inválidos" }, { status: 400 });
  }

  // Usar upsert para crear o actualizar el contador
  const actualizado = await prisma.contador.upsert({
    where: { nombre },
    update: { valor },
    create: { nombre, valor },
  });

  return NextResponse.json({ valor: actualizado.valor });
}