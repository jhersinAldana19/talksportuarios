import { ETIQUETA_MODALIDAD, partesFecha } from "@/lib/formato";
import type { EventoConRelaciones } from "@/services/eventos";

const ZONA = "America/Lima";

export function EventoDestacado({ evento }: { evento: EventoConRelaciones }) {
  const { dia } = partesFecha(evento.fecha);
  const mes = new Intl.DateTimeFormat("es-PE", { month: "long", timeZone: ZONA })
    .format(evento.fecha)
    .toLocaleLowerCase("es-PE");
  const lugar = [evento.lugar, ETIQUETA_MODALIDAD[evento.modalidad]].filter(Boolean).join(", ");

  return (
    <article className="flex items-start gap-4 sm:gap-6">
      <p className="shrink-0 text-titulo">
        <span className="block text-3xl font-medium leading-none tracking-tight">{dia}</span>
        <span className="mt-1 block text-sm">{mes}</span>
      </p>
      <div className="min-w-0">
        <h2 className="text-2xl font-medium leading-snug tracking-tight text-titulo sm:text-3xl">{evento.titulo}</h2>
        {lugar && <p className="mt-3 text-sm text-texto/75">{lugar}</p>}
        {evento.cupoLimitado && <p className="mt-1 text-sm text-texto/75">Cupo limitado</p>}
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-texto/85">{evento.descripcion}</p>
        {evento.linkInscripcion && (
          <a href={evento.linkInscripcion} target="_blank" rel="noopener" className="boton mt-6">
            Inscribirme
          </a>
        )}
      </div>
    </article>
  );
}

export function LineaEvento({ evento }: { evento: EventoConRelaciones }) {
  const { dia, mes } = partesFecha(evento.fecha);
  const detalle = [evento.aliado?.nombre, ...evento.ponentes.map((ponente) => ponente.nombre)]
    .filter((parte) => parte)
    .join(", ");
  const cuerpo = (
    <>
      <span className="shrink-0 text-titulo">
        <span className="block text-lg font-medium leading-none">{dia}</span>
        <span className="mt-1 block text-sm">{mes.toLocaleLowerCase("es-PE")}</span>
      </span>
      <span className="min-w-0">
        <span className="block font-medium leading-snug text-titulo group-hover:text-magenta">{evento.titulo}</span>
        {detalle && <span className="mt-1 block text-sm text-texto/70">{detalle}</span>}
      </span>
    </>
  );
  const clase =
    "group flex items-baseline gap-4 py-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-magenta";

  if (!evento.linkInscripcion) {
    return <article className={clase}>{cuerpo}</article>;
  }

  return (
    <a href={evento.linkInscripcion} target="_blank" rel="noopener" className={clase}>
      {cuerpo}
    </a>
  );
}
