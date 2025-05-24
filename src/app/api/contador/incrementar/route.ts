// src/app/api/contador/incrementar/route.ts
import { prisma } from "lala/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { nombre } = await req.json();

  if (!nombre) {
    return NextResponse.json({ message: "Falta el nombre del contador" }, { status: 400 });
  }

  const actualizado = await prisma.contador.update({
    where: { nombre },
    data: { valor: { increment: 1 } },
  });

  return NextResponse.json({ valor: actualizado.valor });
}
