// src/app/api/usuarios/route.ts
import { prisma } from 'lala/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  const usuarios = await prisma.usuario.findMany()
  return NextResponse.json(usuarios)
}
export async function POST(req: Request) {
  const data = await req.json()

  if (!data.nombre || !data.email || !data.rol) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  const usuario = await prisma.usuario.create({
    data: {
      nombre: data.nombre,
      email: data.email,
      rol: data.rol
    }
  })

  return NextResponse.json(usuario)
}
export async function PUT(req: Request) {
  const data = await req.json()

  if (!data.id || !data.nombre || !data.email || !data.rol) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  const usuario = await prisma.usuario.update({
    where: { id: data.id },
    data: {
      nombre: data.nombre,
      email: data.email,
      rol: data.rol,
    },
  })

  return NextResponse.json(usuario)
}
export async function DELETE(req: Request) {
  const { id } = await req.json()

  if (!id) {
    return NextResponse.json({ error: 'Falta el ID' }, { status: 400 })
  }

  await prisma.usuario.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}