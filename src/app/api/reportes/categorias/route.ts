import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Agrupamos ventas por varianteId
    const ventas = await prisma.ventaDetalle.groupBy({
      by: ['varianteId'],
      _sum: { cantidad: true },
    })

    // Traemos todas las variantes con su producto y categoría
    const variantes = await prisma.variante.findMany({
      include: {
        producto: {
          include: {
            categoria: true
          }
        }
      }
    })

    // Acumulamos cantidad vendida por categoría
    const resumen: Record<string, number> = {}

    for (const venta of ventas) {
      const variante = variantes.find(v => v.id === venta.varianteId)
      if (!variante) continue

      const categoria = variante.producto.categoria.nombre
      resumen[categoria] = (resumen[categoria] || 0) + (venta._sum.cantidad || 0)
    }

    // Convertimos el resumen en array para el gráfico
    const resultado = Object.entries(resumen).map(([nombre, cantidad]) => ({
      nombre,
      cantidad,
    }))

    return NextResponse.json(resultado)
  } catch (error) {
    console.error('Error al generar reporte de categorías:', error)
    return NextResponse.json({ error: 'Error al generar el reporte' }, { status: 500 })
  }
}