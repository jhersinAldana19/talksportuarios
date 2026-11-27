/** Hosts que next/image puede optimizar (ver next.config.ts). */
const HOSTS_NEXT_IMAGE = new Set(["i.ytimg.com"]);

/** true = usar next/image; false = usar <img> (URL externa arbitraria). */
export function esHostNextImage(src: string): boolean {
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    return HOSTS_NEXT_IMAGE.has(new URL(src).hostname);
  } catch {
    return false;
  }
}

/** Ruta local o http(s) usable como imagen de destacado. */
export function imagenUsableParaCarrusel(
  url: string,
): { imagen: string; imagenExterna: boolean } | null {
  const limpio = url.trim();
  if (!limpio) return null;
  if (limpio.startsWith("/") && !limpio.startsWith("//")) {
    return { imagen: limpio, imagenExterna: false };
  }
  try {
    const parseada = new URL(limpio);
    if (parseada.protocol === "https:" || parseada.protocol === "http:") {
      return { imagen: parseada.toString(), imagenExterna: true };
    }
  } catch {
    return null;
  }
  return null;
}
