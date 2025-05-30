import { NextResponse, NextRequest } from 'next/server'
import { prisma } from 'lala/lib/db'

export async function GET(_req: NextRequest, context: any) {
  const { codigo } = context.params

  if (!codigo) {
    return NextResponse.json({ message: 'Código no proporcionado' }, { status: 400 })
  }

  const variante = await prisma.variante.findUnique({
    where: { codBarra: codigo },
    include: {
      producto: {
        select: {
          codigo: true,
          descripcion: true,
          precioVenta: true
        }
      }
    }
  })

  if (!variante) {
    return NextResponse.json({ message: 'Variante no encontrada' }, { status: 404 })
  }

  return NextResponse.json({
    id: variante.id,
    codBarra: variante.codBarra,
    talle: variante.talle,
    color: variante.color,
    stock: variante.stock,
    producto: {
      codigo: variante.producto.codigo,
      descripcion: variante.producto.descripcion,
      precioVenta: variante.producto.precioVenta
    }
  })
}