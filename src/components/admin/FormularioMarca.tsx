"use client";

import { useActionState, useMemo, useState } from "react";
import {
  deshacerConfiguracionMarca,
  guardarConfiguracionMarca,
  restaurarConfiguracionMarca,
} from "@/app/admin/acciones/configuracion";
import { ayuda, alerta, campo, etiqueta } from "@/components/clases-formulario";
import { MARCA_OFICIAL, type MarcaSitio } from "@/lib/marca";
import type { EstadoFormulario } from "@/lib/formulario";

export function FormularioMarca({
  marca,
  mensajeOk,
  mensajeError,
}: {
  marca: MarcaSitio & { tieneRespaldo: boolean };
  mensajeOk?: string;
  mensajeError?: string;
}) {
  const [estado, accion, pendiente] = useActionState(guardarConfiguracionMarca, {} as EstadoFormulario);
  const [primario, setPrimario] = useState(marca.colorPrimario);
  const [secundario, setSecundario] = useState(marca.colorSecundario);
  const [terciario, setTerciario] = useState(marca.colorTerciario);
  const [logoUrl, setLogoUrl] = useState(marca.logoUrl ?? "");
  const [heroUrl, setHeroUrl] = useState(marca.heroUrl);
  const [confirmar, setConfirmar] = useState(false);

  const preview = useMemo(
    () => ({
      primario,
      secundario,
      terciario,
      logo: logoUrl.trim() || null,
      hero: heroUrl.trim() || MARCA_OFICIAL.heroUrl,
    }),
    [primario, secundario, terciario, logoUrl, heroUrl],
  );

  return (
    <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)]">
      <div className="flex flex-col gap-8">
        {(mensajeOk || estado.error || mensajeError) && (
          <p role="alert" className={mensajeOk ? "alerta-admin" : alerta} style={mensajeOk ? { color: "var(--titulo)", borderColor: "var(--color-marino)" } : undefined}>
            {mensajeOk ?? estado.error ?? mensajeError}
          </p>
        )}

        <form action={accion} className="flex flex-col gap-6">
          <fieldset className="flex flex-col gap-4">
            <legend className={etiqueta}>Colores de marca</legend>
            <p className={ayuda}>
              Primario = marino (títulos, barra). Secundario = magenta (botones, acentos). Terciario = claro
              (texto sobre magenta). Se aplican como variables CSS en todo el sitio.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className={etiqueta}>
                Primario
                <input
                  type="color"
                  value={primario}
                  onChange={(e) => setPrimario(e.target.value)}
                  className="mt-2 h-11 w-full cursor-pointer border border-borde bg-transparent p-1"
                  aria-label="Color primario"
                />
                <input
                  name="colorPrimario"
                  value={primario}
                  onChange={(e) => setPrimario(e.target.value)}
                  className={campo}
                  pattern="#[0-9A-Fa-f]{6}"
                  required
                />
              </label>
              <label className={etiqueta}>
                Secundario
                <input
                  type="color"
                  value={secundario}
                  onChange={(e) => setSecundario(e.target.value)}
                  className="mt-2 h-11 w-full cursor-pointer border border-borde bg-transparent p-1"
                  aria-label="Color secundario"
                />
                <input
                  name="colorSecundario"
                  value={secundario}
                  onChange={(e) => setSecundario(e.target.value)}
                  className={campo}
                  pattern="#[0-9A-Fa-f]{6}"
                  required
                />
              </label>
              <label className={etiqueta}>
                Terciario
                <input
                  type="color"
                  value={terciario}
                  onChange={(e) => setTerciario(e.target.value)}
                  className="mt-2 h-11 w-full cursor-pointer border border-borde bg-transparent p-1"
                  aria-label="Color terciario"
                />
                <input
                  name="colorTerciario"
                  value={terciario}
                  onChange={(e) => setTerciario(e.target.value)}
                  className={campo}
                  pattern="#[0-9A-Fa-f]{6}"
                  required
                />
              </label>
            </div>
          </fieldset>

          <label className={etiqueta}>
            Logo (opcional)
            <input
              name="logoUrl"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="Vacío = logo SVG oficial · /partners/… o https://"
              className={campo}
            />
            <span className={ayuda}>
              Cuando exista Cloudinary podrás subir el archivo aquí. Por ahora usa una ruta del proyecto o URL.
            </span>
          </label>

          <label className={etiqueta}>
            Imagen del hero (inicio)
            <input
              name="heroUrl"
              value={heroUrl}
              onChange={(e) => setHeroUrl(e.target.value)}
              placeholder="/hero-puerto-2880.webp"
              required
              className={campo}
            />
            <span className={ayuda}>Por defecto: /hero-puerto-2880.webp</span>
          </label>

          <label className="flex items-start gap-2 text-sm text-titulo">
            <input
              type="checkbox"
              name="confirmar"
              checked={confirmar}
              onChange={(e) => setConfirmar(e.target.checked)}
              className="mt-0.5 size-4 accent-magenta"
              required
            />
            <span>
              Confirmo que estos cambios se verán en el sitio público. Si me equivoco, podré deshacer el último
              cambio o restaurar la marca oficial.
            </span>
          </label>

          <button type="submit" disabled={pendiente || !confirmar} className="boton self-start disabled:opacity-50">
            {pendiente ? "Guardando…" : "Aplicar en el sitio"}
          </button>
        </form>

        <div className="flex flex-wrap gap-3 border-t border-borde pt-6">
          <form action={deshacerConfiguracionMarca}>
            <button
              type="submit"
              disabled={!marca.tieneRespaldo}
              className="form-pasos-secundario disabled:opacity-40"
              style={{
                display: "inline-flex",
                alignItems: "center",
                border: "1px solid rgb(17 25 102 / 0.28)",
                borderRadius: 3,
                background: "#fff",
                color: "var(--titulo)",
                padding: "0.75rem 1.15rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: marca.tieneRespaldo ? "pointer" : "not-allowed",
              }}
            >
              Deshacer último cambio
            </button>
          </form>
          <form
            action={restaurarConfiguracionMarca}
            onSubmit={(e) => {
              if (!confirm("¿Restaurar colores, logo y hero oficiales de Talks Portuarios?")) {
                e.preventDefault();
                return;
              }
              const ok = confirm("Última confirmación: el sitio volverá a la marca oficial.");
              if (!ok) e.preventDefault();
            }}
          >
            <input type="hidden" name="confirmar" value="true" />
            <button
              type="submit"
              style={{
                display: "inline-flex",
                alignItems: "center",
                border: "1px solid var(--color-magenta)",
                borderRadius: 3,
                background: "#fff",
                color: "var(--color-magenta)",
                padding: "0.75rem 1.15rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Restaurar marca oficial
            </button>
          </form>
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <p className="text-xs font-semibold tracking-[0.14em] text-titulo uppercase">Vista previa</p>
        <div className="mt-3 overflow-hidden border border-borde" style={{ background: preview.primario }}>
          <div className="flex items-center gap-2 px-3 py-3" style={{ color: preview.terciario }}>
            {preview.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview.logo} alt="" className="h-8 w-auto max-w-[8rem] object-contain" />
            ) : (
              <span className="text-sm font-medium">Logo SVG oficial</span>
            )}
          </div>
          <div className="relative aspect-[16/9] bg-black/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview.hero} alt="" className="absolute inset-0 h-full w-full object-cover" />
          </div>
          <div className="flex gap-2 p-3">
            <span
              className="inline-flex px-3 py-2 text-sm font-medium"
              style={{ background: preview.secundario, color: preview.terciario }}
            >
              Botón
            </span>
            <span className="inline-flex px-3 py-2 text-sm" style={{ color: preview.terciario, opacity: 0.9 }}>
              Acento {preview.secundario}
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}
