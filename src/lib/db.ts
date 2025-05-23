import { PrismaClient } from "@prisma/client";

// Permite reutilizar la instancia de Prisma en desarrollo para evitar errores de múltiples instancias
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"], // Opcional: muestra en consola las consultas SQL
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;