import Link from "next/link";
import { Logo } from "./Logo";
import { SITIO, enlaceWhatsapp } from "@/lib/sitio";

export function Footer({ logoUrl = null }: { logoUrl?: string | null }) {
  return (
    <footer className="mt-auto bg-marino-oscuro text-white/80 dark:border-t dark:border-borde dark:bg-black/30">
      <style>{`
        .pie {
          display: grid;
          gap: 2.75rem 4.5rem;
          padding: 4.5rem 1.25rem 3.5rem;
        }
        .pie h2 { margin-bottom: 1.35rem; }
        .pie ul { display: flex; flex-direction: column; gap: 0.9rem; }
        .pie-nota { max-width: 22rem; margin-top: 1.1rem; line-height: 1.65; }
        .pie-legal { padding: 1.35rem 1.25rem; }
        @media (min-width: 640px) {
          .pie { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
      `}</style>
      <div className="pie mx-auto max-w-6xl">
        <div>
          <Logo claro logoUrl={logoUrl} />
          <p className="pie-nota text-sm">{SITIO.lema}.</p>
          <p className="pie-nota text-sm text-white/60">
            Comunidad del sector marítimo-portuario peruano desde {SITIO.fundacion}. {SITIO.ciudad}, Perú.
          </p>
        </div>

        <nav aria-label="Secciones">
          <h2 className="text-sm font-bold text-white">Secciones</h2>
          <ul className="text-sm">
            <li><Link href="/talks" className="hover:text-white">Talks</Link></li>
            <li><Link href="/eventos" className="hover:text-white">Eventos</Link></li>
            <li><Link href="/aliados" className="hover:text-white">Aliados</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-bold text-white">Síguenos y conversemos</h2>
          <ul className="text-sm">
            <li><a href={SITIO.youtube} target="_blank" rel="noopener" className="hover:text-white">YouTube</a></li>
            <li><a href={SITIO.linkedin} target="_blank" rel="noopener" className="hover:text-white">LinkedIn</a></li>
            <li><a href={enlaceWhatsapp()} target="_blank" rel="noopener" className="hover:text-white">WhatsApp</a></li>
          </ul>
        </div>
      </div>
      <div className="pie-legal border-t border-white/10 text-center text-xs text-white/50">
        © {SITIO.nombre}.
      </div>
    </footer>
  );
}
