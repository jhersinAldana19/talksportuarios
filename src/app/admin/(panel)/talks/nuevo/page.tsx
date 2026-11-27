import type { Metadata } from "next";
import { Suspense } from "react";
import { EncabezadoAdmin } from "@/components/admin/EncabezadoAdmin";
import { FormularioTalk } from "@/components/admin/FormularioTalk";
import { fechaISOLima } from "@/lib/formato";
import { listarInvitadosAsignables } from "@/services/invitados";

export const metadata: Metadata = { title: "Nuevo Talk" };

export default function PaginaNuevoTalk() {
  return (
    <Suspense fallback={<p className="text-texto">Cargando formulario…</p>}>
      <Nuevo />
    </Suspense>
  );
}

async function Nuevo() {
  const invitados = await listarInvitadosAsignables();

  return (
    <div>
      <EncabezadoAdmin titulo="Nuevo Talk" volver={{ href: "/admin/talks", texto: "Talks" }} />
      <FormularioTalk talk={null} invitados={invitados} fechaHoy={fechaISOLima(new Date())} />
    </div>
  );
}
