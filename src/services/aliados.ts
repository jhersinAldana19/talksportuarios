import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";

// Caché: cacheTag('partners') y cacheTag('aliado:<slug>').
// Al guardar un partner desde el panel, la action llama updateTag('partners').

const publicado = { activo: true, estado: "PUBLICADO" as const, nivel: "ALIADO" as const, slug: { not: null } };

export async function listarAliadosPublicados() {
  "use cache";
  cacheLife("hours");
  cacheTag("partners");

  return prisma.partner.findMany({
    where: publicado,
    orderBy: [{ orden: "asc" }, { nombre: "asc" }],
    select: {
      id: true,
      slug: true,
      nombre: true,
      logoUrl: true,
      frase: true,
      relacionComercial: true,
      _count: { select: { cursos: { where: { activo: true } }, becas: true } },
    },
  });
}

export async function listarSlugsAliados(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("partners");

  const filas = await prisma.partner.findMany({ where: publicado, select: { slug: true } });
  return filas.flatMap((fila) => (fila.slug ? [fila.slug] : []));
}

export async function obtenerAliadoPorSlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("partners");
  cacheTag(`aliado:${slug}`);

  return prisma.partner.findFirst({
    where: { ...publicado, slug },
    select: {
      id: true,
      slug: true,
      nombre: true,
      logoUrl: true,
      web: true,
      frase: true,
      descripcion: true,
      beneficios: true,
      relacionComercial: true,
      cursos: {
        where: { activo: true },
        orderBy: { orden: "asc" },
        select: { id: true, slug: true, titulo: true, url: true, resumen: true, gratuito: true },
      },
      becas: {
        orderBy: [{ fecha: "desc" }, { orden: "asc" }],
        select: { id: true, titulo: true, descripcion: true, fecha: true, estado: true },
      },
    },
  });
}
