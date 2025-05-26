import { prisma } from "lala/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nombre = searchParams.get("nombre");

  if (!nombre) {
    return NextResponse.json({ message: "Falta el parámetro 'nombre'" }, { status: 400 });
  }

  // Buscar el contador sin incrementarlo
  const contador = await prisma.contador.findUnique({
    where: { nombre }
  });

  const valorActual = contador?.valor ?? 0;
  const proximoValor = valorActual + 1;

  // Devuelve formateado, por ejemplo: C0000012
  const prefijo = nombre.charAt(0).toUpperCase();
  const numeroFormateado = `${prefijo}${String(proximoValor).padStart(7, "0")}`;

  return NextResponse.json({ valor: proximoValor, formateado: numeroFormateado });
}