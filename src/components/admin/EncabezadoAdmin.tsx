import Link from "next/link";

export function EncabezadoAdmin({
  titulo,
  descripcion,
  volver,
  accion,
}: {
  titulo: string;
  descripcion?: string;
  volver?: { href: string; texto: string };
  accion?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3 sm:gap-4">
      <div className="min-w-0">
        {volver && (
          <Link href={volver.href} className="enlace">
            {volver.texto}
          </Link>
        )}
        <h1
          className={`${volver ? "mt-3 sm:mt-4" : ""} text-2xl font-medium tracking-tight text-titulo sm:text-4xl`}
        >
          {titulo}
        </h1>
        {descripcion && (
          <p className="mt-2 max-w-prose text-sm leading-relaxed text-texto/80 sm:mt-3 sm:text-base">
            {descripcion}
          </p>
        )}
      </div>
      {accion ? <div className="w-full sm:w-auto">{accion}</div> : null}
    </header>
  );
}
