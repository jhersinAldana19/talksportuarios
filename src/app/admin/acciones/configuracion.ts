"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { texto, type EstadoFormulario } from "@/lib/formulario";
import { exigirAdmin } from "@/lib/sesion";
import {
  deshacerMarca,
  guardarMarca,
  restaurarMarcaOficial,
} from "@/services/configuracion";

const RUTA_MARCA = "/admin/configuracion/marca";

function invalidarSitio() {
  updateTag("configuracion");
  revalidatePath("/");
  revalidatePath(RUTA_MARCA);
}

export async function guardarConfiguracionMarca(
  _previo: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  await exigirAdmin();
  const confirmado = formData.get("confirmar") === "on" || formData.get("confirmar") === "true";
  if (!confirmado) {
    return { error: "Debes confirmar que quieres aplicar los cambios en el sitio público." };
  }

  const resultado = await guardarMarca({
    colorPrimario: texto(formData, "colorPrimario"),
    colorSecundario: texto(formData, "colorSecundario"),
    colorTerciario: texto(formData, "colorTerciario"),
    logoUrl: texto(formData, "logoUrl"),
    heroUrl: texto(formData, "heroUrl"),
  });
  if (!resultado.ok) return { error: resultado.error };
  invalidarSitio();
  redirect(`${RUTA_MARCA}?ok=guardado`);
}

export async function restaurarConfiguracionMarca(formData: FormData) {
  await exigirAdmin();
  const confirmado = formData.get("confirmar") === "on" || formData.get("confirmar") === "true";
  if (!confirmado) {
    redirect(`${RUTA_MARCA}?error=${encodeURIComponent("Confirma antes de restaurar la marca oficial.")}`);
  }
  const resultado = await restaurarMarcaOficial();
  if (!resultado.ok) {
    redirect(`${RUTA_MARCA}?error=${encodeURIComponent(resultado.error)}`);
  }
  invalidarSitio();
  redirect(`${RUTA_MARCA}?ok=restaurado`);
}

export async function deshacerConfiguracionMarca() {
  await exigirAdmin();
  const resultado = await deshacerMarca();
  if (!resultado.ok) {
    redirect(`${RUTA_MARCA}?error=${encodeURIComponent(resultado.error)}`);
  }
  invalidarSitio();
  redirect(`${RUTA_MARCA}?ok=deshecho`);
}
