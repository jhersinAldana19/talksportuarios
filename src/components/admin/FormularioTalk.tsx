"use client";

import { useActionState, useState } from "react";
import { guardarTalk } from "@/app/admin/actions";
import { ayuda, campo, etiqueta } from "@/components/admin/clases";
import { FormularioPasos } from "@/components/admin/FormularioPasos";
import { Estado, Serie, type Estado as TipoEstado, type Serie as TipoSerie } from "@/generated/prisma/enums";
import { ETIQUETA_SERIE } from "@/lib/formato";
import type { EstadoFormulario } from "@/lib/formulario";
import { slugify } from "@/lib/slug";

export type InvitadoOpcion = {
  id: string;
  nombre: string;
  cargo: string | null;
  empresa: string | null;
};

export type ValoresTalk = {
  id: string;
  titulo: string;
  slug: string;
  serie: TipoSerie;
  edicion: number | null;
  youtubeId: string;
  duracionMin: number;
  fecha: string;
  resumen: string;
  puntosClave: string;
  transcripcion: string;
  tags: string;
  estado: TipoEstado;
  patrocinado: boolean;
  contenidoProvisional: boolean;
  invitadoIds: string[];
};

export function FormularioTalk({
  talk,
  invitados,
  fechaHoy,
}: {
  talk: ValoresTalk | null;
  invitados: InvitadoOpcion[];
  fechaHoy: string;
}) {
  const [estado, accion, pendiente] = useActionState(guardarTalk, {} as EstadoFormulario);
  const [titulo, setTitulo] = useState(talk?.titulo ?? "");
  const [slug, setSlug] = useState(talk?.slug ?? "");
  const [slugManual, setSlugManual] = useState(Boolean(talk?.slug));
  const invitadosElegidos = new Set(talk?.invitadoIds ?? []);

  return (
    <form action={accion}>
      {talk && <input type="hidden" name="id" value={talk.id} />}
      <FormularioPasos
        error={estado.error}
        pendiente={pendiente}
        textoEnviar={talk ? "Guardar cambios" : "Crear Talk"}
        pasos={[
          {
            id: "identidad",
            titulo: "Identidad",
            contenido: (
              <>
                <label className={etiqueta}>
                  Título
                  <input
                    name="titulo"
                    required
                    value={titulo}
                    onChange={(evento) => {
                      const valor = evento.target.value;
                      setTitulo(valor);
                      if (!slugManual) setSlug(slugify(valor));
                    }}
                    className={campo}
                  />
                </label>
                <label className={etiqueta}>
                  Slug
                  <input
                    name="slug"
                    required
                    value={slug}
                    onChange={(evento) => {
                      setSlugManual(true);
                      setSlug(evento.target.value);
                    }}
                    className={campo}
                  />
                  <span className={ayuda}>Se propone a partir del título. Es la URL pública.</span>
                </label>
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className={etiqueta}>
                    Serie
                    <select name="serie" defaultValue={talk?.serie ?? "TALKS"} className={campo}>
                      {Object.values(Serie).map((serie) => (
                        <option key={serie} value={serie}>
                          {ETIQUETA_SERIE[serie]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={etiqueta}>
                    Edición
                    <input
                      name="edicion"
                      inputMode="numeric"
                      defaultValue={talk?.edicion ?? ""}
                      placeholder="Opcional"
                      className={campo}
                    />
                  </label>
                </div>
              </>
            ),
          },
          {
            id: "video",
            titulo: "Video",
            contenido: (
              <>
                <label className={etiqueta}>
                  Video de YouTube
                  <input
                    name="youtubeId"
                    required
                    defaultValue={talk?.youtubeId ?? ""}
                    placeholder="id o URL"
                    className={campo}
                  />
                </label>
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className={etiqueta}>
                    Duración (min)
                    <input
                      name="duracionMin"
                      inputMode="numeric"
                      required
                      defaultValue={talk?.duracionMin ?? ""}
                      className={campo}
                    />
                  </label>
                  <label className={etiqueta}>
                    Fecha
                    <input
                      name="fechaPublicacion"
                      type="date"
                      required
                      defaultValue={talk?.fecha ?? fechaHoy}
                      className={campo}
                    />
                  </label>
                </div>
              </>
            ),
          },
          {
            id: "contenido",
            titulo: "Contenido",
            contenido: (
              <>
                <label className={etiqueta}>
                  Resumen
                  <textarea name="resumen" required rows={5} defaultValue={talk?.resumen ?? ""} className={campo} />
                </label>
                <label className={etiqueta}>
                  Puntos clave
                  <textarea
                    name="puntosClave"
                    rows={4}
                    defaultValue={talk?.puntosClave ?? ""}
                    placeholder="Uno por línea"
                    className={campo}
                  />
                </label>
                <label className={etiqueta}>
                  Transcripción
                  <textarea
                    name="transcripcion"
                    rows={6}
                    defaultValue={talk?.transcripcion ?? ""}
                    placeholder="Opcional"
                    className={campo}
                  />
                </label>
                <label className={etiqueta}>
                  Etiquetas
                  <input
                    name="tags"
                    defaultValue={talk?.tags ?? ""}
                    placeholder="Separadas por coma"
                    className={campo}
                  />
                </label>
              </>
            ),
          },
          {
            id: "publicacion",
            titulo: "Publicación",
            contenido: (
              <>
                <label className={etiqueta}>
                  Estado
                  <select name="estado" defaultValue={talk?.estado ?? "BORRADOR"} className={campo}>
                    {Object.values(Estado).map((valor) => (
                      <option key={valor} value={valor}>
                        {valor === "PUBLICADO" ? "Publicado" : "Borrador"}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex flex-col gap-3 text-sm text-titulo">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="patrocinado"
                      defaultChecked={talk?.patrocinado ?? false}
                      className="size-4 accent-magenta"
                    />
                    Contenido patrocinado
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="contenidoProvisional"
                      defaultChecked={talk?.contenidoProvisional ?? false}
                      className="size-4 accent-magenta"
                    />
                    Resumen provisional
                  </label>
                </div>
                <fieldset>
                  <legend className={etiqueta}>Invitados</legend>
                  {invitados.length === 0 ? (
                    <p className="mt-3 text-sm text-texto/70">Todavía no hay invitados para asignar.</p>
                  ) : (
                    <ul className="mt-3 max-h-64 overflow-y-auto border border-borde">
                      {invitados.map((invitado) => (
                        <li key={invitado.id} className="border-b border-borde px-3 py-2 last:border-b-0">
                          <label className="flex items-start gap-2 text-sm text-texto">
                            <input
                              type="checkbox"
                              name="invitadoId"
                              value={invitado.id}
                              defaultChecked={invitadosElegidos.has(invitado.id)}
                              className="mt-0.5 size-4 accent-magenta"
                            />
                            <span>
                              <span className="text-titulo">{invitado.nombre}</span>
                              {(invitado.cargo || invitado.empresa) && (
                                <span className="block text-texto/70">
                                  {[invitado.cargo, invitado.empresa].filter(Boolean).join(" · ")}
                                </span>
                              )}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </fieldset>
                <p className="text-sm text-texto/70">
                  {talk
                    ? "Los cambios se ven en el sitio al guardar."
                    : "Si no eliges Publicado, queda como borrador."}
                </p>
              </>
            ),
          },
        ]}
      />
    </form>
  );
}
