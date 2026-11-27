/** Secciones del módulo Configuración (única fuente para menú vertical y rutas). */
export const SECCIONES_CONFIGURACION = [
  {
    id: "cuenta",
    href: "/admin/configuracion/cuenta",
    texto: "Mi cuenta",
    descripcionCorta: "Perfil y contraseña",
    descripcion: "Tu nombre, correo y contraseña de acceso al panel.",
  },
  {
    id: "marca",
    href: "/admin/configuracion/marca",
    texto: "Marca del sitio",
    descripcionCorta: "Colores, logo y hero",
    descripcion: "Colores, logo e imagen del hero del sitio público.",
  },
  {
    id: "acceso",
    href: "/admin/configuracion/acceso",
    texto: "Acceso",
    descripcionCorta: "Administradores del panel",
    descripcion: "Quién puede entrar al panel y alta de administradores.",
  },
] as const;

export type IdSeccionConfiguracion = (typeof SECCIONES_CONFIGURACION)[number]["id"];

export function seccionConfiguracionPorRuta(ruta: string) {
  return SECCIONES_CONFIGURACION.find((s) => ruta === s.href || ruta.startsWith(`${s.href}/`));
}
