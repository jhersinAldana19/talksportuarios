import { cacheLife, cacheTag, updateTag } from "next/cache";
import {
  esHexColor,
  MARCA_OFICIAL,
  type MarcaSitio,
  type RespaldoMarca,
} from "@/lib/marca";
import { prisma } from "@/lib/prisma";

export type EntradaMarca = {
  colorPrimario: string;
  colorSecundario: string;
  colorTerciario: string;
  logoUrl: string;
  heroUrl: string;
};

type Resultado<T> = { ok: true; datos: T } | { ok: false; error: string };

function aMarca(fila: {
  colorPrimario: string;
  colorSecundario: string;
  colorTerciario: string;
  logoUrl: string | null;
  heroUrl: string;
}): MarcaSitio {
  return {
    colorPrimario: fila.colorPrimario,
    colorSecundario: fila.colorSecundario,
    colorTerciario: fila.colorTerciario,
    logoUrl: fila.logoUrl,
    heroUrl: fila.heroUrl,
  };
}

async function asegurarFila() {
  const existente = await prisma.configuracionSitio.findUnique({ where: { id: "sitio" } });
  if (existente) return existente;
  return prisma.configuracionSitio.create({
    data: {
      id: "sitio",
      colorPrimario: MARCA_OFICIAL.colorPrimario,
      colorSecundario: MARCA_OFICIAL.colorSecundario,
      colorTerciario: MARCA_OFICIAL.colorTerciario,
      logoUrl: MARCA_OFICIAL.logoUrl,
      heroUrl: MARCA_OFICIAL.heroUrl,
    },
  });
}

/** Marca pública (caché). Sin fila en BD → valores oficiales (sin escribir en la petición). */
export async function obtenerMarca(): Promise<MarcaSitio & { tieneRespaldo: boolean }> {
  "use cache";
  cacheLife("hours");
  cacheTag("configuracion");

  // Defensa: si el proceso de Next sigue con un PrismaClient viejo (sin este modelo),
  // no tumbar el sitio; se usan los colores/logo/hero oficiales.
  if (!prisma.configuracionSitio) {
    return { ...MARCA_OFICIAL, logoUrl: MARCA_OFICIAL.logoUrl, tieneRespaldo: false };
  }

  const fila = await prisma.configuracionSitio.findUnique({ where: { id: "sitio" } });
  if (!fila) return { ...MARCA_OFICIAL, logoUrl: MARCA_OFICIAL.logoUrl, tieneRespaldo: false };
  return { ...aMarca(fila), tieneRespaldo: Boolean(fila.respaldoJson) };
}

export async function obtenerMarcaAdmin(): Promise<MarcaSitio & { tieneRespaldo: boolean; updatedAt: Date }> {
  const fila = await asegurarFila();
  return { ...aMarca(fila), tieneRespaldo: Boolean(fila.respaldoJson), updatedAt: fila.updatedAt };
}

function validarEntrada(entrada: EntradaMarca): Resultado<MarcaSitio> {
  const primario = entrada.colorPrimario.trim();
  const secundario = entrada.colorSecundario.trim();
  const terciario = entrada.colorTerciario.trim();
  if (!esHexColor(primario)) return { ok: false, error: "El color primario debe ser un hex #RRGGBB." };
  if (!esHexColor(secundario)) return { ok: false, error: "El color secundario debe ser un hex #RRGGBB." };
  if (!esHexColor(terciario)) return { ok: false, error: "El color terciario debe ser un hex #RRGGBB." };

  const logoUrl: string | null = entrada.logoUrl.trim() || null;
  if (logoUrl) {
    if (logoUrl.startsWith("/") && !logoUrl.startsWith("//")) {
      if (logoUrl.length > 500) return { ok: false, error: "La ruta del logo es demasiado larga." };
    } else if (!/^https?:\/\//i.test(logoUrl)) {
      return { ok: false, error: "El logo debe ser una ruta /… o una URL https." };
    }
  }

  const heroUrl = entrada.heroUrl.trim() || MARCA_OFICIAL.heroUrl;
  if (heroUrl.startsWith("/") && !heroUrl.startsWith("//")) {
    if (heroUrl.length > 500) return { ok: false, error: "La ruta del hero es demasiado larga." };
  } else if (!/^https?:\/\//i.test(heroUrl)) {
    return { ok: false, error: "El hero debe ser una ruta /… o una URL https." };
  }

  return {
    ok: true,
    datos: { colorPrimario: primario, colorSecundario: secundario, colorTerciario: terciario, logoUrl, heroUrl },
  };
}

function invalidar() {
  updateTag("configuracion");
}

/** Guarda marca y deja el estado actual en respaldoJson (para deshacer). */
export async function guardarMarca(entrada: EntradaMarca): Promise<Resultado<{ id: string }>> {
  const validado = validarEntrada(entrada);
  if (!validado.ok) return validado;

  const actual = await asegurarFila();
  const respaldo: RespaldoMarca = aMarca(actual);

  await prisma.configuracionSitio.update({
    where: { id: "sitio" },
    data: {
      ...validado.datos,
      respaldoJson: JSON.stringify(respaldo),
    },
  });
  invalidar();
  return { ok: true, datos: { id: "sitio" } };
}

/** Restaura la paleta y assets oficiales de Talks Portuarios. */
export async function restaurarMarcaOficial(): Promise<Resultado<{ id: string }>> {
  const actual = await asegurarFila();
  await prisma.configuracionSitio.update({
    where: { id: "sitio" },
    data: {
      colorPrimario: MARCA_OFICIAL.colorPrimario,
      colorSecundario: MARCA_OFICIAL.colorSecundario,
      colorTerciario: MARCA_OFICIAL.colorTerciario,
      logoUrl: MARCA_OFICIAL.logoUrl,
      heroUrl: MARCA_OFICIAL.heroUrl,
      respaldoJson: JSON.stringify(aMarca(actual)),
    },
  });
  invalidar();
  return { ok: true, datos: { id: "sitio" } };
}

/** Vuelve al estado guardado en respaldoJson (un paso atrás). */
export async function deshacerMarca(): Promise<Resultado<{ id: string }>> {
  const actual = await asegurarFila();
  if (!actual.respaldoJson) return { ok: false, error: "No hay un cambio anterior para deshacer." };

  let previo: RespaldoMarca;
  try {
    previo = JSON.parse(actual.respaldoJson) as RespaldoMarca;
  } catch {
    return { ok: false, error: "El respaldo está dañado. Usa «Restaurar marca oficial»." };
  }

  await prisma.configuracionSitio.update({
    where: { id: "sitio" },
    data: {
      colorPrimario: previo.colorPrimario,
      colorSecundario: previo.colorSecundario,
      colorTerciario: previo.colorTerciario,
      logoUrl: previo.logoUrl,
      heroUrl: previo.heroUrl,
      respaldoJson: JSON.stringify(aMarca(actual)),
    },
  });
  invalidar();
  return { ok: true, datos: { id: "sitio" } };
}
