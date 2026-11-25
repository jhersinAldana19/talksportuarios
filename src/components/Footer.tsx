import Link from "next/link";
import { Logo } from "./Logo";
import { SITIO, enlaceWhatsapp } from "@/lib/sitio";

export function Footer() {
  return (
    <footer className="mt-auto bg-marino-oscuro text-white/80 dark:border-t dark:border-borde dark:bg-black/30">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div className="space-y-3">
          <Logo claro />
          <p className="text-sm">{SITIO.lema}.</p>
          <p className="text-xs text-white/60">
            Comunidad del sector marítimo-portuario peruano desde {SITIO.fundacion}. {SITIO.ciudad}, Perú.
          </p>
        </div>

        <nav aria-label="Secciones">
          <h2 className="mb-3 text-sm font-bold text-white">Secciones</h2>
          <ul className="space-y-2 text-sm">
            <li><Link href="/talks" className="hover:text-white">Talks</Link></li>
            <li><Link href="/eventos" className="hover:text-white">Eventos</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="mb-3 text-sm font-bold text-white">Síguenos y conversemos</h2>
          <ul className="space-y-2 text-sm">
            <li><a href={SITIO.youtube} target="_blank" rel="noopener" className="hover:text-white">YouTube</a></li>
            <li><a href={SITIO.linkedin} target="_blank" rel="noopener" className="hover:text-white">LinkedIn</a></li>
            <li><a href={enlaceWhatsapp()} target="_blank" rel="noopener" className="hover:text-white">WhatsApp</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {SITIO.nombre}. Plataforma desarrollada por TECPORT, partner fundador.
      </div>
    </footer>
  );
}
