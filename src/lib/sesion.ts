import "server-only";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

/** Exige un administrador con sesión. Si no hay, manda al login. */
export async function exigirAdmin() {
  // connection() antes de auth(): Auth.js usa crypto al leer la cookie y, si eso
  // ocurre durante el prerender, Next lo rechaza. A partir de aquí la página espera la petición.
  await connection();
  const sesion = await auth();
  if (!sesion?.user?.id) redirect("/admin/login");
  return sesion;
}
