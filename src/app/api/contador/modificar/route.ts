// src/app/api/contador/modificar/route.ts
import { prisma } from "lala/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const { nombre, valor } = await req.json();

  if (!nombre || typeof valor !== "number") {
    return NextResponse.json({ message: "Datos inválidos" }, { status: 400 });
  }

  const actualizado = await prisma.contador.update({
    where: { nombre },
    data: { valor },
  });

  return NextResponse.json({ valor: actualizado.valor });
}
