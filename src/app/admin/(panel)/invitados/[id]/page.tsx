import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EncabezadoAdmin } from "@/components/admin/EncabezadoAdmin";
import { FormularioInvitado, type ValoresInvitado } from "@/components/admin/FormularioInvitado";
import { obtenerInvitadoAdmin } from "@/services/invitados";

export const metadata: Metadata = { title: "Editar invitado" };

export default function PaginaEditarInvitado({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-texto">Cargando invitado…</p>}>
      <Editar params={params} />
    </Suspense>
  );
}

async function Editar({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invitado = await obtenerInvitadoAdmin(id);
  if (!invitado) notFound();

  const valores: ValoresInvitado = {
    id: invitado.id,
    nombre: invitado.nombre,
    slug: invitado.slug,
    cargo: invitado.cargo ?? "",
    empresa: invitado.empresa ?? "",
    bio: invitado.bio ?? "",
    fotoUrl: invitado.fotoUrl ?? "",
    linkedinUrl: invitado.linkedinUrl ?? "",
  };

  return (
    <div>
      <EncabezadoAdmin titulo="Editar invitado" volver={{ href: "/admin/invitados", texto: "Invitados" }} />
      <FormularioInvitado invitado={valores} />
    </div>
  );
}
