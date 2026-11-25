// Datos generales del sitio. Se usan en el layout, metadatos, JSON-LD y el seed.
// Fuente: docs/datos-reales.json

export const SITIO = {
  nombre: "Talks Portuarios",
  lema: "Espacios para aprender, compartir y conectar",
  descripcion:
    "Comunidad del sector marítimo-portuario peruano. Charlas con expertos, eventos y contenido para aprender, compartir y conectar desde el Callao.",
  url: "https://talksportuarios.com",
  fundacion: "2020",
  fundadora: "Stephany Del Pino",
  ciudad: "Callao",
  pais: "PE",
  telefono: "+51 997 000 170",
  // Link de WhatsApp Business: no admite mensaje prellenado (?text=); el saludo lo configura la cuenta.
  whatsapp: "https://wa.me/message/CT2HK4NK3NHZE1",
  youtube: "https://www.youtube.com/@TalksPortuarios",
  linkedin: "https://www.linkedin.com/company/talks-portuarios/",
} as const;

export function enlaceWhatsapp(): string {
  return SITIO.whatsapp;
}
