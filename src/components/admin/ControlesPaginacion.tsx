"use client";

type Props = {
  pagina: number;
  paginas: number;
  total: number;
  desde: number;
  hasta: number;
  onCambiar: (pagina: number) => void;
};

/** Controles Anterior / Siguiente para tablas del panel. */
export function ControlesPaginacion({ pagina, paginas, total, desde, hasta, onCambiar }: Props) {
  if (total === 0) return null;

  return (
    <div className="paginacion-tabla">
      <style>{`
        .paginacion-tabla {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          margin-top: 0.85rem;
          padding: 0.35rem 0.15rem;
        }
        .paginacion-tabla-info {
          font-size: 0.8125rem;
          color: color-mix(in srgb, var(--texto) 72%, transparent);
        }
        .paginacion-tabla-acciones {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.45rem;
        }
        .paginacion-tabla-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 2.25rem;
          height: 2.25rem;
          padding: 0 0.75rem;
          border: 1px solid rgb(17 25 102 / 0.18);
          border-radius: 0.45rem;
          background: #ffffff;
          color: var(--titulo);
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
        }
        .dark .paginacion-tabla-btn {
          background: var(--superficie);
          border-color: rgb(254 253 253 / 0.2);
        }
        .paginacion-tabla-btn:hover:not(:disabled) {
          border-color: var(--color-marino);
          background: var(--fondo);
        }
        .paginacion-tabla-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .paginacion-tabla-btn:focus-visible {
          outline: 2px solid var(--color-magenta);
          outline-offset: 2px;
        }
        .paginacion-tabla-pagina {
          font-size: 0.8125rem;
          color: var(--texto);
          padding: 0 0.35rem;
        }
      `}</style>

      <p className="paginacion-tabla-info">
        {desde}–{hasta} de {total}
      </p>
      <div className="paginacion-tabla-acciones">
        <button
          type="button"
          className="paginacion-tabla-btn"
          disabled={pagina <= 1}
          onClick={() => onCambiar(pagina - 1)}
          aria-label="Página anterior"
        >
          Anterior
        </button>
        <span className="paginacion-tabla-pagina">
          {pagina} / {paginas}
        </span>
        <button
          type="button"
          className="paginacion-tabla-btn"
          disabled={pagina >= paginas}
          onClick={() => onCambiar(pagina + 1)}
          aria-label="Página siguiente"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
