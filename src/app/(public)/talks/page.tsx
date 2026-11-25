import type { Metadata } from "next";
import { ListaTalksFiltrable } from "@/components/ListaTalksFiltrable";
import type { TalkResumen } from "@/components/TalkCard";
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
    patrocinado: t.patrocinado,
    invitados: t.invitados.map((i) => ({ nombre: i.nombre })),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <header className="mb-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-titulo sm:text-4xl">Talks</h1>
        <p className="mt-3 text-texto/80">
          {resumen.length} conversaciones en vivo con profesionales del sector
          marítimo-portuario. Cada Talk tiene su página con el video, un resumen y sus
          invitados para que puedas aprender y volver a consultarlo cuando lo necesites.
        </p>
      </header>

      <ListaTalksFiltrable talks={resumen} />
    </div>
  );
}
