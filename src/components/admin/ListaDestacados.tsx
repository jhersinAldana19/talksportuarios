"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { activarDestacado, eliminarDestacado, reordenarDestacados } from "@/app/admin/acciones/destacados";
import { AccionActivar, AccionEditar, AccionEliminar } from "@/components/admin/AccionTabla";

export type FilaDestacadoAdmin = {
  id: string;
  titulo: string;
  tipoEtiqueta: string;
  miniatura: string;
  vigencia: string;
  estado: string;
  estadoAlerta: boolean;
  activo: boolean;
};

export function ListaDestacados({ iniciales }: { iniciales: FilaDestacadoAdmin[] }) {
  const router = useRouter();
  const [filas, setFilas] = useState(iniciales);
  const [prevIniciales, setPrevIniciales] = useState(iniciales);
  const filasRef = useRef(filas);
  const [arrastrando, setArrastrando] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();
  const [errorOrden, setErrorOrden] = useState<string | null>(null);

  if (iniciales !== prevIniciales) {
    setPrevIniciales(iniciales);
    setFilas(iniciales);
  }

  useEffect(() => {
    filasRef.current = filas;
  }, [filas]);

  function onDragStart(id: string) {
    setArrastrando(id);
  }

  function onDragOver(evento: React.DragEvent, sobreId: string) {
    evento.preventDefault();
    if (!arrastrando || arrastrando === sobreId) return;
    setFilas((prev) => {
      const desde = prev.findIndex((f) => f.id === arrastrando);
      const hacia = prev.findIndex((f) => f.id === sobreId);
      if (desde < 0 || hacia < 0 || desde === hacia) return prev;
      const copia = [...prev];
      const [item] = copia.splice(desde, 1);
      copia.splice(hacia, 0, item);
      return copia;
    });
  }

  function onDrop() {
    if (!arrastrando) return;
    setArrastrando(null);
    const ids = filasRef.current.map((f) => f.id);
    startTransition(async () => {
      const resultado = await reordenarDestacados(ids);
      if ("error" in resultado && resultado.error) {
        setErrorOrden(resultado.error);
        setFilas(iniciales);
        return;
      }
      setErrorOrden(null);
      router.refresh();
    });
  }

  return (
    <div className="tabla-marco">
      {errorOrden && (
        <p role="alert" className="mb-4 text-sm text-magenta">
          {errorOrden}
        </p>
      )}
      {pendiente && <p className="mb-2 text-sm text-texto/70">Guardando orden…</p>}
      <table className="tabla-panel">
        <thead>
          <tr>
            <th aria-label="Arrastrar" />
            <th>Miniatura</th>
            <th>Título</th>
            <th>Tipo</th>
            <th>Vigencia</th>
            <th>Estado</th>
            <th className="num">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => (
            <tr
              key={fila.id}
              draggable
              onDragStart={() => onDragStart(fila.id)}
              onDragOver={(e) => onDragOver(e, fila.id)}
              onDrop={onDrop}
              onDragEnd={() => setArrastrando(null)}
              className={arrastrando === fila.id ? "opacity-60" : undefined}
            >
              <td className="cursor-grab text-texto/50" title="Arrastra para reordenar">
                ⋮⋮
              </td>
              <td>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={fila.miniatura} alt="" className="h-12 w-20 object-cover" />
              </td>
              <td className="font-medium text-titulo">{fila.titulo}</td>
              <td>{fila.tipoEtiqueta}</td>
              <td>{fila.vigencia}</td>
              <td className={fila.estadoAlerta ? "text-magenta" : undefined}>{fila.estado}</td>
              <td className="num">
                <div className="tabla-acciones">
                  <AccionEditar href={`/admin/destacados/${fila.id}`} />
                  <AccionActivar accion={activarDestacado} id={fila.id} activo={fila.activo} />
                  <AccionEliminar accion={eliminarDestacado} id={fila.id} nombre={fila.titulo} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
