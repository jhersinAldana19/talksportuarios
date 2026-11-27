type PropsIcono = { className?: string };

function base({ className = "icono-accion-svg" }: PropsIcono) {
  return {
    viewBox: "0 0 24 24",
    className,
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.75,
    "aria-hidden": true as const,
  };
}

export function IconoEditar(props: PropsIcono) {
  return (
    <svg {...base(props)}>
      <path d="M12 20h9" strokeLinecap="round" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconoPublicar(props: PropsIcono) {
  return (
    <svg {...base(props)}>
      <path d="M12 19V5" strokeLinecap="round" />
      <path d="m6 11 6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 19h14" strokeLinecap="round" />
    </svg>
  );
}

export function IconoBorrador(props: PropsIcono) {
  return (
    <svg {...base(props)}>
      <path d="M12 5v14" strokeLinecap="round" />
      <path d="m6 13 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 5h14" strokeLinecap="round" />
    </svg>
  );
}

export function IconoEliminar(props: PropsIcono) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16" strokeLinecap="round" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" strokeLinecap="round" />
      <path d="M7 7v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7" strokeLinejoin="round" />
      <path d="M10 11v5M14 11v5" strokeLinecap="round" />
    </svg>
  );
}

export function IconoMostrar(props: PropsIcono) {
  return (
    <svg {...base(props)}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconoOcultar(props: PropsIcono) {
  return (
    <svg {...base(props)}>
      <path d="M3 3l18 18" strokeLinecap="round" />
      <path d="M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-4.8" strokeLinecap="round" />
      <path
        d="M6.1 6.2C3.9 7.7 2 12 2 12s3.5 7 10 7c1.7 0 3.2-.4 4.5-1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14.1 9.1A7.7 7.7 0 0 1 22 12s-1.2 2.4-3.4 4.2" strokeLinecap="round" />
    </svg>
  );
}

export function IconoActivar(props: PropsIcono) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconoDesactivar(props: PropsIcono) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8" />
      <path d="M9 9l6 6M15 9l-6 6" strokeLinecap="round" />
    </svg>
  );
}
