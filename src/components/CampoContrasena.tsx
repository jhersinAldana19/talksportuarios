"use client";

import { useId, useState, type ComponentProps } from "react";
import { campo } from "@/components/clases-formulario";

type Props = Omit<ComponentProps<"input">, "type" | "className"> & {
  className?: string;
};

/** Input de contraseña con botón ojo (mostrar / ocultar). Reutilizable en login y panel. */
export function CampoContrasena({ className = "", id, ...rest }: Props) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [visible, setVisible] = useState(false);

  return (
    <div className="campo-contrasena">
      <input
        {...rest}
        id={inputId}
        type={visible ? "text" : "password"}
        className={`${campo} ${className}`.trim()}
      />
      <button
        type="button"
        className="campo-contrasena-ojo"
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        aria-pressed={visible}
        aria-controls={inputId}
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? <IconoOjoTachado /> : <IconoOjo />}
      </button>
    </div>
  );
}

function IconoOjo() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}

function IconoOjoTachado() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M3 3l18 18" strokeLinecap="round" />
      <path
        d="M10.5 6.3A9.4 9.4 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-3.2 3.6M6.2 6.8C3.9 8.5 2.5 12 2.5 12S6 18.5 12 18.5c1.3 0 2.5-.3 3.5-.7"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d="M9.9 9.9a2.6 2.6 0 0 0 3.7 3.7" strokeLinecap="round" />
    </svg>
  );
}
