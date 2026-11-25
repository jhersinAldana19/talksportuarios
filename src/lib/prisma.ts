import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// En desarrollo Next.js recarga los módulos en cada cambio; guardamos el cliente
// en globalThis para no abrir un pool de conexiones nuevo en cada recarga.
const globalParaPrisma = globalThis as unknown as { prisma?: PrismaClient };

function crearCliente() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma = globalParaPrisma.prisma ?? crearCliente();

if (process.env.NODE_ENV !== "production") globalParaPrisma.prisma = prisma;
