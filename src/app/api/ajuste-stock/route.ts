import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('query')?.toLowerCase()

  if (!q) return NextResponse.json([])

  const productos = await prisma.producto.findMany({
    where: {
      OR: [
        { codigo: { contains: q } },
        { descripcion: { contains: q, mode: 'insensitive' } }
      ]
    },
    include: {
      variantes: true
    }
  })

  const variantes = productos.flatMap(producto =>
    producto.variantes.map(vari => ({
      ...vari,
      producto: {
        codigo: producto.codigo,
        descripcion: producto.descripcion
      }
    }))
  )

  return NextResponse.json(variantes)
}
export async function POST(req: Request) {
  const body = await req.json()
  const { movimientos } = body

  const hoy = new Date()
  const fecha = new Date(`${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}T00:00:00`)

  const registros = await Promise.all(
    movimientos.map(async (mov: any) => {
      return await prisma.movimientoStock.create({
        data: {
          varianteId: mov.varianteId,
          tipo: "AJUSTE",
          cantidad: mov.cantidad,
          comprobante: mov.comprobante || 'AJUSTE',
          observacion: mov.observacion || '',
          fecha,
        }
      })
    })
  )

  return NextResponse.json({ ok: true, registros })
}