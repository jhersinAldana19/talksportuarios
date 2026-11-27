import Image from "next/image";
import Link from "next/link";
import { DestacadosCarrusel } from "@/components/DestacadosCarrusel";
import { FranjaSecciones } from "@/components/FranjaSecciones";
import { ETIQUETA_MODALIDAD, ETIQUETA_NIVEL, ETIQUETA_SERIE, etiquetaSerieEdicion, formatearFecha, miniaturaYoutube, partesFecha } from "@/lib/formato";
import { SITIO, enlaceWhatsapp } from "@/lib/sitio";
import { Serie } from "@/generated/prisma/enums";
import { obtenerMarca } from "@/services/configuracion";
import { listarDestacadosInicio } from "@/services/destacados";
import { listarProximosEventos, type EventoConRelaciones } from "@/services/eventos";
import { listarPartnersActivos } from "@/services/partners";
import { listarTalksPublicados } from "@/services/talks";

export default async function InicioPage() {
  const [talks, eventos, partners, destacados, marca] = await Promise.all([
    listarTalksPublicados(),
    listarProximosEventos(),
    listarPartnersActivos(),
    listarDestacadosInicio(),
    obtenerMarca(),
  ]);

  const ultimos = talks.slice(0, 3);

  const logos = partners.flatMap((partner) => {
    const src = partner.logoUrl ?? logoLocal(partner.nombre);
    return src
      ? [{ id: partner.id, nombre: partner.nombre, web: partner.web, slug: partner.slug, estado: partner.estado, nivel: partner.nivel, src }]
      : [];
  });

  return (
    <>
      <section className="relative isolate flex min-h-[20rem] w-full min-w-0 items-center py-8 sm:min-h-[22rem] lg:min-h-[24rem]">
        <Image
          src={marca.heroUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[64%_center] md:object-[72%_center]"
          unoptimized={marca.heroUrl.startsWith("http")}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(90deg,rgb(8_12_40/0.72)_0%,rgb(8_12_40/0.4)_42%,transparent_68%)] md:bg-[linear-gradient(90deg,rgb(8_12_40/0.45)_0%,transparent_42%)]"
        />
        <div className="relative mx-auto flex w-full min-w-0 max-w-6xl flex-col px-4">
          <h1 className="max-w-xl text-3xl font-medium leading-[1.15] tracking-tight text-claro sm:text-5xl">
            Charlas para la comunidad marítimo-portuaria del Callao
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-claro/85 sm:mt-5 sm:text-base">{SITIO.lema}</p>
          <Link href="/talks" className="boton mt-6 self-start sm:mt-8">
            Ver últimos talks
          </Link>
        </div>
      </section>

      <FranjaSecciones />

      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-8 sm:py-12 lg:grid-cols-[minmax(0,1.45fr)_minmax(16rem,0.8fr)] lg:items-start">
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-2xl font-medium text-titulo">Últimos Talks</h2>
            <Link href="/talks" className="text-sm font-semibold text-magenta hover:text-magenta-oscuro">
              Ver todos
            </Link>
          </div>
          {ultimos.length > 0 ? (
            <ul className="mt-4 border-t border-borde">
              {ultimos.map((talk) => (
                <li key={talk.id} className="border-b border-borde">
                  <Link href={`/talks/${talk.slug}`} className="flex gap-4 py-4">
                    <Image
                      src={miniaturaYoutube(talk.youtubeId)}
                      alt=""
                      width={160}
                      height={90}
                      className="h-14 w-24 shrink-0 rounded-[10px] object-cover sm:h-16 sm:w-28"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm text-texto/60">{etiquetaSerieEdicion(talk.serie, talk.edicion)}</span>
                      <span className="mt-1 block font-medium leading-snug text-titulo">{talk.titulo}</span>
                      <span className="mt-1 block text-sm text-texto/70">
                        {talk.invitados.length > 0
                          ? talk.invitados.map((invitado) => invitado.nombre).join(", ")
                          : formatearFecha(talk.fechaPublicacion)}
                      </span>
                      {talk.patrocinado && (
                        <span className="mt-1 block text-sm text-magenta">Contenido patrocinado</span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-texto/70">Todavía no hay Talks publicados.</p>
          )}
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2" aria-label="Series">
            {(Object.keys(ETIQUETA_SERIE) as Serie[]).map((serie) => (
              <li key={serie}>
                <Link href={`/talks#${serie}`} className="text-sm font-medium text-titulo hover:text-magenta">
                  {ETIQUETA_SERIE[serie]}
                </Link>
              </li>
            ))}
          </ul>

          <DestacadosCarrusel slides={destacados} />
        </div>

        <div>
          <h2 className="text-2xl font-medium text-titulo">Próximos eventos</h2>
          {eventos.length > 0 ? (
            <div className="mt-4 space-y-4">
              {eventos.map((evento) => (
                <EventoAgenda key={evento.id} evento={evento} />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-texto/70">Pronto anunciaremos el próximo evento.</p>
          )}
          <Link href="/eventos" className="enlace mt-6">
            Todos los eventos
          </Link>
        </div>
      </section>

      {logos.length > 0 && (
        <section aria-label="Partners y aliados" className="py-8">
          <h2 className="sr-only">Partners y aliados</h2>
          <ul className="mx-auto grid w-full min-w-0 max-w-3xl grid-cols-3 items-center gap-3 px-4 py-2 sm:max-w-4xl sm:gap-10">
            {logos.map((partner) => {
              const ficha = partner.estado === "PUBLICADO" && partner.slug ? `/aliados/${partner.slug}` : null;
              const logo = <LogoPartner nombre={partner.nombre} src={partner.src} nivel={partner.nivel} />;
              return (
                <li key={partner.id} className="min-w-0">
                  {ficha ? (
                    <Link href={ficha} className="block min-w-0">
                      {logo}
                    </Link>
                  ) : partner.web ? (
                    <a href={partner.web} target="_blank" rel="noopener" className="block min-w-0">
                      {logo}
                    </a>
                  ) : (
                    logo
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <BandaCierre evento={eventos[0]} />
    </>
  );
}

function logoLocal(nombre: string): string | null {
  if (nombre === "TECPORT") return "/partners/tecport.webp";
  if (nombre === "COEX PUCP") return "/partners/coex-pucp.webp";
  if (nombre === "Sarmiento Academia") return "/partners/sarmiento.webp";
  return null;
}

function LogoPartner({ nombre, src, nivel }: { nombre: string; src: string; nivel: keyof typeof ETIQUETA_NIVEL }) {
  // En el inicio no mostramos "Partner fundador"; solo Aliado / Partner.
  const etiqueta = nivel === "PARTNER_FUNDADOR" ? null : ETIQUETA_NIVEL[nivel];
  return (
    <span className="block min-w-0 text-center">
      <img src={src} alt={nombre} className="mx-auto block h-12 w-full min-w-0 max-w-full object-contain sm:h-16" />
      {etiqueta ? <span className="mt-2 block text-[0.68rem] text-texto/60">{etiqueta}</span> : null}
    </span>
  );
}

function BandaCierre({ evento }: { evento: EventoConRelaciones | undefined }) {
  if (!evento) {
    return (
      <section className="border-t border-borde bg-suave">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium text-titulo">Únete a la comunidad</p>
          <a href={enlaceWhatsapp()} target="_blank" rel="noopener" className="boton shrink-0">
            Unirme al WhatsApp
          </a>
        </div>
      </section>
    );
  }

  const fecha = partesFecha(evento.fecha);

  return (
    <section className="border-t border-borde bg-suave">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="min-w-0">
          <span className="text-sm text-texto/70">
            {fecha.dia} {fecha.mes.toLocaleLowerCase("es-PE")}
          </span>
          <span className="mt-1 block font-medium leading-snug text-titulo">{evento.titulo}</span>
        </p>
        {evento.linkInscripcion ? (
          <a href={evento.linkInscripcion} target="_blank" rel="noopener" className="boton shrink-0">
            Inscribirme
          </a>
        ) : (
          <Link href="/eventos" className="boton shrink-0">
            Ver eventos
          </Link>
        )}
      </div>
    </section>
  );
}

function EventoAgenda({ evento }: { evento: EventoConRelaciones }) {
  const fecha = partesFecha(evento.fecha);

  return (
    <article className="rounded-[10px] border border-borde p-5">
      <p className="text-titulo">
        <span className="block text-4xl font-medium leading-none tracking-tight">{fecha.dia.padStart(2, "0")}</span>
        <span className="mt-1 block text-[0.68rem] font-semibold tracking-[0.14em] uppercase">{fecha.mes}</span>
      </p>
      <p className="mt-3 text-sm text-texto/70">{ETIQUETA_MODALIDAD[evento.modalidad]}</p>
      <h3 className="mt-1 font-medium leading-snug text-titulo">{evento.titulo}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-texto/80">{evento.descripcion}</p>
      {evento.linkInscripcion ? (
        <a href={evento.linkInscripcion} target="_blank" rel="noopener" className="boton mt-5">
          Inscribirme
        </a>
      ) : (
        <Link href="/eventos" className="enlace mt-5">
          Ver eventos
        </Link>
      )}
    </article>
  );
}
