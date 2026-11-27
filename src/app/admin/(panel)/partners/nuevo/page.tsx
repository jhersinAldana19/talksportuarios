import type { Metadata } from "next";
import { Suspense } from "react";
import { EncabezadoAdmin } from "@/components/admin/EncabezadoAdmin";
import { FormularioPartner } from "@/components/admin/FormularioPartner";

export const metadata: Metadata = { title: "Nuevo partner" };

export default function PaginaNuevoPartner() {
  return (
    <Suspense fallback={<p className="text-texto">Cargando formulario…</p>}>
      <Nuevo />
    </Suspense>
  );
}

function Nuevo() {
  return (
    <div>
      <EncabezadoAdmin titulo="Nuevo partner" volver={{ href: "/admin/partners", texto: "Partners" }} />
      <FormularioPartner partner={null} />
    </div>
  );
}
