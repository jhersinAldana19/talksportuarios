import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EncabezadoAdmin } from "@/components/admin/EncabezadoAdmin";
import { FormularioTalk, type ValoresTalk } from "@/components/admin/FormularioTalk";
import { fechaISOLima } from "@/lib/formato";
import { listarInvitadosAsignables } from "@/services/invitados";
import { obtenerTalkAdmin } from "@/services/talks";

export const metadata: Metadata = { title: "Editar Talk" };

export default function PaginaEditarTalk({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-texto">Cargando Talk…</p>}>
      <Editar params={params} />
    </Suspense>
  );
}

async function Editar({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [talk, invitados] = await Promise.all([obtenerTalkAdmin(id), listarInvitadosAsignables()]);
  if (!talk) notFound();

  const valores: ValoresTalk = {
    id: talk.id,
    titulo: talk.titulo,
    slug: talk.slug,
    serie: talk.serie,
    edicion: talk.edicion,
    youtubeId: talk.youtubeId,
    duracionMin: talk.duracionMin,
    fecha: fechaISOLima(talk.fechaPublicacion),
    resumen: talk.resumen,
    puntosClave: talk.puntosClave.join("\n"),
    transcripcion: talk.transcripcion ?? "",
    tags: talk.tags.join(", "),
    estado: talk.estado,
    patrocinado: talk.patrocinado,
    contenidoProvisional: talk.contenidoProvisional,
    invitadoIds: talk.invitados.map((invitado) => invitado.id),
  };

  return (
    <div>
      <EncabezadoAdmin titulo="Editar Talk" volver={{ href: "/admin/talks", texto: "Talks" }} />
      <FormularioTalk talk={valores} invitados={invitados} fechaHoy={fechaISOLima(new Date())} />
    </div>
  );
}
