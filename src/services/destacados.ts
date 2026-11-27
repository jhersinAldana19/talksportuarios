import { cacheLife, cacheTag } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { TipoDestacado, type TipoDestacado as Tipo } from "@/generated/prisma/enums";
import { ETIQUETA_TIPO_DESTACADO, fechaISOLima, fechaMediodiaLima, miniaturaYoutube } from "@/lib/formato";

export { ETIQUETA_TIPO_DESTACADO };
import { urlOpcional } from "@/lib/formulario";
import { imagenUsableParaCarrusel } from "@/lib/imagenes";
import { MARCA_OFICIAL } from "@/lib/marca";
import { prisma } from "@/lib/prisma";
import { obtenerMarca } from "@/services/configuracion";

const MAX_PUBLICOS = 4;

const incluirAdmin = {
  talk: { select: { id: true, slug: true, titulo: true, youtubeId: true, patrocinado: true } },
  evento: {
    select: {
      id: true,
      slug: true,
      titulo: true,
      linkInscripcion: true,
      aliado: { select: { logoUrl: true, nombre: true, relacionComercial: true } },
    },
  },
  partner: {
    select: {
      id: true,
      slug: true,
      nombre: true,
      logoUrl: true,
      frase: true,
      relacionComercial: true,
    },
  },
} satisfies Prisma.DestacadoInclude;

export type DestacadoAdmin = Prisma.DestacadoGetPayload<{ include: typeof incluirAdmin }>;

export type DestacadoSlide = {
  id: string;
  titulo: string;
  imagen: string;
  imagenExterna: boolean;
  href: string;
  cta: string;
  patrocinado: boolean;
  externo: boolean;
};

export type EntradaDestacado = {
  tipo: string;
  talkId: string;
  eventoId: string;
  partnerId: string;
  hrefLibre: string;
  tituloCustom: string;
  ctaCustom: string;
  imagenUrl: string;
  fechaDesde: string;
  fechaHasta: string;
  patrocinado: boolean;
  activo: boolean;
};

export type ErroresDestacado = Partial<
  Record<
    | "tipo"
    | "talkId"
    | "eventoId"
    | "partnerId"
    | "hrefLibre"
    | "tituloCustom"
    | "ctaCustom"
    | "imagenUrl"
    | "fechaDesde"
    | "fechaHasta",
    string
  >
>;

type Resultado<T> = { ok: true; datos: T } | { ok: false; error: string; errores?: ErroresDestacado };

/** Solo tras `await connection()` o dentro de una función con `'use cache'`. */
export function hoyLimaISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima" }).format(new Date());
}

export function vigenteEn(fechaDesde: Date | null, fechaHasta: Date | null, hoyISO: string): boolean {
  if (fechaDesde && fechaISOLima(fechaDesde) > hoyISO) return false;
  if (fechaHasta && fechaISOLima(fechaHasta) < hoyISO) return false;
  return true;
}

export function vencidoEn(fechaHasta: Date | null, hoyISO: string): boolean {
  return Boolean(fechaHasta && fechaISOLima(fechaHasta) < hoyISO);
}

function logoLocalPartner(nombre: string | undefined): string | null {
  if (nombre === "TECPORT") return "/partners/tecport.webp";
  if (nombre === "COEX PUCP") return "/partners/coex-pucp.webp";
  if (nombre === "Sarmiento Academia") return "/partners/sarmiento.webp";
  return null;
}

function esUrlExterna(src: string): boolean {
  return src.startsWith("http://") || src.startsWith("https://");
}

function ctaPorDefecto(tipo: Tipo): string {
  if (tipo === "TALK") return "Ver Talk";
  if (tipo === "EVENTO") return "Inscribirme";
  if (tipo === "ALIADO") return "Ver cursos";
  return "Ver más";
}

function resolverImagenRuta(url: string | null | undefined): { imagen: string; imagenExterna: boolean } | null {
  if (!url?.trim()) return null;
  return imagenUsableParaCarrusel(url);
}

