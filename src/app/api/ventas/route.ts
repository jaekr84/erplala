import { NextResponse } from "next/server";
import { prisma } from "lala/lib/db";
import { Param } from "@prisma/client/runtime/library";

export async function POST(req: Request) {
  const cajaAbierta = await prisma.caja.findFirst({
    where: { estado: "ABIERTA" },
  });

  if (!cajaAbierta) {
    return NextResponse.json(
      { error: "No se puede realizar una venta sin una caja abierta" },
      { status: 400 }
    );
  }
  try {
    const data = await req.json();
    const { clienteId, fecha, detalle, descuento, total, pagos } = data;

    if (!detalle || detalle.length === 0 || !pagos || pagos.length === 0) {
      return NextResponse.json(
        { message: "Datos incompletos" },
        { status: 400 }
      );
    }

    // 1. Obtener número de comprobante
    const contador = await prisma.contador.upsert({
      where: { nombre: "venta" },
      create: { nombre: "venta", valor: 1 },
      update: { valor: { increment: 1 } },
      select: { valor: true },
    });
    const nroComprobante = `V${String(contador.valor).padStart(7, "0")}`;

    // 2. Calcular subtotal
    const subtotal = detalle.reduce(
      (acc: number, item: any) => acc + item.precio * item.cantidad,
      0
    );

    // 3. Registrar la venta en una transacción
    const venta = await prisma.$transaction(async (tx) => {
      const nuevaVenta = await tx.venta.create({
        data: {
          nroComprobante,
          fecha: new Date(), // ✅ Usa la fecha y hora actual
          clienteId: clienteId || null,
          subtotal,
          descuento,
          total,
          detalles: {
            create: detalle.map((d: any) => ({
              varianteId: d.varianteId,
              cantidad: d.cantidad,
              precio: d.precio,
              paraCambio: d.paraCambio ?? false,
            })),
          },
          pagos: {
            create: pagos.map((p: any) => ({
              medioPagoId: p.medioPagoId,
              monto: p.monto,
            })),
          },
        },
      });

      // 4. Restar stock y registrar movimientos
      for (const d of detalle) {
        await tx.variante.update({
          where: { id: d.varianteId },
          data: {
            stock: { decrement: d.cantidad },
          },
        });

        await tx.movimientoStock.create({
          data: {
            varianteId: d.varianteId,
            tipo: "VENTA",
            cantidad: -Math.abs(d.cantidad),
            comprobante: nroComprobante,
            observacion: "Venta",
          },
        });
      }

      return nuevaVenta;
    });

    return NextResponse.json({ id: venta.id, nroComprobante: venta.nroComprobante });
  } catch (error) {
    console.error("❌ Error al registrar venta:", error);
    return NextResponse.json(
      { message: "Error al registrar la venta" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");
  const busqueda = searchParams.get("busqueda") || "";
  const pagina = parseInt(searchParams.get("pagina") || "1");
  const porPagina = 25;

  if (!desde || !hasta) {
    return NextResponse.json({ message: "Faltan fechas" }, { status: 400 });
  }

  const fechaDesde = new Date(desde);
  const fechaHasta = new Date(hasta);

  try {
    const [ventas, total] = await Promise.all([
      prisma.venta.findMany({
        where: {
          fecha: { gte: fechaDesde, lte: fechaHasta },
          nroComprobante: {
            contains: busqueda,
            mode: "insensitive",
          },
        },
        include: {
          cliente: true,
          detalles: {
            include: {
              variante: {
                include: {
                  producto: {
                    select: {
                      codigo: true,
                      descripcion: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { fecha: "desc" },
        skip: (pagina - 1) * porPagina,
        take: porPagina,
      }),
      prisma.venta.count({
        where: {
          fecha: { gte: fechaDesde, lte: fechaHasta },
          nroComprobante: {
            contains: busqueda,
            mode: "insensitive",
          },
        },
      }),
    ]);

    const totalPaginas = Math.max(1, Math.ceil(total / porPagina));

    return NextResponse.json({ ventas, totalPaginas });
  } catch (error) {
    console.error("❌ Error al cargar ventas:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
