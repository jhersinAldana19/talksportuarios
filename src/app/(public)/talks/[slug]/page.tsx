import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { VideoYoutube } from "@/components/VideoYoutube";
import {
  etiquetaSerieEdicion,
  duracionISO,
  formatearDuracion,
  formatearFecha,
  miniaturaYoutube,
} from "@/lib/formato";
import { SITIO } from "@/lib/sitio";
import { listarSlugsTalks, obtenerTalkPorSlug } from "@/services/talks";

// Prerenderiza en el build una página por cada Talk publicado.
// Un Talk nuevo se genera en su primera visita (y queda en caché).
export async function generateStaticParams() {
  const slugs = await listarSlugsTalks();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/talks/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const talk = await obtenerTalkPorSlug(slug);
  if (!talk) return {};

  const url = `/talks/${talk.slug}`;
  return {
    title: talk.titulo,
    description: talk.resumen,
    alternates: { canonical: url },
    openGraph: {
      type: "video.other",
      url,
      title: talk.titulo,
      description: talk.resumen,
      images: [{ url: miniaturaYoutube(talk.youtubeId), width: 480, height: 360 }],
    },
  };
}

export default async function TalkPage({ params }: PageProps<"/talks/[slug]">) {
  const { slug } = await params;
  const talk = await obtenerTalkPorSlug(slug);
  if (!talk) notFound();

  const videoObject = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: talk.titulo,
    description: talk.resumen,
    thumbnailUrl: [miniaturaYoutube(talk.youtubeId)],
    uploadDate: talk.fechaPublicacion.toISOString(),
    duration: duracionISO(talk.duracionMin),
    embedUrl: `https://www.youtube.com/embed/${talk.youtubeId}`,
    contentUrl: `https://www.youtube.com/watch?v=${talk.youtubeId}`,
    url: `${SITIO.url}/talks/${talk.slug}`,
    inLanguage: "es-PE",
    keywords: talk.tags.join(", "),
    publisher: { "@type": "Organization", name: SITIO.nombre, url: SITIO.url },
    ...(talk.invitados.length > 0 && {
      actor: talk.invitados.map((i) => ({ "@type": "Person", name: i.nombre })),
    }),
  };

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <JsonLd datos={videoObject} />

      <nav aria-label="Ruta" className="mb-6 text-sm">
        <Link
          href="/talks"
          className="font-medium text-titulo underline decoration-titulo/30 underline-offset-4 hover:decoration-magenta focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-magenta"
        >
          Todos los Talks
        </Link>
      </nav>

      <header className="mb-6">
        <h1 className="max-w-3xl text-2xl leading-tight font-medium tracking-tight text-titulo sm:text-4xl">
          {talk.titulo}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-texto/70">
          {etiquetaSerieEdicion(talk.serie, talk.edicion)}.{" "}
          <time dateTime={talk.fechaPublicacion.toISOString()}>
            {formatearFecha(talk.fechaPublicacion)}
          </time>
          . {formatearDuracion(talk.duracionMin)}.
        </p>
        {talk.patrocinado && (
          <p className="mt-2 text-sm font-medium text-magenta">Contenido patrocinado</p>
        )}
      </header>

      <VideoYoutube youtubeId={talk.youtubeId} titulo={talk.titulo} />

      {talk.contenidoProvisional && (
        <p className="mt-6 max-w-prose text-sm leading-relaxed text-texto/80">
          <strong className="font-semibold text-titulo">Resumen provisional.</strong> Este resumen
          y sus puntos clave se completarán con la transcripción del Talk.
        </p>
      )}

      <div className="mt-8 grid gap-10 md:grid-cols-[1fr_16rem]">
        <div className="space-y-8">
          <section aria-labelledby="titulo-resumen">
            <h2 id="titulo-resumen" className="mb-3 text-xl font-semibold text-titulo">
              Resumen
            </h2>
            <p className="max-w-prose leading-relaxed text-texto/90">{talk.resumen}</p>
          </section>

          {talk.puntosClave.length > 0 && (
            <section aria-labelledby="titulo-puntos">
              <h2 id="titulo-puntos" className="mb-3 text-xl font-semibold text-titulo">
                Puntos clave
              </h2>
              <ul className="max-w-prose list-disc space-y-2 pl-5 text-texto/90">
                {talk.puntosClave.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          {talk.invitados.length > 0 && (
            <section aria-labelledby="titulo-invitados">
              <h2 id="titulo-invitados" className="text-base font-semibold text-titulo">
                {talk.invitados.length === 1 ? "Invitado" : "Invitados"}
              </h2>
              <ul className="mt-3 space-y-4">
                {talk.invitados.map((i) => (
                  <li key={i.slug}>
                    <p className="font-medium text-titulo">{i.nombre}</p>
                    {(i.cargo || i.empresa) && (
                      <p className="text-sm text-texto/70">
                        {[i.cargo, i.empresa].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {talk.tags.length > 0 && (
            <section aria-labelledby="titulo-temas">
              <h2 id="titulo-temas" className="text-base font-semibold text-titulo">
                Temas
              </h2>
              <ul className="mt-3 space-y-1 text-sm text-texto/80">
                {talk.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </section>
          )}

          <a
            href={`https://www.youtube.com/watch?v=${talk.youtubeId}`}
            target="_blank"
            rel="noopener"
            className="enlace"
          >
            Ver en YouTube
          </a>
        </aside>
      </div>
    </article>
  );
}
