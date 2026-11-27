"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import { BotonCerrarSesion } from "@/components/admin/BotonCerrarSesion";
import { NavegacionPanel } from "@/components/admin/NavegacionPanel";
import { Logo } from "@/components/Logo";

/**
 * Menú del panel en móvil: botón + barra lateral a pantalla completa
 * (el <details> anterior expandía la lista sobre el contenido y se veía mal).
 */
export function MenuPanelMovil({ logoUrl }: { logoUrl?: string | null }) {
  const [abierto, setAbierto] = useState(false);
  const ruta = usePathname();
  const panelId = useId();

  useEffect(() => {
    setAbierto(false);
  }, [ruta]);

  useEffect(() => {
    if (!abierto) return;

    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function alTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") setAbierto(false);
    }
    window.addEventListener("keydown", alTecla);

    return () => {
      document.body.style.overflow = anterior;
      window.removeEventListener("keydown", alTecla);
    };
  }, [abierto]);

  return (
    <>
      <style>{`
        .menu-panel-boton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgb(254 253 253 / 0.35);
          border-radius: 0.65rem;
          background: rgb(254 253 253 / 0.06);
          color: var(--color-claro);
          padding: 0.55rem 0.85rem;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
        }
        .menu-panel-boton:hover { background: rgb(254 253 253 / 0.12); }
        .menu-panel-boton:focus-visible {
          outline: 2px solid var(--color-magenta);
          outline-offset: 2px;
        }
        .menu-panel-velo {
          position: fixed;
          inset: 0;
          z-index: 60;
          border: 0;
          padding: 0;
          background: rgb(8 12 40 / 0.55);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.22s ease;
          cursor: pointer;
        }
        .menu-panel-velo.es-abierto {
          opacity: 1;
          pointer-events: auto;
        }
        .menu-panel-drawer {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 70;
          display: flex;
          flex-direction: column;
          width: min(19rem, 88vw);
          height: 100dvh;
          background: var(--color-marino);
          color: var(--color-claro);
          box-shadow: 8px 0 28px rgb(8 12 40 / 0.35);
          transform: translateX(-105%);
          transition: transform 0.22s ease;
          pointer-events: none;
        }
        .menu-panel-drawer.es-abierto {
          transform: translateX(0);
          pointer-events: auto;
        }
        .menu-panel-drawer-cabecera {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          padding: 1.1rem 1rem 0.85rem;
          border-bottom: 1px solid rgb(254 253 253 / 0.12);
        }
        .menu-panel-cerrar {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2.4rem;
          height: 2.4rem;
          flex: none;
          border: 1px solid rgb(254 253 253 / 0.28);
          border-radius: 0.65rem;
          background: rgb(254 253 253 / 0.06);
          color: var(--color-claro);
          font-size: 1.35rem;
          line-height: 1;
          cursor: pointer;
        }
        .menu-panel-cerrar:hover { background: rgb(254 253 253 / 0.12); }
        .menu-panel-cerrar:focus-visible {
          outline: 2px solid var(--color-magenta);
          outline-offset: 2px;
        }
        .menu-panel-drawer-cuerpo {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
        .menu-panel-drawer-pie {
          padding: 0.85rem 0.75rem 1.15rem;
          border-top: 1px solid rgb(254 253 253 / 0.12);
        }
        @media (min-width: 768px) {
          .menu-panel-boton,
          .menu-panel-velo,
          .menu-panel-drawer { display: none !important; }
        }
      `}</style>

      <button
        type="button"
        className="menu-panel-boton"
        aria-expanded={abierto}
        aria-controls={panelId}
        onClick={() => setAbierto(true)}
      >
        Menú
      </button>

      <button
        type="button"
        className={`menu-panel-velo${abierto ? " es-abierto" : ""}`}
        aria-label="Cerrar menú"
        tabIndex={abierto ? 0 : -1}
        onClick={() => setAbierto(false)}
      />

      <div
        id={panelId}
        className={`menu-panel-drawer${abierto ? " es-abierto" : ""}`}
        role="dialog"
        aria-modal={abierto}
        aria-label="Navegación del panel"
        aria-hidden={!abierto}
        inert={!abierto ? true : undefined}
      >
        <div className="menu-panel-drawer-cabecera">
          <Link href="/admin" aria-label="Inicio del panel" className="min-w-0" onClick={() => setAbierto(false)}>
            <Logo claro logoUrl={logoUrl} />
          </Link>
          <button
            type="button"
            className="menu-panel-cerrar"
            aria-label="Cerrar menú"
            onClick={() => setAbierto(false)}
          >
            ×
          </button>
        </div>
        <div className="menu-panel-drawer-cuerpo">
          <NavegacionPanel />
        </div>
        <div className="menu-panel-drawer-pie">
          <BotonCerrarSesion />
        </div>
      </div>
    </>
  );
}
