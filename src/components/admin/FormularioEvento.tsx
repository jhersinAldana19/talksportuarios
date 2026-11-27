"use client";

import { useActionState, useState } from "react";
import { guardarEvento } from "@/app/admin/acciones/eventos";
import { ayuda, campo, etiqueta } from "@/components/admin/clases";
import { FormularioPasos } from "@/components/admin/FormularioPasos";
import { Estado, Modalidad } from "@/generated/prisma/enums";
import { ETIQUETA_MODALIDAD, ETIQUETA_NIVEL } from "@/lib/formato";
import type { EstadoFormulario } from "@/lib/formulario";
import { slugify } from "@/lib/slug";
import type { InvitadoAsignable } from "@/services/invitados";
import type { PartnerAsignable } from "@/services/partners";

export type ValoresEvento = {
  id: string;
  titulo: string;
  slug: string;
  descripcion: string;
  fecha: string;
  lugar: string;
  modalidad: string;
  cupoLimitado: boolean;
  linkInscripcion: string;
  estado: string;
  aliadoId: string;
  ponenteIds: string[];
};

export function FormularioEvento({
  evento,
  invitados,
  partners,
  fechaHoy,
}: {
  evento: ValoresEvento | null;
  invitados: InvitadoAsignable[];
  partners: PartnerAsignable[];
  fechaHoy: string;
}) {
  const [estado, accion, pendiente] = useActionState(guardarEvento, {} as EstadoFormulario);
  const [titulo, setTitulo] = useState(evento?.titulo ?? "");
  const [slug, setSlug] = useState(evento?.slug ?? "");
  const [slugManual, setSlugManual] = useState(Boolean(evento?.slug));
  const elegidos = new Set(evento?.ponenteIds ?? []);

  return (
    <form action={accion}>
      {evento && <input type="hidden" name="id" value={evento.id} />}
      <FormularioPasos
        error={estado.error}
        pendiente={pendiente}
        textoEnviar={evento ? "Guardar cambios" : "Crear evento"}
        pasos={[
          {
            id: "que",
            titulo: "Qué es",
            contenido: (
              <>
                <label className={etiqueta}>
                  Título
                  <input
                    name="titulo"
                    required
                    value={titulo}
                    onChange={(cambio) => {
                      const valor = cambio.target.value;
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
                    onChange={(cambio) => {
                      setSlugManual(true);
                      setSlug(cambio.target.value);
                    }}
                    className={campo}
                  />
                  <span className={ayuda}>Se propone a partir del título.</span>
                </label>
                <label className={etiqueta}>
                  Descripción
                  <textarea
                    name="descripcion"
                    required
                    rows={5}
                    defaultValue={evento?.descripcion ?? ""}
                    className={campo}
                  />
                </label>
              </>
            ),
          },
          {
            id: "cuando",
            titulo: "Cuándo y dónde",
            contenido: (
              <>
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className={etiqueta}>
                    Fecha
                    <input
                      name="fecha"
                      type="date"
                      required
                      defaultValue={evento?.fecha ?? fechaHoy}
                      className={campo}
                    />
                  </label>
                  <label className={etiqueta}>
                    Lugar
                    <input name="lugar" defaultValue={evento?.lugar ?? ""} className={campo} />
                  </label>
                </div>
                <label className={etiqueta}>
                  Modalidad
                  <select name="modalidad" defaultValue={evento?.modalidad ?? "PRESENCIAL"} className={campo}>
                    {Object.values(Modalidad).map((valor) => (
                      <option key={valor} value={valor}>
                        {ETIQUETA_MODALIDAD[valor]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-2 text-sm text-titulo">
                  <input
                    type="checkbox"
                    name="cupoLimitado"
                    defaultChecked={evento?.cupoLimitado ?? false}
                    className="size-4 accent-magenta"
                  />
                  Cupo limitado
                </label>
                <label className={etiqueta}>
                  Enlace de inscripción
                  <input
                    name="linkInscripcion"
                    type="url"
                    defaultValue={evento?.linkInscripcion ?? ""}
                    placeholder="https://"
                    className={campo}
                  />
                </label>
              </>
            ),
          },
          {
            id: "personas",
            titulo: "Personas y publicación",
            contenido: (
              <>
                <label className={etiqueta}>
                  Estado
                  <select name="estado" defaultValue={evento?.estado ?? "BORRADOR"} className={campo}>
                    {Object.values(Estado).map((valor) => (
                      <option key={valor} value={valor}>
                        {valor === "PUBLICADO" ? "Publicado" : "Borrador"}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={etiqueta}>
                  Aliado
                  <select name="aliadoId" defaultValue={evento?.aliadoId ?? ""} className={campo}>
                    <option value="">Sin aliado</option>
                    {partners.map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.nombre} · {ETIQUETA_NIVEL[partner.nivel]}
                      </option>
                    ))}
                  </select>
                </label>
                <fieldset>
                  <legend className={etiqueta}>Ponentes</legend>
                  {invitados.length === 0 ? (
                    <p className="mt-3 text-sm text-texto/70">Todavía no hay invitados para asignar.</p>
                  ) : (
                    <ul className="mt-3 max-h-64 overflow-y-auto border border-borde">
                      {invitados.map((invitado) => (
                        <li key={invitado.id} className="border-b border-borde px-3 py-2 last:border-b-0">
                          <label className="flex items-start gap-2 text-sm text-texto">
                            <input
                              type="checkbox"
                              name="ponenteId"
                              value={invitado.id}
                              defaultChecked={elegidos.has(invitado.id)}
                              className="mt-0.5 size-4 accent-magenta"
                            />
                            <span>
                              {invitado.nombre}
                              {(invitado.cargo || invitado.empresa) && (
                                <span className="block text-texto/70">
                                  {[invitado.cargo, invitado.empresa].filter(Boolean).join(", ")}
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
                  {evento
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
