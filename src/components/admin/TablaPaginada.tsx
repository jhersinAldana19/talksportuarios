"use client";

import { useState, type ReactNode } from "react";
import { ControlesPaginacion } from "@/components/admin/ControlesPaginacion";
import { POR_PAGINA_TABLA, rangoPagina } from "@/components/admin/paginacion";

type Props = {
  /** Fila <tr> del thead. */
  encabezado: ReactNode;
  /** Filas <tr> ya renderizadas (una por registro). */
  filas: ReactNode[];
  porPagina?: number;
  classNameMarco?: string;
  classNameTabla?: string;
};

/** Tabla del panel con paginación cliente (reutilizable en listados). */
export function TablaPaginada({
  encabezado,
  filas,
  porPagina = POR_PAGINA_TABLA,
  classNameMarco = "tabla-marco",
  classNameTabla = "tabla-panel",
}: Props) {
  const [pagina, setPagina] = useState(1);
  const total = filas.length;
  const { actual, paginas, inicio, fin } = rangoPagina(pagina, porPagina, total);
  const visibles = filas.slice(inicio, fin);

  return (
    <div>
      <div className={classNameMarco}>
        <table className={classNameTabla}>
          <thead>{encabezado}</thead>
          <tbody>{visibles}</tbody>
        </table>
      </div>
      <ControlesPaginacion
        pagina={actual}
        paginas={paginas}
        total={total}
        desde={total === 0 ? 0 : inicio + 1}
        hasta={fin}
        onCambiar={setPagina}
      />
    </div>
  );
}
