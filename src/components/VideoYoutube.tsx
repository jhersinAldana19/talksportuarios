"use client";

import Image from "next/image";
import { useState } from "react";
import { miniaturaYoutube } from "@/lib/formato";

// Carga diferida: primero la miniatura (ligera); el iframe de YouTube solo al hacer clic.
export function VideoYoutube({ youtubeId, titulo }: { youtubeId: string; titulo: string }) {
  const [activo, setActivo] = useState(false);

  if (activo) {
    return (
      <div className="relative aspect-video overflow-hidden bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={titulo}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setActivo(true)}
      className="group relative block aspect-video w-full overflow-hidden bg-marino focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-magenta"
      aria-label={`Reproducir video: ${titulo}`}
    >
      <Image
        src={miniaturaYoutube(youtubeId)}
        alt=""
        fill
        sizes="(min-width: 1024px) 768px, 100vw"
        className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
        priority
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center bg-magenta text-white sm:h-20 sm:w-20">
          <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
    </button>
  );
}
