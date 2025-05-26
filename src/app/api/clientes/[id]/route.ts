import { prisma } from 'lala/lib/db'
import { NextResponse } from 'next/server'

type Params = { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
  const id = Number(params.id)
  if (isNaN(id)) {
    return NextResponse.json({ message: 'ID inválido' }, { status: 400 })
  }

  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id },
    })

    if (!cliente) {
      return NextResponse.json({ message: 'Cliente no encontrado' }, { status: 404 })
    }

    return NextResponse.json(cliente)
  } catch (error) {
    console.error('Error al buscar cliente:', error)
    return NextResponse.json({ message: 'Error interno' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: Params) {
  const id = Number(params.id)
  if (isNaN(id)) {
    return NextResponse.json({ message: 'ID inválido' }, { status: 400 })
  }

  try {
    const data = await req.json()
    const { nombre, apellido, dni, telefono, email, fechaNac } = data

    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        nombre,
        apellido,
        dni,
        telefono,
        email,
        fechaNac: fechaNac ? new Date(fechaNac) : undefined,
      },
    })

    return NextResponse.json(cliente)
  } catch (error) {
    console.error('Error al actualizar cliente:', error)
    return NextResponse.json({ message: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const id = Number(params.id)
  if (isNaN(id)) {
    return NextResponse.json({ message: 'ID inválido' }, { status: 400 })
  }

  try {
    await prisma.cliente.delete({ where: { id } })
    return NextResponse.json({ message: 'Cliente eliminado' })
  } catch (error) {
    console.error('Error al eliminar cliente:', error)
    return NextResponse.json({ message: 'Error interno' }, { status: 500 })
  }
}