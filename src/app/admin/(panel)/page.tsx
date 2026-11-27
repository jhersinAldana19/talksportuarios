import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { GraficoBarrasTalks } from "@/components/admin/GraficoBarrasTalks";
import { contarInvitadosAdmin } from "@/services/invitados";
import { contarEventosAdmin } from "@/services/eventos";
import { contarPartnersAdmin } from "@/services/partners";
import { contarTalksAdmin, talksPublicadosPorMesAdmin } from "@/services/talks";

export const metadata: Metadata = { title: "Panel" };

export default function PaginaInicio() {
  return (
    <Suspense fallback={<p className="text-texto">Cargando…</p>}>
      <Inicio />
    </Suspense>
  );
}

async function Inicio() {
  const [talks, eventos, invitados, partners, ritmo] = await Promise.all([
    contarTalksAdmin(),
    contarEventosAdmin(),
    contarInvitadosAdmin(),
    contarPartnersAdmin(),
    talksPublicadosPorMesAdmin(12),
  ]);

  const fichas = [
    {
      href: "/admin/talks",
      nombre: "Talks",
      numero: talks.publicados,
      unidad: "publicados",
      detalle: `${talks.borradores} en borrador`,
    },
    {
      href: "/admin/eventos",
      nombre: "Eventos",
      numero: eventos.publicados,
      unidad: "publicados",
      detalle: `${eventos.borradores} en borrador`,
    },
    {
      href: "/admin/invitados",
      nombre: "Invitados",
      numero: invitados,
      unidad: invitados === 1 ? "registrado" : "registrados",
      detalle: "Personas de los Talks",
    },
    {
      href: "/admin/partners",
      nombre: "Partners",
      numero: partners.activos,
      unidad: "visibles",
      detalle: `${partners.ocultos} ${partners.ocultos === 1 ? "oculto" : "ocultos"}`,
    },
  ];

  return (
    <div>
      <style>{`
        .fichas {
          display: grid;
          gap: 1rem;
          margin-top: 2.25rem;
          grid-template-columns: 1fr;
        }
        .ficha {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          background: var(--fondo);
          border: 1px solid var(--borde);
          padding: 1.35rem 1.4rem 1.45rem;
          color: inherit;
          text-decoration: none;
        }
        .ficha:hover { border-color: var(--color-marino); }
        .ficha:focus-visible { outline: 2px solid var(--color-magenta); outline-offset: 3px; }
        .ficha:hover .ficha-nombre { color: var(--color-magenta); }
        .ficha-nombre { font-size: 1.05rem; font-weight: 500; color: var(--titulo); }
        .ficha-cifra { display: flex; align-items: baseline; gap: 0.6rem; margin-top: 0.85rem; }
        .ficha-numero {
          font-size: 2.35rem;
          line-height: 0.9;
          font-weight: 500;
          letter-spacing: -0.03em;
          color: var(--titulo);
        }
        .ficha-unidad, .ficha-detalle { color: var(--texto); }
        .ficha-detalle { margin-top: 0.55rem; }
        @media (min-width: 720px) {
          .fichas { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (min-width: 1100px) {
          .fichas { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        }
      `}</style>
      <h1 className="text-3xl font-medium tracking-tight text-titulo sm:text-4xl">Panel</h1>
      <p className="mt-3 max-w-prose leading-relaxed text-texto/80">
        Lo que publiques se ve en el sitio. Un registro nuevo queda en borrador hasta que lo pases a publicado.
      </p>
      <div className="fichas">
        {fichas.map((ficha) => (
          <Link key={ficha.href} href={ficha.href} className="ficha">
            <span className="ficha-nombre">{ficha.nombre}</span>
            <span className="ficha-cifra">
              <span className="ficha-numero">{ficha.numero}</span>
              <span className="ficha-unidad">{ficha.unidad}</span>
            </span>
            <span className="ficha-detalle">{ficha.detalle}</span>
          </Link>
        ))}
      </div>

      <GraficoBarrasTalks
        serie={ritmo.serie}
        borradores={ritmo.borradores}
        provisionales={ritmo.provisionales}
      />

      <Link href="/admin/talks/nuevo" className="boton mt-8">
        Nuevo Talk
      </Link>
    </div>
  );
}
