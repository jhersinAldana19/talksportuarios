import Link from "next/link";
import { Suspense } from "react";
import { BotonTema } from "@/components/BotonTema";
import { BotonCerrarSesion } from "@/components/admin/BotonCerrarSesion";
import { MenuPanelMovil } from "@/components/admin/MenuPanelMovil";
import { NavegacionPanel } from "@/components/admin/NavegacionPanel";
import { Logo } from "@/components/Logo";
import { exigirAdmin } from "@/lib/sesion";
import { obtenerAdminPorId } from "@/services/admins";
import { obtenerMarca } from "@/services/configuracion";

export default function LayoutPanel({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className="px-4 py-6 text-texto">Cargando panel…</p>}>
      <MarcoPanel>{children}</MarcoPanel>
    </Suspense>
  );
}

async function MarcoPanel({ children }: { children: React.ReactNode }) {
  const [sesion, marca] = await Promise.all([exigirAdmin(), obtenerMarca()]);
  const admin = sesion.user.id ? await obtenerAdminPorId(sesion.user.id) : null;
  const nombreVisible = admin?.nombre ?? sesion.user.name ?? "administrador";

  return (
    <div className="marco-panel">
      <style>{`
        .marco-panel { min-height: 100dvh; background: var(--fondo); }
        .barra-panel { background: var(--color-marino); color: var(--color-claro); }
        .barra-escritorio { display: none; }
        .barra-panel-cabecera {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          padding: 1.1rem 1rem 0.85rem;
        }
        .barra-panel-pie {
          margin-top: auto;
          padding: 0.85rem 0.75rem 1.15rem;
          border-top: 1px solid rgb(254 253 253 / 0.12);
        }
        .zona-panel { display: flex; min-height: 100dvh; flex-direction: column; }
        .barra-bienvenida {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          position: sticky;
          top: 0;
          z-index: 20;
          background: var(--superficie);
          border-bottom: 1px solid var(--borde);
          padding: 0.75rem 1rem;
        }
        .barra-bienvenida p {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 0.875rem;
        }
        .tabla-marco {
          margin-top: 2rem;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .tabla-panel {
          width: 100%;
          min-width: 0;
          border-collapse: collapse;
          background: var(--superficie);
          border: 1px solid var(--borde);
        }
        .tabla-panel th {
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--titulo);
          background: var(--suave);
          padding: 0.7rem 0.9rem;
          border-bottom: 1px solid var(--borde);
        }
        .tabla-panel td {
          padding: 0.8rem 0.9rem;
          border-bottom: 1px solid var(--borde);
          vertical-align: middle;
          color: var(--texto);
        }
        .tabla-panel tr:last-child td { border-bottom: 0; }
        .tabla-panel th.num, .tabla-panel td.num { text-align: right; white-space: nowrap; }
        .tabla-acciones { display: flex; justify-content: flex-end; align-items: center; gap: 0.35rem; }
        .accion-tabla {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          min-width: 2.25rem;
          height: 2.25rem;
          padding: 0 0.55rem;
          border: 1px solid rgb(17 25 102 / 0.16);
          border-radius: 3px;
          background: #ffffff;
          color: var(--titulo);
          font: inherit;
          font-size: 0.75rem;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
        }
        .dark .accion-tabla {
          background: var(--superficie);
          border-color: rgb(254 253 253 / 0.18);
        }
        .accion-tabla:hover {
          border-color: var(--color-marino);
          background: var(--fondo);
        }
        .accion-tabla:focus-visible {
          outline: 2px solid var(--color-magenta);
          outline-offset: 2px;
        }
        .accion-tabla.es-peligro { color: var(--color-magenta); }
        .accion-tabla.es-peligro:hover {
          border-color: var(--color-magenta);
          background: color-mix(in srgb, var(--color-magenta) 8%, #ffffff);
        }
        .accion-tabla.es-exito { color: var(--color-marino); }
        .icono-accion-svg { width: 1.05rem; height: 1.05rem; flex: none; }
        .accion-tabla-texto { display: none; }
        .zona-contenido {
          padding: 1rem 0.75rem 2rem;
          overflow-x: clip;
        }
        .marco-modulo {
          background: #ffffff;
          border: 1px solid rgb(17 25 102 / 0.12);
          border-radius: 0.65rem;
          padding: 1.1rem 0.95rem 1.5rem;
          box-shadow: 0 1px 3px rgb(17 25 102 / 0.05);
        }
        .dark .marco-modulo {
          background: var(--superficie);
          border-color: rgb(254 253 253 / 0.12);
          box-shadow: none;
        }
        .marco-modulo .tabla-panel {
          background: transparent;
          border: 0;
        }
        .marco-modulo .tabla-marco {
          margin-top: 1.5rem;
          border: 1px solid var(--borde);
          border-radius: 3px;
          overflow-x: auto;
        }
        .marco-modulo .ficha {
          background: var(--fondo);
        }
        @media (min-width: 768px) {
          .marco-panel { display: flex; }
          .barra-panel {
            position: sticky;
            top: 0;
            display: flex;
            flex-direction: column;
            width: 17rem;
            height: 100dvh;
            flex: none;
          }
          .barra-escritorio { display: flex; flex: 1; flex-direction: column; min-height: 0; }
          .barra-movil { display: none; }
          .zona-panel { flex: 1; min-width: 0; min-height: 100dvh; }
          .barra-bienvenida { padding: 1rem 2rem; }
          .barra-bienvenida p { font-size: 1rem; }
          .zona-contenido { padding: 1.75rem 2rem 2.75rem; }
          .marco-modulo { padding: 1.75rem 1.85rem 2.1rem; border-radius: 3px; }
          .tabla-panel { min-width: 32rem; }
        }
      `}</style>
      <aside className="barra-panel">
        <div className="barra-panel-cabecera barra-movil">
          <Link href="/admin" aria-label="Inicio del panel" className="min-w-0">
            <Logo claro logoUrl={marca.logoUrl} />
          </Link>
          <MenuPanelMovil logoUrl={marca.logoUrl} />
        </div>
        <div className="barra-escritorio">
          <div className="barra-panel-cabecera">
            <Link href="/admin" aria-label="Inicio del panel" className="min-w-0">
              <Logo claro logoUrl={marca.logoUrl} />
            </Link>
          </div>
          <NavegacionPanel />
          <div className="barra-panel-pie">
            <BotonCerrarSesion />
          </div>
        </div>
      </aside>
      <div className="zona-panel">
        <header className="barra-bienvenida">
          <p className="text-texto">
            Bienvenido, <span className="font-medium text-titulo">{nombreVisible}</span>
          </p>
          <BotonTema />
        </header>
        <div className="zona-contenido">
          <div className="marco-modulo">{children}</div>
        </div>
      </div>
    </div>
  );
}
