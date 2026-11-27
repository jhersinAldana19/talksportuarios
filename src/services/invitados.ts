import { Prisma } from "@/generated/prisma/client";
import { urlOpcional } from "@/lib/formulario";
import { prisma } from "@/lib/prisma";
import { slugify, slugValido } from "@/lib/slug";
import type { Resultado } from "@/services/talks";

// Sin caché: el panel incluye todo y el sitio público lee a los invitados dentro del Talk o del evento.

export type InvitadoAsignable = {
  id: string;
  nombre: string;
  cargo: string | null;
  empresa: string | null;
};

export type InvitadoAdmin = InvitadoAsignable & {
  slug: string;
  bio: string | null;
  fotoUrl: string | null;
  linkedinUrl: string | null;
  talks: number;
};

export type EntradaInvitado = {
  nombre: string;
  slug: string;
  cargo: string;
  empresa: string;
  bio: string;
  fotoUrl: string;
  linkedinUrl: string;
};

export type InvitadoGuardado = {
  id: string;
  slug: string;
  slugAnterior: string | null;
  talkSlugs: string[];
};

export async function listarInvitadosAsignables(): Promise<InvitadoAsignable[]> {
  return prisma.invitado.findMany({
    orderBy: { nombre: "asc" },
    select: { id: true, nombre: true, cargo: true, empresa: true },
  });
}

export async function listarInvitadosAdmin(): Promise<InvitadoAdmin[]> {
  const filas = await prisma.invitado.findMany({
    orderBy: { nombre: "asc" },
    select: {
      id: true,
      slug: true,
      nombre: true,
      cargo: true,
      empresa: true,
      bio: true,
      fotoUrl: true,
      linkedinUrl: true,
      _count: { select: { talks: true } },
    },
  });
  return filas.map((fila) => ({
    id: fila.id,
    slug: fila.slug,
    nombre: fila.nombre,
    cargo: fila.cargo,
    empresa: fila.empresa,
    bio: fila.bio,
    fotoUrl: fila.fotoUrl,
    linkedinUrl: fila.linkedinUrl,
    talks: fila._count.talks,
  }));
}

export async function obtenerInvitadoAdmin(id: string): Promise<InvitadoAdmin | null> {
  const fila = await prisma.invitado.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      nombre: true,
      cargo: true,
      empresa: true,
      bio: true,
      fotoUrl: true,
      linkedinUrl: true,
      _count: { select: { talks: true } },
    },
  });
  if (!fila) return null;
  return {
    id: fila.id,
    slug: fila.slug,
    nombre: fila.nombre,
    cargo: fila.cargo,
    empresa: fila.empresa,
    bio: fila.bio,
    fotoUrl: fila.fotoUrl,
    linkedinUrl: fila.linkedinUrl,
    talks: fila._count.talks,
  };
}

export async function contarInvitadosAdmin(): Promise<number> {
  return prisma.invitado.count();
}

export async function crearInvitado(entrada: EntradaInvitado): Promise<Resultado<InvitadoGuardado>> {
  const preparado = await prepararInvitado(entrada);
  if (!preparado.ok) return preparado;
  try {
    const invitado = await prisma.invitado.create({
      data: preparado.datos,
      select: { id: true, slug: true },
    });
    return { ok: true, datos: { ...invitado, slugAnterior: null, talkSlugs: [] } };
  } catch (error) {
    const mensaje = mensajeSlug(error);
    if (mensaje) return { ok: false, error: mensaje };
    throw error;
  }
}

export async function actualizarInvitado(
  id: string,
  entrada: EntradaInvitado,
): Promise<Resultado<InvitadoGuardado>> {
  const actual = await prisma.invitado.findUnique({
    where: { id },
    select: { slug: true, talks: { select: { slug: true } } },
  });
  if (!actual) return { ok: false, error: "No encontramos a ese invitado." };

  const preparado = await prepararInvitado(entrada, id);
  if (!preparado.ok) return preparado;

  try {
    const invitado = await prisma.invitado.update({
      where: { id },
      data: { ...preparado.datos, fotoPublicId: null },
      select: { id: true, slug: true },
    });
    return {
      ok: true,
      datos: {
        ...invitado,
        slugAnterior: actual.slug,
        talkSlugs: actual.talks.map((talk) => talk.slug),
      },
    };
  } catch (error) {
    const mensaje = mensajeSlug(error);
    if (mensaje) return { ok: false, error: mensaje };
    throw error;
  }
}

export async function eliminarInvitado(id: string): Promise<Resultado<InvitadoGuardado>> {
  const actual = await prisma.invitado.findUnique({
    where: { id },
    select: { id: true, slug: true, talks: { select: { slug: true } } },
  });
  if (!actual) return { ok: false, error: "No encontramos a ese invitado." };
  await prisma.invitado.delete({ where: { id } });
  return {
    ok: true,
    datos: {
      id: actual.id,
      slug: actual.slug,
      slugAnterior: null,
      talkSlugs: actual.talks.map((talk) => talk.slug),
    },
  };
}

async function prepararInvitado(
  entrada: EntradaInvitado,
  idActual?: string,
): Promise<Resultado<Prisma.InvitadoCreateInput>> {
  const nombre = entrada.nombre.trim();
  if (!nombre) return { ok: false, error: "El nombre es obligatorio." };
  if (nombre.length > 200) return { ok: false, error: "El nombre es demasiado largo." };

  const slug = slugify(entrada.slug.trim() || nombre);
  if (!slugValido(slug)) return { ok: false, error: "El slug no es válido. Usa letras, números y guiones." };

  const cargo = opcional(entrada.cargo, 200, "El cargo");
  if (!cargo.ok) return cargo;
  const empresa = opcional(entrada.empresa, 200, "La empresa");
  if (!empresa.ok) return empresa;

  const bio = entrada.bio.trim();
  if (bio.length > 10_000) return { ok: false, error: "La biografía es demasiado larga." };

  const foto = urlOpcional(entrada.fotoUrl, "la foto");
  if (!foto.ok) return foto;
  const linkedin = urlOpcional(entrada.linkedinUrl, "LinkedIn");
  if (!linkedin.ok) return linkedin;

  const donde = idActual ? { slug, NOT: { id: idActual } } : { slug };
  const tomado = await prisma.invitado.findFirst({ where: donde, select: { id: true } });
  if (tomado) return { ok: false, error: "Ya existe un invitado con ese slug." };

  return {
    ok: true,
    datos: {
      nombre,
      slug,
      cargo: cargo.valor,
      empresa: empresa.valor,
      bio: bio || null,
      fotoUrl: foto.url,
      linkedinUrl: linkedin.url,
    },
  };
}

function opcional(
  valor: string,
  maximo: number,
  campo: string,
): { ok: true; valor: string | null } | { ok: false; error: string } {
  const limpio = valor.trim();
  if (!limpio) return { ok: true, valor: null };
  if (limpio.length > maximo) return { ok: false, error: `${campo} es demasiado largo.` };
  return { ok: true, valor: limpio };
}

function mensajeSlug(error: unknown): string | null {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") return null;
  return "Ya existe un invitado con ese slug.";
}
