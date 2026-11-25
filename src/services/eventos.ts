import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

// Caché: cacheTag('eventos'). Al editar desde el panel → revalidateTag('eventos').

const incluirRelaciones = {
  aliado: { select: { nombre: true, web: true } },
  ponentes: { select: { slug: true, nombre: true, cargo: true, empresa: true } },
} satisfies Prisma.EventoInclude;

export type EventoConRelaciones = Prisma.EventoGetPayload<{ include: typeof incluirRelaciones }>;

/**
 * Eventos publicados desde hoy (hora de Lima) en adelante, del más próximo al más lejano.
 * La caché se renueva cada hora, así un evento pasado deja de mostrarse solo.
 */
export async function listarProximosEventos(limite?: number): Promise<EventoConRelaciones[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("eventos");

  // Inicio del día actual en Lima (UTC-5, Perú no tiene horario de verano).
  const hoy = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima" }).format(new Date()); // "AAAA-MM-DD"
  const desde = new Date(`${hoy}T00:00:00-05:00`);

  return prisma.evento.findMany({
    where: { estado: "PUBLICADO", fecha: { gte: desde } },
    orderBy: { fecha: "asc" },
    include: incluirRelaciones,
    take: limite,
  });
}
