"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ENLACES_PANEL } from "@/components/admin/enlaces-panel";
import {
  IconoConfiguracion,
  IconoDestacados,
  IconoEventos,
  IconoInicio,
  IconoInvitados,
  IconoPartners,
  IconoTalks,
  IconoVerSitio,
} from "@/components/admin/iconos-panel";

const ICONOS = {
  inicio: IconoInicio,
  talks: IconoTalks,
  invitados: IconoInvitados,
  eventos: IconoEventos,
  partners: IconoPartners,
  destacados: IconoDestacados,
  configuracion: IconoConfiguracion,
  sitio: IconoVerSitio,
} as const;

export function NavegacionPanel() {
  const ruta = usePathname();

  return (
    <nav aria-label="Panel" className="nav-panel">
      <style>{`
        .nav-panel {
          padding: 0.35rem 0.75rem 0.75rem;
        }
        .nav-panel ul {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .nav-panel a {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.7rem 0.85rem;
          border-radius: 0.6rem;
          color: rgb(254 253 253 / 0.88);
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .nav-panel a:hover {
          background: rgb(254 253 253 / 0.1);
          color: var(--color-claro);
        }
        .nav-panel a[aria-current="page"] {
          background: rgb(254 253 253 / 0.12);
          color: var(--color-claro);
          box-shadow: inset 3px 0 0 var(--color-magenta);
        }
        .nav-panel a:focus-visible {
          outline: 2px solid var(--color-magenta);
          outline-offset: 2px;
        }
        .nav-panel-icono {
          display: inline-flex;
          width: 1.15rem;
          height: 1.15rem;
          flex: none;
          opacity: 0.9;
        }
        .nav-panel-sep {
          height: 1px;
          margin: 0.45rem 0.35rem;
          background: rgb(254 253 253 / 0.14);
        }
      `}</style>
      <ul>
        {ENLACES_PANEL.map((enlace) => {
          const activo =
            enlace.href === "/"
              ? false
              : enlace.href === "/admin"
                ? ruta === "/admin"
                : ruta.startsWith(enlace.href);
          const Icono = ICONOS[enlace.id];
          const esSitio = enlace.id === "sitio";
          return (
            <li key={enlace.href}>
              {esSitio ? <div className="nav-panel-sep" role="separator" /> : null}
              <Link
                href={enlace.href}
                aria-current={activo ? "page" : undefined}
                {...(esSitio ? { target: "_blank", rel: "noopener" } : {})}
              >
                <span className="nav-panel-icono">
                  <Icono />
                </span>
                {enlace.texto}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
