import { redirect } from "next/navigation";
import { SECCIONES_CONFIGURACION } from "@/components/admin/secciones-configuracion";

export default function PaginaConfiguracion() {
  redirect(SECCIONES_CONFIGURACION[0].href);
}
