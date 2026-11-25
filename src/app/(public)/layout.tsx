import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { WhatsAppFlotante } from "@/components/WhatsAppFlotante";

// Todo el sitio público debe salir completo en el HTML (los rastreadores de IA no
// ejecutan JS). Con 'navigation', el build FALLA si alguna página pública depende de
// datos sin caché o de la petición: es la garantía de la regla 1 de CLAUDE.md.
export const ensureStatic = "navigation";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFlotante />
    </>
  );
}
