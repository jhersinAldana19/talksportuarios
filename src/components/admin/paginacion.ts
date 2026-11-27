/** Tamaño de página por defecto en tablas del panel. */
export const POR_PAGINA_TABLA = 10;

export function totalPaginas(total: number, porPagina: number): number {
  return Math.max(1, Math.ceil(Math.max(0, total) / porPagina));
}

export function rangoPagina(pagina: number, porPagina: number, total: number) {
  const paginas = totalPaginas(total, porPagina);
  const actual = Math.min(Math.max(1, pagina), paginas);
  const inicio = (actual - 1) * porPagina;
  const fin = Math.min(inicio + porPagina, total);
  return { actual, paginas, inicio, fin };
}
