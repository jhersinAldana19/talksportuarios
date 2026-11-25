import Image from "next/image";
import Link from "next/link";
import { EventoCard } from "@/components/EventoCard";
import { ETIQUETA_NIVEL, etiquetaSerieEdicion, formatearDuracion, miniaturaYoutube } from "@/lib/formato";
import { SITIO } from "@/lib/sitio";
import { listarProximosEventos } from "@/services/eventos";
import { listarPartnersActivos } from "@/services/partners";
import { obtenerUltimoTalk } from "@/services/talks";

export default async function InicioPage() {
  const [ultimoTalk, eventos, partners] = await Promise.all([
    obtenerUltimoTalk(),
    listarProximosEventos(2),
    listarPartnersActivos(),
  ]);

  const fundadores = partners.filter((p) => p.nivel === "PARTNER_FUNDADOR");
  const otros = partners.filter((p) => p.nivel !== "PARTNER_FUNDADOR");

  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-marino-oscuro via-marino to-marino text-white">
        <svg
          className="absolute -bottom-1 left-0 w-full text-fondo"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 40c240-40 480-40 720 0s480 40 720 0v40H0Z" fill="currentColor" />
        </svg>
        <div className="relative mx-auto max-w-6xl px-4 pt-16 pb-24 sm:pt-24 sm:pb-32">
          <p className="mb-4 text-sm font-semibold tracking-widest text-white/70 uppercase">
            Comunidad marítimo-portuaria del Perú · desde {SITIO.fundacion}
          </p>
          <h1 className="max-w-3xl text-4xl leading-tight font-bold sm:text-6xl">
            <span className="font-script text-5xl text-white sm:text-7xl">Talks Portuarios</span>
            <span className="mt-3 block text-2xl font-semibold text-white/90 sm:text-3xl">
              {SITIO.lema}
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-base text-white/80 sm:text-lg">
            Charlas con expertos del sector, eventos presenciales y contenido para quienes hacen
            posible el comercio exterior desde el Callao.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/talks"
              className="rounded-full bg-magenta px-6 py-3 font-bold text-white transition-colors hover:bg-magenta-oscuro"
            >
              Ver los Talks
            </Link>
            <Link
              href="/eventos"
              className="rounded-full px-6 py-3 font-bold text-white ring-2 ring-white/40 transition-colors hover:bg-white/10"
            >
              Próximos eventos
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Último Talk ─── */}
      {ultimoTalk && (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16" aria-labelledby="titulo-ultimo-talk">
          <h2 id="titulo-ultimo-talk" className="mb-6 text-2xl font-bold text-titulo sm:text-3xl">
            Último Talk
          </h2>
          <article className="grid overflow-hidden rounded-2xl bg-superficie shadow-sm ring-1 ring-borde md:grid-cols-2">
            <Link href={`/talks/${ultimoTalk.slug}`} className="relative block aspect-video md:aspect-auto">
              <Image
                src={miniaturaYoutube(ultimoTalk.youtubeId)}
                alt=""
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
                priority
              />
            </Link>
            <div className="flex flex-col gap-3 p-6 sm:p-8">
              <p className="text-sm font-semibold text-magenta">
                {etiquetaSerieEdicion(ultimoTalk.serie, ultimoTalk.edicion)} ·{" "}
                {formatearDuracion(ultimoTalk.duracionMin)}
              </p>
              <h3 className="text-xl font-bold leading-snug text-titulo sm:text-2xl">
                <Link href={`/talks/${ultimoTalk.slug}`} className="hover:text-magenta">
                  {ultimoTalk.titulo}
                </Link>
              </h3>
              {ultimoTalk.invitados.length > 0 && (
                <p className="text-sm font-semibold text-texto/80">
                  Con {ultimoTalk.invitados.map((i) => i.nombre).join(", ")}
                </p>
              )}
              <p className="text-texto/80">{ultimoTalk.resumen}</p>
              <Link
                href={`/talks/${ultimoTalk.slug}`}
                className="mt-auto w-fit rounded-full bg-marino px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-marino-oscuro dark:bg-magenta dark:hover:bg-magenta-oscuro"
              >
                Ver el Talk
              </Link>
            </div>
          </article>
        </section>
      )}

      {/* ─── Próximos eventos ─── */}
      <section className="bg-suave" aria-labelledby="titulo-eventos">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 id="titulo-eventos" className="text-2xl font-bold text-titulo sm:text-3xl">
              Próximos eventos
            </h2>
            <Link href="/eventos" className="text-sm font-bold text-magenta hover:underline">
              Ver todos →
            </Link>
          </div>
          {eventos.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {eventos.map((e) => (
                <EventoCard key={e.id} evento={e} />
              ))}
            </div>
          ) : (
            <p className="text-texto/70">Pronto anunciaremos nuevos eventos.</p>
          )}
        </div>
      </section>

      {/* ─── Partners ─── */}
      {partners.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16" aria-labelledby="titulo-partners">
          <h2 id="titulo-partners" className="mb-2 text-2xl font-bold text-titulo sm:text-3xl">
            Partners y aliados
          </h2>
          <p className="mb-8 text-texto/70">
            Organizaciones que hacen posible Talks Portuarios.
          </p>

          <div className="space-y-6">
            {fundadores.map((p) => (
              <div
                key={p.id}
                className="flex flex-col items-start gap-1 rounded-2xl bg-marino p-6 text-white ring-1 ring-borde sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-2xl font-bold tracking-wide">{p.nombre}</span>
                <span className="rounded-full bg-magenta px-3 py-1 text-xs font-bold tracking-wide uppercase">
                  {ETIQUETA_NIVEL[p.nivel]}
                </span>
              </div>
            ))}

            {otros.length > 0 && (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {otros.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between rounded-2xl bg-superficie p-5 ring-1 ring-borde"
                  >
                    <span className="font-bold text-titulo">{p.nombre}</span>
                    <span className="text-xs font-semibold text-magenta uppercase">
                      {ETIQUETA_NIVEL[p.nivel]}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}
    </>
  );
}
