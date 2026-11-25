// Utilidades de formato (sin dependencias de servidor: usables en cliente y servidor).

import type { Serie, NivelPartner, Modalidad } from "@/generated/prisma/enums";

const ZONA = "America/Lima";

export function formatearFecha(fecha: Date): string {
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: ZONA,
  }).format(fecha);
}

/** Partes de la fecha para tarjetas de evento: { dia: "29", mes: "nov" } */
export function partesFecha(fecha: Date): { dia: string; mes: string; diaSemana: string } {
  const f = (o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("es-PE", { ...o, timeZone: ZONA }).format(fecha);
  return {
    dia: f({ day: "numeric" }),
    mes: f({ month: "short" }).replace(".", ""),
    diaSemana: f({ weekday: "long" }),
  };
}

/** 67 → "1 h 07 min" */
export function formatearDuracion(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m} min`;
  return `${h} h ${String(m).padStart(2, "0")} min`;
}

/** 67 → "PT1H7M" (formato ISO 8601 para JSON-LD) */
export function duracionISO(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `PT${h ? `${h}H` : ""}${m}M`;
}

export function miniaturaYoutube(youtubeId: string): string {
  return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
}

export const ETIQUETA_SERIE: Record<Serie, string> = {
  TALKS: "Talks",
  NEXT_GENERATION: "Next Generation",
  EDICION_ESPECIAL: "Edición Especial",
};

/** ("TALKS", 25) → "Talks · 25.ª edición"; sin edición → "Talks" */
export function etiquetaSerieEdicion(serie: Serie, edicion: number | null): string {
  return edicion ? `${ETIQUETA_SERIE[serie]} · ${edicion}.ª edición` : ETIQUETA_SERIE[serie];
}

/** Fecha en Lima como "AAAA-MM-DD" (para JSON-LD cuando la hora no está confirmada). */
export function fechaISOLima(fecha: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA }).format(fecha);
}

export const ETIQUETA_NIVEL: Record<NivelPartner, string> = {
  PARTNER_FUNDADOR: "Partner fundador",
  PARTNER: "Partner",
  ALIADO: "Aliado",
};

export const ETIQUETA_MODALIDAD: Record<Modalidad, string> = {
  PRESENCIAL: "Presencial",
  VIRTUAL: "Virtual",
};
