import { cacheLife, cacheTag } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { Estado, Modalidad, type Estado as TipoEstado, type Modalidad as TipoModalidad } from "@/generated/prisma/enums";
import { fechaMediodiaLima } from "@/lib/formato";
import { urlOpcional } from "@/lib/formulario";
import { prisma } from "@/lib/prisma";
import { slugify, slugValido } from "@/lib/slug";
import type { Resultado } from "@/services/talks";

// Caché: cacheTag('eventos'). Al guardar desde el panel, la action llama updateTag('eventos').
// Las funciones de administración no llevan caché: incluyen borradores.

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

const incluirAdmin = {
  aliado: { select: { id: true, nombre: true } },
  ponentes: { select: { id: true, nombre: true }, orderBy: { nombre: "asc" } },
} satisfies Prisma.EventoInclude;

export type EventoAdmin = Prisma.EventoGetPayload<{ include: typeof incluirAdmin }>;

export type EntradaEvento = {
  titulo: string;
  slug: string;
  descripcion: string;
  fecha: string;
  lugar: string;
  modalidad: string;
  cupoLimitado: boolean;
  linkInscripcion: string;
  estado: string;
  aliadoId: string;
  ponenteIds: string[];
};

export type EventoGuardado = { id: string; slug: string; slugAnterior: string | null };

const MODALIDADES = new Set<string>(Object.values(Modalidad));
const ESTADOS = new Set<string>(Object.values(Estado));

export async function listarEventosAdmin(): Promise<EventoAdmin[]> {
  return prisma.evento.findMany({
    orderBy: { fecha: "desc" },
    include: incluirAdmin,
  });
}

export async function obtenerEventoAdmin(id: string): Promise<EventoAdmin | null> {
  return prisma.evento.findUnique({ where: { id }, include: incluirAdmin });
}

export async function contarEventosAdmin(): Promise<{ publicados: number; borradores: number }> {
  const [publicados, borradores] = await Promise.all([
    prisma.evento.count({ where: { estado: "PUBLICADO" } }),
    prisma.evento.count({ where: { estado: "BORRADOR" } }),
  ]);
  return { publicados, borradores };
}

export async function crearEvento(entrada: EntradaEvento): Promise<Resultado<EventoGuardado>> {
  const preparado = await prepararEvento(entrada);
  if (!preparado.ok) return preparado;

  try {
    const evento = await prisma.evento.create({
      data: datosCrear(preparado.datos),
      select: { id: true, slug: true },
    });
    return { ok: true, datos: { ...evento, slugAnterior: null } };
  } catch (error) {
    const mensaje = mensajeSlug(error);
    if (mensaje) return { ok: false, error: mensaje };
    throw error;
  }
}

export async function actualizarEvento(id: string, entrada: EntradaEvento): Promise<Resultado<EventoGuardado>> {
  const actual = await prisma.evento.findUnique({ where: { id }, select: { slug: true, aliadoId: true } });
  if (!actual) return { ok: false, error: "No encontramos ese evento." };

  const preparado = await prepararEvento(entrada, id);
  if (!preparado.ok) return preparado;

  try {
    const evento = await prisma.evento.update({
      where: { id },
      data: datosActualizar(preparado.datos, Boolean(actual.aliadoId)),
      select: { id: true, slug: true },
    });
    return { ok: true, datos: { ...evento, slugAnterior: actual.slug } };
  } catch (error) {
    const mensaje = mensajeSlug(error);
    if (mensaje) return { ok: false, error: mensaje };
    throw error;
  }
}

export async function cambiarEstadoEvento(id: string, estado: string): Promise<Resultado<{ slug: string }>> {
  if (!ESTADOS.has(estado)) return { ok: false, error: "El estado no es válido." };
  try {
    const evento = await prisma.evento.update({
      where: { id },
      data: { estado: estado as TipoEstado },
      select: { slug: true },
    });
    return { ok: true, datos: evento };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { ok: false, error: "No encontramos ese evento." };
    }
    throw error;
  }
}

export async function eliminarEvento(id: string): Promise<Resultado<{ slug: string }>> {
  const actual = await prisma.evento.findUnique({ where: { id }, select: { slug: true } });
  if (!actual) return { ok: false, error: "No encontramos ese evento." };
  await prisma.evento.delete({ where: { id } });
  return { ok: true, datos: { slug: actual.slug } };
}

