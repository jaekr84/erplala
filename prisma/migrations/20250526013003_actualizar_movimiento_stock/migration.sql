-- AlterEnum
ALTER TYPE "TipoMovimiento" ADD VALUE 'VENTA';

-- AlterTable
ALTER TABLE "MovimientoStock" ADD COLUMN     "costo" DOUBLE PRECISION;
