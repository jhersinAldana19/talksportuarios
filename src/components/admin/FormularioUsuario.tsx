"use client";

import { useActionState } from "react";
import { crearUsuario } from "@/app/admin/acciones/usuarios";
import { CampoContrasena } from "@/components/CampoContrasena";
import { alerta, campo, etiqueta, formularioCortoDuo } from "@/components/clases-formulario";
import { enviar } from "@/components/admin/clases";
import type { EstadoFormulario } from "@/lib/formulario";

export function FormularioUsuario() {
  const [estado, accion, pendiente] = useActionState(crearUsuario, {} as EstadoFormulario);

  return (
    <form action={accion} className={`mt-4 ${formularioCortoDuo}`}>
      {estado.error && (
        <p role="alert" className={alerta}>
          {estado.error}
        </p>
      )}

      <div className="formulario-corto-duo">
        <div>
          <label>
            <span className={etiqueta}>Nombre</span>
            <input name="nombre" required autoComplete="name" className={campo} />
          </label>
          <label>
            <span className={etiqueta}>Correo</span>
            <input name="email" type="email" required autoComplete="off" className={campo} />
          </label>
        </div>
        <div>
          <label>
            <span className={etiqueta}>Contraseña</span>
            <CampoContrasena name="password" required autoComplete="new-password" minLength={8} />
          </label>
          <label>
            <span className={etiqueta}>Repetir contraseña</span>
            <CampoContrasena name="confirmacion" required autoComplete="new-password" minLength={8} />
          </label>
        </div>
      </div>

      <button type="submit" disabled={pendiente} className={enviar}>
        {pendiente ? "Creando…" : "Crear usuario"}
      </button>
    </form>
  );
}
