// Carga los datos reales de Talks Portuarios desde docs/datos-reales.json
// (ver docs/DATOS_REALES.md). Ejecutar con: npx prisma db seed
//
// Es idempotente: Talks por youtubeId, invitados por slug, eventos por slug y partners
// por slug (o por nombre si no tienen slug). Al final elimina invitados que no tengan ningún Talk ni evento.
//
// Resúmenes: se usa el campo `tema` como resumen PROVISIONAL (contenidoProvisional = true)
// hasta tenerlos desde las transcripciones. No se inventan puntos clave ni tags.
//
// OJO: re-ejecutar el seed sobrescribe los campos de estos registros con los del JSON.
// El administrador del panel es distinto: solo se crea si el correo no existe y nunca
// se le pisa la contraseña. Hace falta ADMIN_EMAIL, ADMIN_NOMBRE y ADMIN_PASSWORD.

import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type { Estado, EstadoBeca, Modalidad, NivelPartner, Serie } from "../src/generated/prisma/enums";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// ─── Tipos del JSON ──────────────────────────────────────

type InvitadoJson = { nombre: string; cargo: string | null; empresa: string | null };
type TalkJson = {
  youtubeId: string;
  titulo: string;
  serie: Serie;
  edicion: number | null;
  fechaPublicacion: string; // AAAA-MM-DD
  duracionSeg: number;
  duracionMin: number;
  tema: string;
  invitados: InvitadoJson[];
};
type EventoJson = {
  titulo: string;
  fecha: string; // AAAA-MM-DD
  lugar: string | null;
  modalidad: Modalidad;
  cupoLimitado: boolean;
  linkInscripcion: string | null;
  aliado: string | null;
  invitados?: string[];
};
type CursoJson = { slug: string; titulo: string; ruta: string; resumen: string | null; gratuito: boolean };
type BecaJson = {
  titulo: string;
  descripcion: string;
  fecha: string | null;
  estado: EstadoBeca;
  cursoSlug: string | null;
};
type PartnerJson = {
  nombre: string;
  nivel: NivelPartner;
  web: string | null;
  logoUrl: string | null;
  slug?: string;
  frase?: string;
  descripcion?: string;
  beneficios?: string[];
  estado?: Estado;
  cursos?: CursoJson[];
  becas?: BecaJson[];
};
type DatosReales = { talks: TalkJson[]; eventos: EventoJson[]; partners: PartnerJson[] };

const datos: DatosReales = JSON.parse(
  // Prisma ejecuta el seed desde la raíz del proyecto.
  readFileSync(join(process.cwd(), "docs", "datos-reales.json"), "utf8"),
);

// ─── Utilidades ──────────────────────────────────────────

