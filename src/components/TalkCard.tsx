import Image from "next/image";
import Link from "next/link";
import { ETIQUETA_SERIE, formatearDuracion, formatearFecha, miniaturaYoutube } from "@/lib/formato";
import type { Serie } from "@/generated/prisma/enums";

// Datos mínimos que necesita la tarjeta (objetos planos: también se usa desde un Client Component).
export type TalkResumen = {
  slug: string;
  titulo: string;
  serie: Serie;
  edicion: number | null;
  youtubeId: string;
  duracionMin: number;
  fechaPublicacion: string; // AAAA-MM-DD (Lima): orden, años y "Publicado el …"
  patrocinado: boolean;
  invitados: { nombre: string }[];
};

function figura(edicion: number | null, duracionMin: number): { grande: string; chico: string } {
  if (edicion) return { grande: String(edicion), chico: "edición" };
  const horas = Math.floor(duracionMin / 60);
  const minutos = duracionMin % 60;
  if (horas === 0) return { grande: String(minutos), chico: "min" };
  return { grande: `${horas}h`, chico: `${String(minutos).padStart(2, "0")} min` };
}

export function TalkCard({ talk, prioridad = false }: { talk: TalkResumen; prioridad?: boolean }) {
  const dato = figura(talk.edicion, talk.duracionMin);
  // Mediodía Lima: misma fecha civil que fechaPublicacion (YouTube), sin new Date() "ahora".
  const publicadoEl = formatearFecha(new Date(`${talk.fechaPublicacion}T12:00:00-05:00`));

  return (
    <article className="flex w-full">
      <Link
        href={`/talks/${talk.slug}`}
        className="flex w-full flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-magenta"
      >
        <div className="relative aspect-[4/3] bg-marino/10">
          <Image
            src={miniaturaYoutube(talk.youtubeId)}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            priority={prioridad}
          />
        </div>
        <div className="grid flex-1 grid-cols-[4.5rem_1fr] gap-3 bg-panel px-4 py-5">
          <p className="text-titulo">
            <span className="block text-4xl font-medium leading-none tracking-tight whitespace-nowrap">{dato.grande}</span>
            <span className="mt-1 block text-[0.68rem] font-semibold tracking-[0.14em] uppercase">
              {dato.chico}
            </span>
          </p>
          <div className="flex min-w-0 flex-col">
            <h3 className="font-medium leading-snug text-titulo">{talk.titulo}</h3>
            <p className="mt-2 text-sm leading-relaxed text-texto/70">
              {ETIQUETA_SERIE[talk.serie]}
              {talk.edicion ? `, ${formatearDuracion(talk.duracionMin)}` : ""}
            </p>
            <p className="mt-1 text-sm text-texto/70">
              <time dateTime={talk.fechaPublicacion}>Publicado el {publicadoEl}</time>
            </p>
            {talk.invitados.length > 0 && (
              <p className="mt-1 text-sm text-texto/80">
                Con {talk.invitados.map((i) => i.nombre).join(", ")}
              </p>
            )}
            {talk.patrocinado && (
              <p className="mt-2 text-sm text-magenta">Contenido patrocinado</p>
            )}
            <span className="enlace mt-auto pt-6">Ver el Talk</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
