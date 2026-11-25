// Carga los datos reales de Talks Portuarios desde docs/datos-reales.json
// (ver docs/DATOS_REALES.md). Ejecutar con: npx prisma db seed
//
// Es idempotente: Talks por youtubeId, invitados por slug, eventos por slug y partners
// por nombre. Al final elimina invitados que no tengan ningún Talk ni evento.
//
// Resúmenes: se usa el campo `tema` como resumen PROVISIONAL (contenidoProvisional = true)
// hasta tenerlos desde las transcripciones. No se inventan puntos clave ni tags.
//
// OJO: cuando exista el panel /admin, re-ejecutar el seed sobrescribe los campos de
// estos registros con los del JSON.

import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type { Modalidad, NivelPartner, Serie } from "../src/generated/prisma/enums";

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
type PartnerJson = { nombre: string; nivel: NivelPartner; web: string | null; logoUrl: string | null };
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
  // Partners
  for (const [i, p] of datos.partners.entries()) {
    const campos = { nivel: p.nivel, web: p.web, logoUrl: p.logoUrl, orden: i + 1, activo: true };
    await prisma.partner.upsert({
      where: { nombre: p.nombre },
      update: campos,
      create: { nombre: p.nombre, ...campos },
    });
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

  const [nt, ne, np, ni] = await Promise.all([
    prisma.talk.count(),
    prisma.evento.count(),
    prisma.partner.count(),
    prisma.invitado.count(),
  ]);
  console.log(`Seed OK → ${nt} talks, ${ne} eventos, ${np} partners, ${ni} invitados`);
  console.log(`Limpieza → ${eventosBorrados.count} eventos antiguos, ${invitadosBorrados.count} invitados huérfanos eliminados`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
