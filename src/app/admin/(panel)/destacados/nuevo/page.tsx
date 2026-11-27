import type { Metadata } from "next";
import { Suspense } from "react";
import { EncabezadoAdmin } from "@/components/admin/EncabezadoAdmin";
import { FormularioDestacado } from "@/components/admin/FormularioDestacado";
import { opcionesDestacadoFormulario } from "@/services/destacados";

export const metadata: Metadata = { title: "Nuevo destacado" };

export default function PaginaNuevoDestacado() {
  return (
    <div>
      <EncabezadoAdmin
        titulo="Nuevo destacado"
        descripcion="Se mostrará en el carrusel del inicio si está activo y dentro de la vigencia."
      />
      <Suspense fallback={<p className="mt-8 text-texto">Cargando formulario…</p>}>
        <FormularioNuevo />
      </Suspense>
    </div>
  );
}

async function FormularioNuevo() {
  const opciones = await opcionesDestacadoFormulario();
  return <FormularioDestacado destacado={null} opciones={opciones} />;
}
