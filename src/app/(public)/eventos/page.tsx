import type { Metadata } from "next";
import { EventoDestacado, LineaEvento } from "@/components/EventoCard";
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
        <h1 className="text-2xl font-medium tracking-tight text-titulo sm:text-3xl">Próximos eventos</h1>
        <p className="mt-3 max-w-prose text-texto/80">
          Una visita a bordo y el primer encuentro presencial, ambos con cupo por WhatsApp.
        </p>
      </header>

      {eventos.length > 0 ? (
        <div>
          <EventoDestacado evento={eventos[0]} />
          {eventos.length > 1 && (
            <ul className="mt-8 border-t border-borde">
              {eventos.slice(1).map((evento) => (
                <li key={evento.id} className="border-b border-borde">
                  <LineaEvento evento={evento} />
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="text-texto/75">
          Pronto anunciaremos nuevos eventos. Síguenos en LinkedIn o escríbenos por WhatsApp
          para enterarte primero.
        </p>
      )}
    </div>
  );
}
