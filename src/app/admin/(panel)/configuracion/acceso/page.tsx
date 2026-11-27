import type { Metadata } from "next";
import { Suspense } from "react";
import { FormularioUsuario } from "@/components/admin/FormularioUsuario";
import { TablaPaginada } from "@/components/admin/TablaPaginada";
import { SECCIONES_CONFIGURACION } from "@/components/admin/secciones-configuracion";
import { exigirAdmin } from "@/lib/sesion";
import { listarAdmins } from "@/services/admins";

export const metadata: Metadata = { title: "Acceso al panel" };

const seccion = SECCIONES_CONFIGURACION.find((s) => s.id === "acceso")!;

export default function PaginaAcceso() {
  return (
    <Suspense fallback={<p className="text-texto">Cargando acceso…</p>}>
      <Contenido />
    </Suspense>
  );
}

async function Contenido() {
  const [sesion, admins] = await Promise.all([exigirAdmin(), listarAdmins()]);

  return (
    <section>
      <h2 className="text-xl font-medium tracking-tight text-titulo">{seccion.texto}</h2>
      <p className="mt-2 max-w-prose text-texto/80">{seccion.descripcion}</p>

      <h3 className="mt-10 text-base font-medium text-titulo">Nuevo administrador</h3>
      <FormularioUsuario />

      <h3 className="mt-12 text-base font-medium text-titulo">Quién tiene acceso</h3>
      {admins.length === 0 ? (
        <p className="mt-4 text-texto/70">Todavía no hay administradores.</p>
      ) : (
        <TablaPaginada
          encabezado={
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
            </tr>
          }
          filas={admins.map((admin) => (
            <tr key={admin.id}>
              <td className="font-medium text-titulo">
                {admin.nombre}
                {admin.id === sesion.user.id && (
                  <span className="ml-2 text-sm font-normal text-texto/70">Tú</span>
                )}
              </td>
              <td>{admin.email}</td>
            </tr>
          ))}
        />
      )}
    </section>
  );
}
