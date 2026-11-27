import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { BotonTema } from "@/components/BotonTema";
import { FormularioLogin } from "@/components/admin/FormularioLogin";
import { Logo } from "@/components/Logo";
import { auth } from "@/auth";
import { obtenerMarca } from "@/services/configuracion";

export const metadata: Metadata = { title: "Ingresar" };

// La foto es 1672×941. Su columna usa esa proporción; el resto de la pantalla es el ingreso.
const FOTO = { ancho: 1672, alto: 941 };

export default function PaginaLogin() {
  return (
    <main className="login-pantalla bg-fondo">
      <style>{`
        .login-pantalla { display: flex; flex-direction: column; min-height: 100dvh; }
        .login-foto { position: relative; width: 100%; aspect-ratio: ${FOTO.ancho} / ${FOTO.alto}; flex: none; }
        .login-panel { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 2rem 1.5rem 2.5rem; }
        @media (min-width: 1100px) {
          .login-pantalla { flex-direction: row; }
          .login-foto {
            width: min(calc(100dvh * ${FOTO.ancho} / ${FOTO.alto}), calc(100vw - 32rem));
            height: 100dvh;
            aspect-ratio: auto;
          }
          .login-panel { width: 32rem; flex: none; padding: 3rem 2.5rem; }
        }
      `}</style>
      <div className="login-foto">
        <Image
          src="/login-puerto.webp"
          alt=""
          fill
          priority
          sizes="(max-width: 1099px) 100vw, 60vw"
          className="object-cover object-left"
        />
      </div>
      <Suspense fallback={<p className="login-panel text-texto">Cargando…</p>}>
        <PanelLogin />
      </Suspense>
    </main>
  );
}

async function PanelLogin() {
  await connection();
  const [sesion, marca] = await Promise.all([auth(), obtenerMarca()]);
  if (sesion?.user) redirect("/admin");

  return (
    <div className="login-panel">
      <div className="flex items-start justify-between gap-3">
        <Logo logoUrl={marca.logoUrl} />
        <BotonTema />
      </div>
      <h1 className="mt-10 text-4xl font-medium tracking-tight text-titulo">Panel</h1>
      <p className="mt-3 text-texto/80">Solo administradores. No hay registro público.</p>
      <FormularioLogin />
    </div>
  );
}
