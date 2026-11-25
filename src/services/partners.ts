import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";

// Caché: cacheTag('partners'). Al editar desde el panel → revalidateTag('partners').

/** Partners activos ordenados por nivel (fundador primero) y luego por `orden`. */
export async function listarPartnersActivos() {
  "use cache";
  cacheLife("hours");
  cacheTag("partners");

  return prisma.partner.findMany({
    where: { activo: true },
    orderBy: [{ nivel: "asc" }, { orden: "asc" }],
    select: { id: true, nombre: true, logoUrl: true, web: true, nivel: true },
  });
}
