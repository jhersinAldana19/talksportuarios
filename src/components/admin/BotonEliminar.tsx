"use client";

import { AccionEliminar } from "@/components/admin/AccionTabla";

/** @deprecated Preferir AccionEliminar; se mantiene por compatibilidad. */
export function BotonEliminar({
  accion,
  id,
  nombre,
}: {
  accion: (formData: FormData) => void | Promise<void>;
  id: string;
  nombre: string;
}) {
  return <AccionEliminar accion={accion} id={id} nombre={nombre} />;
}
