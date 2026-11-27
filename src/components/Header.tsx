"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITIO, enlaceWhatsapp } from "@/lib/sitio";
import { BotonTema } from "./BotonTema";
import { Logo } from "./Logo";

const enlaces = [
  { href: "/", texto: "Inicio" },
  { href: "/talks", texto: "Talks" },
  { href: "/eventos", texto: "Eventos" },
  { href: "/aliados", texto: "Aliados" },
];

const redes = [
  { href: SITIO.youtube, texto: "YouTube", icono: IconoYoutube },
  { href: SITIO.linkedin, texto: "LinkedIn", icono: IconoLinkedin },
];

function rutaActiva(href: string, ruta: string) {
  if (href === "/") return ruta === "/";
  return ruta === href || ruta.startsWith(`${href}/`);
}

// Menú móvil con <details>: funciona sin JavaScript.
export function Header({ logoUrl = null }: { logoUrl?: string | null }) {
  const ruta = usePathname();

  return (
    <header className="cabecera sticky top-0 z-40 bg-marino text-claro">
      <style>{`
        .cabecera {
          border-bottom: 1px solid rgb(254 253 253 / 0.15);
        }
        .cabecera-barra {
          position: relative;
          display: flex;
          align-items: stretch;
          justify-content: space-between;
          gap: 1rem;
          margin: 0 auto;
          max-width: 72rem;
          min-height: 4.75rem;
          padding: 0 1rem;
        }
        .cabecera-marca {
          display: flex;
          align-items: center;
          align-self: center;
          flex: none;
        }
        .cabecera-acciones {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          min-width: 0;
        }
        .cabecera-nav {
          display: none;
        }
        .cabecera-nav ul {
          display: flex;
          align-items: flex-end;
          gap: 0;
          height: 100%;
        }
        .cabecera-nav a {
          display: flex;
          align-items: flex-end;
          height: 100%;
          padding: 0 0.85rem 1.05rem;
          border-bottom: 3px solid transparent;
          color: #ffffff;
          font-family: var(--font-roboto), Roboto, sans-serif;
          font-style: normal;
          font-weight: 400;
          font-size: 13px;
          line-height: 16.25px;
          text-transform: uppercase;
          white-space: nowrap;
          transition: color 0.15s ease, border-color 0.15s ease;
        }
        .cabecera-nav a:hover { color: var(--color-magenta); }
        .cabecera-nav a[aria-current="page"] {
          border-bottom-color: var(--color-claro);
          color: var(--color-claro);
        }
        .cabecera-util {
          display: flex;
          align-items: center;
          gap: 0.15rem;
        }
        .cabecera-cta {
          display: none;
          margin-bottom: 0.7rem;
        }
        .cabecera-movil-enlace[aria-current="page"] {
          box-shadow: inset 3px 0 0 var(--color-claro);
          background: rgb(254 253 253 / 0.08);
        }
        @media (min-width: 768px) {
          .cabecera-barra { min-height: 5.75rem; }
          .cabecera-acciones {
            align-items: flex-end;
            gap: 1.1rem;
          }
          .cabecera-nav { display: block; height: 100%; }
          .cabecera-util { align-items: flex-end; padding-bottom: 0.85rem; }
          .cabecera-cta { display: inline-flex; }
          .cabecera-hamburguesa { display: none; }
        }
      `}</style>
      <div className="cabecera-barra">
        <Link href="/" aria-label="Talks Portuarios — inicio" className="cabecera-marca">
          <Logo claro logoUrl={logoUrl} />
        </Link>

        <div className="cabecera-acciones">
          <nav aria-label="Principal" className="cabecera-nav">
            <ul>
              {enlaces.map((e) => {
                const activa = rutaActiva(e.href, ruta);
                return (
                  <li key={e.href}>
                    <Link href={e.href} aria-current={activa ? "page" : undefined}>
                      {e.texto}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="cabecera-util">
            <ul className="hidden items-center gap-1 md:flex">
              {redes.map((red) => (
                <li key={red.texto}>
                  <EnlaceRed {...red} />
                </li>
              ))}
            </ul>

            <Link
              href="/admin"
              aria-label="Entrar al panel"
              title="Entrar al panel"
              className="flex h-10 w-10 items-center justify-center transition-colors hover:text-magenta"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="12" cy="8" r="3.2" />
                <path d="M5.5 19.2v-.6a4.2 4.2 0 0 1 4.2-4.2h4.6a4.2 4.2 0 0 1 4.2 4.2v.6" strokeLinecap="round" />
              </svg>
            </Link>

            <BotonTema sobreOscuro />
          </div>

          <a href={enlaceWhatsapp()} target="_blank" rel="noopener" className="boton cabecera-cta">
            Únete a la comunidad
          </a>

          <details className="group cabecera-hamburguesa self-center">
            <summary
              className="flex h-10 w-10 cursor-pointer list-none items-center justify-center [&::-webkit-details-marker]:hidden"
              aria-label="Abrir menú"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path className="group-open:hidden" d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                <path className="hidden group-open:block" d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </summary>
            <nav
              aria-label="Principal (móvil)"
              className="hidden border-t border-white/15 px-3 pt-2 pb-3 group-open:block"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "100%",
                zIndex: 40,
                maxHeight: "calc(100dvh - 4.5rem)",
                overflowY: "auto",
                background: "var(--color-marino)",
              }}
            >
              <ul className="flex flex-col text-base">
                {enlaces.map((e) => {
                  const activa = rutaActiva(e.href, ruta);
                  return (
                    <li key={e.href}>
                      <Link
                        href={e.href}
                        aria-current={activa ? "page" : undefined}
                        className="cabecera-movil-enlace block px-3 py-3 hover:bg-white/10"
                      >
                        {e.texto}
                      </Link>
                    </li>
                  );
                })}
                {redes.map((red) => (
                  <li key={red.texto}>
                    <a href={red.href} target="_blank" rel="noopener" className="block px-3 py-3 hover:bg-white/10">
                      {red.texto}
                    </a>
                  </li>
                ))}
                <li className="px-1 py-3">
                  <a href={enlaceWhatsapp()} target="_blank" rel="noopener" className="boton w-full">
                    Únete a la comunidad
                  </a>
                </li>
              </ul>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

function EnlaceRed({
  href,
  texto,
  icono: Icono,
}: {
  href: string;
  texto: string;
  icono: () => React.ReactElement;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label={`${texto} de Talks Portuarios`}
      title={texto}
      className="flex h-10 w-10 items-center justify-center transition-colors hover:text-magenta"
    >
      <Icono />
    </a>
  );
}

function IconoYoutube() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M23 12.2s0-3.2-.4-4.6c-.2-.9-.9-1.6-1.8-1.8C19.2 5.4 12 5.4 12 5.4s-7.2 0-8.8.4c-.9.2-1.6.9-1.8 1.8C1 9 1 12.2 1 12.2s0 3.2.4 4.6c.2.9.9 1.6 1.8 1.8 1.6.4 8.8.4 8.8.4s7.2 0 8.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.4.4-4.6.4-4.6zM9.8 15.5v-6.6l6.2 3.3-6.2 3.3z" />
    </svg>
  );
}

function IconoLinkedin() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M4.7 3.3A2.2 2.2 0 1 0 4.7 7.7 2.2 2.2 0 0 0 4.7 3.3zM3 9h3.4v12H3zM9.3 9h3.3v1.6h.1c.5-.9 1.6-1.8 3.3-1.8 3.5 0 4.2 2.3 4.2 5.3V21H16.8v-5.3c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21H9.3z" />
    </svg>
  );
}
