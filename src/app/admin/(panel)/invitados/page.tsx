import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { eliminarInvitado } from "@/app/admin/acciones/invitados";
import { AccionEditar, AccionEliminar } from "@/components/admin/AccionTabla";
import { EncabezadoAdmin } from "@/components/admin/EncabezadoAdmin";
import { TablaPaginada } from "@/components/admin/TablaPaginada";
import { alerta } from "@/components/admin/clases";
import { listarInvitadosAdmin } from "@/services/invitados";

export const metadata: Metadata = { title: "Invitados" };

export default function PaginaInvitados({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return (
    <Suspense fallback={<p className="text-texto">Cargando invitados…</p>}>
      <Listado searchParams={searchParams} />
    </Suspense>
  );
}

async function Listado({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [{ error }, invitados] = await Promise.all([searchParams, listarInvitadosAdmin()]);

  return (
    <div>
      <EncabezadoAdmin
        titulo="Invitados"
        descripcion={`${invitados.length} en total. Editar uno actualiza los Talks y eventos donde aparece.`}
        accion={
          <Link href="/admin/invitados/nuevo" className="boton">
            Nuevo invitado
          </Link>
        }
      />

      {error && (
        <p role="alert" className={`mt-6 ${alerta}`}>
          {error}
        </p>
      )}

      {invitados.length === 0 ? (
        <p className="mt-8 text-texto/70">Todavía no hay invitados.</p>
      ) : (
        <TablaPaginada
          encabezado={
            <tr>
              <th>Nombre</th>
              <th>Cargo</th>
              <th>Empresa</th>
              <th className="num">Talks</th>
              <th className="num">Acciones</th>
            </tr>
          }
          filas={invitados.map((invitado) => (
            <tr key={invitado.id}>
              <td className="font-medium text-titulo">{invitado.nombre}</td>
              <td>{invitado.cargo || "—"}</td>
              <td>{invitado.empresa || "—"}</td>
              <td className="num">{invitado.talks}</td>
              <td className="num">
                <div className="tabla-acciones">
                  <AccionEditar href={`/admin/invitados/${invitado.id}`} />
                  <AccionEliminar accion={eliminarInvitado} id={invitado.id} nombre={invitado.nombre} />
                </div>
              </td>
            </tr>
          ))}
        />
      )}
    </div>
  );
}