function aSlide(fila: DestacadoAdmin, heroUrl = MARCA_OFICIAL.heroUrl): DestacadoSlide | null {
  const customImg = resolverImagenRuta(fila.imagenUrl);
  const tituloBase =
    fila.tituloCustom?.trim() ||
    fila.talk?.titulo ||
    fila.evento?.titulo ||
    fila.partner?.frase?.trim() ||
    fila.partner?.nombre ||
    "";
  const cta = fila.ctaCustom?.trim() || ctaPorDefecto(fila.tipo);

  const hero = {
    imagen: heroUrl,
    imagenExterna: heroUrl.startsWith("http"),
  };

  if (fila.tipo === "TALK") {
    if (!fila.talk) return null;
    const img =
      customImg ??
      imagenUsableParaCarrusel(miniaturaYoutube(fila.talk.youtubeId)) ??
      hero;
    return {
      id: fila.id,
      titulo: tituloBase || fila.talk.titulo,
      ...img,
      href: `/talks/${fila.talk.slug}`,
      cta,
      patrocinado: fila.patrocinado || fila.talk.patrocinado,
      externo: false,
    };
  }

  if (fila.tipo === "EVENTO") {
    if (!fila.evento) return null;
    const logoAliado = fila.evento.aliado?.logoUrl;
    const img =
      customImg ??
      (logoAliado ? imagenUsableParaCarrusel(logoAliado) : null) ??
      (logoLocalPartner(fila.evento.aliado?.nombre)
        ? imagenUsableParaCarrusel(logoLocalPartner(fila.evento.aliado?.nombre)!)
        : null) ??
      hero;
    const externo = Boolean(fila.evento.linkInscripcion);
    return {
      id: fila.id,
      titulo: tituloBase || fila.evento.titulo,
      ...img,
      href: fila.evento.linkInscripcion || `/eventos/${fila.evento.slug}`,
      cta,
      patrocinado: fila.patrocinado || Boolean(fila.evento.aliado?.relacionComercial),
      externo,
    };
  }

  if (fila.tipo === "ALIADO") {
    if (!fila.partner?.slug) return null;
    const img =
      customImg ??
      (fila.partner.logoUrl ? imagenUsableParaCarrusel(fila.partner.logoUrl) : null) ??
      (logoLocalPartner(fila.partner.nombre)
        ? imagenUsableParaCarrusel(logoLocalPartner(fila.partner.nombre)!)
        : null) ??
      imagenUsableParaCarrusel("/partners/sarmiento.webp") ??
      hero;
    return {
      id: fila.id,
      titulo: tituloBase || fila.partner.frase?.trim() || fila.partner.nombre,
      ...img,
      href: `/aliados/${fila.partner.slug}`,
      cta: fila.ctaCustom?.trim() || "Ver aliado",
      patrocinado: fila.patrocinado || fila.partner.relacionComercial,
      externo: false,
    };
  }

  if (fila.tipo === "ENLACE") {
    if (!fila.hrefLibre) return null;
    const img = customImg ?? hero;
    const externo = esUrlExterna(fila.hrefLibre);
    return {
      id: fila.id,
      titulo: tituloBase || "Destacado",
      ...img,
      href: fila.hrefLibre,
      cta,
      patrocinado: fila.patrocinado,
      externo,
    };
  }

  return null;
}

