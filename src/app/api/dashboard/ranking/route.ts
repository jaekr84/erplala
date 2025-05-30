import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  const { fechaDesde, fechaHasta } = await req.json()

  const desde = new Date(fechaDesde)
  const hasta = new Date(fechaHasta)
  const dias = Math.ceil((hasta.getTime() - desde.getTime()) / (1000 * 60 * 60 * 24)) + 1

  const periodoAnteriorDesde = new Date(desde)
  periodoAnteriorDesde.setDate(desde.getDate() - dias)
  const periodoAnteriorHasta = new Date(desde)
  periodoAnteriorHasta.setDate(desde.getDate() - 1)

  const ventasActual = await prisma.ventaDetalle.findMany({
    where: {
      venta: {
        fecha: { gte: desde, lte: hasta }
      }
    },
    include: {
      variante: {
        include: {
          producto: true
        }
      }
    }
  })

  const ventasAnterior = await prisma.ventaDetalle.findMany({
    where: {
      venta: {
        fecha: { gte: periodoAnteriorDesde, lte: periodoAnteriorHasta }
      }
    },
    include: {
      variante: {
        include: {
          producto: true
        }
      }
    }
  })

  // Obtener todos los productos y sus variantes con proveedor y fecha
  const productos = await prisma.producto.findMany({
    include: {
      proveedor: true,
      variantes: true,
    }
  })

  // Contar ventas actuales por varianteId
  const ventasPorVariante: Record<number, number> = {}
  for (const v of ventasActual) {
    ventasPorVariante[v.varianteId] = (ventasPorVariante[v.varianteId] || 0) + v.cantidad
  }

  // Ranking anterior para tendencia
  // Usar el agrupador anterior solo para rankingAnterior, para saber la posición previa
  const agruparVentas = (ventas: typeof ventasActual) => {
    const agrupado: Record<string, {
      codigo: string,
      descripcion: string,
      ventas: number,
    }> = {}
    for (const v of ventas) {
      const codigo = v.variante.producto.codigo
      if (!agrupado[codigo]) {
        agrupado[codigo] = {
          codigo,
          descripcion: v.variante.producto.descripcion,
          ventas: 0,
        }
      }
      agrupado[codigo].ventas += v.cantidad
    }
    return Object.values(agrupado).sort((a, b) => b.ventas - a.ventas)
  }
  const rankingAnterior = agruparVentas(ventasAnterior)

  // Mapear productos con todas sus variantes
  const resultado = productos.map(producto => {
    const variantes = producto.variantes.map(v => ({
      talle: v.talle,
      color: v.color,
      cantidad: ventasPorVariante[v.id] || 0,
      stock: v.stock
    }))
    const ventasTotales = variantes.reduce((sum, v) => sum + v.cantidad, 0)

    const anteriorIndex = rankingAnterior.findIndex(a => a.codigo === producto.codigo)
    // Se asignará luego la posición
    let tendencia = '🆕'
    // rankingActual se determina después del sort
    // La posición previa se compara usando el índice de rankingAnterior vs rankingActual
    // Aquí solo guardamos anteriorIndex, tendencia se ajusta después de ordenar
    return {
      codigo: producto.codigo,
      descripcion: producto.descripcion,
      proveedor: producto.proveedor?.nombre || '',
      fechaAlta: producto.createdAt,
      ventas: ventasTotales,
      posicion: 0, // se asignará luego
      anterior: anteriorIndex === -1 ? null : anteriorIndex + 1,
      tendencia,
      variantes
    }
  }).sort((a, b) => b.ventas - a.ventas)

  // Asignar posición y tendencia después de ordenar
  resultado.forEach((r, i) => {
    r.posicion = i + 1
    const anteriorIndex = rankingAnterior.findIndex(a => a.codigo === r.codigo)
    let tendencia = '🆕'
    if (anteriorIndex !== -1) {
      if (anteriorIndex > i) tendencia = '🔼'
      else if (anteriorIndex < i) tendencia = '🔽'
      else tendencia = '➖'
    }
    r.tendencia = tendencia
    r.anterior = anteriorIndex === -1 ? null : anteriorIndex + 1
  })

  return NextResponse.json(resultado)
}
