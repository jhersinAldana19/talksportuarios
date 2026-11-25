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
        <Link href="/talks" className="font-semibold text-titulo hover:text-magenta">
          ← Todos los Talks
        </Link>
      </nav>

      <header className="mb-6 space-y-3">
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-suave px-2.5 py-0.5 text-titulo">
            {etiquetaSerieEdicion(talk.serie, talk.edicion)}
          </span>
          {talk.patrocinado && (
            <span className="rounded-full bg-magenta/10 px-2.5 py-0.5 text-magenta">
              Contenido patrocinado
            </span>
          )}
        </div>
        <h1 className="text-2xl leading-tight font-bold text-titulo sm:text-4xl">{talk.titulo}</h1>
        <p className="text-sm text-texto/70">
          <time dateTime={talk.fechaPublicacion.toISOString()}>
            {formatearFecha(talk.fechaPublicacion)}
          </time>{" "}
          · {formatearDuracion(talk.duracionMin)}
        </p>
      </header>

      <VideoYoutube youtubeId={talk.youtubeId} titulo={talk.titulo} />

      {talk.contenidoProvisional && (
        <p className="mt-6 rounded-xl bg-suave px-4 py-3 text-sm text-titulo">
          <strong>Resumen provisional.</strong> Este resumen y sus puntos clave se completarán
          con la transcripción del Talk.
        </p>
      )}

      <div className="mt-8 grid gap-10 md:grid-cols-[1fr_16rem]">
        <div className="space-y-8">
          <section aria-labelledby="titulo-resumen">
            <h2 id="titulo-resumen" className="mb-3 text-xl font-bold text-titulo">
              Resumen
            </h2>
            <p className="leading-relaxed text-texto/90">{talk.resumen}</p>
          </section>

          {talk.puntosClave.length > 0 && (
            <section aria-labelledby="titulo-puntos">
              <h2 id="titulo-puntos" className="mb-3 text-xl font-bold text-titulo">
                Puntos clave
              </h2>
              <ul className="space-y-2">
                {talk.puntosClave.map((p) => (
                  <li key={p} className="flex gap-3 text-texto/90">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-magenta" aria-hidden="true" />
                    {p}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          {talk.invitados.length > 0 && (
            <section aria-labelledby="titulo-invitados">
              <h2 id="titulo-invitados" className="mb-3 text-sm font-bold tracking-wide text-titulo uppercase">
                {talk.invitados.length === 1 ? "Invitado" : "Invitados"}
              </h2>
              <ul className="space-y-3">
                {talk.invitados.map((i) => (
                  <li key={i.slug} className="rounded-xl bg-superficie p-4 ring-1 ring-borde">
                    <p className="font-bold text-titulo">{i.nombre}</p>
                    {(i.cargo || i.empresa) && (
                      <p className="text-sm text-texto/70">
                        {[i.cargo, i.empresa].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {talk.tags.length > 0 && (
            <section aria-labelledby="titulo-temas">
              <h2 id="titulo-temas" className="mb-3 text-sm font-bold tracking-wide text-titulo uppercase">
                Temas
              </h2>
              <ul className="flex flex-wrap gap-2">
                {talk.tags.map((t) => (
                  <li key={t} className="rounded-full bg-suave px-3 py-1 text-xs font-semibold text-titulo">
                    {t}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <a
            href={`https://www.youtube.com/watch?v=${talk.youtubeId}`}
            target="_blank"
            rel="noopener"
            className="block rounded-full bg-marino px-5 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-marino-oscuro dark:bg-magenta dark:hover:bg-magenta-oscuro"
          >
            Ver en YouTube
          </a>
        </aside>
      </div>
    </article>
  );
}
