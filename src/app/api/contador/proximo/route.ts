import { prisma } from "lala/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nombre = searchParams.get("nombre");

  if (!nombre) {
    return NextResponse.json({ message: "Falta el parámetro 'nombre'" }, { status: 400 });
  }

  const contador = await prisma.contador.findUnique({ where: { nombre } });

  if (!contador) {
    return NextResponse.json({ message: "Contador no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ valor: contador.valor });
}
