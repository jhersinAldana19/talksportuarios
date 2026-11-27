import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// En desarrollo Next.js recarga los módulos en cada cambio; guardamos el cliente
// en globalThis para no abrir un pool de conexiones nuevo en cada recarga.
// La clave incluye una revisión: si se añade un modelo (p. ej. Destacado) y el
// proceso sigue vivo, hay que cambiarla o reiniciar `npm run dev` para no
// reutilizar un PrismaClient viejo sin ese modelo.
const globalParaPrisma = globalThis as unknown as {
  prismaTalks?: PrismaClient;
  prismaTalksRev?: string;
};
const PRISMA_REV = "configuracion-sitio-2";

function crearCliente() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma =
  globalParaPrisma.prismaTalksRev === PRISMA_REV && globalParaPrisma.prismaTalks
    ? globalParaPrisma.prismaTalks
    : crearCliente();

if (process.env.NODE_ENV !== "production") {
  globalParaPrisma.prismaTalks = prisma;
  globalParaPrisma.prismaTalksRev = PRISMA_REV;
}
