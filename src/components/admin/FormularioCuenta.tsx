"use client";

import { useActionState } from "react";
import { guardarCuentaPropia } from "@/app/admin/acciones/cuenta";
import { CampoContrasena } from "@/components/CampoContrasena";
import { ayuda, campo, etiqueta, formularioCorto } from "@/components/clases-formulario";
import { FormularioPasos } from "@/components/admin/FormularioPasos";
import type { EstadoFormulario } from "@/lib/formulario";

export function FormularioCuenta({
  nombre,
  email,
  mensajeOk,
}: {
  nombre: string;
  email: string;
  mensajeOk?: string;
}) {
  const [estado, accion, pendiente] = useActionState(guardarCuentaPropia, {} as EstadoFormulario);

  return (
    <div className="mt-2">
      {mensajeOk && !estado.error && (
        <p
          role="status"
          className="alerta-admin"
          style={{ color: "var(--titulo)", borderColor: "var(--color-marino)", marginBottom: "1.25rem" }}
        >
          {mensajeOk}
        </p>
      )}

      <form action={accion} className={formularioCorto}>
        <FormularioPasos
          compacto
          error={estado.error}
          pendiente={pendiente}
          textoEnviar="Guardar cuenta"
          pasos={[
            {
              id: "identidad",
              titulo: "Identidad",
              contenido: (
                <>
                  <label>
                    <span className={etiqueta}>Nombre</span>
                    <input
                      name="nombre"
                      required
                      defaultValue={nombre}
                      autoComplete="name"
                      maxLength={120}
                      className={campo}
                    />
                  </label>
                  <label>
                    <span className={etiqueta}>Correo</span>
                    <input
                      name="email"
                      type="email"
                      required
                      defaultValue={email}
                      autoComplete="username"
                      maxLength={200}
                      className={campo}
                    />
                    <span className={ayuda}>Con este correo entras al panel.</span>
                  </label>
                </>
              ),
            },
            {
              id: "seguridad",
              titulo: "Seguridad",
              contenido: (
                <>
                  <p className={ayuda} style={{ marginTop: 0 }}>
                    Déjalo vacío si solo quieres actualizar nombre o correo. Para cambiar la
                    contraseña, completa los tres campos.
                  </p>
                  <label>
                    <span className={etiqueta}>Contraseña actual</span>
                    <CampoContrasena name="contraseñaActual" autoComplete="current-password" />
                  </label>
                  <label>
                    <span className={etiqueta}>Contraseña nueva</span>
                    <CampoContrasena name="contraseñaNueva" autoComplete="new-password" minLength={8} />
                  </label>
                  <label>
                    <span className={etiqueta}>Repetir contraseña nueva</span>
                    <CampoContrasena name="confirmacion" autoComplete="new-password" minLength={8} />
                  </label>
                </>
              ),
            },
          ]}
        />
      </form>
    </div>
  );
}
