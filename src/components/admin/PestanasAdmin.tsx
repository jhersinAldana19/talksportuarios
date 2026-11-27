"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export type PestanaAdmin = {
  href: string;
  texto: string;
  descripcion?: string;
  icono?: ReactNode;
};

/**
 * Menú lateral de secciones (estilo ajustes: lista vertical a la izquierda).
 * Tema claro del panel — no fuerza fondo oscuro.
 */
export function PestanasAdmin({
  pestanas,
  ariaLabel = "Secciones",
}: {
  pestanas: readonly PestanaAdmin[];
  ariaLabel?: string;
}) {
  const ruta = usePathname();

  return (
    <nav aria-label={ariaLabel} className="menu-secciones">
      <style>{`
        .menu-secciones {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 0.35rem;
          border: 1px solid var(--borde);
          border-radius: 0.75rem;
          background: var(--fondo);
        }
        .menu-secciones a {
          display: flex;
          align-items: flex-start;
          gap: 0.7rem;
          padding: 0.7rem 0.8rem;
          border-radius: 0.55rem;
          color: var(--texto);
          text-decoration: none;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .menu-secciones a:hover {
          background: color-mix(in srgb, var(--brand-primario) 6%, #ffffff);
          color: var(--titulo);
        }
        .dark .menu-secciones a:hover {
          background: color-mix(in srgb, var(--brand-terciario) 8%, transparent);
        }
        .menu-secciones a[aria-current="page"] {
          background: #ffffff;
          color: var(--titulo);
          box-shadow: 0 1px 2px rgb(17 25 102 / 0.06);
        }
        .dark .menu-secciones a[aria-current="page"] {
          background: color-mix(in srgb, var(--brand-terciario) 10%, transparent);
          box-shadow: none;
        }
        .menu-secciones a:focus-visible {
          outline: 2px solid var(--color-magenta);
          outline-offset: 2px;
        }
        .menu-secciones-icono {
          display: inline-flex;
          flex: none;
          width: 1.15rem;
          height: 1.15rem;
          margin-top: 0.1rem;
          color: var(--titulo);
          opacity: 0.85;
        }
        .menu-secciones-texto {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          min-width: 0;
        }
        .menu-secciones-titulo {
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: 0.01em;
          line-height: 1.25;
        }
        .menu-secciones-desc {
          font-size: 0.75rem;
          font-weight: 400;
          line-height: 1.35;
          color: color-mix(in srgb, var(--texto) 68%, transparent);
        }
      `}</style>
      {pestanas.map((p) => {
        const activa = ruta === p.href || ruta.startsWith(`${p.href}/`);
        return (
          <Link key={p.href} href={p.href} aria-current={activa ? "page" : undefined}>
            {p.icono ? <span className="menu-secciones-icono" aria-hidden="true">{p.icono}</span> : null}
            <span className="menu-secciones-texto">
              <span className="menu-secciones-titulo">{p.texto}</span>
              {p.descripcion ? <span className="menu-secciones-desc">{p.descripcion}</span> : null}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
