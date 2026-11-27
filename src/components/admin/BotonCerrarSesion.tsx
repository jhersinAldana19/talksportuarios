"use client";

import { useTransition, useState } from "react";
import { cerrarSesion } from "@/app/admin/actions";
import { ModalConfirmacion } from "@/components/admin/ModalConfirmacion";
import { IconoSalir } from "@/components/admin/iconos-panel";

/** Cierre de sesión con modal de confirmación (usa .boton del kit). */
export function BotonCerrarSesion() {
  const [abierto, setAbierto] = useState(false);
  const [pendiente, startTransition] = useTransition();

  function confirmar() {
    startTransition(async () => {
      await cerrarSesion();
    });
  }

  return (
    <>
      <style>{`
        .boton-cerrar-sesion {
          display: inline-flex;
          width: 100%;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
          border: 1px solid rgb(254 253 253 / 0.28);
          border-radius: 0.65rem;
          background: rgb(254 253 253 / 0.06);
          color: var(--color-claro);
          padding: 0.7rem 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .boton-cerrar-sesion:hover {
          background: rgb(254 253 253 / 0.12);
          border-color: rgb(254 253 253 / 0.45);
        }
        .boton-cerrar-sesion:focus-visible {
          outline: 2px solid var(--color-magenta);
          outline-offset: 2px;
        }
        .boton-cerrar-sesion-icono {
          display: inline-flex;
          width: 1.05rem;
          height: 1.05rem;
          flex: none;
        }
      `}</style>

      <button type="button" className="boton-cerrar-sesion" onClick={() => setAbierto(true)}>
        <span className="boton-cerrar-sesion-icono" aria-hidden="true">
          <IconoSalir />
        </span>
        Salir
      </button>

      <ModalConfirmacion
        abierto={abierto}
        titulo="Cerrar sesión"
        descripcion="Vas a salir del panel. Para volver a entrar necesitarás tu correo y contraseña."
        textoConfirmar="Cerrar sesión"
        textoCancelar="Cancelar"
        peligro
        pendiente={pendiente}
        onCancelar={() => {
          if (!pendiente) setAbierto(false);
        }}
        onConfirmar={confirmar}
      />
    </>
  );
}
