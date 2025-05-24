-- CreateTable
CREATE TABLE "Contador" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "valor" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contador_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contador_nombre_key" ON "Contador"("nombre");
