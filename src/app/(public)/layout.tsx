import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { WhatsAppFlotante } from "@/components/WhatsAppFlotante";
import { obtenerMarca } from "@/services/configuracion";

// Todo el sitio público debe salir completo en el HTML (los rastreadores de IA no
// ejecutan JS). Con 'navigation', el build FALLA si alguna página pública depende de
// datos sin caché o de la petición: es la garantía de la regla 1 de CLAUDE.md.
export const ensureStatic = "navigation";

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const marca = await obtenerMarca();

  return (
    <>
      <Header logoUrl={marca.logoUrl} />
      <main className="flex-1 bg-superficie">{children}</main>
      <Footer logoUrl={marca.logoUrl} />
      <WhatsAppFlotante />
    </>
  );
}
