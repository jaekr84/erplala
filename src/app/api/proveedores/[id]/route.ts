import { prisma } from "lala/lib/db"
import { NextResponse } from "next/server"

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.proveedor.delete({
      where: { id: Number(params.id) },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "No se pudo eliminar el proveedor" }, { status: 500 })
  }
}
