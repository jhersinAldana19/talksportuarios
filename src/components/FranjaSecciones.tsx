import Link from "next/link";

const secciones = [
  { texto: "Noticias y Análisis", icono: IconoNoticias, proximamente: true },
  { texto: "Entrevistas y Talks", href: "/talks", icono: IconoTalks },
  { texto: "Eventos y Encuentros", href: "/eventos", icono: IconoEventos },
  { texto: "Comunidad Profesional", icono: IconoComunidad, proximamente: true },
  { texto: "Formación y Talento", href: "/formacion", icono: IconoFormacion },
  { texto: "Directorio de Empresas", icono: IconoDirectorio, proximamente: true },
];

// Pegada al hero: sin margen superior. Las secciones sin página todavía no enlazan.
export function FranjaSecciones() {
  return (
    <nav aria-label="Secciones" className="bg-marino text-claro">
      <style>{`
        .franja-secciones { overflow-x: auto; overscroll-behavior-x: contain; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
        .franja-secciones::-webkit-scrollbar { display: none; }
        .franja-secciones > li { flex: 0 0 11rem; width: 11rem; }
        @media (min-width: 48rem) {
          .franja-secciones { overflow: visible; }
          .franja-secciones > li { flex: 1 1 0%; width: auto; min-width: 0; }
        }
      `}</style>
      <ul className="franja-secciones mx-auto flex w-full max-w-6xl">
        {secciones.map((seccion, indice) => {
          const clase = `flex h-full items-center gap-1.5 px-3 py-2 text-left text-xs leading-tight font-medium text-claro/90 ${
            indice > 0 ? "border-l border-white/15" : ""
          }`;
          const contenido = (
            <>
              <seccion.icono />
              <span className="min-w-0">
                {seccion.texto}
                {"proximamente" in seccion && seccion.proximamente && (
                  <span className="block font-medium text-claro/55">Próximamente</span>
                )}
              </span>
            </>
          );
          return (
            <li key={seccion.texto}>
              {seccion.href ? (
                <Link href={seccion.href} className={`${clase} transition-colors hover:bg-white/10 hover:text-claro`}>
                  {contenido}
                </Link>
              ) : (
                <span className={clase}>{contenido}</span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function trazo(path: string) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d={path} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconoNoticias() {
  return trazo("M7 3.5h8.5L19 7v13.5H7z M15.5 3.5V7H19 M9.5 12h6 M9.5 15.5h6");
}

function IconoTalks() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3.5" y="6" width="17" height="12" rx="2" />
      <path d="M11 10.2v3.6l3-1.8-3-1.8z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconoEventos() {
  return trazo("M7 3.5v3 M17 3.5v3 M4.5 8.5h15 M5.5 5.5h13a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1z");
}

function IconoComunidad() {
  return trazo("M9 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M15.5 11.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4z M4.5 18.5v-.8a3.2 3.2 0 0 1 3.2-3.2h2.6a3.2 3.2 0 0 1 3.2 3.2v.8 M14 14.6a3 3 0 0 1 3-2.6h.8a3 3 0 0 1 3 3v.9");
}

function IconoFormacion() {
  return trazo("M3 9.5 12 5l9 4.5-9 4.5z M7 12.2v4.2c1.4 1.2 3.1 1.8 5 1.8s3.6-.6 5-1.8v-4.2");
}

function IconoDirectorio() {
  return trazo("M5 20.5V5.5a1 1 0 0 1 1-1h7l5 4v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z M13 4.5V9h5 M8.5 13h6 M8.5 16.5h6");
}
