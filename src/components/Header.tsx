import Link from "next/link";
import { BotonTema } from "./BotonTema";
import { Logo } from "./Logo";

const enlaces = [
  { href: "/", texto: "Inicio" },
  { href: "/talks", texto: "Talks" },
  { href: "/eventos", texto: "Eventos" },
];

// Menú móvil con <details>: funciona sin JavaScript.
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-borde bg-superficie/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" aria-label="Talks Portuarios — inicio">
          <Logo />
        </Link>

        <div className="flex items-center gap-2 md:gap-6">
          <nav aria-label="Principal" className="hidden md:block">
            <ul className="flex items-center gap-8 text-sm font-semibold text-titulo">
              {enlaces.map((e) => (
                <li key={e.href}>
                  <Link href={e.href} className="transition-colors hover:text-magenta">
                    {e.texto}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <BotonTema />

          <details className="group relative md:hidden">
            <summary
              className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg text-titulo hover:bg-suave [&::-webkit-details-marker]:hidden"
              aria-label="Abrir menú"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path className="group-open:hidden" d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                <path className="hidden group-open:block" d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </summary>
            <nav
              aria-label="Principal (móvil)"
              className="absolute right-0 mt-2 w-48 rounded-xl border border-borde bg-superficie p-2 shadow-lg"
            >
              <ul className="flex flex-col text-sm font-semibold text-titulo">
                {enlaces.map((e) => (
                  <li key={e.href}>
                    <Link href={e.href} className="block rounded-lg px-3 py-2 hover:bg-suave">
                      {e.texto}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
