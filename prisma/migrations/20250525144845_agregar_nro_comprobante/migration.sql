/*
  Warnings:

  - A unique constraint covering the columns `[nroComprobante]` on the table `Compra` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "TipoMovimiento" ADD VALUE 'COMPRA';

-- AlterTable
ALTER TABLE "Compra" ADD COLUMN     "nroComprobante" TEXT NOT NULL DEFAULT 'TEMP';

-- AlterTable
ALTER TABLE "DetalleCompra" ADD COLUMN     "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "MovimientoStock" ADD COLUMN     "usuarioId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Compra_nroComprobante_key" ON "Compra"("nroComprobante");
