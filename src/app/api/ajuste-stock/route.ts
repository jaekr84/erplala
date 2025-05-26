import { NextResponse } from 'next/server'
import { prisma } from 'lala/lib/db'

export async function POST(req: Request) {
  try {
    const ajustes = await req.json()

    if (!Array.isArray(ajustes) || ajustes.length === 0) {
      return NextResponse.json({ message: 'No hay ajustes' }, { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
      for (const item of ajustes) {
        const { varianteId, stockNuevo, diferencia } = item

        const stockFinal = Number(stockNuevo)
        const cantidad = Number(diferencia)

        if (isNaN(stockFinal) || isNaN(cantidad)) {
          throw new Error(`Stock o diferencia inválida para variante ${varianteId}`)
        }

        await tx.variante.update({
          where: { id: varianteId },
          data: { stock: stockFinal },
        })

        await tx.movimientoStock.create({
          data: {
            varianteId,
            tipo: 'AJUSTE',
            cantidad,
            comprobante: `AJUSTE-${varianteId}-${Date.now()}`,
            observacion: 'Ajuste manual de stock'
          }
        })
      }
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error en ajuste de stock:', error)
    return NextResponse.json({ message: 'Error en ajuste de stock' }, { status: 500 })
  }
}