import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const compraId = Number(searchParams.get('compraId'))

    if (isNaN(compraId)) {
      return NextResponse.json({ error: 'ID de compra inválido' }, { status: 400 })
    }

    const compra = await prisma.compra.findUnique({
      where: { id: compraId },
      include: {
        detalles: {
          include: {
            variante: {
              include: {
                producto: {
                  select: { codigo: true, descripcion: true }
                }
              }
            }
          }
        }
      }
    })

    if (!compra) {
      return NextResponse.json({ error: 'Compra no encontrada' }, { status: 404 })
    }

    const etiquetas = compra.detalles.map((item) => ({
      id: item.variante.id,
      talle: item.variante.talle,
      color: item.variante.color,
      codBarra: item.variante.codBarra,
      cantidad: item.cantidad,
      producto: {
        codigo: item.variante.producto.codigo,
        descripcion: item.variante.producto.descripcion
      }
    }))

    return NextResponse.json(etiquetas)
  } catch (error) {
    console.error('Error cargando etiquetas desde compra:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}