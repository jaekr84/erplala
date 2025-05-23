import { prisma } from "lala/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();

  const proveedor = await prisma.proveedor.create({
    data: {
      nombre: data.nombre,
      telefono: data.telefono,
      email: data.email,
      direccion: data.direccion,
    },
  });

  return NextResponse.json(proveedor);
}