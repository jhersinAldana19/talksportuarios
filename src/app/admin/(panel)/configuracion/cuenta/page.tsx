import type { Metadata } from "next";
import { Suspense } from "react";
import { FormularioCuenta } from "@/components/admin/FormularioCuenta";
import { SECCIONES_CONFIGURACION } from "@/components/admin/secciones-configuracion";
import { exigirAdmin } from "@/lib/sesion";
import { obtenerAdminPorId } from "@/services/admins";

export const metadata: Metadata = { title: "Mi cuenta" };

const MENSAJES_OK: Record<string, string> = {
  guardado: "Tu cuenta se actualizó correctamente.",
};

const seccion = SECCIONES_CONFIGURACION.find((s) => s.id === "cuenta")!;

export default function PaginaCuenta({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  return (
    <Suspense fallback={<p className="text-texto">Cargando cuenta…</p>}>
      <Contenido searchParams={searchParams} />
    </Suspense>
  );
}

async function Contenido({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const [{ ok }, sesion] = await Promise.all([searchParams, exigirAdmin()]);
  const admin = sesion.user.id ? await obtenerAdminPorId(sesion.user.id) : null;
  if (!admin) {
    return <p className="text-texto">No se pudo cargar tu cuenta.</p>;
  }

  return (
    <section>
      <h2 className="text-xl font-medium tracking-tight text-titulo">{seccion.texto}</h2>
      <p className="mt-2 max-w-prose text-texto/80">{seccion.descripcion}</p>
      <FormularioCuenta
        nombre={admin.nombre}
        email={admin.email}
        mensajeOk={ok ? MENSAJES_OK[ok] : undefined}
      />
    </section>
  );
}
