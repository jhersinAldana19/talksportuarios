import Link from "next/link";
import { enlaceConUtm } from "@/lib/utm";

export type CursoRecomendado = {
  id: string;
  slug: string;
  titulo: string;
  url: string;
  resumen: string | null;
  aliadoNombre?: string;
  aliadoSlug?: string | null;
  relacionComercial: boolean;
};

export function ListaCursos({
  cursos,
  campana,
  programa = false,
}: {
  cursos: CursoRecomendado[];
  campana: string;
  programa?: boolean;
}) {
  if (!programa) {
    return (
      <ul className="mt-4 border-t border-borde">
        {cursos.map((curso) => (
          <FilaCurso key={curso.id} curso={curso} campana={campana} conEnlace />
        ))}
      </ul>
    );
  }

  const [primero, ...resto] = cursos;
  if (!primero) return null;

  return (
    <div className="mt-8">
      <CursoPrincipal curso={primero} campana={campana} />
      {resto.length > 0 && (
        <ul className="mt-8 border-t border-borde">
          {resto.map((curso) => (
            <FilaCurso key={curso.id} curso={curso} campana={campana} />
          ))}
        </ul>
      )}
    </div>
  );
}

function CursoPrincipal({ curso, campana }: { curso: CursoRecomendado; campana: string }) {
  const rel = curso.relacionComercial ? "sponsored noopener" : "noopener";
  return (
    <article>
      <h3 className="text-2xl font-medium leading-snug text-titulo">{curso.titulo}</h3>
      {curso.resumen && <p className="mt-3 max-w-prose leading-relaxed text-texto/75">{curso.resumen}</p>}
      <Aliado curso={curso} />
      {curso.relacionComercial && <p className="mt-2 text-sm text-magenta">Contenido patrocinado</p>}
      <a href={enlaceConUtm(curso.url, campana, curso.slug)} target="_blank" rel={rel} className="enlace mt-6">
        Ver el curso
      </a>
    </article>
  );
}

function FilaCurso({
  curso,
  campana,
  conEnlace = false,
}: {
  curso: CursoRecomendado;
  campana: string;
  conEnlace?: boolean;
}) {
  const rel = curso.relacionComercial ? "sponsored noopener" : "noopener";
  return (
    <li
      className={
        conEnlace
          ? "flex flex-col gap-3 border-b border-borde py-4 sm:flex-row sm:items-baseline sm:justify-between"
          : "border-b border-borde py-5"
      }
    >
      <div className="min-w-0">
        <h3 className="font-medium leading-snug text-titulo">
          {conEnlace ? (
            curso.titulo
          ) : (
            <a
              href={enlaceConUtm(curso.url, campana, curso.slug)}
              target="_blank"
              rel={rel}
              className="hover:text-magenta"
            >
              {curso.titulo}
            </a>
          )}
        </h3>
        {curso.resumen && <p className="mt-1 text-sm text-texto/70">{curso.resumen}</p>}
        <Aliado curso={curso} />
        {curso.relacionComercial && <p className="mt-1 text-sm text-magenta">Contenido patrocinado</p>}
      </div>
      {conEnlace && (
        <a href={enlaceConUtm(curso.url, campana, curso.slug)} target="_blank" rel={rel} className="enlace shrink-0">
          Ver el curso
        </a>
      )}
    </li>
  );
}

function Aliado({ curso }: { curso: CursoRecomendado }) {
  if (!curso.aliadoSlug || !curso.aliadoNombre) return null;
  return (
    <Link href={`/aliados/${curso.aliadoSlug}`} className="mt-1 block text-sm text-texto/70 hover:text-magenta">
      {curso.aliadoNombre}
    </Link>
  );
}
