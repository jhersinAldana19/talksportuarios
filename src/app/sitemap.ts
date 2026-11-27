import type { MetadataRoute } from "next";
import { SITIO } from "@/lib/sitio";
import { listarSlugsAliados } from "@/services/aliados";
import { listarSlugsTalks } from "@/services/talks";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [talks, aliados] = await Promise.all([listarSlugsTalks(), listarSlugsAliados()]);

  return [
    { url: SITIO.url, changeFrequency: "weekly", priority: 1 },
    { url: `${SITIO.url}/talks`, changeFrequency: "weekly", priority: 0.8 },
    ...talks.map((slug) => ({ url: `${SITIO.url}/talks/${slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    { url: `${SITIO.url}/eventos`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITIO.url}/formacion`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITIO.url}/aliados`, changeFrequency: "weekly", priority: 0.6 },
    ...aliados.map((slug) => ({
      url: `${SITIO.url}/aliados/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
