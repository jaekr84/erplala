import { NextResponse } from "next/server";
import { prisma } from "lala/lib/db";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { proveedorId, descuento, variantes } = data;

    if (!proveedorId || !Array.isArray(variantes) || variantes.length === 0) {
      return NextResponse.json(
        { message: "Datos incompletos" },
        { status: 400 }
      );
    }

    // Calcular totales
    let total = 0;
    for (const v of variantes) {
      total += Number(v.cantidad) * Number(v.costo);
    }
    const totalConDescuento = total * (1 - (Number(descuento) || 0) / 100);

    // Registrar fecha fija del día a las 00:00:00
    const hoy = new Date();
    const fecha = new Date(`${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}T00:00:00`);

    // Ejecutar transacción
    const compra = await prisma.$transaction(async (tx) => {
      // 1. Obtener y actualizar contador de comprobantes
      const contador = await tx.contador.upsert({
        where: { nombre: "compra" },
        create: { nombre: "compra", valor: 1 },
        update: { valor: { increment: 1 } },
        select: { valor: true },
      });
      const nroComprobante = `C${String(contador.valor).padStart(7, "0")}`;

      // 2. Crear la compra con nroComprobante
      const nuevaCompra = await tx.compra.create({
        data: {
          nroComprobante,
          proveedorId: Number(proveedorId),
          total: totalConDescuento,
          fecha,
          detalles: {
            create: variantes.map((v: any) => ({
              varianteId: Number(v.id),
              cantidad: Number(v.cantidad),
              costo: Number(v.costo),
            })),
          },
        },
        include: { detalles: true },
      });

      // 3. Registrar stock y movimientos
      for (const v of variantes) {
        await tx.variante.update({
          where: { id: Number(v.id) },
          data: {
            stock: { increment: Number(v.cantidad) },
          },
        });

        await tx.movimientoStock.create({
          data: {
            varianteId: Number(v.id),
            tipo: "COMPRA",
            cantidad: Number(v.cantidad),
            comprobante: nroComprobante,
            costo: Number(v.costo),
            observacion: "Compra",
            fecha,
          },
        });
      }

      return nuevaCompra;
    });

    return NextResponse.json({ ok: true, compra });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error al registrar la compra" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");
  const comprobante = searchParams.get("comprobante")?.toLowerCase() || '';

  const fechaHastaFinal = hasta ? new Date(hasta) : undefined;

  try {
    const compras = await prisma.compra.findMany({
      where: {
        fecha: {
          ...(desde && { gte: new Date(desde) }),
          ...(fechaHastaFinal && { lte: new Date(fechaHastaFinal.getTime() + 86400000) }),
        },
        ...(comprobante && {
          nroComprobante: {
            contains: comprobante,
            mode: 'insensitive',
          },
        }),
      },
      include: {
        proveedor: true,
        detalles: {
          include: {
            variante: {
              include: {
                producto: {
                  select: {
                    descripcion: true,
                    codigo: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        fecha: 'desc',
      },
    });

    return NextResponse.json(compras);
  } catch (error) {
    console.error('❌ Error en GET /api/compras', error);
    return NextResponse.json({ message: 'Error al obtener las compras' }, { status: 500 });
  }
}