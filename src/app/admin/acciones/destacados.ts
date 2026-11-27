"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { texto, type EstadoFormulario } from "@/lib/formulario";
import { exigirAdmin } from "@/lib/sesion";
import {
  activarDestacado as activarDestacadoEnServicio,
  actualizarDestacado,
  crearDestacado,
  eliminarDestacado as eliminarDestacadoEnServicio,
  reordenarDestacados as reordenarDestacadosEnServicio,
  type EntradaDestacado,
  type ErroresDestacado,
} from "@/services/destacados";

export type EstadoFormularioDestacado = EstadoFormulario & {
  errores?: ErroresDestacado;
};

function leer(formData: FormData): EntradaDestacado {
  return {
    tipo: texto(formData, "tipo"),
    talkId: texto(formData, "talkId"),
    eventoId: texto(formData, "eventoId"),
    partnerId: texto(formData, "partnerId"),
    hrefLibre: texto(formData, "hrefLibre"),
    tituloCustom: texto(formData, "tituloCustom"),
    ctaCustom: texto(formData, "ctaCustom"),
    imagenUrl: texto(formData, "imagenUrl"),
    fechaDesde: texto(formData, "fechaDesde"),
    fechaHasta: texto(formData, "fechaHasta"),
    patrocinado: formData.get("patrocinado") === "on",
    activo: formData.get("activo") === "on",
  };
}

function invalidar(id?: string) {
  updateTag("destacados");
  if (id) updateTag(`destacado:${id}`);
  revalidatePath("/");
  revalidatePath("/admin/destacados");
}

export async function guardarDestacado(
  _previo: EstadoFormularioDestacado,
  formData: FormData,
): Promise<EstadoFormularioDestacado> {
  await exigirAdmin();
  const id = texto(formData, "id");
  const resultado = id ? await actualizarDestacado(id, leer(formData)) : await crearDestacado(leer(formData));
  if (!resultado.ok) return { error: resultado.error, errores: resultado.errores };
  invalidar(resultado.datos.id);
  redirect("/admin/destacados");
}

export async function activarDestacado(formData: FormData) {
  await exigirAdmin();
  const id = texto(formData, "id");
  const resultado = await activarDestacadoEnServicio(id, texto(formData, "activo") === "true");
  if (!resultado.ok) redirect(`/admin/destacados?error=${encodeURIComponent(resultado.error)}`);
  invalidar(id);
  redirect("/admin/destacados");
}

export async function eliminarDestacado(formData: FormData) {
  await exigirAdmin();
  const id = texto(formData, "id");
  const resultado = await eliminarDestacadoEnServicio(id);
  if (!resultado.ok) redirect(`/admin/destacados?error=${encodeURIComponent(resultado.error)}`);
  invalidar(id);
  redirect("/admin/destacados");
}

export async function reordenarDestacados(ids: string[]) {
  await exigirAdmin();
  const resultado = await reordenarDestacadosEnServicio(ids);
  if (!resultado.ok) return { error: resultado.error };
  invalidar();
  return { ok: true as const };
}
