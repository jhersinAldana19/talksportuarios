"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  IconoActivar,
  IconoBorrador,
  IconoDesactivar,
  IconoEditar,
  IconoEliminar,
  IconoMostrar,
  IconoOcultar,
  IconoPublicar,
} from "@/components/admin/Iconos";

type Tono = "normal" | "peligro" | "exito";

function claseTono(tono: Tono) {
  if (tono === "peligro") return "accion-tabla es-peligro";
  if (tono === "exito") return "accion-tabla es-exito";
  return "accion-tabla";
}

function AccionBase({ etiqueta, icono }: { etiqueta: string; icono: ReactNode }) {
  return (
    <>
      {icono}
      <span className="accion-tabla-texto">{etiqueta}</span>
    </>
  );
}

export function AccionEditar({ href, etiqueta = "Editar" }: { href: string; etiqueta?: string }) {
  return (
    <Link href={href} className={claseTono("normal")} title={etiqueta} aria-label={etiqueta}>
      <AccionBase etiqueta={etiqueta} icono={<IconoEditar />} />
    </Link>
  );
}

export function AccionFormulario({
  accion,
  id,
  campos,
  etiqueta,
  icono,
  tono = "normal",
  confirmar,
}: {
  accion: (formData: FormData) => void | Promise<void>;
  id: string;
  campos?: Record<string, string>;
  etiqueta: string;
  icono: ReactNode;
  tono?: Tono;
  confirmar?: string;
}) {
  return (
    <form action={accion}>
      <input type="hidden" name="id" value={id} />
      {campos &&
        Object.entries(campos).map(([clave, valor]) => (
          <input key={clave} type="hidden" name={clave} value={valor} />
        ))}
      <button
        type="submit"
        className={claseTono(tono)}
        title={etiqueta}
        aria-label={etiqueta}
        onClick={
          confirmar
            ? (evento) => {
                if (!confirm(confirmar)) evento.preventDefault();
              }
            : undefined
        }
      >
        <AccionBase etiqueta={etiqueta} icono={icono} />
      </button>
    </form>
  );
}

export function AccionPublicar({
  accion,
  id,
  publicado,
}: {
  accion: (formData: FormData) => void | Promise<void>;
  id: string;
  publicado: boolean;
}) {
  return (
    <AccionFormulario
      accion={accion}
      id={id}
      campos={{ estado: publicado ? "BORRADOR" : "PUBLICADO" }}
      etiqueta={publicado ? "Pasar a borrador" : "Publicar"}
      icono={publicado ? <IconoBorrador /> : <IconoPublicar />}
      tono={publicado ? "normal" : "exito"}
    />
  );
}

export function AccionVisibilidad({
  accion,
  id,
  visible,
}: {
  accion: (formData: FormData) => void | Promise<void>;
  id: string;
  visible: boolean;
}) {
  return (
    <AccionFormulario
      accion={accion}
      id={id}
      campos={{ activo: visible ? "false" : "true" }}
      etiqueta={visible ? "Ocultar" : "Mostrar"}
      icono={visible ? <IconoOcultar /> : <IconoMostrar />}
    />
  );
}

export function AccionActivar({
  accion,
  id,
  activo,
}: {
  accion: (formData: FormData) => void | Promise<void>;
  id: string;
  activo: boolean;
}) {
  return (
    <AccionFormulario
      accion={accion}
      id={id}
      campos={{ activo: activo ? "false" : "true" }}
      etiqueta={activo ? "Desactivar" : "Activar"}
      icono={activo ? <IconoDesactivar /> : <IconoActivar />}
      tono={activo ? "normal" : "exito"}
    />
  );
}

export function AccionEliminar({
  accion,
  id,
  nombre,
}: {
  accion: (formData: FormData) => void | Promise<void>;
  id: string;
  nombre: string;
}) {
  return (
    <AccionFormulario
      accion={accion}
      id={id}
      etiqueta="Eliminar"
      icono={<IconoEliminar />}
      tono="peligro"
      confirmar={`¿Eliminar «${nombre}»? Esta acción no se puede deshacer.`}
    />
  );
}
