import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { cambiarActivoPartner, eliminarPartner } from "@/app/admin/acciones/partners";
import { AccionEditar, AccionEliminar, AccionVisibilidad } from "@/components/admin/AccionTabla";
import { EncabezadoAdmin } from "@/components/admin/EncabezadoAdmin";
import { TablaPaginada } from "@/components/admin/TablaPaginada";
import { alerta } from "@/components/admin/clases";
import { ETIQUETA_NIVEL } from "@/lib/formato";
import { listarPartnersAdmin } from "@/services/partners";

export const metadata: Metadata = { title: "Partners" };

export default function PaginaPartners({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return (
    <Suspense fallback={<p className="text-texto">Cargando partners…</p>}>
      <Listado searchParams={searchParams} />
    </Suspense>
  );
}

async function Listado({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [{ error }, partners] = await Promise.all([searchParams, listarPartnersAdmin()]);

  return (
    <div>
      <EncabezadoAdmin
        titulo="Partners"
        descripcion="Los ocultos no salen en el inicio. El orden aplica dentro de cada nivel."
        accion={
          <Link href="/admin/partners/nuevo" className="boton">
            Nuevo partner
          </Link>
        }
      />

      {error && (
        <p role="alert" className={`mt-6 ${alerta}`}>
          {error}
        </p>
      )}

      {partners.length === 0 ? (
        <p className="mt-8 text-texto/70">Todavía no hay partners.</p>
      ) : (
        <TablaPaginada
          encabezado={
            <tr>
              <th>Nombre</th>
              <th>Nivel</th>
              <th className="num">Orden</th>
              <th>Estado</th>
              <th className="num">Acciones</th>
            </tr>
          }
          filas={partners.map((partner) => (
            <tr key={partner.id}>
              <td className="font-medium text-titulo">{partner.nombre}</td>
              <td>{ETIQUETA_NIVEL[partner.nivel]}</td>
              <td className="num">{partner.orden}</td>
              <td className={partner.activo ? "" : "text-magenta"}>{partner.activo ? "Visible" : "Oculto"}</td>
              <td className="num">
                <div className="tabla-acciones">
                  <AccionEditar href={`/admin/partners/${partner.id}`} />
                  <AccionVisibilidad accion={cambiarActivoPartner} id={partner.id} visible={partner.activo} />
                  <AccionEliminar accion={eliminarPartner} id={partner.id} nombre={partner.nombre} />
                </div>
              </td>
            </tr>
          ))}
        />
      )}
    </div>
  );
}
