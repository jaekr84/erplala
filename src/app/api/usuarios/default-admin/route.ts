import { prisma } from 'lala/lib/db'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST() {
  const yaExiste = await prisma.usuario.findFirst({
    where: { email: 'admin@lala.com' }
  })

  if (yaExiste) {
    return NextResponse.json({ message: '✅ Admin ya existe' })
  }

  const passwordHash = await bcrypt.hash('admin', 10)

  const admin = await prisma.usuario.create({
    data: {
      nombre: 'Administrador',
      email: 'admin@lala.com', // ✅ email correcto
      password: passwordHash,
      rol: 'admin'
    }
  })

  return NextResponse.json({ message: '✅ Admin creado', admin })
}