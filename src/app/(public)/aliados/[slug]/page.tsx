import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { ListaCursos } from "@/components/ListaCursos";
import { Logo } from "@/components/Logo";
import { obtenerMarca } from "@/services/configuracion";
import { formatearFecha } from "@/lib/formato";
import { SITIO, enlaceWhatsapp } from "@/lib/sitio";
import { enlaceConUtm } from "@/lib/utm";
import { listarSlugsAliados, obtenerAliadoPorSlug } from "@/services/aliados";

export async function generateStaticParams() {
  const slugs = await listarSlugsAliados();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const aliado = await obtenerAliadoPorSlug(slug);
  if (!aliado?.slug) return {};

  const description = aliado.frase ?? aliado.descripcion ?? `Alianza de Talks Portuarios con ${aliado.nombre}.`;
  const url = `/aliados/${aliado.slug}`;
  return {
    title: `${SITIO.nombre} × ${aliado.nombre}`,
    description,
    alternates: { canonical: url },
    openGraph: { url, title: `${SITIO.nombre} × ${aliado.nombre}`, description },
  };
}

export default async function AliadoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [aliado, marca] = await Promise.all([obtenerAliadoPorSlug(slug), obtenerMarca()]);
  if (!aliado?.slug) notFound();
  const slugAliado = aliado.slug;

  const pagina = `${SITIO.url}/aliados/${slugAliado}`;
  const idOrganizacion = `${pagina}#organizacion`;
  const logo = aliado.logoUrl
    ? aliado.logoUrl.startsWith("http")
      ? aliado.logoUrl
      : `${SITIO.url}${aliado.logoUrl}`
    : undefined;
  const rel = aliado.relacionComercial ? "sponsored noopener" : "noopener";

  const organizacion = {
    "@type": "Organization",
    "@id": idOrganizacion,
    name: aliado.nombre,
    ...(aliado.web && { url: aliado.web }),
    ...(logo && { logo }),
    ...(aliado.descripcion && { description: aliado.descripcion }),
    memberOf: { "@type": "Organization", name: SITIO.nombre, url: SITIO.url },
  };

  const cursos = aliado.cursos.map((curso) => ({
    "@type": "Course",
    name: curso.titulo,
    url: curso.url,
    ...(curso.resumen && { description: curso.resumen }),
    inLanguage: "es-PE",
    provider: { "@id": idOrganizacion },
    ...(curso.gratuito && { isAccessibleForFree: true }),
  }));

  return (
    <article className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <JsonLd datos={{ "@context": "https://schema.org", "@graph": [organizacion, ...cursos] }} />

      <nav aria-label="Ruta" className="mb-8 text-sm">
        <Link href="/aliados" className="enlace">
          Aliados
        </Link>
      </nav>

      <header>
        <div className="flex flex-wrap items-center gap-4">
          <Logo logoUrl={marca.logoUrl} />
          <span aria-hidden="true" className="text-2xl text-texto/40">
            ×
          </span>
          {aliado.logoUrl && (
            <img src={aliado.logoUrl} alt={aliado.nombre} className="h-12 w-auto max-w-48 object-contain sm:h-16" />
          )}
        </div>
        <h1 className="mt-6 max-w-3xl text-3xl font-medium tracking-tight text-titulo sm:text-4xl">
          {SITIO.nombre} × {aliado.nombre}
        </h1>
        {aliado.frase && <p className="mt-3 max-w-prose leading-relaxed text-texto/80">{aliado.frase}</p>}
        {aliado.relacionComercial && <p className="mt-2 text-sm text-magenta">Contenido patrocinado</p>}
        {aliado.descripcion && (
          <p className="mt-6 max-w-prose leading-relaxed text-texto/85">{aliado.descripcion}</p>
        )}
        {aliado.web && (
          <a href={enlaceConUtm(aliado.web, slugAliado, "sitio")} target="_blank" rel={rel} className="enlace mt-4">
            Visitar {aliado.nombre}
          </a>
        )}
      </header>

      {aliado.beneficios.length > 0 && (
        <section className="mt-10" aria-labelledby="beneficios">
          <h2 id="beneficios" className="text-2xl font-medium text-titulo">
            Para la comunidad
          </h2>
          <ul className="mt-4 border-t border-borde">
            {aliado.beneficios.map((beneficio) => (
              <li key={beneficio} className="border-b border-borde py-4 text-texto/85">
                {beneficio}
              </li>
            ))}
          </ul>
        </section>
      )}

      {aliado.cursos.length > 0 && (
        <section className="mt-10" aria-labelledby="cursos">
          <h2 id="cursos" className="text-lg font-medium text-titulo">
            Cursos recomendados
          </h2>
          <ListaCursos
            campana={slugAliado}
            cursos={aliado.cursos.map((curso) => ({
              id: curso.id,
              slug: curso.slug,
              titulo: curso.titulo,
              url: curso.url,
              resumen: curso.resumen,
              relacionComercial: aliado.relacionComercial,
            }))}
          />
        </section>
      )}

      <section className="mt-10" aria-labelledby="becas">
        <h2 id="becas" className="text-lg font-medium text-titulo">
          Becas y sorteos
        </h2>
        {aliado.becas.length > 0 ? (
          <ul className="mt-4 border-t border-borde">
            {aliado.becas.map((beca) => (
              <li key={beca.id} className="border-b border-borde py-4">
                <p className="text-sm text-texto/70">
                  {beca.estado === "PROXIMA" ? "Próximo" : "Realizado"}
                  {beca.fecha ? ` · ${formatearFecha(beca.fecha)}` : ""}
                </p>
                <h3 className="mt-1 font-medium text-titulo">{beca.titulo}</h3>
                <p className="mt-2 max-w-prose text-sm leading-relaxed text-texto/80">{beca.descripcion}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 max-w-prose text-texto/75">
            Todavía no hay un sorteo anunciado. El aviso sale por el canal de WhatsApp.
          </p>
        )}
        <a href={enlaceWhatsapp()} target="_blank" rel="noopener" className="boton mt-6">
          Enterarme de las becas
        </a>
      </section>
    </article>
  );
}
