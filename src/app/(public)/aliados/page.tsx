import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { SITIO } from "@/lib/sitio";
import { listarAliadosPublicados } from "@/services/aliados";

export const metadata: Metadata = {
  title: "Aliados",
  description:
    "Organizaciones que forman y acompañan a la comunidad de Talks Portuarios: cursos, becas y encuentros del sector marítimo-portuario.",
  alternates: { canonical: "/aliados" },
  openGraph: { url: "/aliados" },
};

export default async function AliadosPage() {
  const aliados = await listarAliadosPublicados();

  const listado = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Aliados de Talks Portuarios",
    itemListElement: aliados.flatMap((aliado, indice) =>
      aliado.slug
        ? [
            {
              "@type": "ListItem",
              position: indice + 1,
              item: {
                "@type": "Organization",
                name: aliado.nombre,
                url: `${SITIO.url}/aliados/${aliado.slug}`,
              },
            },
          ]
        : [],
    ),
  };

  return (
    <div className="pagina-aliados mx-auto max-w-4xl px-4">
      <style>{`
        .pagina-aliados {
          padding-top: 3.25rem;
          padding-bottom: 4.5rem;
        }
        .pagina-aliados > header {
          margin-bottom: 2.75rem;
        }
        .pagina-aliados > header h1 {
          font-size: 2rem;
          line-height: 1.15;
          letter-spacing: -0.02em;
        }
        .pagina-aliados > header p {
          margin-top: 1rem;
          max-width: 36rem;
          line-height: 1.65;
        }
        .aliado-destacado {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 1.75rem;
          background: var(--panel);
          padding: 2rem 1.5rem;
          color: inherit;
          text-decoration: none;
        }
        .aliado-destacado:focus-visible {
          outline: 2px solid var(--color-magenta);
          outline-offset: 4px;
        }
        .aliado-destacado img {
          height: 4.5rem;
          width: auto;
          max-width: 14rem;
          object-fit: contain;
        }
        .aliado-destacado .nombre {
          display: block;
          font-size: 0.95rem;
          color: var(--texto);
        }
        .aliado-destacado .frase {
          display: block;
          margin-top: 0.75rem;
          max-width: 34rem;
          font-size: 1.35rem;
          font-weight: 500;
          line-height: 1.45;
          letter-spacing: -0.02em;
          color: var(--titulo);
        }
        .aliado-destacado:hover .frase,
        .aliado-destacado:hover .titulo {
          color: var(--color-magenta);
        }
        .aliado-destacado .titulo {
          display: block;
          font-size: 1.35rem;
          font-weight: 500;
          line-height: 1.45;
          letter-spacing: -0.02em;
          color: var(--titulo);
        }
        .aliado-destacado .patrocinado {
          display: block;
          margin-top: 0.85rem;
          color: var(--color-magenta);
        }
        .aliados-resto {
          margin-top: 2.5rem;
          border-top: 1px solid var(--borde);
        }
        .aliados-resto li {
          border-bottom: 1px solid var(--borde);
        }
        .aliado-fila {
          display: flex;
          align-items: flex-start;
          gap: 1.35rem;
          padding: 1.6rem 0;
          color: inherit;
          text-decoration: none;
        }
        .aliado-fila:focus-visible {
          outline: 2px solid var(--color-magenta);
          outline-offset: 4px;
        }
        .aliado-fila img {
          height: 3.25rem;
          width: 7.5rem;
          flex: none;
          object-fit: contain;
        }
        .aliado-fila .nombre {
          display: block;
          font-weight: 500;
          color: var(--titulo);
        }
        .aliado-fila:hover .nombre { color: var(--color-magenta); }
        .aliado-fila .frase {
          display: block;
          margin-top: 0.45rem;
          max-width: 36rem;
          line-height: 1.6;
          color: var(--texto);
          opacity: 0.8;
        }
        .aliado-fila .patrocinado {
          display: block;
          margin-top: 0.45rem;
          color: var(--color-magenta);
        }
        @media (min-width: 640px) {
          .pagina-aliados {
            padding-top: 4rem;
            padding-bottom: 5.5rem;
          }
          .pagina-aliados > header h1 { font-size: 2.35rem; }
          .aliado-destacado {
            flex-direction: row;
            align-items: center;
            gap: 2.5rem;
            padding: 2.5rem 2.25rem;
          }
          .aliado-destacado img {
            height: 5.5rem;
            max-width: 16rem;
          }
          .aliado-destacado .frase,
          .aliado-destacado .titulo {
            font-size: 1.5rem;
          }
          .aliado-fila {
            align-items: center;
            gap: 1.75rem;
            padding: 1.85rem 0;
          }
        }
      `}</style>
      {aliados.length > 0 && <JsonLd datos={listado} />}

      <header>
        <h1 className="font-medium tracking-tight text-titulo">Aliados</h1>
        <p className="text-texto/80">Cursos y becas para la comunidad.</p>
      </header>

      {aliados.length > 0 ? (
        <Listado aliados={aliados} />
      ) : (
        <p className="text-texto/75">Pronto presentaremos a los aliados de la comunidad.</p>
      )}
    </div>
  );
}

function Listado({ aliados }: { aliados: Awaited<ReturnType<typeof listarAliadosPublicados>> }) {
  const destacado =
    aliados.find((aliado) => aliado._count.cursos > 0 || aliado._count.becas > 0) ?? aliados[0];
  const resto = aliados.filter((aliado) => aliado.id !== destacado.id);

  return (
    <div>
      <FilaDestacada aliado={destacado} />
      {resto.length > 0 && (
        <ul className="aliados-resto">
          {resto.map((aliado) => (
            <li key={aliado.id}>
              <Fila aliado={aliado} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilaDestacada({
  aliado,
}: {
  aliado: Awaited<ReturnType<typeof listarAliadosPublicados>>[number];
}) {
  return (
    <Link href={`/aliados/${aliado.slug}`} className="aliado-destacado group">
      {aliado.logoUrl && <img src={aliado.logoUrl} alt="" />}
      <span className="min-w-0">
        {aliado.frase ? (
          <>
            <span className="nombre">{aliado.nombre}</span>
            <span className="frase">{aliado.frase}</span>
          </>
        ) : (
          <span className="titulo">{aliado.nombre}</span>
        )}
        {aliado.relacionComercial && <span className="patrocinado">Contenido patrocinado</span>}
      </span>
    </Link>
  );
}

function Fila({ aliado }: { aliado: Awaited<ReturnType<typeof listarAliadosPublicados>>[number] }) {
  return (
    <Link href={`/aliados/${aliado.slug}`} className="aliado-fila group">
      {aliado.logoUrl && <img src={aliado.logoUrl} alt="" />}
      <span className="min-w-0">
        <span className="nombre">{aliado.nombre}</span>
        {aliado.frase && <span className="frase">{aliado.frase}</span>}
        {aliado.relacionComercial && <span className="patrocinado">Contenido patrocinado</span>}
      </span>
    </Link>
  );
}
