// Logo de Talks Portuarios (bandera de olas + globo de diálogo), trazado en SVG a partir de
// docs/marca/logo-talks-portuarios.webp. Las franjas usan el color de títulos del tema
// (azul en tema claro, blanco en oscuro); la franja inferior es siempre magenta.

export function MarcaTalks({ className = "h-9 w-9", claro = false }: { className?: string; claro?: boolean }) {
  return (
    <svg viewBox="170 280 913 765" className={className} aria-hidden="true">
      <g className={claro ? "fill-claro" : "fill-titulo"}>
        <path d="M180 347C290 285 470 290 650 385C820 475 960 478 1073 403V508C960 578 820 580 650 490C470 395 290 390 180 453Z" />
        <path d="M180 523C290 462 470 467 650 562C820 652 960 655 1073 580V685C960 755 820 757 650 667C470 572 290 567 180 630Z" />
      </g>
      <path
        className="fill-magenta"
        d="M180 697C290 636 470 641 650 736C700 758 740 770 765 790C785 806 795 825 803 845C812 825 830 805 875 801C960 804 1020 790 1073 752V858C1020 888 960 900 875 897L803 1035L720 885C700 860 680 850 650 840C470 746 290 741 180 803Z"
      />
    </svg>
  );
}

export function Logo({ claro = false }: { claro?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <MarcaTalks className="h-8 w-9 shrink-0" claro={claro} />
      <span className={`font-script text-2xl leading-none font-bold ${claro ? "text-claro" : "text-titulo"}`}>
        Talks Portuarios
      </span>
    </span>
  );
}
