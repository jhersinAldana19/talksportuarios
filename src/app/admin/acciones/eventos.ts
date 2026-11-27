"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { ids, texto, type EstadoFormulario } from "@/lib/formulario";
import { exigirAdmin } from "@/lib/sesion";
import {
  actualizarEvento,
  cambiarEstadoEvento as cambiarEstadoEventoEnServicio,
  crearEvento,
  eliminarEvento as eliminarEventoEnServicio,
  type EntradaEvento,
} from "@/services/eventos";

function leer(formData: FormData): EntradaEvento {
  return {
    titulo: texto(formData, "titulo"),
    slug: texto(formData, "slug"),
    descripcion: texto(formData, "descripcion"),
    fecha: texto(formData, "fecha"),
    lugar: texto(formData, "lugar"),
    modalidad: texto(formData, "modalidad"),
    cupoLimitado: formData.get("cupoLimitado") === "on",
    linkInscripcion: texto(formData, "linkInscripcion"),
    estado: texto(formData, "estado"),
    aliadoId: texto(formData, "aliadoId"),
    ponenteIds: ids(formData, "ponenteId"),
  };
}

export async function guardarEvento(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  await exigirAdmin();
  const id = texto(formData, "id");
  const resultado = id ? await actualizarEvento(id, leer(formData)) : await crearEvento(leer(formData));
  if (!resultado.ok) return { error: resultado.error };
  updateTag("eventos");
  redirect("/admin/eventos");
}

export async function cambiarEstadoEvento(formData: FormData) {
  await exigirAdmin();
  const resultado = await cambiarEstadoEventoEnServicio(texto(formData, "id"), texto(formData, "estado"));
  if (!resultado.ok) redirect(`/admin/eventos?error=${encodeURIComponent(resultado.error)}`);
  updateTag("eventos");
  redirect("/admin/eventos");
}

export async function eliminarEvento(formData: FormData) {
  await exigirAdmin();
  const resultado = await eliminarEventoEnServicio(texto(formData, "id"));
  if (!resultado.ok) redirect(`/admin/eventos?error=${encodeURIComponent(resultado.error)}`);
  updateTag("eventos");
  redirect("/admin/eventos");
}
