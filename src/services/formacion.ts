import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";

const publicado = { activo: true, estado: "PUBLICADO" as const, nivel: "ALIADO" as const, slug: { not: null } };

export async function listarCursosRecomendados() {
  "use cache";
  cacheLife("hours");
  cacheTag("partners");

  return prisma.cursoAliado.findMany({
    where: { activo: true, partner: publicado },
    orderBy: [{ partner: { orden: "asc" } }, { orden: "asc" }],
    select: {
      id: true,
      slug: true,
      titulo: true,
      url: true,
      resumen: true,
      gratuito: true,
      partner: { select: { nombre: true, slug: true, relacionComercial: true, web: true } },
    },
  });
}

export async function listarBecasPublicas() {
  "use cache";
  cacheLife("hours");
  cacheTag("partners");

  return prisma.becaAliado.findMany({
    where: { partner: publicado },
    orderBy: [{ fecha: "desc" }, { orden: "asc" }],
    select: {
      id: true,
      titulo: true,
      descripcion: true,
      fecha: true,
      estado: true,
      partner: { select: { nombre: true, slug: true } },
    },
  });
}
