import type { Metadata } from "next";
import { Suspense } from "react";
import { FormularioMarca } from "@/components/admin/FormularioMarca";
import { SECCIONES_CONFIGURACION } from "@/components/admin/secciones-configuracion";
import { obtenerMarcaAdmin } from "@/services/configuracion";

export const metadata: Metadata = { title: "Marca del sitio" };

const MENSAJES_OK: Record<string, string> = {
  guardado: "Cambios aplicados en el sitio público. Si no te convencen, usa «Deshacer último cambio».",
  restaurado: "Se restauró la marca oficial de Talks Portuarios.",
  deshecho: "Se revirtió el último cambio de marca.",
};

const seccion = SECCIONES_CONFIGURACION.find((s) => s.id === "marca")!;

export default function PaginaMarca({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  return (
    <Suspense fallback={<p className="text-texto">Cargando marca…</p>}>
      <Contenido searchParams={searchParams} />
    </Suspense>
  );
}

async function Contenido({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const [{ ok, error }, marca] = await Promise.all([searchParams, obtenerMarcaAdmin()]);

  return (
    <section>
      <h2 className="text-xl font-medium tracking-tight text-titulo">{seccion.texto}</h2>
      <p className="mt-2 max-w-prose text-texto/80">{seccion.descripcion}</p>
      <FormularioMarca
        marca={marca}
        mensajeOk={ok ? MENSAJES_OK[ok] : undefined}
        mensajeError={error}
      />
    </section>
  );
}