async function slidesAutomaticos(hoy: string): Promise<DestacadoSlide[]> {
  const desde = new Date(`${hoy}T00:00:00-05:00`);

  const [talk, evento, sarmiento] = await Promise.all([
    prisma.talk.findFirst({
      where: { estado: "PUBLICADO" },
      orderBy: { fechaPublicacion: "desc" },
      select: { id: true, slug: true, titulo: true, youtubeId: true, patrocinado: true },
    }),
    prisma.evento.findFirst({
      where: { estado: "PUBLICADO", fecha: { gte: desde } },
      orderBy: { fecha: "asc" },
      select: {
        id: true,
        slug: true,
        titulo: true,
        linkInscripcion: true,
        aliado: { select: { logoUrl: true, nombre: true, relacionComercial: true } },
      },
    }),
    prisma.partner.findFirst({
      where: { activo: true, estado: "PUBLICADO", nivel: "ALIADO", slug: "sarmiento-academia" },
      select: { id: true, nombre: true, logoUrl: true, frase: true, relacionComercial: true },
    }),
  ]);

  const slides: DestacadoSlide[] = [];
  const marca = await obtenerMarca();
  const hero = {
    imagen: marca.heroUrl || MARCA_OFICIAL.heroUrl,
    imagenExterna: Boolean(marca.heroUrl?.startsWith("http")),
  };

  if (talk) {
    const img = imagenUsableParaCarrusel(miniaturaYoutube(talk.youtubeId)) ?? hero;
    slides.push({
      id: `auto-talk-${talk.id}`,
      titulo: talk.titulo,
      ...img,
      href: `/talks/${talk.slug}`,
      cta: "Ver Talk",
      patrocinado: talk.patrocinado,
      externo: false,
    });
  }

  if (evento) {
    const logoAliado = evento.aliado?.logoUrl;
    const img =
      (logoAliado ? imagenUsableParaCarrusel(logoAliado) : null) ??
      (logoLocalPartner(evento.aliado?.nombre)
        ? imagenUsableParaCarrusel(logoLocalPartner(evento.aliado?.nombre)!)
        : null) ??
      hero;
    slides.push({
      id: `auto-evento-${evento.id}`,
      titulo: evento.titulo,
      ...img,
      href: evento.linkInscripcion || `/eventos/${evento.slug}`,
      cta: "Inscribirme",
      patrocinado: Boolean(evento.aliado?.relacionComercial),
      externo: Boolean(evento.linkInscripcion),
    });
  }

  const imgFormacion =
    (sarmiento?.logoUrl ? imagenUsableParaCarrusel(sarmiento.logoUrl) : null) ??
    imagenUsableParaCarrusel("/partners/sarmiento.webp") ??
    hero;
  slides.push({
    id: sarmiento ? `auto-formacion-${sarmiento.id}` : "auto-formacion-sarmiento",
    titulo: sarmiento?.frase?.trim() || "Formación con Sarmiento Academia",
    ...imgFormacion,
    href: "/formacion",
    cta: "Ver cursos",
    patrocinado: Boolean(sarmiento?.relacionComercial),
    externo: false,
  });

  return slides;
}

/** Carrusel público: hasta 4 destacados activos y vigentes; si no hay, fallback automático. */
export async function listarDestacadosInicio(): Promise<DestacadoSlide[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("destacados");
  cacheTag("talks");
  cacheTag("eventos");
  cacheTag("partners");
  cacheTag("configuracion");

  // new Date() debe quedar dentro de esta función con 'use cache' (Next 16).
  const hoy = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima" }).format(new Date());
  const [filas, marca] = await Promise.all([
    prisma.destacado.findMany({
      where: { activo: true },
      orderBy: [{ orden: "asc" }, { createdAt: "asc" }],
      include: incluirAdmin,
    }),
    obtenerMarca(),
  ]);
  const heroUrl = marca.heroUrl || MARCA_OFICIAL.heroUrl;

  const slides = filas
    .filter((fila) => vigenteEn(fila.fechaDesde, fila.fechaHasta, hoy))
    .map((fila) => aSlide(fila, heroUrl))
    .filter((s): s is DestacadoSlide => Boolean(s))
    .slice(0, MAX_PUBLICOS);

  if (slides.length > 0) return slides;
  return slidesAutomaticos(hoy);
}

export async function listarDestacadosAdmin(): Promise<DestacadoAdmin[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("destacados");

  return prisma.destacado.findMany({
    orderBy: [{ orden: "asc" }, { createdAt: "asc" }],
    include: incluirAdmin,
  });
}

/** Filas listas para la tabla del panel (incluye estado Activo/Inactivo/Vencido). */
export async function listarFilasDestacadosAdmin(): Promise<
  {
    id: string;
    titulo: string;
    tipoEtiqueta: string;
    miniatura: string;
    vigencia: string;
    estado: string;
    estadoAlerta: boolean;
    activo: boolean;
  }[]
> {
  "use cache";
  cacheLife("hours");
  cacheTag("destacados");

  const hoy = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima" }).format(new Date());
  const destacados = await prisma.destacado.findMany({
    orderBy: [{ orden: "asc" }, { createdAt: "asc" }],
    include: incluirAdmin,
  });

  return destacados.map((fila) => {
    const vencido = vencidoEn(fila.fechaHasta, hoy);
    let vigencia = "Siempre";
    if (fila.fechaDesde || fila.fechaHasta) {
      const desde = fila.fechaDesde ? fechaISOLima(fila.fechaDesde) : "…";
      const hasta = fila.fechaHasta ? fechaISOLima(fila.fechaHasta) : "…";
      vigencia = `${desde} → ${hasta}`;
    }
    return {
      id: fila.id,
      titulo: tituloMostrado(fila),
      tipoEtiqueta: ETIQUETA_TIPO_DESTACADO[fila.tipo],
      miniatura: miniaturaAdmin(fila),
      vigencia,
      estado: !fila.activo ? "Inactivo" : vencido ? "Vencido" : "Activo",
      estadoAlerta: !fila.activo || vencido,
      activo: fila.activo,
    };
  });
}

