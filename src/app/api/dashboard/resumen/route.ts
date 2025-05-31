import { prisma } from 'lala/lib/db'
import { NextResponse } from 'next/server'
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth
} from 'date-fns'

export async function GET() {
  try {
    const hoyDate = new Date()
    const hoy = new Date(`${hoyDate.getFullYear()}-${String(hoyDate.getMonth() + 1).padStart(2, '0')}-${String(hoyDate.getDate()).padStart(2, '0')}T00:00:00`)

    const [ventasHoy, ventasSemana, ventasMes] = await Promise.all([
      prisma.venta.findMany({
        where: {
          fecha: {
            gte: startOfDay(hoy),
            lte: endOfDay(hoy)
          }
        },
        include: { detalles: true }
      }),
      prisma.venta.findMany({
        where: {
          fecha: {
            gte: startOfWeek(hoy, { weekStartsOn: 1 }),
            lte: endOfWeek(hoy, { weekStartsOn: 1 })
          }
        },
        include: { detalles: true }
      }),
      prisma.venta.findMany({
        where: {
          fecha: {
            gte: startOfMonth(hoy),
            lte: endOfMonth(hoy)
          }
        },
        include: { detalles: true }
      })
    ])

    const totalHoy = ventasHoy.reduce((sum, v) => sum + v.total, 0)
    const totalSemana = ventasSemana.reduce((sum, v) => sum + v.total, 0)
    const totalMes = ventasMes.reduce((sum, v) => sum + v.total, 0)

    const unidadesHoy = ventasHoy.flatMap(v => v.detalles).reduce((sum, d) => sum + d.cantidad, 0)
    const unidadesSemana = ventasSemana.flatMap(v => v.detalles).reduce((sum, d) => sum + d.cantidad, 0)
    const unidadesMes = ventasMes.flatMap(v => v.detalles).reduce((sum, d) => sum + d.cantidad, 0)

    return NextResponse.json({
      totalHoy,
      totalSemana,
      totalMes,
      unidadesHoy,
      unidadesSemana,
      unidadesMes
    })
  } catch (error) {
    console.error('Error en resumen dashboard:', error)
    return NextResponse.json({ message: 'Error en resumen de ventas' }, { status: 500 })
  }
}