import { prisma } from "lala/lib/db"
import { NextResponse } from "next/server"

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.categoria.delete({
      where: { id: Number(params.id) },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "No se pudo eliminar la categoría" }, { status: 500 })
  }
}
