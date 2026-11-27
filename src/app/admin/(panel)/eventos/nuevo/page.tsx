import type { Metadata } from "next";
import { Suspense } from "react";
import { EncabezadoAdmin } from "@/components/admin/EncabezadoAdmin";
import { FormularioEvento } from "@/components/admin/FormularioEvento";
import { fechaISOLima } from "@/lib/formato";
import { listarInvitadosAsignables } from "@/services/invitados";
import { listarPartnersAsignables } from "@/services/partners";

export const metadata: Metadata = { title: "Nuevo evento" };

export default function PaginaNuevoEvento() {
  return (
    <Suspense fallback={<p className="text-texto">Cargando formulario…</p>}>
      <Nuevo />
    </Suspense>
  );
}

async function Nuevo() {
  const [invitados, partners] = await Promise.all([listarInvitadosAsignables(), listarPartnersAsignables()]);

  return (
    <div>
      <EncabezadoAdmin titulo="Nuevo evento" volver={{ href: "/admin/eventos", texto: "Eventos" }} />
      <FormularioEvento evento={null} invitados={invitados} partners={partners} fechaHoy={fechaISOLima(new Date())} />
    </div>
  );
}
