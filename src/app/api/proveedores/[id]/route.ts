import { prisma } from "lala/lib/db"
import { NextResponse, NextRequest } from "next/server"

export async function DELETE(_req: NextRequest, context: any) {
  try {
    const id = Number(context.params.id)
    await prisma.proveedor.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "No se pudo eliminar el proveedor" }, { status: 500 })
  }
}
