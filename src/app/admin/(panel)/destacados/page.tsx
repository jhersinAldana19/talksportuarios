import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { EncabezadoAdmin } from "@/components/admin/EncabezadoAdmin";
import { ListaDestacados } from "@/components/admin/ListaDestacados";
import { alerta } from "@/components/admin/clases";
import { listarFilasDestacadosAdmin } from "@/services/destacados";

export const metadata: Metadata = { title: "Destacados" };

export default function PaginaDestacados({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return (
    <div>
      <EncabezadoAdmin
        titulo="Destacados"
        descripcion="Carrusel del inicio. Arrastra las filas para cambiar el orden."
        accion={
          <Link href="/admin/destacados/nuevo" className="boton">
            Nuevo destacado
          </Link>
        }
      />

      <p className="mt-6 max-w-3xl border border-borde bg-suave px-4 py-3 text-sm leading-relaxed text-texto">
        El carrusel muestra máximo 4 destacados activos y vigentes. Si no hay ninguno, se muestra en automático
        (último Talk, próximo evento, Formación).
      </p>

      <Suspense fallback={<p className="mt-8 text-texto">Cargando destacados…</p>}>
        <Listado searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Listado({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [{ error }, filas] = await Promise.all([searchParams, listarFilasDestacadosAdmin()]);

  return (
    <>
      {error && (
        <p role="alert" className={`mt-6 ${alerta}`}>
          {error}
        </p>
      )}

      {filas.length === 0 ? (
        <p className="mt-8 text-texto/70">Todavía no hay destacados. El inicio usa el modo automático.</p>
      ) : (
        <ListaDestacados iniciales={filas} />
      )}
    </>
  );
}