export async function obtenerDestacadoAdmin(id: string): Promise<DestacadoAdmin | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("destacados");
  cacheTag(`destacado:${id}`);

  return prisma.destacado.findUnique({ where: { id }, include: incluirAdmin });
}

/** Opciones del formulario admin. Cacheadas: al guardar Talk/Evento/Partner se invalidan esas tags. */
export async function opcionesDestacadoFormulario() {
  "use cache";
  cacheLife("hours");
  cacheTag("talks");
  cacheTag("eventos");
  cacheTag("partners");

  const hoy = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima" }).format(new Date());
  const desde = new Date(`${hoy}T00:00:00-05:00`);
  const [talks, eventos, aliados] = await Promise.all([
    prisma.talk.findMany({
      where: { estado: "PUBLICADO" },
      orderBy: { fechaPublicacion: "desc" },
      select: { id: true, titulo: true, youtubeId: true },
    }),
    prisma.evento.findMany({
      where: { estado: "PUBLICADO", fecha: { gte: desde } },
      orderBy: { fecha: "asc" },
      select: { id: true, titulo: true, fecha: true },
    }),
    prisma.partner.findMany({
      where: { activo: true, estado: "PUBLICADO", nivel: "ALIADO", slug: { not: null } },
      orderBy: [{ orden: "asc" }, { nombre: "asc" }],
      select: { id: true, nombre: true, slug: true, logoUrl: true },
    }),
  ]);
  return {
    talks,
    eventos: eventos.map((e) => ({ id: e.id, titulo: e.titulo, fechaISO: fechaISOLima(e.fecha) })),
    aliados,
  };
}

function imagenPermitida(valor: string): { ok: true; url: string | null } | { ok: false; error: string } {
  const limpio = valor.trim();
  if (!limpio) return { ok: true, url: null };
  if (limpio.startsWith("/") && !limpio.startsWith("//")) {
    if (limpio.length > 500) return { ok: false, error: "La ruta de la imagen es demasiado larga." };
    return { ok: true, url: limpio };
  }
  const remoto = urlOpcional(limpio, "imagen");
  if (!remoto.ok) return remoto;
  if (!remoto.url) return { ok: true, url: null };
  const usable = imagenUsableParaCarrusel(remoto.url);
  if (!usable) {
    return { ok: false, error: "La URL de la imagen no es válida." };
  }
  return { ok: true, url: usable.imagen };
}

