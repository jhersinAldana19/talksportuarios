"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { texto, type EstadoFormulario } from "@/lib/formulario";
import { exigirAdmin } from "@/lib/sesion";
import { actualizarCuentaPropia } from "@/services/admins";

export async function guardarCuentaPropia(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const sesion = await exigirAdmin();
  const adminId = sesion.user.id;
  if (!adminId) return { error: "Sesión no válida." };

  const resultado = await actualizarCuentaPropia(adminId, {
    nombre: texto(formData, "nombre"),
    email: texto(formData, "email"),
    contraseñaActual: texto(formData, "contraseñaActual"),
    contraseñaNueva: texto(formData, "contraseñaNueva"),
    confirmacion: texto(formData, "confirmacion"),
  });
  if (!resultado.ok) return { error: resultado.error };

  revalidatePath("/admin", "layout");
  revalidatePath("/admin/configuracion/cuenta");
  redirect("/admin/configuracion/cuenta?ok=guardado");
}
