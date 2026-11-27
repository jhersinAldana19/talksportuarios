import type { Metadata } from "next";
import { Dancing_Script, Roboto } from "next/font/google";
import Script from "next/script";
import { JsonLd } from "@/components/JsonLd";
import { variablesCssMarca } from "@/lib/marca";
import { SITIO } from "@/lib/sitio";
import { SCRIPT_TEMA } from "@/lib/tema";
import { obtenerMarca } from "@/services/configuracion";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});
const dancing = Dancing_Script({ variable: "--font-dancing", subsets: ["latin"], weight: ["700"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITIO.url),
  title: {
    default: `${SITIO.nombre} — ${SITIO.lema}`,
    template: `%s | ${SITIO.nombre}`,
  },
  description: SITIO.descripcion,
  openGraph: {
    siteName: SITIO.nombre,
    locale: "es_PE",
    type: "website",
  },
};

const organizacion = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITIO.nombre,
  url: SITIO.url,
  slogan: SITIO.lema,
  description: SITIO.descripcion,
  foundingDate: SITIO.fundacion,
  founder: { "@type": "Person", name: SITIO.fundadora },
  telephone: SITIO.telefono,
  address: { "@type": "PostalAddress", addressLocality: SITIO.ciudad, addressCountry: SITIO.pais },
  sameAs: [SITIO.youtube, SITIO.linkedin],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const marca = await obtenerMarca();
  const vars = variablesCssMarca(marca);
  const cssMarca = Object.entries(vars)
    .map(([clave, valor]) => `${clave}:${valor}`)
    .join(";");

  return (
    // suppressHydrationWarning: SCRIPT_TEMA añade la clase "dark" antes de que React hidrate.
    <html
      lang="es-PE"
      className={`${roboto.variable} ${dancing.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Marca dinámica (BD) + .boton (Turbopack a veces sirve globals.css viejo). */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root { ${cssMarca} }
              .boton {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background: var(--color-magenta);
                color: var(--color-claro);
                border: 0;
                padding: 0.85rem 1.4rem;
                font-size: 0.9375rem;
                line-height: 1.2;
                font-weight: 500;
                letter-spacing: 0;
                text-transform: none;
                border-radius: 3px;
                text-decoration: none;
              }
              .boton:hover { background: var(--color-magenta-oscuro); }
              .boton:focus-visible {
                outline: 2px solid var(--color-claro);
                outline-offset: 3px;
              }
            `,
          }}
        />
      </head>
      <body className="flex min-h-full min-w-0 flex-col overflow-x-clip font-sans">
        {/* beforeInteractive: aplica el tema antes de hidratar, sin <script> crudo en el árbol React. */}
        <Script id="tema" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
        <JsonLd datos={organizacion} />
        {children}
      </body>
    </html>
  );
}
