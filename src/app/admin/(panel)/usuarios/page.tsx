import { redirect } from "next/navigation";

/** Ruta antigua → Configuración → Acceso. */
export default function RedireccionUsuarios() {
  redirect("/admin/configuracion/acceso");
}
