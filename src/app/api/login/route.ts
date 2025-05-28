import { prisma } from 'lala/lib/db'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  }

  const user = await prisma.usuario.findUnique({ where: { email } })

  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 })
  }

  if (!user.password) {
    return NextResponse.json({ error: 'Usuario sin contraseña válida' }, { status: 500 })
  }

  const valido = await bcrypt.compare(password, user.password)

  if (!valido) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
  }

  // ✅ destructuring seguro (después de validar)
  const { password: omitPassword, ...usuarioSinClave } = user
  return NextResponse.json(usuarioSinClave)
}