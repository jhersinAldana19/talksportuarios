import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

// Lógica de negocio de Talks. La usan las páginas y, más adelante, el panel y el MCP.
// Caché: 'use cache' + cacheTag('talks'). Al editar desde el panel → revalidateTag('talks').

const incluirInvitados = {
  invitados: {
    select: { slug: true, nombre: true, cargo: true, empresa: true },
    orderBy: { nombre: "asc" },
  },
} satisfies Prisma.TalkInclude;

export type TalkConInvitados = Prisma.TalkGetPayload<{ include: typeof incluirInvitados }>;

/** Talks publicados, del más reciente al más antiguo. */
export async function listarTalksPublicados(): Promise<TalkConInvitados[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("talks");

  return prisma.talk.findMany({
    where: { estado: "PUBLICADO" },
    orderBy: { fechaPublicacion: "desc" },
    include: incluirInvitados,
  });
}

export async function obtenerUltimoTalk(): Promise<TalkConInvitados | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("talks");

  return prisma.talk.findFirst({
    where: { estado: "PUBLICADO" },
    orderBy: { fechaPublicacion: "desc" },
    include: incluirInvitados,
  });
}

/** Un Talk publicado por su slug (null si no existe o es borrador). */
export async function obtenerTalkPorSlug(slug: string): Promise<TalkConInvitados | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("talks", `talk:${slug}`);

  return prisma.talk.findFirst({
    where: { slug, estado: "PUBLICADO" },
    include: incluirInvitados,
  });
}

/** Slugs publicados, para generateStaticParams. */
export async function listarSlugsTalks(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("talks");

  const filas = await prisma.talk.findMany({
    where: { estado: "PUBLICADO" },
    select: { slug: true },
  });
  return filas.map((f) => f.slug);
}
