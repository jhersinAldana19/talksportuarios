import type { Metadata } from "next";
import { ListaTalksFiltrable } from "@/components/ListaTalksFiltrable";
import type { TalkResumen } from "@/components/TalkCard";
import { fechaISOLima } from "@/lib/formato";
import { listarTalksPublicados } from "@/services/talks";

export const metadata: Metadata = {
  title: "Talks",
  description:
    "Charlas con expertos del sector marítimo-portuario peruano: agenciamiento, comercio exterior, logística, liderazgo y más. Series Talks, Next Generation y Ediciones Especiales.",
  alternates: { canonical: "/talks" },
  openGraph: { url: "/talks" },
};

export default async function TalksPage() {
  const talks = await listarTalksPublicados();

  // Solo los campos que necesita la tarjeta: es lo que viaja al Client Component.
  const resumen: TalkResumen[] = talks.map((t) => ({
    slug: t.slug,
    titulo: t.titulo,
    serie: t.serie,
    edicion: t.edicion,
    youtubeId: t.youtubeId,
    duracionMin: t.duracionMin,
    fechaPublicacion: fechaISOLima(t.fechaPublicacion),
    patrocinado: t.patrocinado,
    invitados: t.invitados.map((i) => ({ nombre: i.nombre })),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <header className="mb-8 max-w-3xl">
        <h1 className="text-2xl font-medium tracking-tight text-titulo sm:text-3xl">Talks</h1>
        <p className="mt-3 max-w-prose leading-relaxed text-texto/80">
          Tres series del archivo: Talks, Next Generation y Edición especial.
        </p>
      </header>

      <ListaTalksFiltrable talks={resumen} />
    </div>
  );
}
