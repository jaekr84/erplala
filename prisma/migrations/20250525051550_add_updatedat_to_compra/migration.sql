/*
  Warnings:

  - You are about to drop the column `numero` on the `Compra` table. All the data in the column will be lost.
  - You are about to drop the column `costoUnitario` on the `DetalleCompra` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal` on the `DetalleCompra` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Compra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `costo` to the `DetalleCompra` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Compra_numero_key";

-- AlterTable
ALTER TABLE "Compra" DROP COLUMN "numero",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "DetalleCompra" DROP COLUMN "costoUnitario",
DROP COLUMN "subtotal",
ADD COLUMN     "costo" DOUBLE PRECISION NOT NULL;
