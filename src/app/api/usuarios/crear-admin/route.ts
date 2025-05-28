import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const { nombre, email, password } = await req.json()

  // Verificar si ya existe un admin
  const adminExiste = await prisma.usuario.findFirst({
    where: { rol: 'ADMIN' },
  })

  if (adminExiste) {
    return NextResponse.json({ message: 'Ya existe un usuario admin' }, { status: 400 })
  }

  if (!nombre || !email || !password) {
    return NextResponse.json({ message: 'Faltan datos' }, { status: 400 })
  }

  const passwordHash = await hash(password, 10)

  const nuevoUsuario = await prisma.usuario.create({
    data: {
      nombre,
      email,
      password: passwordHash,
      rol: 'ADMIN',
    },
  })

  return NextResponse.json({ message: 'Usuario admin creado', usuario: nuevoUsuario })
}