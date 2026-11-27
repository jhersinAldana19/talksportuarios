"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { texto, type EstadoFormulario } from "@/lib/formulario";
import { exigirAdmin } from "@/lib/sesion";
import {
  actualizarPartner,
  cambiarActivoPartner as cambiarActivoPartnerEnServicio,
  crearPartner,
  eliminarPartner as eliminarPartnerEnServicio,
  type EntradaPartner,
} from "@/services/partners";

function leer(formData: FormData): EntradaPartner {
  return {
    nombre: texto(formData, "nombre"),
    slug: texto(formData, "slug"),
    web: texto(formData, "web"),
    logoUrl: texto(formData, "logoUrl"),
    frase: texto(formData, "frase"),
    descripcion: texto(formData, "descripcion"),
    beneficios: texto(formData, "beneficios"),
    relacionComercial: formData.get("relacionComercial") === "on",
    estado: texto(formData, "estado") || "BORRADOR",
    nivel: texto(formData, "nivel"),
    orden: texto(formData, "orden"),
    activo: formData.get("activo") === "on",
  };
}

function invalidar(slug?: string | null, slugAnterior?: string | null) {
  updateTag("partners");
  updateTag("eventos");
  if (slug) updateTag(`aliado:${slug}`);
  if (slugAnterior && slugAnterior !== slug) updateTag(`aliado:${slugAnterior}`);
}

export async function guardarPartner(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  await exigirAdmin();
  const id = texto(formData, "id");
  const resultado = id ? await actualizarPartner(id, leer(formData)) : await crearPartner(leer(formData));
  if (!resultado.ok) return { error: resultado.error };
  invalidar(resultado.datos.slug, resultado.datos.slugAnterior);
  redirect("/admin/partners");
}

export async function cambiarActivoPartner(formData: FormData) {
  await exigirAdmin();
  const resultado = await cambiarActivoPartnerEnServicio(texto(formData, "id"), texto(formData, "activo") === "true");
  if (!resultado.ok) redirect(`/admin/partners?error=${encodeURIComponent(resultado.error)}`);
  invalidar();
  redirect("/admin/partners");
}

export async function eliminarPartner(formData: FormData) {
  await exigirAdmin();
  const resultado = await eliminarPartnerEnServicio(texto(formData, "id"));
  if (!resultado.ok) redirect(`/admin/partners?error=${encodeURIComponent(resultado.error)}`);
  invalidar();
  redirect("/admin/partners");
}