function validarEntrada(entrada: EntradaDestacado): Resultado<{
  tipo: Tipo;
  talkId: string | null;
  eventoId: string | null;
  partnerId: string | null;
  hrefLibre: string | null;
  tituloCustom: string | null;
  ctaCustom: string | null;
  imagenUrl: string | null;
  fechaDesde: Date | null;
  fechaHasta: Date | null;
  patrocinado: boolean;
  activo: boolean;
}> {
  const errores: ErroresDestacado = {};
  const tipos = new Set<string>(Object.values(TipoDestacado));
  if (!tipos.has(entrada.tipo)) errores.tipo = "Elige un tipo de destacado.";

  const tipo = entrada.tipo as Tipo;
  let talkId: string | null = null;
  let eventoId: string | null = null;
  let partnerId: string | null = null;
  let hrefLibre: string | null = null;

  if (tipo === "TALK") {
    talkId = entrada.talkId.trim() || null;
    if (!talkId) errores.talkId = "Elige un Talk publicado.";
  } else if (tipo === "EVENTO") {
    eventoId = entrada.eventoId.trim() || null;
    if (!eventoId) errores.eventoId = "Elige un evento futuro.";
  } else if (tipo === "ALIADO") {
    partnerId = entrada.partnerId.trim() || null;
    if (!partnerId) errores.partnerId = "Elige un aliado activo.";
  } else if (tipo === "ENLACE") {
    const limpio = entrada.hrefLibre.trim();
    if (!limpio) {
      errores.hrefLibre = "La URL del enlace es obligatoria.";
    } else if (limpio.startsWith("/") && !limpio.startsWith("//")) {
      if (limpio.length > 500) errores.hrefLibre = "El enlace es demasiado largo.";
      else hrefLibre = limpio;
    } else {
      const url = urlOpcional(limpio, "enlace");
      if (!url.ok) errores.hrefLibre = url.error;
      else if (!url.url) errores.hrefLibre = "La URL del enlace es obligatoria.";
      else hrefLibre = url.url;
    }
  }

  const tituloCustom = entrada.tituloCustom.trim() || null;
  if (tituloCustom && tituloCustom.length > 200) errores.tituloCustom = "El titular es demasiado largo.";

  const ctaCustom = entrada.ctaCustom.trim() || null;
  if (ctaCustom && ctaCustom.length > 60) errores.ctaCustom = "El texto del botón es demasiado largo.";

  const imagen = imagenPermitida(entrada.imagenUrl);
  if (!imagen.ok) errores.imagenUrl = imagen.error;

  let fechaDesde: Date | null = null;
  let fechaHasta: Date | null = null;
  if (entrada.fechaDesde.trim()) {
    fechaDesde = fechaMediodiaLima(entrada.fechaDesde.trim());
    if (!fechaDesde) errores.fechaDesde = "La fecha desde no es válida.";
  }
  if (entrada.fechaHasta.trim()) {
    fechaHasta = fechaMediodiaLima(entrada.fechaHasta.trim());
    if (!fechaHasta) errores.fechaHasta = "La fecha hasta no es válida.";
  }
  if (fechaDesde && fechaHasta && fechaISOLima(fechaHasta) < fechaISOLima(fechaDesde)) {
    errores.fechaHasta = "La fecha hasta no puede ser anterior a la fecha desde.";
  }

  if (Object.keys(errores).length > 0 || !imagen.ok) {
    return { ok: false, error: "Revisa los campos marcados.", errores };
  }

  return {
    ok: true,
    datos: {
      tipo,
      talkId,
      eventoId,
      partnerId,
      hrefLibre,
      tituloCustom,
      ctaCustom,
      imagenUrl: imagen.url,
      fechaDesde,
      fechaHasta,
      patrocinado: entrada.patrocinado,
      activo: entrada.activo,
    },
  };
}

async function comprobarReferencias(datos: {
  tipo: Tipo;
  talkId: string | null;
  eventoId: string | null;
  partnerId: string | null;
}): Promise<ErroresDestacado> {
  const errores: ErroresDestacado = {};
  // Server action: la petición ya es dinámica.
  const hoy = hoyLimaISO();
  const desde = new Date(`${hoy}T00:00:00-05:00`);

  if (datos.tipo === "TALK" && datos.talkId) {
    const talk = await prisma.talk.findFirst({ where: { id: datos.talkId, estado: "PUBLICADO" } });
    if (!talk) errores.talkId = "Ese Talk no existe o no está publicado.";
  }
  if (datos.tipo === "EVENTO" && datos.eventoId) {
    const evento = await prisma.evento.findFirst({
      where: { id: datos.eventoId, estado: "PUBLICADO", fecha: { gte: desde } },
    });
    if (!evento) errores.eventoId = "Ese evento no existe, no está publicado o ya pasó.";
  }
  if (datos.tipo === "ALIADO" && datos.partnerId) {
    const partner = await prisma.partner.findFirst({
      where: {
        id: datos.partnerId,
        activo: true,
        estado: "PUBLICADO",
        nivel: "ALIADO",
        slug: { not: null },
      },
    });
    if (!partner) errores.partnerId = "Ese aliado no existe o no tiene ficha publicada.";
  }
  return errores;
}

