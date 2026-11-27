"use client";

import { useActionState, useState } from "react";
import { guardarInvitado } from "@/app/admin/acciones/invitados";
import { ayuda, campo, etiqueta } from "@/components/admin/clases";
import { FormularioPasos } from "@/components/admin/FormularioPasos";
import type { EstadoFormulario } from "@/lib/formulario";
import { slugify } from "@/lib/slug";

export type ValoresInvitado = {
  id: string;
  nombre: string;
  slug: string;
  cargo: string;
  empresa: string;
  bio: string;
  fotoUrl: string;
  linkedinUrl: string;
};

export function FormularioInvitado({ invitado }: { invitado: ValoresInvitado | null }) {
  const [estado, accion, pendiente] = useActionState(guardarInvitado, {} as EstadoFormulario);
  const [nombre, setNombre] = useState(invitado?.nombre ?? "");
  const [slug, setSlug] = useState(invitado?.slug ?? "");
  const [slugManual, setSlugManual] = useState(Boolean(invitado?.slug));

  return (
    <form action={accion}>
      {invitado && <input type="hidden" name="id" value={invitado.id} />}
      <FormularioPasos
        error={estado.error}
        pendiente={pendiente}
        textoEnviar={invitado ? "Guardar cambios" : "Crear invitado"}
        pasos={[
          {
            id: "persona",
            titulo: "Persona",
            contenido: (
              <>
                <label className={etiqueta}>
                  Nombre
                  <input
                    name="nombre"
                    required
                    value={nombre}
                    onChange={(evento) => {
                      const valor = evento.target.value;
                      setNombre(valor);
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
                  <span className={ayuda}>Se propone a partir del nombre. Será la URL pública.</span>
                </label>
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className={etiqueta}>
                    Cargo
                    <input name="cargo" defaultValue={invitado?.cargo ?? ""} className={campo} />
                  </label>
                  <label className={etiqueta}>
                    Empresa
                    <input name="empresa" defaultValue={invitado?.empresa ?? ""} className={campo} />
                  </label>
                </div>
              </>
            ),
          },
          {
            id: "perfil",
            titulo: "Perfil",
            contenido: (
              <>
                <label className={etiqueta}>
                  Biografía
                  <textarea name="bio" rows={5} defaultValue={invitado?.bio ?? ""} className={campo} />
                </label>
                <label className={etiqueta}>
                  Foto
                  <input
                    name="fotoUrl"
                    type="url"
                    defaultValue={invitado?.fotoUrl ?? ""}
                    placeholder="https://"
                    className={campo}
                  />
                  <span className={ayuda}>Pega un enlace. La subida de archivos llega con Cloudinary.</span>
                </label>
                <label className={etiqueta}>
                  LinkedIn
                  <input
                    name="linkedinUrl"
                    type="url"
                    defaultValue={invitado?.linkedinUrl ?? ""}
                    placeholder="https://"
                    className={campo}
                  />
                </label>
              </>
            ),
          },
        ]}
      />
    </form>
  );
}
