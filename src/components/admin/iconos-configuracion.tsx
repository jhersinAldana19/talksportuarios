/** Iconos lineales para el menú de Configuración (reutilizables). */

export function IconoCuenta({ className = "h-full w-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19.2v-.6a4.2 4.2 0 0 1 4.2-4.2h4.6a4.2 4.2 0 0 1 4.2 4.2v.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconoMarca({ className = "h-full w-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 7.5h16M4 12h10M4 16.5h14" strokeLinecap="round" />
      <circle cx="18.5" cy="12" r="2.2" />
    </svg>
  );
}

export function IconoAcceso({ className = "h-full w-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="1.5" />
      <path d="M8.5 11V8.2a3.5 3.5 0 0 1 7 0V11" strokeLinecap="round" />
    </svg>
  );
}
