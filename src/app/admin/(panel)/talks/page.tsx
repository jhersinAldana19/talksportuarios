import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { cambiarEstadoTalk, eliminarTalk } from "@/app/admin/actions";
import { AccionEditar, AccionEliminar, AccionPublicar } from "@/components/admin/AccionTabla";
import { EncabezadoAdmin } from "@/components/admin/EncabezadoAdmin";
import { TablaPaginada } from "@/components/admin/TablaPaginada";
import { alerta } from "@/components/admin/clases";
import { etiquetaSerieEdicion, formatearFecha } from "@/lib/formato";
import { listarTalksAdmin } from "@/services/talks";

export const metadata: Metadata = { title: "Talks" };

export default function PaginaTalks({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return (
    <Suspense fallback={<p className="text-texto">Cargando Talks…</p>}>
      <Listado searchParams={searchParams} />
    </Suspense>
  );
}

async function Listado({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [{ error }, talks] = await Promise.all([searchParams, listarTalksAdmin()]);

  return (
    <div>
      <EncabezadoAdmin
        titulo="Talks"
        descripcion={`${talks.length} en total, incluidos los borradores.`}
        accion={
          <Link href="/admin/talks/nuevo" className="boton">
            Nuevo Talk
          </Link>
        }
      />

      {error && (
        <p role="alert" className={`mt-6 ${alerta}`}>
          {error}
        </p>
      )}

      {talks.length === 0 ? (
        <p className="mt-8 text-texto/70">Todavía no hay Talks.</p>
      ) : (
        <TablaPaginada
          encabezado={
            <tr>
              <th>Título</th>
              <th>Serie</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th className="num">Acciones</th>
            </tr>
          }
          filas={talks.map((talk) => {
            const publicado = talk.estado === "PUBLICADO";
            return (
              <tr key={talk.id}>
                <td className="font-medium text-titulo">{talk.titulo}</td>
                <td>{etiquetaSerieEdicion(talk.serie, talk.edicion)}</td>
                <td>{formatearFecha(talk.fechaPublicacion)}</td>
                <td className={publicado ? "" : "text-magenta"}>
                  {publicado ? "Publicado" : "Borrador"}
                  {talk.patrocinado ? ", patrocinado" : ""}
                </td>
                <td className="num">
                  <div className="tabla-acciones">
                    <AccionEditar href={`/admin/talks/${talk.id}`} />
                    <AccionPublicar accion={cambiarEstadoTalk} id={talk.id} publicado={publicado} />
                    <AccionEliminar accion={eliminarTalk} id={talk.id} nombre={talk.titulo} />
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
