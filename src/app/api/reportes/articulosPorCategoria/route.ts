import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const categoria = req.nextUrl.searchParams.get('categoria')

    if (!categoria) {
      return NextResponse.json({ error: 'Falta el nombre de categoría' }, { status: 400 })
    }

    const categoriaLower = categoria.toLowerCase()

    // 1. Buscar variantes con su producto y categoría
    const variantes = await prisma.variante.findMany({
      include: {
        producto: {
          include: { categoria: true }
        }
      }
    })

    // 2. Filtrar variantes cuya categoría coincida
    const variantesFiltradas = variantes.filter(v =>
      v.producto?.categoria?.nombre.toLowerCase() === categoriaLower
    )

    // 3. Buscar ventas agrupadas por variante
    const ventas = await prisma.ventaDetalle.groupBy({
      by: ['varianteId'],
      _sum: { cantidad: true }
    })

    // 4. Agrupar ventas por producto
    const resumenPorProducto: Record<number, { descripcion: string; codBarra: string; cantidadVendida: number }> = {}

    for (const variante of variantesFiltradas) {
      const productoId = variante.producto.id
      const descripcion = variante.producto.descripcion
      const codBarra = variante.codBarra // usamos uno de los códigos de barra como identificador para mostrar detalle

      const venta = ventas.find(v => v.varianteId === variante.id)
      const cantidad = venta?._sum.cantidad ?? 0

      if (!resumenPorProducto[productoId]) {
        resumenPorProducto[productoId] = {
          descripcion,
          codBarra,
          cantidadVendida: 0
        }
      }

      resumenPorProducto[productoId].cantidadVendida += cantidad
    }

    const resultado = Object.values(resumenPorProducto).filter(r => r.cantidadVendida > 0)

    return NextResponse.json(resultado)
  } catch (error) {
    console.error('❌ Error al generar artículos por categoría:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}