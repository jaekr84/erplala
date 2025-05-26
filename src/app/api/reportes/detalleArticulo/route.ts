import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const codBarra = req.nextUrl.searchParams.get('codBarra')

    if (!codBarra) {
      return NextResponse.json({ error: 'Falta el código de barra' }, { status: 400 })
    }

    const variante = await prisma.variante.findFirst({
      where: { codBarra },
      include: {
        producto: {
          include: {
            proveedor: true,
            variantes: true
          }
        }
      }
    })

    if (!variante) {
      return NextResponse.json({ error: 'Variante no encontrada' }, { status: 404 })
    }

    // Buscar ventas por todas las variantes del producto
    const ventas = await prisma.ventaDetalle.groupBy({
      by: ['varianteId'],
      _sum: { cantidad: true }
    })

    const variantesDetalladas = variante.producto.variantes.map(v => {
      const vendida = ventas.find(vta => vta.varianteId === v.id)
      return {
        talle: v.talle,
        color: v.color,
        stock: v.stock,
        cantidadVendida: vendida?._sum.cantidad ?? 0
      }
    })

    return NextResponse.json({
      descripcion: variante.producto.descripcion,
      proveedor: variante.producto.proveedor.nombre,
      fechaAlta: variante.producto.createdAt,
      variantes: variantesDetalladas
    })
  } catch (error) {
    console.error('❌ Error en detalleArticulo:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}