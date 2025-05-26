import { prisma } from "lala/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { nombre } = await req.json()

  if (!nombre) {
    return NextResponse.json({ message: "Falta el nombre del contador" }, { status: 400 })
  }

  try {
    const contador = await prisma.contador.findUnique({
      where: { nombre }
    })

    let nuevoValor: number

    if (!contador) {
      const creado = await prisma.contador.create({
        data: { nombre, valor: 1 }
      })
      nuevoValor = creado.valor
    } else {
      const actualizado = await prisma.contador.update({
        where: { nombre },
        data: { valor: { increment: 1 } },
        select: { valor: true }
      })
      nuevoValor = actualizado.valor
    }

    return NextResponse.json({ valor: nuevoValor })
  } catch (error) {
    console.error("❌ Error en incrementar contador:", error)
    return NextResponse.json({ message: "Error interno" }, { status: 500 })
  }
}