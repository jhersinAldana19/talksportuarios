# Plan por fases

> **Fase actual: 1b**. Panel con login y CRUD de Talks, invitados, eventos y partners. Sigue Cloudinary.

## Fase 0 — Preparación (30 min)

- [x] PostgreSQL local (instalado en Windows, sin Docker) con la base `talksportuarios` creada (PostgreSQL 18)
- [x] `create-next-app` con TypeScript, Tailwind, App Router y `src/` (Next.js 16.4)
- [x] Prisma instalado e inicializado, `.env` con `DATABASE_URL` (Prisma 7.10.1 fijado; config en `prisma7.config.ts`)
- [x] Repositorio git inicializado, `.env` en `.gitignore`

## Fase 1 — Demo local para presentar (hoy)

Objetivo: mostrar el sitio público funcionando con **contenido real** de Talks Portuarios.

- [x] `schema.prisma` con Talk, Invitado, Evento, Partner (+ enums)
- [x] `prisma/seed.ts` con los Talks, invitados, eventos y aliados de `docs/CONTEXTO.md`
- [x] `src/services/` para talks, eventos y partners
- [x] Layout con header, footer, colores de marca y **botón flotante de WhatsApp**
- [x] **Inicio**: hero con el lema, último Talk, próximos eventos, partners (TECPORT como partner fundador)
- [x] **/talks**: listado con miniaturas y filtro por serie
- [x] **/talks/[slug]**: video con carga diferida, resumen, puntos clave, invitado, `generateMetadata` y JSON-LD `VideoObject`
- [x] **/eventos**: próximos eventos con botón de inscripción por WhatsApp (+ JSON-LD `Event`)
- [x] Responsive (mobile-first)
- [x] Verificar con "Ver código fuente" que el contenido está en el HTML (verificado descargando el HTML crudo de cada página)

Datos reales (fuente: `docs/datos-reales.json`, ver `docs/DATOS_REALES.md`):
- [x] Los 36 Talks con fecha real, duración, serie, edición e invitados (35 invitados deduplicados)
- [x] WhatsApp Business real en todo el sitio
- [ ] Resúmenes y puntos clave reales desde las transcripciones (hoy: `tema` como "Resumen provisional")
- [ ] Hora de los eventos y lugar del 16/12; cargo/empresa de 7 invitados y empresa de Sheila Samamé
- [ ] Edición de 3 Talks de 2024 (Chartering, LinkedIn, Operadores de Comercio Exterior)
- [ ] Fotos de invitados; logos y webs de TECPORT y COEX PUCP; paleta y logo oficiales

## Fase 1b — Completar la versión 1

- [x] Panel `/admin` con login (Auth.js): CRUD de Talks, Invitados, Eventos, Partners
- [x] Fichas `/aliados` y `/aliados/[slug]` (Sarmiento Academia publicada; sin precios; UTM y JSON-LD)
- [x] `/formacion` desde la tarjeta Formación y Talento (cursos, becas y Talks con certificado)
- [x] Marca del sitio editable (colores CSS vars, logo, hero; deshacer / restaurar oficial)
- [x] Módulo `/admin/configuracion`: Mi cuenta, Marca del sitio y Acceso (admins)
- [ ] Subida de imágenes a Cloudinary
- [ ] Blog: modelo Articulo + listado + detalle
- [ ] Páginas: /invitados/[slug], /partners, /nosotros
- [ ] Etiqueta visible de contenido patrocinado
- [ ] `sitemap.ts`, `robots.ts`, JSON-LD en todas las páginas públicas
- [ ] **PWA**: `manifest.ts`, íconos, Serwist
- [ ] PageSpeed Insights > 90 en móvil
- [ ] Despliegue: VPS Linux (Docker Compose o PM2, instalado en la VPS) + Caddy + Cloudflare, dominio talksportuarios.com

## Fase 2 — Integración con Claude y medición

- [ ] Servidor **MCP remoto** en `app/api/mcp` usando los mismos `services/`
  - Herramientas: `buscar_talks`, `listar_eventos`, `listar_invitados`, `ver_estadisticas`, `crear_borrador_talk`, `crear_borrador_articulo`
  - Autenticación por token/login; escrituras solo como BORRADOR
- [ ] Analítica (Umami autoalojado)
- [ ] Monitoreo de caída (Uptime Kuma / UptimeRobot)
- [ ] Directorio de empresas del sector

## Fase 3 — Crecimiento

- [ ] Notificaciones push (nuevo Talk, recordatorio de evento)
- [ ] Monitor de visibilidad de TECPORT en las IA (consultas periódicas y registro de menciones y fuentes citadas)
- [ ] Mediakit / oferta para otros patrocinadores