type DatosEvento = {
  titulo: string;
  slug: string;
  descripcion: string;
  fecha: Date;
  lugar: string | null;
  modalidad: TipoModalidad;
  cupoLimitado: boolean;
  linkInscripcion: string | null;
  estado: TipoEstado;
  aliadoId: string | null;
  ponenteIds: string[];
};

function camposEvento(datos: DatosEvento) {
  return {
    titulo: datos.titulo,
    slug: datos.slug,
    descripcion: datos.descripcion,
    fecha: datos.fecha,
    lugar: datos.lugar,
    modalidad: datos.modalidad,
    cupoLimitado: datos.cupoLimitado,
    linkInscripcion: datos.linkInscripcion,
    estado: datos.estado,
  };
}

function datosCrear(datos: DatosEvento): Prisma.EventoCreateInput {
  const ponentes = datos.ponenteIds.map((id) => ({ id }));
  return {
    ...camposEvento(datos),
    ...(datos.aliadoId ? { aliado: { connect: { id: datos.aliadoId } } } : {}),
    ...(ponentes.length > 0 ? { ponentes: { connect: ponentes } } : {}),
  };
}

function datosActualizar(datos: DatosEvento, teniaAliado: boolean): Prisma.EventoUpdateInput {
  const aliado = datos.aliadoId
    ? { connect: { id: datos.aliadoId } }
    : teniaAliado
      ? { disconnect: true }
      : undefined;
  return {
    ...camposEvento(datos),
    ...(aliado ? { aliado } : {}),
    ponentes: { set: datos.ponenteIds.map((id) => ({ id })) },
  };
}

async function prepararEvento(entrada: EntradaEvento, idActual?: string): Promise<Resultado<DatosEvento>> {
  const titulo = entrada.titulo.trim();
  if (!titulo) return { ok: false, error: "El título es obligatorio." };
  if (titulo.length > 300) return { ok: false, error: "El título es demasiado largo." };

  const slug = slugify(entrada.slug.trim() || titulo);
  if (!slugValido(slug)) return { ok: false, error: "El slug no es válido. Usa letras, números y guiones." };

  const descripcion = entrada.descripcion.trim();
  if (!descripcion) return { ok: false, error: "La descripción es obligatoria." };
  if (descripcion.length > 20_000) return { ok: false, error: "La descripción es demasiado larga." };

  const fecha = fechaMediodiaLima(entrada.fecha.trim());
  if (!fecha) return { ok: false, error: "La fecha no es válida." };

  const lugar = entrada.lugar.trim();
  if (lugar.length > 200) return { ok: false, error: "El lugar es demasiado largo." };

  if (!MODALIDADES.has(entrada.modalidad)) return { ok: false, error: "La modalidad no es válida." };

  const enlace = urlOpcional(entrada.linkInscripcion, "inscripción");
  if (!enlace.ok) return enlace;

  const estado = entrada.estado.trim() || "BORRADOR";
  if (!ESTADOS.has(estado)) return { ok: false, error: "El estado no es válido." };

  const aliadoId = entrada.aliadoId.trim();
  if (aliadoId) {
    const aliado = await prisma.partner.findUnique({ where: { id: aliadoId }, select: { id: true } });
    if (!aliado) return { ok: false, error: "El aliado elegido ya no existe." };
  }

  const ponenteIds = [...new Set(entrada.ponenteIds.map((id) => id.trim()).filter(Boolean))];
  if (ponenteIds.length > 0) {
    const encontrados = await prisma.invitado.findMany({
      where: { id: { in: ponenteIds } },
      select: { id: true },
    });
    if (encontrados.length !== ponenteIds.length) {
      return { ok: false, error: "Hay ponentes que ya no existen. Vuelve a cargar el formulario." };
    }
  }

  const donde = idActual ? { slug, NOT: { id: idActual } } : { slug };
  const tomado = await prisma.evento.findFirst({ where: donde, select: { id: true } });
  if (tomado) return { ok: false, error: "Ya existe un evento con ese slug." };

  return {
    ok: true,
    datos: {
      titulo,
      slug,
      descripcion,
      fecha,
      lugar: lugar || null,
      modalidad: entrada.modalidad as TipoModalidad,
      cupoLimitado: entrada.cupoLimitado,
      linkInscripcion: enlace.url,
      estado: estado as TipoEstado,
      aliadoId: aliadoId || null,
      ponenteIds,
    },
  };
}

function mensajeSlug(error: unknown): string | null {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") return null;
  return "Ya existe un evento con ese slug.";
}
