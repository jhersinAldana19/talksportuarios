import type { Metadata } from "next";
import { EventoCard } from "@/components/EventoCard";
import { JsonLd } from "@/components/JsonLd";
import { fechaISOLima } from "@/lib/formato";
import { SITIO } from "@/lib/sitio";
import { listarProximosEventos } from "@/services/eventos";

export const metadata: Metadata = {
  title: "Eventos",
  description:
    "Próximos eventos de Talks Portuarios: encuentros presenciales, visitas y actividades para la comunidad marítimo-portuaria. Inscríbete por WhatsApp.",
  alternates: { canonical: "/eventos" },
  openGraph: { url: "/eventos" },
};

export default async function EventosPage() {
  const eventos = await listarProximosEventos();

  const datosEstructurados = eventos.map((e) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.titulo,
    description: e.descripcion,
    startDate: fechaISOLima(e.fecha), // solo fecha: la hora aún no está confirmada
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode:
      e.modalidad === "PRESENCIAL"
        ? "https://schema.org/OfflineEventAttendanceMode"
        : "https://schema.org/OnlineEventAttendanceMode",
    ...(e.lugar && { location: { "@type": "Place", name: e.lugar } }),
    organizer: [
      { "@type": "Organization", name: SITIO.nombre, url: SITIO.url },
      ...(e.aliado ? [{ "@type": "Organization", name: e.aliado.nombre }] : []),
    ],
    ...(e.ponentes.length > 0 && {
      performer: e.ponentes.map((p) => ({ "@type": "Person", name: p.nombre })),
    }),
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      {datosEstructurados.length > 0 && <JsonLd datos={datosEstructurados} />}

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-titulo sm:text-4xl">Próximos eventos</h1>
        <p className="mt-3 text-texto/80">
          Encuentros presenciales y actividades para aprender, compartir y conectar con la
          comunidad. Los cupos son limitados: inscríbete por WhatsApp.
        </p>
      </header>

      {eventos.length > 0 ? (
        <div className="space-y-6">
          {eventos.map((e) => (
            <EventoCard key={e.id} evento={e} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-superficie p-6 text-texto/70 ring-1 ring-borde">
          Pronto anunciaremos nuevos eventos. Síguenos en LinkedIn o escríbenos por WhatsApp
          para enterarte primero.
        </p>
      )}
    </div>
  );
}
