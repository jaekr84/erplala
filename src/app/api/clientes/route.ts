import { prisma } from 'lala/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: { nombre: 'asc' },
    })
    return NextResponse.json(clientes)
  } catch (error) {
    console.error('Error al obtener clientes:', error)
    return NextResponse.json(
      { message: 'Error al obtener los clientes' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const { nombre, apellido, dni, telefono, email, fechaNac } = data

    if (!nombre) {
      return NextResponse.json(
        { message: 'El nombre es obligatorio' },
        { status: 400 }
      )
    }

    if (dni) {
      const existe = await prisma.cliente.findUnique({ where: { dni } })
      if (existe) {
        return NextResponse.json(
          { message: 'Ya existe un cliente con ese DNI' },
          { status: 400 }
        )
      }
    }

    const nuevoCliente = await prisma.cliente.create({
      data: {
        nombre,
        apellido,
        dni: dni || null,
        telefono,
        email,
        fechaNac: fechaNac ? new Date(`${fechaNac}T00:00:00`) : undefined,
      },
    })

    return NextResponse.json(nuevoCliente)
  } catch (error) {
    console.error('Error al crear cliente:', error)
    return NextResponse.json(
      { message: 'Error al crear el cliente' },
      { status: 500 }
    )
  }
}