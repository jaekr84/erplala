import { prisma } from "lala/lib/db"
import { NextResponse, NextRequest } from "next/server"

export async function DELETE(_req: NextRequest, context: any) {
  try {
    await prisma.categoria.delete({
      where: { id: Number(context.params.id) },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "No se pudo eliminar la categoría" }, { status: 500 })
  }
}
