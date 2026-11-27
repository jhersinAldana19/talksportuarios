import { redirect } from "next/navigation";

/** Ruta antigua → Configuración → Marca. */
export default async function RedireccionPersonalizacion({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const q = new URLSearchParams();
  if (ok) q.set("ok", ok);
  if (error) q.set("error", error);
  const sufijo = q.toString() ? `?${q}` : "";
  redirect(`/admin/configuracion/marca${sufijo}`);
}
