"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export type PasoFormulario = {
  id: string;
  titulo: string;
  contenido: ReactNode;
};

/**
 * Asistente por pasos dentro de un <form>. Todos los campos permanecen en el DOM
 * (el envío incluye todo); solo se muestra el paso activo.
 */
export function FormularioPasos({
  pasos,
  error,
  pendiente,
  textoEnviar = "Guardar",
  compacto = false,
  children,
}: {
  pasos: PasoFormulario[];
  error?: string;
  pendiente: boolean;
  textoEnviar?: string;
  /** Campos cortos (nombre, correo, contraseña): ~20rem. */
  compacto?: boolean;
  /** Campos ocultos u otros bloques fijos (vista previa, etc.). */
  children?: ReactNode;
}) {
  const baseId = useId();
  const raizRef = useRef<HTMLDivElement>(null);
  const [indice, setIndice] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const total = pasos.length;
  const esUltimo = indice >= total - 1;

  function validarPaso(i: number): boolean {
    const caja = refs.current[i];
    if (!caja) return true;
    const campos = caja.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "input, select, textarea",
    );
    for (const campo of campos) {
      if (campo.disabled || campo.type === "hidden") continue;
      if (!campo.checkValidity()) {
        campo.reportValidity();
        return false;
      }
    }
    return true;
  }

  useEffect(() => {
    const form = raizRef.current?.closest("form");
    if (!form) return;

    function alEnviar(evento: Event) {
      for (let i = 0; i < total; i++) {
        if (!validarPaso(i)) {
          evento.preventDefault();
          setIndice(i);
          return;
        }
      }
    }

    form.addEventListener("submit", alEnviar);
    return () => form.removeEventListener("submit", alEnviar);
  }, [total]);

  function irSiguiente() {
    if (!validarPaso(indice)) return;
    setIndice((v) => Math.min(v + 1, total - 1));
  }

  function irAtras() {
    setIndice((v) => Math.max(v - 1, 0));
  }

  function enviarFormulario() {
    const form = raizRef.current?.closest("form");
    form?.requestSubmit();
  }

  return (
    <div className={`form-pasos${compacto ? " es-compacto" : ""}`} ref={raizRef}>
      <style>{`
        .form-pasos { margin-top: 1.75rem; }
        .form-pasos-progreso {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1.15rem;
          border-bottom: 1px solid var(--borde);
        }
        .form-pasos-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          border: 1px solid var(--borde);
          background: var(--fondo);
          color: var(--texto);
          padding: 0.4rem 0.7rem;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.02em;
          cursor: pointer;
        }
        .form-pasos-pill.es-activo {
          border-color: var(--color-marino);
          background: #ffffff;
          color: var(--titulo);
          box-shadow: 0 1px 2px rgb(17 25 102 / 0.06);
        }
        .dark .form-pasos-pill.es-activo { background: var(--superficie); }
        .form-pasos-pill.es-hecho { color: var(--titulo); }
        .form-pasos-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 999px;
          background: rgb(17 25 102 / 0.1);
          color: var(--titulo);
          font-size: 0.7rem;
          font-weight: 600;
        }
        .form-pasos-pill.es-activo .form-pasos-num {
          background: var(--color-marino);
          color: var(--color-claro);
        }
        .form-pasos-cuerpo { display: flex; flex-direction: column; gap: 1.35rem; max-width: 42rem; }
        .form-pasos.es-compacto .form-pasos-cuerpo { max-width: 20rem; width: 100%; }
        .form-pasos.es-compacto .form-pasos-nav .boton { width: auto; align-self: flex-start; }
        .form-pasos-panel[hidden] { display: none !important; }
        .form-pasos-nav {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.75rem;
          margin-top: 1.75rem;
          padding-top: 1.25rem;
          border-top: 1px solid var(--borde);
        }
        .form-pasos-secundario {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgb(17 25 102 / 0.28);
          border-radius: 3px;
          background: #ffffff;
          color: var(--titulo);
          padding: 0.75rem 1.15rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
        }
        .dark .form-pasos-secundario {
          background: var(--superficie);
          border-color: rgb(254 253 253 / 0.22);
        }
        .form-pasos-secundario:hover { border-color: var(--color-marino); }
        .form-pasos-secundario:focus-visible {
          outline: 2px solid var(--color-magenta);
          outline-offset: 2px;
        }
        .form-pasos-hint { font-size: 0.8125rem; color: color-mix(in srgb, var(--texto) 68%, transparent); }
      `}</style>

      {error && (
        <p role="alert" className="alerta-admin" style={{ marginBottom: "1.25rem" }}>
          {error}
        </p>
      )}

      <div className="form-pasos-progreso" role="tablist" aria-label="Pasos del formulario">
        {pasos.map((paso, i) => {
          const activo = i === indice;
          const hecho = i < indice;
          return (
            <button
              key={paso.id}
              type="button"
              role="tab"
              aria-selected={activo}
              aria-controls={`${baseId}-paso-${i}`}
              className={`form-pasos-pill${activo ? " es-activo" : ""}${hecho ? " es-hecho" : ""}`}
              onClick={() => {
                if (i <= indice) {
                  setIndice(i);
                  return;
                }
                for (let j = indice; j < i; j++) {
                  if (!validarPaso(j)) {
                    setIndice(j);
                    return;
                  }
                }
                setIndice(i);
              }}
            >
              <span className="form-pasos-num">{i + 1}</span>
              {paso.titulo}
            </button>
          );
        })}
      </div>

      {children}

      {pasos.map((paso, i) => (
        <div
          key={paso.id}
          id={`${baseId}-paso-${i}`}
          role="tabpanel"
          className="form-pasos-panel"
          hidden={i !== indice}
          ref={(nodo) => {
            refs.current[i] = nodo;
          }}
        >
          <div className="form-pasos-cuerpo">{paso.contenido}</div>
        </div>
      ))}

      <div className="form-pasos-nav">
        {indice > 0 && (
          <button type="button" className="form-pasos-secundario" onClick={irAtras}>
            Atrás
          </button>
        )}
        {/*
          Ambos botones son type="button" y con key distinto: si React reutiliza el nodo
          al llegar al último paso y el type pasara a "submit", el clic de "Siguiente"
          terminaría enviando el formulario solo.
        */}
        {!esUltimo ? (
          <button key="paso-siguiente" type="button" className="boton" onClick={irSiguiente}>
            Siguiente
          </button>
        ) : (
          <button
            key="paso-enviar"
            type="button"
            disabled={pendiente}
            className="boton cursor-pointer border-0 disabled:opacity-50"
            onClick={enviarFormulario}
          >
            {pendiente ? "Guardando…" : textoEnviar}
          </button>
        )}
        <span className="form-pasos-hint">
          Paso {indice + 1} de {total}
        </span>
      </div>
    </div>
  );
}
