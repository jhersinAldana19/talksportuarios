"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { esHostNextImage } from "@/lib/imagenes";
import type { DestacadoSlide } from "@/services/destacados";

const INTERVALO_MS = 6000;

export function DestacadosCarruselCliente({ slides }: { slides: DestacadoSlide[] }) {
  const baseId = useId();
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [hover, setHover] = useState(false);
  const [reducirMovimiento, setReducirMovimiento] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    function sync() {
      setReducirMovimiento(media.matches);
    }
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (slides.length < 2 || pausado || hover || reducirMovimiento) return;
    const id = window.setInterval(() => {
      setIndice((i) => (i + 1) % slides.length);
    }, INTERVALO_MS);
    return () => window.clearInterval(id);
  }, [slides.length, pausado, hover, reducirMovimiento]);

  if (slides.length === 0) return null;

  const actual = slides[indice] ?? slides[0];

  function ir(delta: number) {
    setIndice((i) => (i + delta + slides.length) % slides.length);
  }

  return (
    <div
      className="destacados"
      role="region"
      aria-roledescription="carrusel"
      aria-label="Destacados"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <style>{`
        .destacados { position: relative; }
        .destacados-escenario {
          position: relative;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background: var(--color-marino);
        }
        .destacados-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.45s ease;
        }
        .destacados-slide.es-activa {
          opacity: 1;
          pointer-events: auto;
        }
        @media (prefers-reduced-motion: reduce) {
          .destacados-slide { transition: none; }
        }
        .destacados-media {
          object-fit: cover;
        }
        .destacados-media.es-logo {
          object-fit: contain;
          object-position: center;
          background: var(--color-claro);
          padding: 12% 16%;
        }
        .destacados-capa {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.85rem;
          padding: 1.15rem 1.15rem 1.25rem;
          background: rgb(17 25 102 / 0.82);
          color: var(--color-claro);
        }
        .destacados-titulo {
          margin: 0;
          max-width: 36rem;
          font-size: 1.15rem;
          font-weight: 500;
          line-height: 1.3;
          letter-spacing: -0.02em;
        }
        .destacados-etiqueta {
          font-size: 0.8rem;
          color: var(--color-magenta);
        }
        .destacados-controles {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          margin-top: 0.75rem;
        }
        .destacados-flechas {
          display: flex;
          gap: 0.35rem;
        }
        .destacados-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 2.5rem;
          height: 2.5rem;
          border: 1px solid var(--borde);
          background: var(--superficie);
          color: var(--titulo);
          cursor: pointer;
          padding: 0 0.65rem;
          font: inherit;
          font-size: 0.85rem;
        }
        .destacados-btn:hover { border-color: var(--color-marino); }
        .destacados-btn:focus-visible {
          outline: 2px solid var(--color-magenta);
          outline-offset: 2px;
        }
        .destacados-puntos {
          display: flex;
          gap: 0.4rem;
          align-items: center;
        }
        .destacados-punto {
          width: 0.55rem;
          height: 0.55rem;
          border: 0;
          border-radius: 0;
          background: var(--borde);
          cursor: pointer;
          padding: 0;
        }
        .destacados-punto.es-activo { background: var(--color-marino); }
        .destacados-punto:focus-visible {
          outline: 2px solid var(--color-magenta);
          outline-offset: 2px;
        }
        @media (min-width: 640px) {
          .destacados-capa { padding: 1.35rem 1.5rem 1.5rem; }
          .destacados-titulo { font-size: 1.35rem; }
        }
      `}</style>

      <div className="destacados-escenario">
        {slides.map((slide, i) => {
          const activa = i === indice;
          const esLogo =
            slide.imagen.includes("/partners/") ||
            (!slide.imagenExterna && !slide.imagen.includes("hero-puerto"));
          return (
            <div
              key={slide.id}
              id={`${baseId}-slide-${i}`}
              className={`destacados-slide${activa ? " es-activa" : ""}`}
              role="group"
              aria-roledescription="diapositiva"
              aria-label={`${i + 1} de ${slides.length}`}
              aria-hidden={!activa}
            >
              {esHostNextImage(slide.imagen) ? (
                <Image
                  src={slide.imagen}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  priority={i === 0}
                  className={`destacados-media${esLogo ? " es-logo" : ""}`}
                />
              ) : (
                // URL externa (p. ej. pegada desde el panel): no pasa por next/image.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={slide.imagen}
                  alt=""
                  className={`destacados-media${esLogo ? " es-logo" : ""}`}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                />
              )}
              <div className="destacados-capa">
                {slide.patrocinado && <span className="destacados-etiqueta">Patrocinado</span>}
                <p className="destacados-titulo">{slide.titulo}</p>
                {slide.externo ? (
                  <a href={slide.href} target="_blank" rel="noopener" className="boton">
                    {slide.cta}
                  </a>
                ) : (
                  <Link href={slide.href} className="boton">
                    {slide.cta}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {slides.length > 1 && (
        <div className="destacados-controles">
          <div className="destacados-flechas">
            <button type="button" className="destacados-btn" onClick={() => ir(-1)} aria-label="Anterior">
              ‹
            </button>
            <button type="button" className="destacados-btn" onClick={() => ir(1)} aria-label="Siguiente">
              ›
            </button>
            {!reducirMovimiento && (
              <button
                type="button"
                className="destacados-btn"
                onClick={() => setPausado((p) => !p)}
                aria-pressed={pausado}
                aria-label={pausado ? "Reanudar carrusel" : "Pausar carrusel"}
              >
                {pausado ? "Reanudar" : "Pausa"}
              </button>
            )}
          </div>
          <div className="destacados-puntos" role="tablist" aria-label="Diapositivas">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={i === indice}
                aria-controls={`${baseId}-slide-${i}`}
                className={`destacados-punto${i === indice ? " es-activo" : ""}`}
                onClick={() => setIndice(i)}
                aria-label={`Ir a diapositiva ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {actual.titulo}
      </p>
    </div>
  );
}
