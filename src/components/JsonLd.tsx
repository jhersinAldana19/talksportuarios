// Inserta datos estructurados (schema.org) en el HTML para Google y las IA.
// Se escapa "<" para que el contenido no pueda cerrar la etiqueta <script>.
export function JsonLd({ datos }: { datos: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(datos).replace(/</g, "\\u003c") }}
    />
  );
}
