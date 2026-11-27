import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { cambiarEstadoEvento, eliminarEvento } from "@/app/admin/acciones/eventos";
import { AccionEditar, AccionEliminar, AccionPublicar } from "@/components/admin/AccionTabla";
import { EncabezadoAdmin } from "@/components/admin/EncabezadoAdmin";
import { TablaPaginada } from "@/components/admin/TablaPaginada";
import { alerta } from "@/components/admin/clases";
import { ETIQUETA_MODALIDAD, formatearFecha } from "@/lib/formato";
import { listarEventosAdmin } from "@/services/eventos";

export const metadata: Metadata = { title: "Eventos" };

export default function PaginaEventos({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return (
    <Suspense fallback={<p className="text-texto">Cargando eventos…</p>}>
      <Listado searchParams={searchParams} />
    </Suspense>
  );
}

async function Listado({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [{ error }, eventos] = await Promise.all([searchParams, listarEventosAdmin()]);

  return (
    <div>
      <EncabezadoAdmin
        titulo="Eventos"
        descripcion={`${eventos.length} en total, incluidos los borradores y los que ya pasaron.`}
        accion={
          <Link href="/admin/eventos/nuevo" className="boton">
            Nuevo evento
          </Link>
        }
      />

      {error && (
        <p role="alert" className={`mt-6 ${alerta}`}>
          {error}
        </p>
      )}

      {eventos.length === 0 ? (
        <p className="mt-8 text-texto/70">Todavía no hay eventos.</p>
      ) : (
        <TablaPaginada
          encabezado={
            <tr>
              <th>Título</th>
              <th>Fecha</th>
              <th>Modalidad</th>
              <th>Estado</th>
              <th className="num">Acciones</th>
            </tr>
          }
          filas={eventos.map((evento) => {
            const publicado = evento.estado === "PUBLICADO";
            return (
              <tr key={evento.id}>
                <td className="font-medium text-titulo">{evento.titulo}</td>
                <td>{formatearFecha(evento.fecha)}</td>
                <td>{ETIQUETA_MODALIDAD[evento.modalidad]}</td>
                <td className={publicado ? "" : "text-magenta"}>{publicado ? "Publicado" : "Borrador"}</td>
                <td className="num">
                  <div className="tabla-acciones">
                    <AccionEditar href={`/admin/eventos/${evento.id}`} />
                    <AccionPublicar accion={cambiarEstadoEvento} id={evento.id} publicado={publicado} />
                    <AccionEliminar accion={eliminarEvento} id={evento.id} nombre={evento.titulo} />
                  </div>
                </td>
              </tr>
            );
          })}
        />
      )}
    </div>
  );
}
