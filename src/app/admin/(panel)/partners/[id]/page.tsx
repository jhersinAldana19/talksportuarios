import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EncabezadoAdmin } from "@/components/admin/EncabezadoAdmin";
import { FormularioPartner, type ValoresPartner } from "@/components/admin/FormularioPartner";
import { obtenerPartnerAdmin } from "@/services/partners";

export const metadata: Metadata = { title: "Editar partner" };

export default function PaginaEditarPartner({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-texto">Cargando partner…</p>}>
      <Editar params={params} />
    </Suspense>
  );
}

async function Editar({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const partner = await obtenerPartnerAdmin(id);
  if (!partner) notFound();

  const valores: ValoresPartner = {
    id: partner.id,
    nombre: partner.nombre,
    slug: partner.slug ?? "",
    web: partner.web ?? "",
    logoUrl: partner.logoUrl ?? "",
    frase: partner.frase ?? "",
    descripcion: partner.descripcion ?? "",
    beneficios: partner.beneficios.join("\n"),
    relacionComercial: partner.relacionComercial,
    estado: partner.estado,
    nivel: partner.nivel,
    orden: partner.orden,
    activo: partner.activo,
  };

  return (
    <div>
      <EncabezadoAdmin titulo="Editar partner" volver={{ href: "/admin/partners", texto: "Partners" }} />
      <FormularioPartner partner={valores} />
    </div>
  );
}
