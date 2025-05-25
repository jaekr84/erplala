import { NextResponse } from "next/server"
import { prisma } from "lala/lib/db"

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const { proveedorId, descuento, variantes } = data

    if (!proveedorId || !Array.isArray(variantes) || variantes.length === 0) {
      return NextResponse.json({ message: "Datos incompletos" }, { status: 400 })
    }

    // Calcular totales
    let total = 0
    for (const v of variantes) {
      total += Number(v.cantidad) * Number(v.costo)
    }
    const totalConDescuento = total * (1 - (Number(descuento) || 0) / 100)

    // Crear la compra y los detalles en una transacción
    const compra = await prisma.$transaction(async (tx) => {
      // Crear compra
      const nuevaCompra = await tx.compra.create({
        data: {
          proveedorId: Number(proveedorId),
          total: totalConDescuento,
          detalles: {
            create: variantes.map((v: any) => ({
              varianteId: Number(v.id),
              cantidad: Number(v.cantidad),
              costo: Number(v.costo),
            })),
          },
        },
        include: { detalles: true },
      })

      // Actualizar stock y registrar movimiento por cada variante
      for (const v of variantes) {
        await tx.variante.update({
          where: { id: Number(v.id) },
          data: {
            stock: { increment: Number(v.cantidad) },
          },
        })
        await tx.movimientoStock.create({
          data: {
            varianteId: Number(v.id),
            tipo: "AJUSTE", // o "COMPRA" si agregás ese tipo en tu enum
            cantidad: Number(v.cantidad),
            comprobante: String(nuevaCompra.id),
            observacion: "Compra",
          },
        })
      }

      return nuevaCompra
    })

    return NextResponse.json({ ok: true, compra })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Error al registrar la compra" }, { status: 500 })
  }
}

export async function GET() {
  const compras = await prisma.compra.findMany({
    include: {
      proveedor: true,
      detalles: {
        include: {
          variante: {
            include: {
              producto: true
            }
          }
        }
      }
    },
    orderBy: {
      fecha: 'desc'
    }
  })

  return NextResponse.json(compras)
}
