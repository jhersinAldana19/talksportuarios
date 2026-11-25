import Image from "next/image";
import Link from "next/link";
import { etiquetaSerieEdicion, formatearDuracion, miniaturaYoutube } from "@/lib/formato";
import type { Serie } from "@/generated/prisma/enums";

// Datos mínimos que necesita la tarjeta (objetos planos: también se usa desde un Client Component).
export type TalkResumen = {
  slug: string;
  titulo: string;
  serie: Serie;
  edicion: number | null;
  youtubeId: string;
  duracionMin: number;
  patrocinado: boolean;
  invitados: { nombre: string }[];
};

export function TalkCard({ talk, prioridad = false }: { talk: TalkResumen; prioridad?: boolean }) {
  return (
    <article className="group flex w-full flex-col overflow-hidden rounded-2xl bg-superficie shadow-sm ring-1 ring-borde transition-shadow hover:shadow-md">
      <Link href={`/talks/${talk.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-video bg-marino/10">
          <Image
            src={miniaturaYoutube(talk.youtubeId)}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            priority={prioridad}
          />
          <span className="absolute right-2 bottom-2 rounded bg-black/75 px-1.5 py-0.5 text-xs font-semibold text-white">
            {formatearDuracion(talk.duracionMin)}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-suave px-2.5 py-0.5 text-xs font-semibold text-titulo">
              {etiquetaSerieEdicion(talk.serie, talk.edicion)}
            </span>
            {talk.patrocinado && (
              <span className="rounded-full bg-magenta/10 px-2.5 py-0.5 text-xs font-semibold text-magenta">
                Contenido patrocinado
              </span>
            )}
          </div>
          <h3 className="font-bold leading-snug text-titulo group-hover:text-magenta">{talk.titulo}</h3>
          {talk.invitados.length > 0 && (
            <p className="mt-auto text-sm text-texto/70">
              Con {talk.invitados.map((i) => i.nombre).join(", ")}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