function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // quita tildes
    .toLowerCase()
    .replace(/&/g, " y ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Fecha sin hora → mediodía de Lima (evita que cambie de día por la zona horaria). */
function fechaLima(aaaammdd: string): Date {
  return new Date(`${aaaammdd}T12:00:00-05:00`);
}

// Invitados repetidos con nombres distintos (ver docs/DATOS_REALES.md).
const ALIAS: Record<string, string> = {
  "Daniel Lastra": "Daniel Lastra Granda",
  "Omar Córdova": "Omar Martín Córdova Cordoví",
};
const nombreCanonico = (nombre: string) => ALIAS[nombre] ?? nombre;

// Descripciones de eventos (solo datos publicados; sin inventar hora ni detalles).
const DESCRIPCION_EVENTO: Record<string, string> = {
  "2026-11-29":
    "Experiencia a bordo: visita a la Base Naval del Perú con la comunidad de Talks Portuarios. Cupo limitado; inscripción por WhatsApp.",
  "2026-12-16":
    "Primer encuentro presencial de Talks Portuarios, en alianza con COEX PUCP, con José Mamani como invitado. Tema: la agencia marítima. Cupo limitado; inscripción por WhatsApp.",
};

// ─── Ejecución ───────────────────────────────────────────

async function main() {
  const soloPartners = process.argv.includes("--solo-partners");

  // Partners y, si el JSON los trae, la ficha /aliados con cursos y becas.
  for (const [i, p] of datos.partners.entries()) {
    const campos = {
      nivel: p.nivel,
      web: p.web,
      logoUrl: p.logoUrl,
      orden: i + 1,
      activo: true,
      ...(p.slug !== undefined && { slug: p.slug }),
      ...(p.frase !== undefined && { frase: p.frase }),
      ...(p.descripcion !== undefined && { descripcion: p.descripcion }),
      ...(p.beneficios !== undefined && { beneficios: p.beneficios }),
      ...(p.estado !== undefined && { estado: p.estado }),
    };
    const previo = p.slug
      ? await prisma.partner.findUnique({ where: { slug: p.slug }, select: { id: true } })
      : await prisma.partner.findUnique({ where: { nombre: p.nombre }, select: { id: true } });
    const partner = previo
      ? await prisma.partner.update({ where: { id: previo.id }, data: { nombre: p.nombre, ...campos } })
      : await prisma.partner.create({ data: { nombre: p.nombre, ...campos } });

    if (!p.web || !p.cursos) continue;
    for (const [orden, curso] of p.cursos.entries()) {
      await prisma.cursoAliado.upsert({
        where: { partnerId_slug: { partnerId: partner.id, slug: curso.slug } },
        update: {
          titulo: curso.titulo,
          url: new URL(curso.ruta, p.web).toString(),
          resumen: curso.resumen,
          gratuito: curso.gratuito,
          orden,
          activo: true,
        },
        create: {
          partnerId: partner.id,
          slug: curso.slug,
          titulo: curso.titulo,
          url: new URL(curso.ruta, p.web).toString(),
          resumen: curso.resumen,
          gratuito: curso.gratuito,
          orden,
        },
      });
    }

    if (!p.becas) continue;
    await prisma.becaAliado.deleteMany({ where: { partnerId: partner.id } });
    for (const [orden, beca] of p.becas.entries()) {
      const curso = beca.cursoSlug
        ? await prisma.cursoAliado.findUnique({
            where: { partnerId_slug: { partnerId: partner.id, slug: beca.cursoSlug } },
            select: { id: true },
          })
        : null;
      await prisma.becaAliado.create({
        data: {
          partnerId: partner.id,
          cursoId: curso?.id,
          titulo: beca.titulo,
          descripcion: beca.descripcion,
          fecha: beca.fecha ? new Date(`${beca.fecha}T12:00:00-05:00`) : null,
          estado: beca.estado,
          orden,
        },
      });
    }
  }

  if (soloPartners) {
    console.log("Seed OK → solo partners y fichas de aliados");
    return;
  }

  // Invitados (deduplicados). El JSON viene del Talk más reciente al más antiguo,
  // así que el primer cargo/empresa que aparece es el más actual.
  const invitados = new Map<string, { slug: string; nombre: string; cargo: string | null; empresa: string | null }>();
  for (const t of datos.talks) {
    for (const inv of t.invitados) {
      const nombre = nombreCanonico(inv.nombre);
      if (!invitados.has(nombre)) {
        invitados.set(nombre, { slug: slugify(nombre), nombre, cargo: inv.cargo, empresa: inv.empresa });
      }
    }
  }
  for (const e of datos.eventos) {
    for (const n of e.invitados ?? []) {
      const nombre = nombreCanonico(n);
      if (!invitados.has(nombre)) invitados.set(nombre, { slug: slugify(nombre), nombre, cargo: null, empresa: null });
    }
  }
  for (const inv of invitados.values()) {
    await prisma.invitado.upsert({
      where: { slug: inv.slug },
      update: { nombre: inv.nombre, cargo: inv.cargo, empresa: inv.empresa },
      create: inv,
    });
  }
  const slugInvitado = (nombre: string) => invitados.get(nombreCanonico(nombre))!.slug;

  // Talks
  const slugsTalks = new Set<string>();
  for (const t of datos.talks) {
    const slug = slugify(t.titulo);
    if (slugsTalks.has(slug)) throw new Error(`Slug de Talk duplicado: ${slug}`);
    slugsTalks.add(slug);

    const relacion = t.invitados.map((i) => ({ slug: slugInvitado(i.nombre) }));
    const campos = {
      slug,
      titulo: t.titulo,
      serie: t.serie,
      edicion: t.edicion,
      duracionMin: t.duracionMin,
      fechaPublicacion: fechaLima(t.fechaPublicacion),
      resumen: t.tema,
      puntosClave: [],
      tags: [],
      estado: "PUBLICADO" as const,
      contenidoProvisional: true,
    };
    await prisma.talk.upsert({
      where: { youtubeId: t.youtubeId },
      update: { ...campos, invitados: { set: relacion } },
      create: { youtubeId: t.youtubeId, ...campos, invitados: { connect: relacion } },
    });
  }

  // Eventos
  for (const e of datos.eventos) {
    const aliadoId = e.aliado
      ? (await prisma.partner.findUniqueOrThrow({ where: { nombre: e.aliado } })).id
      : null;
    const lugar = e.lugar && !/por confirmar/i.test(e.lugar) ? e.lugar : null;
    const relacion = (e.invitados ?? []).map((n) => ({ slug: slugInvitado(n) }));
    const slug = slugify(e.titulo);
    const campos = {
      titulo: e.titulo,
      descripcion: DESCRIPCION_EVENTO[e.fecha] ?? e.titulo,
      fecha: fechaLima(e.fecha),
      lugar,
      modalidad: e.modalidad,
      cupoLimitado: e.cupoLimitado,
      linkInscripcion: e.linkInscripcion,
      estado: "PUBLICADO" as const,
      aliadoId,
    };
    await prisma.evento.upsert({
      where: { slug },
      update: { ...campos, ponentes: { set: relacion } },
      create: { slug, ...campos, ponentes: { connect: relacion } },
    });
  }

  // Limpieza: eventos de versiones anteriores del seed y invitados huérfanos.
  const slugsEventos = datos.eventos.map((e) => slugify(e.titulo));
  const eventosBorrados = await prisma.evento.deleteMany({ where: { slug: { notIn: slugsEventos } } });
  const invitadosBorrados = await prisma.invitado.deleteMany({
    where: { talks: { none: {} }, eventos: { none: {} } },
  });

  await crearAdminInicial();

  const [nt, ne, np, ni, na] = await Promise.all([
    prisma.talk.count(),
    prisma.evento.count(),
    prisma.partner.count(),
    prisma.invitado.count(),
    prisma.admin.count(),
  ]);
  console.log(`Seed OK → ${nt} talks, ${ne} eventos, ${np} partners, ${ni} invitados, ${na} admins`);
  console.log(`Limpieza → ${eventosBorrados.count} eventos antiguos, ${invitadosBorrados.count} invitados huérfanos eliminados`);
}

// Misma regla que src/services/admins.ts. El seed no importa ese archivo: tsx no
// resuelve el alias @/ y el cliente de la app arrastra el paquete server-only.
async function crearAdminInicial() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const nombre = process.env.ADMIN_NOMBRE?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !nombre || !password) {
    console.log("Admin: faltan ADMIN_EMAIL, ADMIN_NOMBRE o ADMIN_PASSWORD; no se crea.");
    return;
  }
  if (password.length < 8) {
    console.log("Admin: la contraseña debe tener al menos 8 caracteres; no se crea.");
    return;
  }
  const existente = await prisma.admin.findUnique({ where: { email }, select: { id: true } });
  if (existente) {
    console.log(`Admin: ${email} ya existe; no se cambia la contraseña.`);
    return;
  }
  const passwordHash = await hash(password, 12);
  await prisma.admin.create({ data: { email, nombre, passwordHash } });
  console.log(`Admin creado: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
