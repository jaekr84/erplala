import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const datos = await prisma.datosNegocio.findUnique({ where: { id: 1 } })
    return NextResponse.json(datos)
  } catch (error) {
    console.error('Error al obtener los datos del negocio:', error)
    return NextResponse.json({ error: 'Error al obtener los datos' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const datos = await prisma.datosNegocio.upsert({
      where: { id: 1 },
      update: body,
      create: { id: 1, ...body },
    })
    return NextResponse.json(datos)
  } catch (error) {
    console.error('Error al guardar los datos del negocio:', error)
    return NextResponse.json({ error: 'Error al guardar los datos' }, { status: 500 })
  }
}