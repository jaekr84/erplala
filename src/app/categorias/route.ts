import { prisma } from "lala/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();

  const categoria = await prisma.categoria.create({
    data: {
      nombre: data.nombre,
    },
  });

  return NextResponse.json(categoria);
}