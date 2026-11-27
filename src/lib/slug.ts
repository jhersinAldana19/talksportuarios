// Slug legible para URLs. La usa el formulario del panel y los servicios.
// El seed tiene su propia copia: tsx no resuelve el alias @/.

export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " y ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function slugValido(slug: string): boolean {
  return slug.length > 0 && slug.length <= 160 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
