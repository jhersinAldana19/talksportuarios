export type EstadoFormulario = { error?: string };

export function texto(formData: FormData, clave: string): string {
  const valor = formData.get(clave);
  return typeof valor === "string" ? valor : "";
}

export function ids(formData: FormData, clave: string): string[] {
  return formData.getAll(clave).filter((valor): valor is string => typeof valor === "string");
}

/** Enlace opcional. Vacío se guarda como null. */
export function urlOpcional(
  valor: string,
  campo: string,
): { ok: true; url: string | null } | { ok: false; error: string } {
  const limpio = valor.trim();
  if (!limpio) return { ok: true, url: null };
  if (limpio.length > 500) return { ok: false, error: `El enlace de ${campo} es demasiado largo.` };
  let url: URL;
  try {
    url = new URL(limpio);
  } catch {
    return { ok: false, error: `El enlace de ${campo} no es válido.` };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, error: `El enlace de ${campo} debe empezar por http o https.` };
  }
  return { ok: true, url: url.toString() };
}
