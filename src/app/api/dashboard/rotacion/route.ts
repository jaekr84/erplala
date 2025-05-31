import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { subDays, differenceInDays, parseISO } from "date-fns";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const desde = searchParams.get("desde");
  const hasta = searchParams.get("hasta");

  if (!desde || !hasta) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  const desdeDate = new Date(`${desde}T00:00:00`);
  const hastaDate = new Date(`${hasta}T23:59:59`);

  const variantes = await prisma.variante.findMany({
    include: {
      producto: true,
      VentaDetalle: {
        where: {
          venta: {
            fecha: {
              gte: desdeDate,
              lte: hastaDate,
            },
          },
        },
        include: {
          venta: true,
        },
      },
    },
  });

  const agrupado: Record<string, any> = {};

  for (const v of variantes) {
    const codigo = v.producto.codigo;
    const descripcion = v.producto.descripcion;
    const fechaAlta = new Date(v.producto.createdAt);
    const stock = v.stock;
    const ventas = v.VentaDetalle.reduce((sum, d) => sum + d.cantidad, 0);
    const fechasVenta = v.VentaDetalle.map((d) => d.venta.fecha);
    const ultimaVenta = fechasVenta.length
      ? new Date(Math.max(...fechasVenta.map((f) => f.getTime())))
      : null;

    const diasActivos = Math.max(
      1,
      differenceInDays(ultimaVenta || hastaDate, fechaAlta)
    );
    const rotacionSemanal = (ventas / diasActivos) * 7;

    if (!agrupado[codigo]) {
      agrupado[codigo] = {
        codigo,
        descripcion,
        fechaAlta,
        ventasTotales: 0,
        diasActivos: 0,
        rotacionSemanal: 0,
        ultimaVenta: ultimaVenta,
        stockTotal: 0,
        alerta: false,
        variantes: [],
      };
    }

    agrupado[codigo].ventasTotales += ventas;
    agrupado[codigo].diasActivos = Math.max(
      agrupado[codigo].diasActivos,
      diasActivos
    );
    agrupado[codigo].stockTotal += stock;
    agrupado[codigo].ultimaVenta = agrupado[codigo].ultimaVenta
      ? new Date(
          Math.max(
            agrupado[codigo].ultimaVenta.getTime(),
            ultimaVenta?.getTime() || 0
          )
        )
      : ultimaVenta;

    agrupado[codigo].variantes.push({
      id: v.id,
      talle: v.talle,
      color: v.color,
      fechaAlta,
      stock,
      ventas,
      ultimaVenta,
      rotacionSemanal,
    });
  }

  const resultado = Object.values(agrupado).map((item: any) => {
    const rotacionGlobal = (item.ventasTotales / item.diasActivos) * 7;
    let etiqueta = "nula";
    if (item.ventasTotales >= 1 && item.diasActivos >= 1) {
      if (rotacionGlobal >= 5) etiqueta = "altisima";
      else if (rotacionGlobal >= 2) etiqueta = "alta";
      else if (rotacionGlobal >= 1) etiqueta = "media";
      else if (item.ventasTotales > 0) etiqueta = "baja";
    }
    return {
      ...item,
      rotacionSemanal: parseFloat(rotacionGlobal.toFixed(2)),
      alerta: rotacionGlobal >= 2 && item.stockTotal === 0,
      etiqueta,
    };
  });

  return NextResponse.json(resultado);
}
