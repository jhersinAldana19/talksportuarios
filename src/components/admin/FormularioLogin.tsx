"use client";

import { useActionState } from "react";
import { iniciarSesion } from "@/app/admin/actions";
import { CampoContrasena } from "@/components/CampoContrasena";
import { alerta, campo, etiqueta, formularioLogin } from "@/components/clases-formulario";
import type { EstadoFormulario } from "@/lib/formulario";

export function FormularioLogin() {
  const [estado, accion, pendiente] = useActionState(iniciarSesion, {} as EstadoFormulario);

  return (
    <form action={accion} className={`mt-8 ${formularioLogin}`}>
      {estado.error && (
        <p role="alert" className={alerta}>
          {estado.error}
        </p>
      )}
      <label>
        <span className={etiqueta}>Correo</span>
        <input name="email" type="email" autoComplete="username" required className={campo} />
      </label>
      <label>
        <span className={etiqueta}>Contraseña</span>
        <CampoContrasena name="password" autoComplete="current-password" required />
      </label>
      <button type="submit" disabled={pendiente} className="boton disabled:opacity-50">
        {pendiente ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
