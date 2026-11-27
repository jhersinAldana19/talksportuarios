"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

/**
 * Modal de confirmación reutilizable (panel).
 * Usa <dialog> nativo + botones del kit (.boton / secundario).
 */
export function ModalConfirmacion({
  abierto,
  titulo,
  descripcion,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
  peligro = false,
  pendiente = false,
  onCancelar,
  onConfirmar,
  children,
}: {
  abierto: boolean;
  titulo: string;
  descripcion?: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  /** Resalta la acción (p. ej. salir / eliminar). */
  peligro?: boolean;
  pendiente?: boolean;
  onCancelar: () => void;
  onConfirmar: () => void;
  children?: ReactNode;
}) {
  const dialogoRef = useRef<HTMLDialogElement>(null);
  const tituloId = useId();
  const descId = useId();

  useEffect(() => {
    const nodo = dialogoRef.current;
    if (!nodo) return;
    if (abierto && !nodo.open) nodo.showModal();
    if (!abierto && nodo.open) nodo.close();
  }, [abierto]);

  return (
    <dialog
      ref={dialogoRef}
      className="modal-confirmacion"
      aria-labelledby={tituloId}
      aria-describedby={descripcion ? descId : undefined}
      onClose={onCancelar}
      onClick={(evento) => {
        if (evento.target === dialogoRef.current) onCancelar();
      }}
    >
      <style>{`
        .modal-confirmacion {
          margin: auto;
          padding: 0;
          border: 1px solid var(--borde);
          border-radius: 0.75rem;
          background: var(--superficie);
          color: var(--texto);
          width: min(100% - 2rem, 26rem);
          box-shadow: 0 18px 48px rgb(17 25 102 / 0.18);
        }
        .modal-confirmacion::backdrop {
          background: rgb(17 25 102 / 0.45);
        }
        .modal-confirmacion-cuerpo {
          padding: 1.35rem 1.35rem 1.15rem;
        }
        .modal-confirmacion-titulo {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: var(--titulo);
        }
        .modal-confirmacion-desc {
          margin: 0.65rem 0 0;
          font-size: 0.9375rem;
          line-height: 1.5;
          color: color-mix(in srgb, var(--texto) 78%, transparent);
        }
        .modal-confirmacion-extra { margin-top: 1rem; }
        .modal-confirmacion-acciones {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 0.65rem;
          padding: 0 1.35rem 1.35rem;
        }
        .modal-confirmacion-secundario {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgb(17 25 102 / 0.22);
          border-radius: 3px;
          background: #ffffff;
          color: var(--titulo);
          padding: 0.85rem 1.25rem;
          font-size: 0.9375rem;
          font-weight: 500;
          cursor: pointer;
        }
        .dark .modal-confirmacion-secundario {
          background: var(--superficie);
          border-color: rgb(254 253 253 / 0.22);
        }
        .modal-confirmacion-secundario:hover { border-color: var(--color-marino); }
        .modal-confirmacion-secundario:focus-visible {
          outline: 2px solid var(--color-magenta);
          outline-offset: 2px;
        }
        .modal-confirmacion-peligro {
          background: var(--color-magenta);
        }
        .modal-confirmacion-peligro:hover {
          background: var(--color-magenta-oscuro);
        }
      `}</style>

      <div className="modal-confirmacion-cuerpo">
        <h2 id={tituloId} className="modal-confirmacion-titulo">
          {titulo}
        </h2>
        {descripcion ? (
          <p id={descId} className="modal-confirmacion-desc">
            {descripcion}
          </p>
        ) : null}
        {children ? <div className="modal-confirmacion-extra">{children}</div> : null}
      </div>

      <div className="modal-confirmacion-acciones">
        <button type="button" className="modal-confirmacion-secundario" onClick={onCancelar} disabled={pendiente}>
          {textoCancelar}
        </button>
        <button
          type="button"
          className={`boton${peligro ? " modal-confirmacion-peligro" : ""}`}
          onClick={onConfirmar}
          disabled={pendiente}
        >
          {pendiente ? "Espere…" : textoConfirmar}
        </button>
      </div>
    </dialog>
  );
}
