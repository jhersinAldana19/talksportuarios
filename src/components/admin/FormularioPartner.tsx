"use client";

import { useActionState } from "react";
import { guardarPartner } from "@/app/admin/acciones/partners";
import { ayuda, campo, etiqueta } from "@/components/admin/clases";
import { FormularioPasos } from "@/components/admin/FormularioPasos";
import { Estado, NivelPartner } from "@/generated/prisma/enums";
import { ETIQUETA_NIVEL } from "@/lib/formato";
import type { EstadoFormulario } from "@/lib/formulario";

export type ValoresPartner = {
  id: string;
  nombre: string;
  slug: string;
  web: string;
  logoUrl: string;
  frase: string;
  descripcion: string;
  beneficios: string;
  relacionComercial: boolean;
  estado: string;
  nivel: string;
  orden: number;
  activo: boolean;
};

export function FormularioPartner({ partner }: { partner: ValoresPartner | null }) {
  const [estado, accion, pendiente] = useActionState(guardarPartner, {} as EstadoFormulario);

  return (
    <form action={accion}>
      {partner && <input type="hidden" name="id" value={partner.id} />}
      <FormularioPasos
        error={estado.error}
        pendiente={pendiente}
        textoEnviar={partner ? "Guardar cambios" : "Crear partner"}
        pasos={[
          {
            id: "identidad",
            titulo: "Identidad",
            contenido: (
              <>
                <label className={etiqueta}>
                  Nombre
                  <input name="nombre" required defaultValue={partner?.nombre ?? ""} className={campo} />
                </label>
                <label className={etiqueta}>
                  Slug de la ficha
                  <input
                    name="slug"
                    defaultValue={partner?.slug ?? ""}
                    placeholder="sarmiento-academia"
                    className={campo}
                  />
                  <span className={ayuda}>Dirección pública: /aliados/slug. Solo se publica con nivel Aliado.</span>
                </label>
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className={etiqueta}>
                    Nivel
                    <select name="nivel" defaultValue={partner?.nivel ?? "ALIADO"} className={campo}>
                      {Object.values(NivelPartner).map((nivel) => (
                        <option key={nivel} value={nivel}>
                          {ETIQUETA_NIVEL[nivel]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={etiqueta}>
                    Orden
                    <input
                      name="orden"
                      inputMode="numeric"
                      defaultValue={partner?.orden ?? 0}
                      className={campo}
                    />
                    <span className={ayuda}>Dentro del mismo nivel, el menor aparece primero.</span>
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
                  Frase de la alianza
                  <input name="frase" defaultValue={partner?.frase ?? ""} className={campo} />
                </label>
                <label className={etiqueta}>
                  Quiénes son
                  <textarea
                    name="descripcion"
                    rows={4}
                    defaultValue={partner?.descripcion ?? ""}
                    className={campo}
                  />
                </label>
                <label className={etiqueta}>
                  Beneficios para la comunidad
                  <textarea
                    name="beneficios"
                    rows={4}
                    defaultValue={partner?.beneficios ?? ""}
                    className={campo}
                  />
                  <span className={ayuda}>Uno por línea. Sin precios.</span>
                </label>
              </>
            ),
          },
          {
            id: "publicacion",
            titulo: "Enlaces y publicación",
            contenido: (
              <>
                <label className={etiqueta}>
                  Web
                  <input
                    name="web"
                    type="url"
                    defaultValue={partner?.web ?? ""}
                    placeholder="https://"
                    className={campo}
                  />
                </label>
                <label className={etiqueta}>
                  Logo
                  <input
                    name="logoUrl"
                    type="url"
                    defaultValue={partner?.logoUrl ?? ""}
                    placeholder="https:// o /partners/…"
                    className={campo}
                  />
                  <span className={ayuda}>Pega un enlace. La subida de archivos llega con Cloudinary.</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-titulo">
                  <input
                    type="checkbox"
                    name="activo"
                    defaultChecked={partner?.activo ?? true}
                    className="size-4 accent-magenta"
                  />
                  Visible en la fila de logos
                </label>
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className={etiqueta}>
                    Ficha pública
                    <select name="estado" defaultValue={partner?.estado ?? "BORRADOR"} className={campo}>
                      {Object.values(Estado).map((valor) => (
                        <option key={valor} value={valor}>
                          {valor === "PUBLICADO" ? "Publicada" : "Borrador"}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-end gap-2 pb-2 text-sm text-titulo">
                    <input
                      type="checkbox"
                      name="relacionComercial"
                      defaultChecked={partner?.relacionComercial ?? false}
                      className="size-4 accent-magenta"
                    />
                    Hay comisión o pago
                  </label>
                </div>
              </>
            ),
          },
        ]}
      />
    </form>
  );
}
