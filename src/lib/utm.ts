// Los UTM se arman al mostrar el enlace. En la base queda la URL limpia del aliado.

export function enlaceConUtm(url: string, campana: string, contenido: string): string {
  const destino = new URL(url);
  destino.searchParams.set("utm_source", "talksportuarios");
  destino.searchParams.set("utm_medium", "aliado");
  destino.searchParams.set("utm_campaign", campana);
  destino.searchParams.set("utm_content", contenido);
  return destino.toString();
}
