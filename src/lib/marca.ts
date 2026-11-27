export type MarcaSitio = {
  colorPrimario: string;
  colorSecundario: string;
  colorTerciario: string;
  logoUrl: string | null;
  heroUrl: string;
};

/** Valores oficiales de marca (respaldo si la BD no tiene fila o se restaura). */
export const MARCA_OFICIAL: MarcaSitio = {
  colorPrimario: "#111966",
  colorSecundario: "#e60d55",
  colorTerciario: "#fefdfd",
  logoUrl: null,
  heroUrl: "/hero-puerto-2880.webp",
};

export type RespaldoMarca = MarcaSitio;

/** Oscurece un hex ~18 % para hover (marino-oscuro / magenta-oscuro). */
export function oscurecerHex(hex: string, factor = 0.82): string {
  const limpio = hex.replace("#", "");
  if (limpio.length !== 6) return hex;
  const n = (i: number) => Math.max(0, Math.min(255, Math.round(parseInt(limpio.slice(i, i + 2), 16) * factor)));
  const h = (v: number) => v.toString(16).padStart(2, "0");
  return `#${h(n(0))}${h(n(2))}${h(n(4))}`;
}

export function esHexColor(valor: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(valor.trim());
}

/** Variables CSS de marca para inyectar en <html>. */
export function variablesCssMarca(marca: MarcaSitio): Record<string, string> {
  const primario = marca.colorPrimario;
  const secundario = marca.colorSecundario;
  const terciario = marca.colorTerciario;
  return {
    "--brand-primario": primario,
    "--brand-secundario": secundario,
    "--brand-terciario": terciario,
    "--brand-primario-oscuro": oscurecerHex(primario, 0.72),
    "--brand-secundario-oscuro": oscurecerHex(secundario, 0.85),
  };
}
