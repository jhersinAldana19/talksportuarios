import { cacheLife, cacheTag } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { Estado, Serie, type Estado as TipoEstado, type Serie as TipoSerie } from "@/generated/prisma/enums";
import { fechaMediodiaLima } from "@/lib/formato";
import { slugify, slugValido } from "@/lib/slug";
import { prisma } from "@/lib/prisma";

// Lógica de negocio de Talks. La usan las páginas públicas, el panel y, más adelante, el MCP.
// Lecturas públicas: 'use cache' + cacheTag('talks'). Al guardar desde el panel, la server
// action llama updateTag('talks') y updateTag('talk:<slug>').
// Las funciones de administración no llevan caché: incluyen borradores y deben verse al momento.

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

// ─── Panel (sin caché) ───────────────────────────────────

const incluirInvitadosAdmin = {
  invitados: {
    select: { id: true, slug: true, nombre: true, cargo: true, empresa: true },
    orderBy: { nombre: "asc" },
  },
} satisfies Prisma.TalkInclude;

export type TalkAdmin = Prisma.TalkGetPayload<{ include: typeof incluirInvitadosAdmin }>;

export type Resultado<T> = { ok: true; datos: T } | { ok: false; error: string };

export type EntradaTalk = {
  titulo: string;
  slug: string;
  serie: string;
  edicion: string;
  youtubeId: string;
  duracionMin: string;
  fechaPublicacion: string;
  resumen: string;
  puntosClave: string;
  transcripcion: string;
  tags: string;
  estado: string;
  patrocinado: boolean;
  contenidoProvisional: boolean;
  invitadoIds: string[];
};

type DatosTalk = {
  titulo: string;
  slug: string;
  serie: TipoSerie;
  edicion: number | null;
  youtubeId: string;
  duracionMin: number;
  fechaPublicacion: Date;
  resumen: string;
  puntosClave: string[];
  transcripcion: string | null;
  tags: string[];
  estado: TipoEstado;
  patrocinado: boolean;
  contenidoProvisional: boolean;
  invitadoIds: string[];
};

export type TalkGuardado = { id: string; slug: string; slugAnterior: string | null };

const SERIES = new Set<string>(Object.values(Serie));
const ESTADOS = new Set<string>(Object.values(Estado));

export async function listarTalksAdmin(): Promise<TalkAdmin[]> {
  return prisma.talk.findMany({
    orderBy: { fechaPublicacion: "desc" },
    include: incluirInvitadosAdmin,
  });
}

export async function obtenerTalkAdmin(id: string): Promise<TalkAdmin | null> {
  return prisma.talk.findUnique({ where: { id }, include: incluirInvitadosAdmin });
}

export async function contarTalksAdmin(): Promise<{ publicados: number; borradores: number }> {
  const [publicados, borradores] = await Promise.all([
    prisma.talk.count({ where: { estado: "PUBLICADO" } }),
    prisma.talk.count({ where: { estado: "BORRADOR" } }),
  ]);
  return { publicados, borradores };
}

export type MesTalksPublicados = {
  /** YYYY-MM (zona America/Lima). */
  clave: string;
  etiqueta: string;
  cantidad: number;
};

/**
 * Ritmo de publicación: Talks PUBLICADOS agrupados por mes (Lima).
 * Incluye meses en cero para ver huecos. Por defecto últimos 12 meses.
 */