export async function crearDestacado(entrada: EntradaDestacado): Promise<Resultado<{ id: string }>> {
  const validado = validarEntrada(entrada);
  if (!validado.ok) return validado;

  const refs = await comprobarReferencias(validado.datos);
  if (Object.keys(refs).length > 0) return { ok: false, error: "Revisa los campos marcados.", errores: refs };

  const ultimo = await prisma.destacado.aggregate({ _max: { orden: true } });
  const orden = (ultimo._max.orden ?? -1) + 1;

  const creado = await prisma.destacado.create({
    data: {
      tipo: validado.datos.tipo,
      orden,
      activo: validado.datos.activo,
      tituloCustom: validado.datos.tituloCustom,
      ctaCustom: validado.datos.ctaCustom,
      imagenUrl: validado.datos.imagenUrl,
      hrefLibre: validado.datos.hrefLibre,
      fechaDesde: validado.datos.fechaDesde,
      fechaHasta: validado.datos.fechaHasta,
      patrocinado: validado.datos.patrocinado,
      talkId: validado.datos.talkId,
      eventoId: validado.datos.eventoId,
      partnerId: validado.datos.partnerId,
    },
  });

  return { ok: true, datos: { id: creado.id } };
}

export async function actualizarDestacado(
  id: string,
  entrada: EntradaDestacado,
): Promise<Resultado<{ id: string }>> {
  const existente = await prisma.destacado.findUnique({ where: { id } });
  if (!existente) return { ok: false, error: "Ese destacado no existe." };

  const validado = validarEntrada(entrada);
  if (!validado.ok) return validado;

  const refs = await comprobarReferencias(validado.datos);
  if (Object.keys(refs).length > 0) return { ok: false, error: "Revisa los campos marcados.", errores: refs };

  await prisma.destacado.update({
    where: { id },
    data: {
      tipo: validado.datos.tipo,
      activo: validado.datos.activo,
      tituloCustom: validado.datos.tituloCustom,
      ctaCustom: validado.datos.ctaCustom,
      imagenUrl: validado.datos.imagenUrl,
      hrefLibre: validado.datos.hrefLibre,
      fechaDesde: validado.datos.fechaDesde,
      fechaHasta: validado.datos.fechaHasta,
      patrocinado: validado.datos.patrocinado,
      talkId: validado.datos.talkId,
      eventoId: validado.datos.eventoId,
      partnerId: validado.datos.partnerId,
    },
  });

  return { ok: true, datos: { id } };
}

export async function eliminarDestacado(id: string): Promise<Resultado<{ id: string }>> {
  const existente = await prisma.destacado.findUnique({ where: { id } });
  if (!existente) return { ok: false, error: "Ese destacado no existe." };
  await prisma.destacado.delete({ where: { id } });
  return { ok: true, datos: { id } };
}

export async function activarDestacado(id: string, activo: boolean): Promise<Resultado<{ id: string }>> {
  const existente = await prisma.destacado.findUnique({ where: { id } });
  if (!existente) return { ok: false, error: "Ese destacado no existe." };
  await prisma.destacado.update({ where: { id }, data: { activo } });
  return { ok: true, datos: { id } };
}

export async function reordenarDestacados(ids: string[]): Promise<Resultado<{ cantidad: number }>> {
  if (ids.length === 0) return { ok: false, error: "No hay nada que reordenar." };
  const unicos = new Set(ids);
  if (unicos.size !== ids.length) return { ok: false, error: "Hay destacados repetidos en el orden." };

  const existentes = await prisma.destacado.findMany({ select: { id: true } });
  if (existentes.length !== ids.length || existentes.some((e) => !unicos.has(e.id))) {
    return { ok: false, error: "El orden no coincide con los destacados actuales." };
  }

  await prisma.$transaction(
    ids.map((id, indice) => prisma.destacado.update({ where: { id }, data: { orden: indice } })),
  );

  return { ok: true, datos: { cantidad: ids.length } };
}

export function tituloMostrado(fila: DestacadoAdmin): string {
  return (
    fila.tituloCustom?.trim() ||
    fila.talk?.titulo ||
    fila.evento?.titulo ||
    fila.partner?.nombre ||
    "Sin título"
  );
}

export function miniaturaAdmin(fila: DestacadoAdmin): string {
  if (fila.imagenUrl?.trim()) return fila.imagenUrl.trim();
  if (fila.talk) return miniaturaYoutube(fila.talk.youtubeId);
  if (fila.evento) {
    return (
      fila.evento.aliado?.logoUrl ||
      logoLocalPartner(fila.evento.aliado?.nombre) ||
      MARCA_OFICIAL.heroUrl
    );
  }
  if (fila.partner) return fila.partner.logoUrl || logoLocalPartner(fila.partner.nombre) || "/partners/sarmiento.webp";
  return MARCA_OFICIAL.heroUrl;
}
