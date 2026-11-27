import { cacheLife, cacheTag } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { Estado, NivelPartner, type NivelPartner as TipoNivel } from "@/generated/prisma/enums";
import { urlOpcional } from "@/lib/formulario";
import { slugify, slugValido } from "@/lib/slug";
import { prisma } from "@/lib/prisma";
import type { Resultado } from "@/services/talks";

// Caché: cacheTag('partners'). Al guardar desde el panel, la action llama updateTag('partners').
// Las funciones de administración no llevan caché.

/** Partners activos ordenados por nivel (fundador primero) y luego por `orden`. */
export async function listarPartnersActivos() {
  "use cache";
  cacheLife("hours");
  cacheTag("partners");

  return prisma.partner.findMany({
    where: { activo: true },
    orderBy: [{ nivel: "asc" }, { orden: "asc" }],
    select: { id: true, nombre: true, logoUrl: true, web: true, nivel: true, slug: true, estado: true },
  });
}

const seleccionAdmin = {
  id: true,
  nombre: true,
  slug: true,
  logoUrl: true,
  web: true,
  frase: true,
  descripcion: true,
  beneficios: true,
  relacionComercial: true,
  estado: true,
  nivel: true,
  orden: true,
  activo: true,
} as const;

export type PartnerAdmin = Prisma.PartnerGetPayload<{ select: typeof seleccionAdmin }>;

export type EntradaPartner = {
  nombre: string;
  slug: string;
  web: string;
  logoUrl: string;
  frase: string;
  descripcion: string;
  beneficios: string;
  relacionComercial: boolean;
  estado: string;
  nivel: string;
  orden: string;
  activo: boolean;
};

export type PartnerAsignable = { id: string; nombre: string; nivel: TipoNivel };

const NIVELES = new Set<string>(Object.values(NivelPartner));

export async function listarPartnersAdmin(): Promise<PartnerAdmin[]> {
  return prisma.partner.findMany({
    orderBy: [{ nivel: "asc" }, { orden: "asc" }, { nombre: "asc" }],
    select: seleccionAdmin,
  });
}

export async function obtenerPartnerAdmin(id: string): Promise<PartnerAdmin | null> {
  return prisma.partner.findUnique({
    where: { id },
    select: seleccionAdmin,
  });
}

export async function listarPartnersAsignables(): Promise<PartnerAsignable[]> {
  return prisma.partner.findMany({
    orderBy: [{ nivel: "asc" }, { nombre: "asc" }],
    select: { id: true, nombre: true, nivel: true },
  });
}

export async function contarPartnersAdmin(): Promise<{ activos: number; ocultos: number }> {
  const [activos, ocultos] = await Promise.all([
    prisma.partner.count({ where: { activo: true } }),
    prisma.partner.count({ where: { activo: false } }),
  ]);
  return { activos, ocultos };
}

export async function crearPartner(entrada: EntradaPartner): Promise<Resultado<{ id: string; slug: string | null; slugAnterior: string | null }>> {
  const preparado = await prepararPartner(entrada);
  if (!preparado.ok) return preparado;
  try {
    const partner = await prisma.partner.create({ data: preparado.datos, select: { id: true, slug: true } });
    return { ok: true, datos: { id: partner.id, slug: partner.slug, slugAnterior: null } };
  } catch (error) {
    const mensaje = mensajeNombre(error);
    if (mensaje) return { ok: false, error: mensaje };
    throw error;
  }
}

export async function actualizarPartner(
  id: string,
  entrada: EntradaPartner,
): Promise<Resultado<{ id: string; slug: string | null; slugAnterior: string | null }>> {
  const actual = await prisma.partner.findUnique({ where: { id }, select: { id: true, slug: true } });
  if (!actual) return { ok: false, error: "No encontramos ese partner." };
  const preparado = await prepararPartner(entrada, id);
  if (!preparado.ok) return preparado;
  try {
    const partner = await prisma.partner.update({
      where: { id },
      data: { ...preparado.datos, logoPublicId: null },
      select: { id: true, slug: true },
    });
    return { ok: true, datos: { id: partner.id, slug: partner.slug, slugAnterior: actual.slug } };
  } catch (error) {
    const mensaje = mensajeNombre(error);
    if (mensaje) return { ok: false, error: mensaje };
    throw error;
  }
}

