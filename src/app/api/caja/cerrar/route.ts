import { prisma } from "lala/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { efectivoFinal, observaciones } = await req.json();

  const caja = await prisma.caja.findFirst({
    where: { abierta: true },
    include: {
      detalles: true,
    },
  });

  if (!caja) {
    return NextResponse.json({ error: "No hay caja abierta" }, { status: 400 });
  }

  const totalEfectivo =
    caja.detalles.find(
      (det) => det.medioPagoId && det.medioPagoId > 0 // o filtrá por nombre si tenés nombres fijos
    )?.total || 0;

  const efectivoEsperado = caja.efectivoInicial + totalEfectivo;
  const diferencia = efectivoFinal - efectivoEsperado;

  const cajaCerrada = await prisma.caja.update({
    where: { id: caja.id },
    data: {
      fechaCierre: new Date(),
      efectivoFinal,
      diferencia,
      observaciones,
      abierta: false,
    },
  });
  await prisma.auditoriaCaja.create({
    data: {
      cajaId: caja.id,
      usuarioId: caja.usuarioId,
      accion: "cierre",
      detalle: `Efectivo final: $${efectivoFinal}, diferencia: $${diferencia}. Obs: ${
        observaciones || "—"
      }`,
    },
  });

  return NextResponse.json({ message: "Caja cerrada", caja: cajaCerrada });
}