export async function talksPublicadosPorMesAdmin(mesesAtras = 12): Promise<{
  serie: MesTalksPublicados[];
  borradores: number;
  provisionales: number;
}> {
  const n = Math.min(36, Math.max(3, Math.floor(mesesAtras)));
  const [fechas, borradores, provisionales] = await Promise.all([
    prisma.talk.findMany({
      where: { estado: "PUBLICADO" },
      select: { fechaPublicacion: true },
    }),
    prisma.talk.count({ where: { estado: "BORRADOR" } }),
    prisma.talk.count({ where: { estado: "PUBLICADO", contenidoProvisional: true } }),
  ]);

  const zona = "America/Lima";
  const ahora = new Date();
  const partesAhora = new Intl.DateTimeFormat("en-CA", {
    timeZone: zona,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(ahora);
  const anioAhora = Number(partesAhora.find((p) => p.type === "year")?.value);
  const mesAhora = Number(partesAhora.find((p) => p.type === "month")?.value);

  const claves: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const mesAbs = anioAhora * 12 + (mesAhora - 1) - i;
    const anio = Math.floor(mesAbs / 12);
    const mes = (mesAbs % 12) + 1;
    claves.push(`${anio}-${String(mes).padStart(2, "0")}`);
  }

  const conteo = new Map<string, number>(claves.map((c) => [c, 0]));
  const fmtClave = new Intl.DateTimeFormat("en-CA", {
    timeZone: zona,
    year: "numeric",
    month: "2-digit",
  });
  for (const fila of fechas) {
    const [anio, mes] = fmtClave.format(fila.fechaPublicacion).split("-");
    const clave = `${anio}-${mes}`;
    if (conteo.has(clave)) conteo.set(clave, (conteo.get(clave) ?? 0) + 1);
  }

  // Fijas (no Intl): Node y el navegador formatean "es-PE" distinto y rompen la hidratación.
  const MESES_CORTO = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"] as const;

  const serie = claves.map((clave) => {
    const [anio, mes] = clave.split("-").map(Number);
    const etiqueta = `${MESES_CORTO[mes - 1]} ${anio}`;
    return { clave, etiqueta, cantidad: conteo.get(clave) ?? 0 };
  });

  return { serie, borradores, provisionales };
}

export async function crearTalk(entrada: EntradaTalk): Promise<Resultado<TalkGuardado>> {
  const preparado = await prepararTalk(entrada);
  if (!preparado.ok) return preparado;

  try {
    const talk = await prisma.talk.create({
      data: datosPrisma(preparado.datos),
      select: { id: true, slug: true },
    });
    return { ok: true, datos: { ...talk, slugAnterior: null } };
  } catch (error) {
    const mensaje = mensajeUnico(error);
    if (mensaje) return { ok: false, error: mensaje };
    throw error;
  }
}

export async function actualizarTalk(id: string, entrada: EntradaTalk): Promise<Resultado<TalkGuardado>> {
  const actual = await prisma.talk.findUnique({ where: { id }, select: { slug: true } });
  if (!actual) return { ok: false, error: "No encontramos ese Talk." };

  const preparado = await prepararTalk(entrada, id);
  if (!preparado.ok) return preparado;

  try {
    const talk = await prisma.talk.update({
      where: { id },
      data: {
        ...datosPrisma(preparado.datos),
        invitados: { set: preparado.datos.invitadoIds.map((invitadoId) => ({ id: invitadoId })) },
      },
      select: { id: true, slug: true },
    });
    return { ok: true, datos: { ...talk, slugAnterior: actual.slug } };
  } catch (error) {
    const mensaje = mensajeUnico(error);
    if (mensaje) return { ok: false, error: mensaje };
    throw error;
  }
}

export async function cambiarEstadoTalk(
  id: string,
  estado: string,
): Promise<Resultado<{ slug: string }>> {
  if (!ESTADOS.has(estado)) return { ok: false, error: "El estado no es válido." };

  try {
    const talk = await prisma.talk.update({
      where: { id },
      data: { estado: estado as TipoEstado },
      select: { slug: true },
    });
    return { ok: true, datos: talk };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { ok: false, error: "No encontramos ese Talk." };
    }
    throw error;
  }
}

export async function eliminarTalk(id: string): Promise<Resultado<{ slug: string }>> {
  const actual = await prisma.talk.findUnique({ where: { id }, select: { slug: true } });
  if (!actual) return { ok: false, error: "No encontramos ese Talk." };
  await prisma.talk.delete({ where: { id } });
  return { ok: true, datos: { slug: actual.slug } };
}

function datosPrisma(datos: DatosTalk): Prisma.TalkCreateInput {
  const relacion = datos.invitadoIds.map((id) => ({ id }));
  return {
    titulo: datos.titulo,
    slug: datos.slug,
    serie: datos.serie,
    edicion: datos.edicion,
    youtubeId: datos.youtubeId,
    duracionMin: datos.duracionMin,
    fechaPublicacion: datos.fechaPublicacion,
    resumen: datos.resumen,
    puntosClave: datos.puntosClave,
    transcripcion: datos.transcripcion,
    tags: datos.tags,
    estado: datos.estado,
    patrocinado: datos.patrocinado,
    contenidoProvisional: datos.contenidoProvisional,
    invitados: { connect: relacion },
  };
}

