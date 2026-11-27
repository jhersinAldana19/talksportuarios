/** Enlaces del menú lateral (única fuente). */
export const ENLACES_PANEL = [
  { id: "inicio", href: "/admin", texto: "Inicio" },
  { id: "talks", href: "/admin/talks", texto: "Talks" },
  { id: "invitados", href: "/admin/invitados", texto: "Invitados" },
  { id: "eventos", href: "/admin/eventos", texto: "Eventos" },
  { id: "partners", href: "/admin/partners", texto: "Partners" },
  { id: "destacados", href: "/admin/destacados", texto: "Destacados" },
  { id: "configuracion", href: "/admin/configuracion", texto: "Configuración" },
  { id: "sitio", href: "/", texto: "Ver sitio", externo: true },
] as const;

export type IdEnlacePanel = (typeof ENLACES_PANEL)[number]["id"];
