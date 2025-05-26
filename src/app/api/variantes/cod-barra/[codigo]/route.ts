import { NextResponse } from 'next/server'
import { prisma } from 'lala/lib/db'

type Params = {
  params: { codigo: string }
}

export async function GET(_req: Request, { params }: Params) {
  const { codigo } = params

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