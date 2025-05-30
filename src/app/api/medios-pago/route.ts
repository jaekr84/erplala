import { prisma } from "lala/lib/db";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const medios = await prisma.medioPago.findMany({
      orderBy: { nombre: "asc" },
    });
    return NextResponse.json(medios);
  } catch (error) {
    console.error("Error al obtener medios de pago:", error);
    return NextResponse.json(
      { message: "Error al obtener medios de pago" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { nombre } = await req.json();

    if (!nombre || nombre.trim().length < 2) {
      return NextResponse.json({ message: "Nombre inválido" }, { status: 400 });
    }

    const existente = await prisma.medioPago.findUnique({ where: { nombre } });
    if (existente) {
      return NextResponse.json(
        { message: "Ese medio de pago ya existe" },
        { status: 400 }
      );
    }

    const nuevo = await prisma.medioPago.create({
      data: { nombre },
    });

    return NextResponse.json(nuevo);
  } catch (error) {
    console.error("Error al crear medio de pago:", error);
    return NextResponse.json(
      { message: "Error al crear medio de pago" },
      { status: 500 }
    );
  }
}
export async function DELETE(_req: NextRequest, context: any) {
  const id = Number(context.params.id);
  if (isNaN(id)) {
    return NextResponse.json({ message: "ID inválido" }, { status: 400 });
  }

  try {
    // Verificamos que no tenga ventas asociadas
    const enUso = await prisma.ventaMedioPago.findFirst({
      where: { medioPagoId: id },
    });

    if (enUso) {
      return NextResponse.json(
        {
          message: "No se puede eliminar: el medio está en uso en una venta.",
        },
        { status: 400 }
      );
    }

    await prisma.medioPago.delete({ where: { id } });

    return NextResponse.json({ message: "Medio de pago eliminado" });
  } catch (error) {
    console.error("Error al eliminar medio de pago:", error);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
