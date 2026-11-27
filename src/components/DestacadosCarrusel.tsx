import { DestacadosCarruselCliente } from "./DestacadosCarruselCliente";
import type { DestacadoSlide } from "@/services/destacados";

/** Server Component: deja el primer slide en el HTML inicial vía el cliente (SSR de React). */
export function DestacadosCarrusel({ slides }: { slides: DestacadoSlide[] }) {
  if (slides.length === 0) return null;

  return (
    <section className="mt-10" aria-labelledby="destacados-titulo">
      <h2 id="destacados-titulo" className="text-2xl font-medium text-titulo">
        Destacados
      </h2>
      <div className="mt-4">
        <DestacadosCarruselCliente slides={slides} />
      </div>
    </section>
  );
}
