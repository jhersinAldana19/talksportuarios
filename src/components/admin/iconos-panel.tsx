/** Iconos lineales del menú lateral del panel. */

type Props = { className?: string };

function svg({ className = "h-full w-full" }: Props) {
  return {
    viewBox: "0 0 24 24",
    className,
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.8,
    "aria-hidden": true as const,
  };
}

export function IconoInicio(props: Props) {
  return (
    <svg {...svg(props)}>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5.2v-6.2H10.2V21H5a1 1 0 0 1-1-1z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconoTalks(props: Props) {
  return (
    <svg {...svg(props)}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m10.2 9.2 5.2 2.8-5.2 2.8z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconoInvitados(props: Props) {
  return (
    <svg {...svg(props)}>
      <circle cx="9" cy="8.5" r="2.8" />
      <circle cx="16.2" cy="9.2" r="2.2" />
      <path d="M3.8 18.5v-.5a4.2 4.2 0 0 1 4.2-4.2h2.2a4.2 4.2 0 0 1 3.8 2.4" strokeLinecap="round" />
      <path d="M14.2 18.5v-.4a3.4 3.4 0 0 1 2.4-3.2h1.4A3.4 3.4 0 0 1 21 17.9v.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconoEventos(props: Props) {
  return (
    <svg {...svg(props)}>
      <rect x="4" y="5.5" width="16" height="14" rx="2" />
      <path d="M8 3.8v3.2M16 3.8v3.2M4 10h16" strokeLinecap="round" />
    </svg>
  );
}

export function IconoPartners(props: Props) {
  return (
    <svg {...svg(props)}>
      <path d="M8.5 11.5 6 14l2.5 2.5M15.5 11.5 18 14l-2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.2 14h3.6" strokeLinecap="round" />
      <circle cx="7.2" cy="8" r="2.2" />
      <circle cx="16.8" cy="8" r="2.2" />
    </svg>
  );
}

export function IconoDestacados(props: Props) {
  return (
    <svg {...svg(props)}>
      <path
        d="m12 3.8 2.2 4.6 5 .7-3.6 3.6.9 5.1L12 15.5 7.5 17.8l.9-5.1L4.8 9.1l5-.7z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Tuerca / engranaje. */
export function IconoConfiguracion(props: Props) {
  return (
    <svg {...svg(props)}>
      <circle cx="12" cy="12" r="3" />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.36.62.36 1.38 0 2H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconoVerSitio(props: Props) {
  return (
    <svg {...svg(props)}>
      <path d="M10 5.5H6.5A2 2 0 0 0 4.5 7.5v10A2 2 0 0 0 6.5 19.5h10a2 2 0 0 0 2-2V14" strokeLinecap="round" />
      <path d="M13.5 4.5H19.5V10.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m19.2 4.8-8.2 8.2" strokeLinecap="round" />
    </svg>
  );
}

export function IconoSalir(props: Props) {
  return (
    <svg {...svg(props)}>
      <path d="M10 5.5H7A2 2 0 0 0 5 7.5v9A2 2 0 0 0 7 18.5h3" strokeLinecap="round" />
      <path d="M13.5 12H21" strokeLinecap="round" />
      <path d="m17.5 8.5 3.5 3.5-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
