"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { campo, etiqueta } from "@/components/clases-formulario";
import { TalkCard, type TalkResumen } from "./TalkCard";
import { ETIQUETA_SERIE } from "@/lib/formato";
import type { Serie } from "@/generated/prisma/enums";

const POR_PAGINA = 12;

type Orden = "recientes" | "antiguos";

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

function coincideBusqueda(talk: TalkResumen, consulta: string) {
  if (!consulta) return true;
  const q = normalizar(consulta);
  const enTitulo = normalizar(talk.titulo).includes(q);
  const enInvitados = talk.invitados.some((i) => normalizar(i.nombre).includes(q));
  return enTitulo || enInvitados;
}

function ordenarTalks(lista: TalkResumen[], orden: Orden) {
  return [...lista].sort((a, b) => {
    const cmp = a.fechaPublicacion.localeCompare(b.fechaPublicacion);
    return orden === "recientes" ? -cmp : cmp;
  });
}

function anioDe(talk: TalkResumen) {
  return talk.fechaPublicacion.slice(0, 4);
}

// Todos los Talks llegan renderizados en el HTML (SEO); el filtro solo oculta/muestra en el navegador.
// Un enlace /talks#TALKS (o la otra serie) deja esa serie activa al abrir la página.
export function ListaTalksFiltrable({ talks }: { talks: TalkResumen[] }) {
  const [serie, setSerie] = useState<Serie | "TODAS">("TODAS");
  const [orden, setOrden] = useState<Orden>("recientes");
  const [busqueda, setBusqueda] = useState("");
  const [limite, setLimite] = useState(POR_PAGINA);
  const busquedaDiferida = useDeferredValue(busqueda);

  useEffect(() => {
    function leerHash() {
      const valor = window.location.hash.slice(1);
      if (valor in ETIQUETA_SERIE) setSerie(valor as Serie);
    }
    leerHash();
    window.addEventListener("hashchange", leerHash);
    return () => window.removeEventListener("hashchange", leerHash);
  }, []);

  useEffect(() => {
    setLimite(POR_PAGINA);
  }, [serie, busquedaDiferida, orden]);

  const seriesPresentes = (Object.keys(ETIQUETA_SERIE) as Serie[]).filter((s) =>
    talks.some((t) => t.serie === s),
  );

  const porBusqueda = talks.filter((t) => coincideBusqueda(t, busquedaDiferida));

  const opciones: { valor: Serie | "TODAS"; texto: string; cantidad: number }[] = [
    { valor: "TODAS", texto: "Todas", cantidad: porBusqueda.length },
    ...seriesPresentes.map((s) => ({
      valor: s,
      texto: ETIQUETA_SERIE[s],
      cantidad: porBusqueda.filter((t) => t.serie === s).length,
    })),
  ];

  const filtrados = ordenarTalks(
    porBusqueda.filter((t) => serie === "TODAS" || t.serie === serie),
    orden,
  );
  const visiblesSlug = new Set(filtrados.slice(0, limite).map((t) => t.slug));
  const todosOrdenados = ordenarTalks(talks, orden);

  const anios: string[] = [];
  for (const talk of todosOrdenados) {
    const anio = anioDe(talk);
    if (!anios.includes(anio)) anios.push(anio);
  }

  const hayMas = limite < filtrados.length;

  return (
    <div className="lista-talks">
      <style>{`
        .lista-talks { display: flex; flex-direction: column; gap: 1.75rem; }
        .lista-talks-controles {
          display: grid;
          gap: 1rem;
        }
        .lista-talks-anio {
          margin: 0 0 1rem;
          padding-bottom: 0.55rem;
          border-bottom: 1px solid var(--borde);
          font-size: 1.35rem;
          font-weight: 500;
          letter-spacing: -0.02em;
          color: var(--titulo);
        }
        .lista-talks-bloque + .lista-talks-bloque { margin-top: 2.25rem; }
        .lista-talks-mas { align-self: center; margin-top: 0.5rem; }
        @media (min-width: 640px) {
          .lista-talks-controles {
            grid-template-columns: minmax(0, 1.4fr) minmax(12rem, 0.7fr);
            align-items: end;
          }
        }
      `}</style>

      <div className="lista-talks-controles">
        <label>
          <span className={etiqueta}>Buscar</span>
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Título o invitado"
            autoComplete="off"
            className={campo}
          />
        </label>
        <label>
          <span className={etiqueta}>Orden</span>
          <select value={orden} onChange={(e) => setOrden(e.target.value as Orden)} className={campo}>
            <option value="recientes">Más recientes</option>
            <option value="antiguos">Más antiguos</option>
          </select>
        </label>
      </div>

      <div role="group" aria-label="Filtrar por serie" className="flex flex-wrap gap-x-6 gap-y-1 border-b border-borde">
        {opciones.map((o) => {
          const activa = serie === o.valor;
          const excepcion = o.valor === "NEXT_GENERATION" || o.valor === "EDICION_ESPECIAL";
          return (
            <button
              key={o.valor}
              type="button"
              onClick={() => setSerie(o.valor)}
              aria-pressed={activa}
              className={`-mb-px border-b-2 pb-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-magenta ${
                activa
                  ? excepcion
                    ? "border-magenta font-semibold text-magenta"
                    : "border-magenta font-semibold text-titulo"
                  : "border-transparent text-texto/70 hover:text-titulo"
              }`}
            >
              {o.texto}{" "}
              <span className={activa ? "opacity-70" : "text-texto/50"}>({o.cantidad})</span>
            </button>
          );
        })}
      </div>

      {filtrados.length === 0 ? (
        <p className="text-texto/75">No hay Talks con esos criterios.</p>
      ) : null}

      <div>
        {anios.map((anio) => {
          const delAnio = todosOrdenados.filter((t) => anioDe(t) === anio);
          const hayVisible = delAnio.some((t) => visiblesSlug.has(t.slug));
          return (
            <section key={anio} className="lista-talks-bloque" hidden={!hayVisible}>
              <h2 className="lista-talks-anio">{anio}</h2>
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {delAnio.map((talk, i) => (
                  <li key={talk.slug} hidden={!visiblesSlug.has(talk.slug)} className="flex">
                    <TalkCard talk={talk} prioridad={anio === anios[0] && i < 3} />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {hayMas ? (
        <button
          type="button"
          className="boton lista-talks-mas"
          onClick={() => setLimite((n) => n + POR_PAGINA)}
        >
          Ver más
        </button>
      ) : null}
    </div>
  );
}
