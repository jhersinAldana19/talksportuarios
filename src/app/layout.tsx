import type { Metadata } from "next";
import { Dancing_Script, Montserrat } from "next/font/google";
import { JsonLd } from "@/components/JsonLd";
import { SITIO } from "@/lib/sitio";
import { SCRIPT_TEMA } from "@/lib/tema";
import "./globals.css";

const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"] });
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: SCRIPT_TEMA añade la clase "dark" antes de que React hidrate.
    <html
      lang="es-PE"
      className={`${montserrat.variable} ${dancing.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <JsonLd datos={organizacion} />
        {children}
      </body>
    </html>
  );
}
