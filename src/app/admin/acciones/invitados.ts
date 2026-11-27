"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { texto, type EstadoFormulario } from "@/lib/formulario";
import { exigirAdmin } from "@/lib/sesion";
import {
  actualizarInvitado,
  crearInvitado,
  eliminarInvitado as eliminarInvitadoEnServicio,
  type EntradaInvitado,
  type InvitadoGuardado,
} from "@/services/invitados";

function leer(formData: FormData): EntradaInvitado {
  return {
    nombre: texto(formData, "nombre"),
    slug: texto(formData, "slug"),
    cargo: texto(formData, "cargo"),
    empresa: texto(formData, "empresa"),
    bio: texto(formData, "bio"),
    fotoUrl: texto(formData, "fotoUrl"),
    linkedinUrl: texto(formData, "linkedinUrl"),
  };
}

function invalidar(datos: InvitadoGuardado) {
  updateTag("eventos");
  updateTag("talks");
  for (const slug of datos.talkSlugs) updateTag(`talk:${slug}`);
}

export async function guardarInvitado(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  await exigirAdmin();
  const id = texto(formData, "id");
  const resultado = id ? await actualizarInvitado(id, leer(formData)) : await crearInvitado(leer(formData));
  if (!resultado.ok) return { error: resultado.error };
  invalidar(resultado.datos);
  redirect("/admin/invitados");
}

export async function eliminarInvitado(formData: FormData) {
  await exigirAdmin();
  const resultado = await eliminarInvitadoEnServicio(texto(formData, "id"));
  if (!resultado.ok) redirect(`/admin/invitados?error=${encodeURIComponent(resultado.error)}`);
  invalidar(resultado.datos);
  redirect("/admin/invitados");
}
