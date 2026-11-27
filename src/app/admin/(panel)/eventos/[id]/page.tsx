import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EncabezadoAdmin } from "@/components/admin/EncabezadoAdmin";
import { FormularioEvento, type ValoresEvento } from "@/components/admin/FormularioEvento";
import { fechaISOLima } from "@/lib/formato";
import { listarInvitadosAsignables } from "@/services/invitados";
import { obtenerEventoAdmin } from "@/services/eventos";
import { listarPartnersAsignables } from "@/services/partners";

export const metadata: Metadata = { title: "Editar evento" };

export default function PaginaEditarEvento({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-texto">Cargando evento…</p>}>
      <Editar params={params} />
    </Suspense>
  );
}

async function Editar({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [evento, invitados, partners] = await Promise.all([
    obtenerEventoAdmin(id),
    listarInvitadosAsignables(),
    listarPartnersAsignables(),
  ]);
  if (!evento) notFound();

  const valores: ValoresEvento = {
    id: evento.id,
    titulo: evento.titulo,
    slug: evento.slug,
    descripcion: evento.descripcion,
    fecha: fechaISOLima(evento.fecha),
    lugar: evento.lugar ?? "",
    modalidad: evento.modalidad,
    cupoLimitado: evento.cupoLimitado,
    linkInscripcion: evento.linkInscripcion ?? "",
    estado: evento.estado,
    aliadoId: evento.aliado?.id ?? "",
    ponenteIds: evento.ponentes.map((ponente) => ponente.id),
  };

  return (
    <div>
      <EncabezadoAdmin titulo="Editar evento" volver={{ href: "/admin/eventos", texto: "Eventos" }} />
      <FormularioEvento evento={valores} invitados={invitados} partners={partners} fechaHoy={fechaISOLima(new Date())} />
    </div>
  );
}
