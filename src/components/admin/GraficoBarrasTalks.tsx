"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { MesTalksPublicados } from "@/services/talks";

/**
 * Barras de Talks publicados por mes (SVG, sin librería).
 * Client Component: el SVG se monta tras hidratar para evitar desajustes
 * del parser HTML con texto/etiquetas del gráfico.
 */
export function GraficoBarrasTalks({
  serie,
  borradores,
  provisionales,
}: {
  serie: MesTalksPublicados[];
  borradores: number;
  provisionales: number;
}) {
  const [listo, setListo] = useState(false);
  useEffect(() => {
    setListo(true);
  }, []);

  const max = Math.max(1, ...serie.map((m) => m.cantidad));
  const altoPlot = 160;
  const anchoBarra = 28;
  const hueco = 14;
  const margenIzq = 28;
  const margenInf = 42;
  const margenSup = 12;
  const ancho = margenIzq + serie.length * (anchoBarra + hueco) + 8;
  const alto = altoPlot + margenInf + margenSup;

  const avisos: string[] = [];
  if (borradores > 0) {
    avisos.push(`${borradores} en borrador`);
  }
  if (provisionales > 0) {
    avisos.push(`${provisionales} publicados con resumen provisional`);
  }

  return (
    <section className="grafico-talks" aria-labelledby="grafico-talks-titulo">
      <style>{`
        .grafico-talks {
          margin-top: 2.25rem;
          padding: 1.25rem 1.15rem 1.35rem;
          border: 1px solid var(--borde);
          border-radius: 0.65rem;
          background: var(--fondo);
        }
        .grafico-talks-cabecera {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          justify-content: space-between;
          gap: 0.65rem 1.25rem;
          margin-bottom: 1rem;
        }
        .grafico-talks-titulo {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--titulo);
        }
        .grafico-talks-aviso {
          margin: 0;
          font-size: 0.8125rem;
          color: color-mix(in srgb, var(--texto) 72%, transparent);
        }
        .grafico-talks-aviso a {
          color: var(--color-magenta);
          font-weight: 500;
          text-decoration: none;
        }
        .grafico-talks-aviso a:hover { text-decoration: underline; }
        .grafico-talks-scroll {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          min-height: ${alto}px;
        }
        .grafico-talks-svg { display: block; min-width: 100%; }
        .grafico-talks-eje { stroke: var(--borde); stroke-width: 1; }
        .grafico-talks-guia { stroke: var(--borde); stroke-width: 1; stroke-dasharray: 3 4; }
        .grafico-talks-barra { fill: var(--color-marino); }
        .grafico-talks-barra.es-cero { fill: color-mix(in srgb, var(--color-marino) 18%, transparent); }
        .grafico-talks-barra.es-pico { fill: var(--color-magenta); }
        .grafico-talks-etiqueta {
          fill: color-mix(in srgb, var(--texto) 70%, transparent);
          font-size: 10px;
          text-anchor: middle;
        }
        .grafico-talks-valor {
          fill: var(--titulo);
          font-size: 11px;
          font-weight: 600;
          text-anchor: middle;
        }
        .grafico-talks-y {
          fill: color-mix(in srgb, var(--texto) 55%, transparent);
          font-size: 10px;
          text-anchor: end;
        }
      `}</style>

      <div className="grafico-talks-cabecera">
        <h2 id="grafico-talks-titulo" className="grafico-talks-titulo">
          Talks publicados por mes
        </h2>
        {avisos.length > 0 ? (
          <p className="grafico-talks-aviso">
            {avisos.join(" · ")} · <Link href="/admin/talks">Ver Talks</Link>
          </p>
        ) : (
          <p className="grafico-talks-aviso">Últimos {serie.length} meses · solo publicados</p>
        )}
      </div>

      <div className="grafico-talks-scroll">
        {listo ? (
          <svg
            className="grafico-talks-svg"
            viewBox={`0 0 ${ancho} ${alto}`}
            role="img"
            aria-label={`Talks publicados por mes. Máximo ${max} en un mes.`}
          >
            {[0, 0.5, 1].map((frac) => {
              const y = margenSup + altoPlot * (1 - frac);
              const valor = Math.round(max * frac);
              return (
                <g key={frac}>
                  <line className="grafico-talks-guia" x1={margenIzq} x2={ancho - 4} y1={y} y2={y} />
                  <text className="grafico-talks-y" x={margenIzq - 6} y={y + 3}>
                    {valor}
                  </text>
                </g>
              );
            })}
            <line
              className="grafico-talks-eje"
              x1={margenIzq}
              x2={ancho - 4}
              y1={margenSup + altoPlot}
              y2={margenSup + altoPlot}
            />

            {serie.map((mes, i) => {
              const x = margenIzq + hueco / 2 + i * (anchoBarra + hueco);
              const h = (mes.cantidad / max) * (altoPlot - 4);
              const y = margenSup + altoPlot - h;
              const esPico = mes.cantidad === max && mes.cantidad > 0;
              const clase =
                mes.cantidad === 0
                  ? "grafico-talks-barra es-cero"
                  : esPico
                    ? "grafico-talks-barra es-pico"
                    : "grafico-talks-barra";
              const descripcion = `${mes.etiqueta}: ${mes.cantidad} ${mes.cantidad === 1 ? "Talk" : "Talks"}`;
              return (
                <g key={mes.clave}>
                  <rect
                    className={clase}
                    x={x}
                    y={mes.cantidad === 0 ? margenSup + altoPlot - 3 : y}
                    width={anchoBarra}
                    height={mes.cantidad === 0 ? 3 : h}
                    rx={3}
                    aria-label={descripcion}
                  />
                  {mes.cantidad > 0 ? (
                    <text className="grafico-talks-valor" x={x + anchoBarra / 2} y={y - 6}>
                      {mes.cantidad}
                    </text>
                  ) : null}
                  <text
                    className="grafico-talks-etiqueta"
                    x={x + anchoBarra / 2}
                    y={margenSup + altoPlot + 16}
                    transform={`rotate(-35 ${x + anchoBarra / 2} ${margenSup + altoPlot + 16})`}
                  >
                    {mes.etiqueta}
                  </text>
                </g>
              );
            })}
          </svg>
        ) : (
          <p className="grafico-talks-aviso" style={{ marginTop: "0.5rem" }}>
            Cargando gráfico…
          </p>
        )}
      </div>
    </section>
  );
}
