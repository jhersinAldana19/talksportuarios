import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EncabezadoAdmin } from "@/components/admin/EncabezadoAdmin";
import { FormularioDestacado } from "@/components/admin/FormularioDestacado";
import { fechaISOLima } from "@/lib/formato";
import { obtenerDestacadoAdmin, opcionesDestacadoFormulario } from "@/services/destacados";

export const metadata: Metadata = { title: "Editar destacado" };

export default function PaginaEditarDestacado({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div>
      <EncabezadoAdmin titulo="Editar destacado" descripcion="Los cambios se ven en el inicio al guardar." />
      <Suspense fallback={<p className="mt-8 text-texto">Cargando formulario…</p>}>
        <FormularioEditar params={params} />
      </Suspense>
    </div>
  );
}

async function FormularioEditar({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [destacado, opciones] = await Promise.all([obtenerDestacadoAdmin(id), opcionesDestacadoFormulario()]);
  if (!destacado) notFound();

  return (
    <FormularioDestacado
      destacado={{
        id: destacado.id,
        tipo: destacado.tipo,
        talkId: destacado.talkId ?? "",
        eventoId: destacado.eventoId ?? "",
        partnerId: destacado.partnerId ?? "",
        hrefLibre: destacado.hrefLibre ?? "",
        tituloCustom: destacado.tituloCustom ?? "",
        ctaCustom: destacado.ctaCustom ?? "",
        imagenUrl: destacado.imagenUrl ?? "",
        fechaDesde: destacado.fechaDesde ? fechaISOLima(destacado.fechaDesde) : "",
        fechaHasta: destacado.fechaHasta ? fechaISOLima(destacado.fechaHasta) : "",
        patrocinado: destacado.patrocinado,
        activo: destacado.activo,
      }}
      opciones={opciones}
    />
  );
}
