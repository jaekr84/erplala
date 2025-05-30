import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ahora = new Date();
const hoy = ahora.toISOString().split("T")[0];

export async function POST(req: Request) {
  try {
    const { id, totalReal, observaciones } = await req.json();

    const caja = await prisma.caja.findUnique({ where: { id } });

    if (!caja)
      return NextResponse.json(
        { error: "Caja no encontrada" },
        { status: 404 }
      );

    const fechaCaja = caja.fechaApertura.toISOString().split("T")[0];
    if (fechaCaja !== hoy) {
      return NextResponse.json(
        { error: "No podés cerrar una caja de días anteriores." },
        { status: 400 }
      );
    }

    const pagos = await prisma.ventaMedioPago.findMany({
      where: {
        venta: {
          fecha: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(),
          },
        },
      },
      include: { medioPago: true },
    });

    const pagosPorMedio: Record<string, number> = {};
    pagos.forEach((p) => {
      const nombre = p.medioPago.nombre;
      pagosPorMedio[nombre] = (pagosPorMedio[nombre] || 0) + p.monto;
    });

    const totalEfectivo = pagosPorMedio["Efectivo"] || 0;
    const totalTarjeta = pagosPorMedio["Tarjeta"] || 0;
    const totalOtro = Object.entries(pagosPorMedio)
      .filter(([nombre]) => nombre !== "Efectivo" && nombre !== "Tarjeta")
      .reduce((sum, [, monto]) => sum + monto, 0);

    const totalTeorico =
      caja.montoInicial + totalEfectivo + totalTarjeta + totalOtro;
    const diferencia = totalReal - totalTeorico;

    const cajaCerrada = await prisma.caja.update({
      where: { id: caja.id },
      data: {
        fechaCierre: new Date(),
        totalEfectivo,
        totalTarjeta,
        totalOtro,
        totalReal,
        diferencia,
        observaciones,
        estado: "CERRADA",
        detallesPago: pagosPorMedio,
      },
    });

    return NextResponse.json(cajaCerrada);
  } catch (error) {
    console.error("❌ Error al cerrar caja:", error);
    return NextResponse.json(
      { error: "Error interno al cerrar caja" },
      { status: 500 }
    );
  }
}
