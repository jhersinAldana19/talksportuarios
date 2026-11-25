import { ETIQUETA_MODALIDAD, partesFecha } from "@/lib/formato";
import type { EventoConRelaciones } from "@/services/eventos";
import { IconoWhatsapp } from "./WhatsAppFlotante";

export function EventoCard({ evento }: { evento: EventoConRelaciones }) {
  const { dia, mes, diaSemana } = partesFecha(evento.fecha);

  return (
    <article className="flex flex-col gap-4 rounded-2xl bg-superficie p-5 shadow-sm ring-1 ring-borde sm:flex-row sm:p-6">
      <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl bg-marino text-white dark:bg-magenta">
        <span className="text-3xl leading-none font-bold">{dia}</span>
        <span className="text-sm font-semibold uppercase tracking-wide text-white/75">{mes}</span>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full bg-suave px-2.5 py-0.5 text-titulo">
            {ETIQUETA_MODALIDAD[evento.modalidad]}
          </span>
          {evento.cupoLimitado && (
            <span className="rounded-full bg-magenta/10 px-2.5 py-0.5 text-magenta">Cupo limitado</span>
          )}
          {evento.aliado && (
            <span className="rounded-full bg-suave px-2.5 py-0.5 text-titulo">
              En alianza con {evento.aliado.nombre}
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold leading-snug text-titulo">{evento.titulo}</h3>

        <p className="text-sm capitalize text-texto/70">
          {diaSemana} {dia} de {mes} · {evento.lugar ?? "Lugar por confirmar"}
        </p>

        {evento.ponentes.length > 0 && (
          <p className="text-sm text-texto/80">
            <span className="font-semibold">Ponente:</span>{" "}
            {evento.ponentes.map((p) => p.nombre).join(", ")}
          </p>
        )}

        <p className="text-sm text-texto/80">{evento.descripcion}</p>

        {evento.linkInscripcion && (
          <a
            href={evento.linkInscripcion}
            target="_blank"
            rel="noopener"
            className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-magenta px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-magenta-oscuro"
          >
            <IconoWhatsapp className="h-5 w-5" />
            Inscribirme por WhatsApp
          </a>
        )}
      </div>
    </article>
  );
}
