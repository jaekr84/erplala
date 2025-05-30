import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

const hoy = new Date().toISOString().split("T")[0];

export async function POST(req: Request) {
  const { montoInicial } = await req.json();

  // Verificar si ya hay una caja abierta
  const cajaAbierta = await prisma.caja.findFirst({
    where: {
      fechaCierre: null,
    },
    orderBy: { fechaApertura: "desc" },
  });

  if (cajaAbierta) {
    const fechaCaja = cajaAbierta.fechaApertura.toISOString().split("T")[0];
    if (fechaCaja !== hoy) {
      return NextResponse.json(
        { error: "No se cerró la caja del día anterior." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Ya hay una caja abierta." },
      { status: 400 }
    );
  }

  // Crear nueva caja
  const nuevaCaja = await prisma.caja.create({
    data: {
      fechaApertura: new Date(),
      montoInicial: Number(montoInicial),
      estado: "ABIERTA",
    },
  });

  return NextResponse.json(nuevaCaja);
}
