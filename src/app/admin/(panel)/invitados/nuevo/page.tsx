import type { Metadata } from "next";
import { Suspense } from "react";
import { EncabezadoAdmin } from "@/components/admin/EncabezadoAdmin";
import { FormularioInvitado } from "@/components/admin/FormularioInvitado";

export const metadata: Metadata = { title: "Nuevo invitado" };

export default function PaginaNuevoInvitado() {
  return (
    <Suspense fallback={<p className="text-texto">Cargando formulario…</p>}>
      <Nuevo />
    </Suspense>
  );
}

function Nuevo() {
  return (
    <div>
      <EncabezadoAdmin titulo="Nuevo invitado" volver={{ href: "/admin/invitados", texto: "Invitados" }} />
      <FormularioInvitado invitado={null} />
    </div>
  );
}