async function prepararTalk(entrada: EntradaTalk, idActual?: string): Promise<Resultado<DatosTalk>> {
  const titulo = entrada.titulo.trim();
  if (!titulo) return { ok: false, error: "El título es obligatorio." };
  if (titulo.length > 300) return { ok: false, error: "El título es demasiado largo." };

  const slug = slugify(entrada.slug.trim() || titulo);
  if (!slugValido(slug)) {
    return { ok: false, error: "El slug no es válido. Usa letras, números y guiones." };
  }

  if (!SERIES.has(entrada.serie)) return { ok: false, error: "La serie no es válida." };

  let edicion: number | null = null;
  const edicionTexto = entrada.edicion.trim();
  if (edicionTexto) {
    if (!/^\d+$/.test(edicionTexto)) return { ok: false, error: "La edición debe ser un número." };
    edicion = Number(edicionTexto);
    if (edicion < 1 || edicion > 999) return { ok: false, error: "La edición debe estar entre 1 y 999." };
  }

  const youtubeId = normalizarYoutubeId(entrada.youtubeId);
  if (!/^[A-Za-z0-9_-]{11}$/.test(youtubeId)) {
    return { ok: false, error: "El video de YouTube no es válido. Pega el id o la URL." };
  }

  const duracionTexto = entrada.duracionMin.trim();
  if (!/^\d+$/.test(duracionTexto)) return { ok: false, error: "La duración debe ser un número de minutos." };
  const duracionMin = Number(duracionTexto);
  if (duracionMin < 1 || duracionMin > 600) {
    return { ok: false, error: "La duración debe estar entre 1 y 600 minutos." };
  }

  const fechaPublicacion = fechaMediodiaLima(entrada.fechaPublicacion.trim());
  if (!fechaPublicacion) return { ok: false, error: "La fecha no es válida." };

  const resumen = entrada.resumen.trim();
  if (!resumen) return { ok: false, error: "El resumen es obligatorio." };
  if (resumen.length > 20_000) return { ok: false, error: "El resumen es demasiado largo." };

  const puntosClave = partirLineas(entrada.puntosClave);
  if (puntosClave.length > 40) return { ok: false, error: "Hay demasiados puntos clave (máximo 40)." };
  if (puntosClave.some((p) => p.length > 500)) {
    return { ok: false, error: "Un punto clave es demasiado largo." };
  }

  const transcripcion = entrada.transcripcion.trim();
  if (transcripcion.length > 500_000) return { ok: false, error: "La transcripción es demasiado larga." };

  const tags = partirComas(entrada.tags);
  if (tags.length > 30) return { ok: false, error: "Hay demasiadas etiquetas (máximo 30)." };
  if (tags.some((t) => t.length > 50)) return { ok: false, error: "Una etiqueta es demasiado larga." };

  const estado = entrada.estado.trim() || "BORRADOR";
  if (!ESTADOS.has(estado)) return { ok: false, error: "El estado no es válido." };

  const invitadoIds = [...new Set(entrada.invitadoIds.map((id) => id.trim()).filter(Boolean))];
  if (invitadoIds.length > 0) {
    const encontrados = await prisma.invitado.findMany({
      where: { id: { in: invitadoIds } },
      select: { id: true },
    });
    if (encontrados.length !== invitadoIds.length) {
      return { ok: false, error: "Hay invitados que ya no existen. Vuelve a cargar el formulario." };
    }
  }

  const dondeSlug = idActual ? { slug, NOT: { id: idActual } } : { slug };
  const dondeVideo = idActual ? { youtubeId, NOT: { id: idActual } } : { youtubeId };
  const [slugTomado, videoTomado] = await Promise.all([
    prisma.talk.findFirst({ where: dondeSlug, select: { id: true } }),
    prisma.talk.findFirst({ where: dondeVideo, select: { id: true } }),
  ]);
  if (slugTomado) return { ok: false, error: "Ya existe un Talk con ese slug." };
  if (videoTomado) return { ok: false, error: "Ya existe un Talk con ese video de YouTube." };

  return {
    ok: true,
    datos: {
      titulo,
      slug,
      serie: entrada.serie as TipoSerie,
      edicion,
      youtubeId,
      duracionMin,
      fechaPublicacion,
      resumen,
      puntosClave,
      transcripcion: transcripcion || null,
      tags,
      estado: estado as TipoEstado,
      patrocinado: entrada.patrocinado,
      contenidoProvisional: entrada.contenidoProvisional,
      invitadoIds,
    },
  };
}

function normalizarYoutubeId(valor: string): string {
  const texto = valor.trim();
  try {
    const url = new URL(texto);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0];
      if (id) return id;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      const v = url.searchParams.get("v");
      if (v) return v;
      const partes = url.pathname.split("/").filter(Boolean);
      const marca = partes.findIndex((p) => p === "embed" || p === "shorts" || p === "live");
      const id = marca >= 0 ? partes[marca + 1] : undefined;
      if (id) return id;
    }
  } catch {
    // No es una URL: se valida el texto tal cual.
  }
  return texto;
}

function partirLineas(valor: string): string[] {
  return valor.split("\n").map((linea) => linea.trim()).filter(Boolean);
}

function partirComas(valor: string): string[] {
  return valor.split(",").map((tag) => tag.trim()).filter(Boolean);
}

function mensajeUnico(error: unknown): string | null {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") return null;
  const meta = error.meta?.target;
  const texto = Array.isArray(meta) ? meta.join(" ") : String(meta ?? "");
  if (texto.includes("slug")) return "Ya existe un Talk con ese slug.";
  if (texto.toLowerCase().includes("youtube")) return "Ya existe un Talk con ese video de YouTube.";
  return "Hay un dato repetido que ya usa otro Talk.";
}
