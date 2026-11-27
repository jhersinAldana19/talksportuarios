"use client";

// Alterna tema claro/oscuro. El tema inicial lo aplica SCRIPT_TEMA (lib/tema.ts, en el
// <head>): claro por defecto; solo oscuro si localStorage tiene "oscuro". Este botón
// cambia la clase y guarda la elección. El icono se decide con CSS (dark:).

import { CLAVE_TEMA } from "@/lib/tema";

export function BotonTema({ sobreOscuro = false }: { sobreOscuro?: boolean }) {
  function alternar() {
    const oscuro = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem(CLAVE_TEMA, oscuro ? "oscuro" : "claro");
    } catch {
      // navegación privada sin almacenamiento: el cambio dura hasta recargar
    }
  }

  return (
    <button
      type="button"
      onClick={alternar}
      className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
        sobreOscuro ? "text-claro hover:bg-white/10" : "text-titulo hover:bg-suave"
      }`}
      title="Cambiar tema claro / oscuro"
    >
      <span className="sr-only">Cambiar tema claro / oscuro</span>
      {/* Luna: se muestra en tema claro (para pasar a oscuro) */}
      <svg viewBox="0 0 24 24" className="h-5 w-5 dark:hidden" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" strokeLinejoin="round" />
      </svg>
      {/* Sol: se muestra en tema oscuro (para pasar a claro) */}
      <svg viewBox="0 0 24 24" className="hidden h-5 w-5 dark:block" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
      </svg>
    </button>
  );
}
