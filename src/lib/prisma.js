import { PrismaClient } from "@prisma/client";
// Evitar múltiplas instâncias do PrismaClient em desenvolvimento
const globalForPrisma = globalThis;
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient();
}
export const prisma = globalForPrisma.prisma;
