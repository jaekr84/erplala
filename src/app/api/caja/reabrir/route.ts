// src/app/api/caja/reabrir/route.ts
import { prisma } from "lala/lib/db";
import { NextResponse } from "next/server";

export async function POST() {
  // Buscar la última caja cerrada
  const caja = await prisma.caja.findFirst({
    where: { abierta: false },
    orderBy: { fechaCierre: "desc" },
  });

  if (!caja) {
    return NextResponse.json(
      { error: "No hay caja cerrada para reabrir" },
      { status: 404 }
    );
  }

  const cajaReabierta = await prisma.caja.update({
    where: { id: caja.id },
    data: {
      abierta: true,
      fechaCierre: null,
      efectivoFinal: null,
      diferencia: null,
      observaciones: caja.observaciones
        ? caja.observaciones + " | Caja reabierta manualmente"
        : "Caja reabierta manualmente",
    },
  });
  await prisma.auditoriaCaja.create({
    data: {
      cajaId: caja.id,
      usuarioId: caja.usuarioId,
      accion: "reapertura",
      detalle: "Caja reabierta manualmente",
    },
  });

  return NextResponse.json({ message: "Caja reabierta", caja: cajaReabierta });
}
