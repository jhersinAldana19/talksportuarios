"use client";

import { useState } from "react";
import { TalkCard, type TalkResumen } from "./TalkCard";
import { ETIQUETA_SERIE } from "@/lib/formato";
import type { Serie } from "@/generated/prisma/enums";

// Todos los Talks llegan renderizados en el HTML (SEO); el filtro solo oculta/muestra en el navegador.
export function ListaTalksFiltrable({ talks }: { talks: TalkResumen[] }) {
  const [serie, setSerie] = useState<Serie | "TODAS">("TODAS");

  const seriesPresentes = (Object.keys(ETIQUETA_SERIE) as Serie[]).filter((s) =>
    talks.some((t) => t.serie === s),
  );
  const opciones: { valor: Serie | "TODAS"; texto: string; cantidad: number }[] = [
    { valor: "TODAS", texto: "Todas", cantidad: talks.length },
    ...seriesPresentes.map((s) => ({
      valor: s,
      texto: ETIQUETA_SERIE[s],
      cantidad: talks.filter((t) => t.serie === s).length,
    })),
  ];

  return (
    <div className="space-y-6">
      <div role="group" aria-label="Filtrar por serie" className="flex flex-wrap gap-2">
        {opciones.map((o) => {
          const activa = serie === o.valor;
          return (
            <button
              key={o.valor}
              type="button"
              onClick={() => setSerie(o.valor)}
              aria-pressed={activa}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                activa
                  ? "bg-marino text-white dark:bg-magenta"
                  : "bg-superficie text-titulo ring-1 ring-borde hover:bg-suave"
              }`}
            >
              {o.texto} <span className={activa ? "text-white/70" : "text-titulo/50"}>({o.cantidad})</span>
            </button>
          );
        })}
      </div>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {talks.map((t, i) => (
          <li key={t.slug} hidden={serie !== "TODAS" && t.serie !== serie} className="flex">
            <TalkCard talk={t} prioridad={i < 3} />
          </li>
        ))}
      </ul>
    </div>
  );
}
