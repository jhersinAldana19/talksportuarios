import type { Metadata } from "next";

// El panel lee la sesión y la base. No hereda ensureStatic del sitio público
// (ese layout está en (public)). instant = false: no exigimos navegación instantánea.
export const instant = false;

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function LayoutAdmin({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Kit compartido (público + panel): también en globals.css; aquí por si Turbopack sirve CSS viejo. */}
      <style>{`
        .etiqueta-admin {
          display: block;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--titulo);
        }
        .campo-admin {
          display: block;
          margin-top: 0.5rem;
          width: 100%;
          box-sizing: border-box;
          border: 1px solid rgb(17 25 102 / 0.18);
          border-radius: 0.65rem;
          background-color: #eef0f8;
          color: var(--texto);
          padding: 0.75rem 0.9rem;
          font-size: 0.875rem;
          font-weight: 400;
          letter-spacing: 0;
          text-transform: none;
          line-height: 1.4;
          outline: none;
          box-shadow: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
        }
        .dark .campo-admin {
          background-color: color-mix(in srgb, var(--brand-terciario) 8%, transparent);
          border-color: rgb(254 253 253 / 0.22);
          box-shadow: none;
        }
        .campo-admin::placeholder {
          color: color-mix(in srgb, var(--texto) 42%, transparent);
        }
        .campo-admin:hover {
          border-color: rgb(17 25 102 / 0.35);
          background-color: #e8ebf6;
        }
        .dark .campo-admin:hover {
          border-color: rgb(254 253 253 / 0.4);
          background-color: color-mix(in srgb, var(--brand-terciario) 12%, transparent);
        }
        .campo-admin:focus-visible {
          border-color: var(--color-marino);
          background-color: #ffffff;
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-magenta) 28%, transparent);
        }
        .dark .campo-admin:focus-visible {
          background-color: color-mix(in srgb, var(--brand-terciario) 10%, transparent);
        }
        .campo-admin:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .formulario-corto {
          width: 100%;
          max-width: 20rem;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 1.25rem;
        }
        .formulario-corto .boton {
          width: auto;
          align-self: flex-start;
        }
        .formulario-login {
          width: 100%;
          max-width: none;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 1.25rem;
        }
        .formulario-login .boton {
          width: 100%;
          align-self: stretch;
        }
        .formulario-corto.es-duo {
          max-width: 42rem;
        }
        .formulario-corto-duo {
          display: grid;
          gap: 1.25rem;
        }
        @media (min-width: 640px) {
          .formulario-corto-duo {
            grid-template-columns: 1fr 1fr;
            align-items: start;
          }
        }
        .formulario-corto-duo > div {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          min-width: 0;
        }
        .campo-contrasena {
          position: relative;
          margin-top: 0.5rem;
        }
        .campo-contrasena .campo-admin {
          margin-top: 0;
          padding-right: 2.75rem;
        }
        .campo-contrasena-ojo {
          position: absolute;
          top: 50%;
          right: 0.35rem;
          transform: translateY(-50%);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2.25rem;
          height: 2.25rem;
          border: 0;
          border-radius: 0.45rem;
          background: transparent;
          color: color-mix(in srgb, var(--texto) 62%, transparent);
          cursor: pointer;
        }
        .campo-contrasena-ojo:hover {
          color: var(--titulo);
          background: color-mix(in srgb, var(--brand-primario) 6%, transparent);
        }
        .campo-contrasena-ojo:focus-visible {
          outline: 2px solid var(--color-magenta);
          outline-offset: 1px;
        }
        textarea.campo-admin {
          min-height: 7rem;
          resize: vertical;
          line-height: 1.55;
        }
        select.campo-admin {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23111966' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.85rem center;
          background-size: 0.75rem;
          padding-right: 2.35rem;
        }
        .dark select.campo-admin {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23fefdfd' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
        }
        .ayuda-admin {
          display: block;
          margin-top: 0.45rem;
          font-size: 0.8125rem;
          font-weight: 400;
          letter-spacing: 0;
          text-transform: none;
          line-height: 1.45;
          color: color-mix(in srgb, var(--texto) 68%, transparent);
        }
        .alerta-admin {
          border-left: 2px solid var(--color-magenta);
          padding: 0.65rem 0.85rem;
          font-size: 0.875rem;
          color: var(--color-magenta);
          background: color-mix(in srgb, var(--color-magenta) 6%, #ffffff);
        }
      `}</style>
      {children}
    </>
  );
}
