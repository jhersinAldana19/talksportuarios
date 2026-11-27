"use server";

import { redirect } from "next/navigation";
import { texto, type EstadoFormulario } from "@/lib/formulario";
import { exigirAdmin } from "@/lib/sesion";
import { crearAdmin } from "@/services/admins";

export async function crearUsuario(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  await exigirAdmin();
  const resultado = await crearAdmin({
    nombre: texto(formData, "nombre"),
    email: texto(formData, "email"),
    password: texto(formData, "password"),
    confirmacion: texto(formData, "confirmacion"),
  });
  if (!resultado.ok) return { error: resultado.error };
  redirect("/admin/configuracion/acceso");
}