export async function cambiarActivoPartner(id: string, activo: boolean): Promise<Resultado<{ id: string }>> {
  try {
    const partner = await prisma.partner.update({
      where: { id },
      data: { activo },
      select: { id: true },
    });
    return { ok: true, datos: partner };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { ok: false, error: "No encontramos ese partner." };
    }
    throw error;
  }
}

export async function eliminarPartner(id: string): Promise<Resultado<{ id: string }>> {
  const actual = await prisma.partner.findUnique({ where: { id }, select: { id: true } });
  if (!actual) return { ok: false, error: "No encontramos ese partner." };
  await prisma.partner.delete({ where: { id } });
  return { ok: true, datos: { id } };
}

async function prepararPartner(
  entrada: EntradaPartner,
  idActual?: string,
): Promise<Resultado<Prisma.PartnerCreateInput>> {
  const nombre = entrada.nombre.trim();
  if (!nombre) return { ok: false, error: "El nombre es obligatorio." };
  if (nombre.length > 200) return { ok: false, error: "El nombre es demasiado largo." };

  if (!NIVELES.has(entrada.nivel)) return { ok: false, error: "El nivel no es válido." };

  const ordenTexto = entrada.orden.trim() || "0";
  if (!/^-?\d+$/.test(ordenTexto)) return { ok: false, error: "El orden debe ser un número." };
  const orden = Number(ordenTexto);
  if (orden < -999 || orden > 999) return { ok: false, error: "El orden debe estar entre -999 y 999." };

  const web = urlOpcional(entrada.web, "la web");
  if (!web.ok) return web;
  const logo = urlOpcional(entrada.logoUrl, "el logo");
  if (!logo.ok) return logo;

  const frase = entrada.frase.trim();
  if (frase.length > 240) return { ok: false, error: "La frase es demasiado larga." };
  const descripcion = entrada.descripcion.trim();
  if (descripcion.length > 2000) return { ok: false, error: "La descripción es demasiado larga." };

  const beneficios = entrada.beneficios
    .split(/\r?\n/)
    .map((linea) => linea.trim())
    .filter(Boolean);
  if (beneficios.length > 12) return { ok: false, error: "Doce beneficios como máximo." };
  if (beneficios.some((linea) => linea.length > 240)) {
    return { ok: false, error: "Un beneficio es demasiado largo." };
  }

  const estados = new Set<string>(Object.values(Estado));
  if (!estados.has(entrada.estado)) return { ok: false, error: "El estado de la ficha no es válido." };

  const slug = slugify(entrada.slug.trim());
  if (slug && !slugValido(slug)) return { ok: false, error: "El slug solo puede tener letras, números y guiones." };
  if (entrada.estado === "PUBLICADO" && entrada.nivel === "ALIADO" && !slug) {
    return { ok: false, error: "Para publicar la ficha de un aliado hace falta un slug." };
  }

  const donde = idActual ? { nombre, NOT: { id: idActual } } : { nombre };
  const tomado = await prisma.partner.findFirst({ where: donde, select: { id: true } });
  if (tomado) return { ok: false, error: "Ya existe un partner con ese nombre." };
  if (slug) {
    const slugTomado = await prisma.partner.findFirst({
      where: idActual ? { slug, NOT: { id: idActual } } : { slug },
      select: { id: true },
    });
    if (slugTomado) return { ok: false, error: "Ya existe un partner con ese slug." };
  }

  return {
    ok: true,
    datos: {
      nombre,
      slug: slug || null,
      web: web.url,
      logoUrl: logo.url,
      frase: frase || null,
      descripcion: descripcion || null,
      beneficios,
      relacionComercial: entrada.relacionComercial,
      estado: entrada.estado as (typeof Estado)[keyof typeof Estado],
      nivel: entrada.nivel as TipoNivel,
      orden,
      activo: entrada.activo,
    },
  };
}

function mensajeNombre(error: unknown): string | null {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") return null;
  return "Ya existe un partner con ese nombre o ese slug.";
}
