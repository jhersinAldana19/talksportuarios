"use server";

import { AuthError } from "next-auth";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import { exigirAdmin } from "@/lib/sesion";
import {
  actualizarTalk,
  cambiarEstadoTalk as cambiarEstadoTalkEnServicio,
  crearTalk,
  eliminarTalk as eliminarTalkEnServicio,
  type EntradaTalk,
} from "@/services/talks";

export type EstadoFormulario = { error?: string };

function texto(formData: FormData, clave: string): string {
  const valor = formData.get(clave);
  return typeof valor === "string" ? valor : "";
}

function leerEntrada(formData: FormData): EntradaTalk {
  return {
    titulo: texto(formData, "titulo"),
    slug: texto(formData, "slug"),
    serie: texto(formData, "serie"),
    edicion: texto(formData, "edicion"),
    youtubeId: texto(formData, "youtubeId"),
    duracionMin: texto(formData, "duracionMin"),
    fechaPublicacion: texto(formData, "fechaPublicacion"),
    resumen: texto(formData, "resumen"),
    puntosClave: texto(formData, "puntosClave"),
    transcripcion: texto(formData, "transcripcion"),
    tags: texto(formData, "tags"),
    estado: texto(formData, "estado"),
    patrocinado: formData.get("patrocinado") === "on",
    contenidoProvisional: formData.get("contenidoProvisional") === "on",
    invitadoIds: formData.getAll("invitadoId").filter((valor): valor is string => typeof valor === "string"),
  };
}

function invalidarTalk(slug: string, slugAnterior?: string | null) {
  updateTag("talks");
  updateTag(`talk:${slug}`);
  if (slugAnterior && slugAnterior !== slug) updateTag(`talk:${slugAnterior}`);
}

export async function iniciarSesion(_previo: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  try {
    // Si la contraseña no coincide, Auth.js lanza CredentialsSignin (es un AuthError).
    // Si entra, lanza la redirección de Next; hay que dejarla pasar para que el navegador vaya a /admin.
    await signIn("credentials", {
      email: texto(formData, "email"),
      password: texto(formData, "password"),
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Correo o contraseña incorrectos." };
    }
    throw error;
  }
  return {};
}

export async function cerrarSesion() {
  await signOut({ redirectTo: "/" });
}

export async function guardarTalk(_previo: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  await exigirAdmin();
  const id = texto(formData, "id");
  const entrada = leerEntrada(formData);
  const resultado = id ? await actualizarTalk(id, entrada) : await crearTalk(entrada);
  if (!resultado.ok) return { error: resultado.error };
  invalidarTalk(resultado.datos.slug, resultado.datos.slugAnterior);
  redirect("/admin/talks");
}

export async function cambiarEstadoTalk(formData: FormData) {
  await exigirAdmin();
  const resultado = await cambiarEstadoTalkEnServicio(texto(formData, "id"), texto(formData, "estado"));
  if (!resultado.ok) redirect(`/admin/talks?error=${encodeURIComponent(resultado.error)}`);
  invalidarTalk(resultado.datos.slug);
  redirect("/admin/talks");
}

export async function eliminarTalk(formData: FormData) {
  await exigirAdmin();
  const resultado = await eliminarTalkEnServicio(texto(formData, "id"));
  if (!resultado.ok) redirect(`/admin/talks?error=${encodeURIComponent(resultado.error)}`);
  invalidarTalk(resultado.datos.slug);
  redirect("/admin/talks");
}
