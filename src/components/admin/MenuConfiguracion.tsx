"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconoAcceso, IconoCuenta, IconoMarca } from "@/components/admin/iconos-configuracion";
import { SECCIONES_CONFIGURACION } from "@/components/admin/secciones-configuracion";

const ICONOS = {
  cuenta: IconoCuenta,
  marca: IconoMarca,
  acceso: IconoAcceso,
} as const;

/** Menú vertical de Configuración: una opción debajo de la otra. */
export function MenuConfiguracion() {
  const ruta = usePathname();

  return (
    <nav
      aria-label="Secciones de configuración"
      className="flex w-full flex-col gap-1 rounded-xl border border-borde bg-fondo p-1.5 md:max-w-[17.5rem]"
    >
      {SECCIONES_CONFIGURACION.map((s) => {
        const activa = ruta === s.href || ruta.startsWith(`${s.href}/`);
        const Icono = ICONOS[s.id];
        return (
          <Link
            key={s.href}
            href={s.href}
            aria-current={activa ? "page" : undefined}
            className={`flex w-full flex-row items-start gap-2.5 rounded-lg px-2.5 py-2 no-underline transition-colors sm:gap-3 sm:px-3 sm:py-2.5 ${
              activa
                ? "bg-superficie text-titulo shadow-sm ring-1 ring-borde"
                : "text-texto hover:bg-suave hover:text-titulo"
            }`}
          >
            <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 text-titulo opacity-85" aria-hidden="true">
              <Icono />
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-semibold leading-snug">{s.texto}</span>
              <span className="hidden text-xs font-normal leading-snug text-texto/65 sm:block">
                {s.descripcionCorta}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
