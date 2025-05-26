/*
  Warnings:

  - A unique constraint covering the columns `[nombre]` on the table `Proveedor` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Proveedor_nombre_key" ON "Proveedor"("nombre");
