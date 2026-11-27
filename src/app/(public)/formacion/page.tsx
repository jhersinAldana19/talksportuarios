import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { ListaCursos } from "@/components/ListaCursos";
import { formatearFecha } from "@/lib/formato";
import { enlaceWhatsapp } from "@/lib/sitio";
import { listarBecasPublicas, listarCursosRecomendados } from "@/services/formacion";
import { listarProximosEventos } from "@/services/eventos";
import { listarTalksPublicados } from "@/services/talks";

export const metadata: Metadata = {
  title: "Formación",
  description:
    "Cursos recomendados por los aliados de Talks Portuarios, becas y sorteos, y Talks en vivo con certificado por asistir por Zoom.",
  alternates: { canonical: "/formacion" },
  openGraph: { url: "/formacion" },
};

export default async function FormacionPage() {
  const [cursos, becas, talks, proximos] = await Promise.all([
    listarCursosRecomendados(),
    listarBecasPublicas(),
    listarTalksPublicados(),
    listarProximosEventos(),
  ]);
  const recientes = talks.slice(0, 6);
  const proximo = proximos.find((evento) => evento.modalidad === "VIRTUAL");

  const datosCursos = cursos.map((curso) => ({
    "@type": "Course",
    name: curso.titulo,
    url: curso.url,
    ...(curso.resumen && { description: curso.resumen }),
    inLanguage: "es-PE",
    provider: {
      "@type": "Organization",
      name: curso.partner.nombre,
      ...(curso.partner.web && { url: curso.partner.web }),
    },
    ...(curso.gratuito && { isAccessibleForFree: true }),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      {datosCursos.length > 0 && <JsonLd datos={datosCursos} />}

      <header className="max-w-2xl">
        <h1 className="text-3xl font-medium tracking-tight text-titulo sm:text-4xl">Formación y talento</h1>
        <p className="mt-4 max-w-prose text-lg leading-relaxed text-texto/80">
          Cursos de los aliados, becas para la comunidad y Talks en vivo con certificado.
        </p>
      </header>

      <section className="mt-12 bg-marino px-6 py-12 text-claro sm:px-10" aria-labelledby="talks">
        <div className="max-w-2xl">
          <h2 id="talks" className="text-2xl font-medium sm:text-3xl">
            Talks en vivo con certificado
          </h2>
          <p className="mt-4 text-base leading-relaxed text-claro/85">
            El certificado es por asistir en vivo por Zoom. El enlace de la sesión se pide por WhatsApp.
          </p>
          {proximo ? (
            <>
              <p className="mt-8 text-sm text-claro/70">{formatearFecha(proximo.fecha)}</p>
              <p className="mt-2 text-xl font-medium leading-snug sm:text-2xl">{proximo.titulo}</p>
              <a href={enlaceWhatsapp()} target="_blank" rel="noopener" className="boton mt-8">
                Pedir el enlace
              </a>
            </>
          ) : (
            <>
              <p className="mt-8 text-lg leading-relaxed">
                Pronto anunciaremos el próximo Talk en vivo. Únete a nuestro WhatsApp para enterarte
              </p>
              <a href={enlaceWhatsapp()} target="_blank" rel="noopener" className="boton mt-8">
                Unirme al WhatsApp
              </a>
            </>
          )}
        </div>
      </section>

      <section className="max-w-3xl py-12" aria-labelledby="cursos">
        <h2 id="cursos" className="text-2xl font-medium text-titulo">
          Cursos recomendados
        </h2>
        {cursos.length > 0 ? (
          <ListaCursos
            campana="formacion"
            programa
            cursos={cursos.flatMap((curso) =>
              curso.partner.slug
                ? [
                    {
                      id: curso.id,
                      slug: curso.slug,
                      titulo: curso.titulo,
                      url: curso.url,
                      resumen: curso.resumen,
                      aliadoNombre: curso.partner.nombre,
                      aliadoSlug: curso.partner.slug,
                      relacionComercial: curso.partner.relacionComercial,
                    },
                  ]
                : [],
            )}
          />
        ) : (
          <p className="mt-6 text-texto/75">Pronto recomendaremos cursos de los aliados.</p>
        )}
      </section>

      <section className="max-w-2xl py-12" aria-labelledby="becas">
        <h2 id="becas" className="text-2xl font-medium text-titulo">
          Becas y sorteos
        </h2>
        <ListaBecas becas={becas} />
      </section>

      <section className="border-t border-borde py-12" aria-labelledby="revive">
        <div className="flex items-baseline justify-between gap-6">
          <h2 id="revive" className="text-2xl font-medium text-titulo">
            Revive los últimos Talks
          </h2>
          <Link href="/talks" className="enlace shrink-0">
            Ver todos los Talks
          </Link>
        </div>
        {recientes.length > 0 && (
          <ul className="mt-6 border-t border-borde">
            {recientes.map((talk) => (
              <li key={talk.id} className="border-b border-borde">
                <Link
                  href={`/talks/${talk.slug}`}
                  className="flex items-baseline justify-between gap-6 py-5"
                >
                  <span className="font-medium leading-snug text-titulo">{talk.titulo}</span>
                  <span className="shrink-0 text-sm text-texto/60">{formatearFecha(talk.fechaPublicacion)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ListaBecas({
  becas,
}: {
  becas: {
    id: string;
    titulo: string;
    descripcion: string;
    fecha: Date | null;
    estado: string;
    partner: { nombre: string; slug: string | null };
  }[];
}) {
  if (becas.length === 0) {
    return <p className="mt-3 text-texto/75">Todavía no hay un sorteo anunciado.</p>;
  }

  const destacada = becas.find((beca) => beca.estado === "PROXIMA") ?? becas[0];
  const resto = becas.filter((beca) => beca.id !== destacada.id);

  return (
    <>
      <article className="mt-8">
        <p className="text-sm text-texto/70">{lineaBeca(destacada)}</p>
        <h3 className="mt-2 text-xl font-medium leading-snug text-titulo">{destacada.titulo}</h3>
        <p className="mt-4 max-w-prose leading-relaxed text-texto/80">{destacada.descripcion}</p>
      </article>
      {resto.length > 0 && (
        <ul className="mt-4 border-t border-borde">
          {resto.map((beca) => (
            <li key={beca.id} className="border-b border-borde py-3">
              <p className="text-sm text-texto/70">{lineaBeca(beca)}</p>
              <p className="mt-1 text-sm font-medium text-titulo">{beca.titulo}</p>
            </li>
          ))}
        </ul>
      )}
      <a href={enlaceWhatsapp()} target="_blank" rel="noopener" className="boton mt-8">
        Enterarme de las becas
      </a>
    </>
  );
}

function lineaBeca(beca: { estado: string; fecha: Date | null; partner: { nombre: string; slug: string | null } }) {
  const partes = [
    beca.estado === "PROXIMA" ? "Próximo" : "Realizado",
    beca.fecha ? formatearFecha(beca.fecha) : null,
    beca.partner.slug ? beca.partner.nombre : null,
  ].filter((parte) => parte);
  return partes.join(", ");
}
