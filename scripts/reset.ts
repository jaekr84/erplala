// scripts/reset.ts
import { prisma } from "../src/lib/db";

async function resetDB() {
  try {
    console.log("⏳ Vaciando base de datos...");

    await prisma.$transaction([
      prisma.detalleCompra.deleteMany(), // Hijo de Compra
      prisma.compra.deleteMany(), // Padre de DetalleCompra

      prisma.movimientoStock.deleteMany(), // Hijo de Stock (o independiente)
      prisma.stock.deleteMany(), // Tabla de stock

      prisma.variante.deleteMany(), // Hijo de Producto
      prisma.producto.deleteMany(), // Hijo de Proveedor y Categoría

      prisma.proveedor.deleteMany(), // Padre de Producto
      prisma.categoria.deleteMany(), // Padre de Producto

      prisma.contador.deleteMany(), // Independiente
    ]);

    console.log("✅ Base de datos vaciada correctamente.");
  } catch (error) {
    console.error("❌ Error al vaciar la base de datos:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetDB();
