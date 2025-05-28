/*
  Warnings:

  - You are about to drop the `Usuario` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "EstadoCaja" AS ENUM ('ABIERTA', 'CERRADA');

-- DropTable
DROP TABLE "Usuario";

-- DropEnum
DROP TYPE "RolUsuario";

-- CreateTable
CREATE TABLE "Caja" (
    "id" SERIAL NOT NULL,
    "fechaApertura" TIMESTAMP(3) NOT NULL,
    "fechaCierre" TIMESTAMP(3),
    "montoInicial" DOUBLE PRECISION NOT NULL,
    "totalEfectivo" DOUBLE PRECISION,
    "totalTarjeta" DOUBLE PRECISION,
    "totalOtro" DOUBLE PRECISION,
    "totalReal" DOUBLE PRECISION,
    "diferencia" DOUBLE PRECISION,
    "observaciones" TEXT,
    "estado" "EstadoCaja" NOT NULL DEFAULT 'ABIERTA',

    CONSTRAINT "Caja_pkey" PRIMARY KEY ("id")
);
