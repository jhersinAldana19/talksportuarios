# Talks Portuarios — Plataforma web

Lee también `docs/CONTEXTO.md` (negocio y estrategia) y `docs/FASES.md` (plan y fase actual) antes de proponer cambios grandes.

## Qué es este proyecto

Plataforma digital de **conocimiento, networking y posicionamiento** para **Talks Portuarios**, una comunidad del sector marítimo-portuario peruano (fundada en 2020, sede Callao, lema: *"Espacios para aprender, compartir y conectar"*).

La desarrolla **TECPORT** (empresa del sector portuario) a cambio de ser su **partner preferido**. El objetivo estratégico es que talksportuarios.com sea una fuente que Google y las IA (ChatGPT, Claude, Perplexity) puedan leer y citar (SEO + GEO).

- Dominio: `talksportuarios.com`
- WhatsApp (Business): `https://wa.me/message/CT2HK4NK3NHZE1` (no admite `?text=`). Teléfono: `+51 997 000 170`
- Fundadora: Stephany Del Pino. Datos reales del canal en `docs/datos-reales.json` (fuente del seed) y `docs/DATOS_REALES.md`
- YouTube: https://www.youtube.com/@TalksPortuarios
- LinkedIn: https://www.linkedin.com/company/talks-portuarios/
- Idioma del sitio: español (Perú). Código, nombres de variables y commits: en español o inglés, pero consistente por archivo.

## Stack

| Capa | Tecnología |
|---|---|
| Framework (front + back) | **Next.js (App Router)** + TypeScript |
| Base de datos | **PostgreSQL** (18 en local) |
| ORM | **Prisma 7** (fijado en 7.10.1; no actualizar a 8 sin decidirlo). Config en `prisma7.config.ts`, cliente generado en `src/generated/prisma`, conexión vía `@prisma/adapter-pg` |
| Estilos | Tailwind CSS |
| Imágenes | Cloudinary (en la BD solo se guarda URL + `public_id`) |
| Auth del panel | Auth.js (solo administradores, sin registro público) |
| PWA | `app/manifest.ts` + Serwist |
| Despliegue (futuro) | VPS Linux + Docker Compose (o PM2) + Caddy, Cloudflare delante |
| Entorno local | Windows, PostgreSQL nativo, sin Docker |

Es **un solo proyecto** Next.js: no hay carpetas `frontend/` y `backend/` separadas.

## Reglas de arquitectura (obligatorias)

1. **Renderizado en servidor para todo lo público.** Las páginas públicas son Server Components y su contenido debe estar en el HTML inicial (los rastreadores de IA no ejecutan JavaScript). Usar `"use client"` solo para piezas interactivas pequeñas.
2. **La lógica de negocio vive en `src/services/`.** Las páginas, las server actions, los route handlers y el futuro servidor MCP llaman a esos servicios. Nunca poner consultas Prisma sueltas en componentes de página si ya existe (o debería existir) un servicio.
3. **Caché (Next 16 con Cache Components).** No se usa `export const revalidate`. Las funciones de `src/services/` que leen la BD llevan `'use cache'` + `cacheLife('hours')` + `cacheTag(...)` (`talks`, `talk:<slug>`, `eventos`, `partners`). Al editar desde el panel, `revalidateTag`/`updateTag` de la etiqueta afectada. El layout `(public)` exporta `ensureStatic = 'navigation'`: el build falla si una página pública deja de ser 100 % estática. Antes de usar APIs de Next, consultar `node_modules/next/dist/docs/`.
4. **SEO/GEO en cada página pública:** `generateMetadata` (title, description, Open Graph), URL con `slug` legible, datos estructurados JSON-LD (`VideoObject` para Talks, `Event` para eventos, `Article` para artículos, `Person` para invitados, `Organization` en el layout), `app/sitemap.ts` y `app/robots.ts` (permitir GPTBot, ClaudeBot, PerplexityBot, Googlebot).
5. **Videos de YouTube:** no se alojan; se incrustan con carga diferida (miniatura primero, iframe al hacer clic). Miniatura: `https://i.ytimg.com/vi/{youtubeId}/hqdefault.jpg`.
6. **Contenido generado por IA = siempre borrador.** Todo lo que cree la IA (incluido el futuro MCP) se guarda con `estado = BORRADOR`; solo un humano publica desde el panel.
7. **Contenido patrocinado se etiqueta como tal** (campo `patrocinado` + etiqueta visible "Contenido patrocinado" / "Partner"). Requisito legal en Perú (publicidad encubierta, D.Leg. 1044) y de credibilidad.
8. **Seguridad:** variables sensibles solo en `.env` (nunca commitear). El futuro MCP expone herramientas concretas y validadas, nunca SQL libre.

## Estructura de carpetas esperada

```
src/
  app/
    (public)/            # sitio público
      page.tsx           # inicio
      talks/page.tsx
      talks/[slug]/page.tsx
      eventos/page.tsx
      eventos/[slug]/page.tsx
      blog/...
      invitados/[slug]/page.tsx
      partners/page.tsx
      nosotros/page.tsx
    admin/               # panel (protegido)
    api/                 # route handlers (y luego api/mcp)
    sitemap.ts
    robots.ts
    manifest.ts
  components/
  services/              # lógica de negocio (talks.ts, eventos.ts, ...)
  lib/                   # prisma client, utils, cloudinary
prisma/
  schema.prisma
  seed.ts
docs/
```

## Modelo de datos (borrador)

- **Talk**: id, slug, titulo, serie (`TALKS` | `NEXT_GENERATION` | `EDICION_ESPECIAL`), youtubeId, duracionMin, fechaPublicacion, resumen, puntosClave (string[]), transcripcion (text, opcional), estado (`BORRADOR` | `PUBLICADO`), patrocinado (bool), invitados (N:N con Invitado), tags.
- **Invitado**: id, slug, nombre, cargo, empresa, bio, fotoUrl, linkedinUrl.
- **Evento**: id, slug, titulo, descripcion, fecha, lugar, modalidad (`PRESENCIAL` | `VIRTUAL`), cupoLimitado (bool), aliado (opcional), linkInscripcion, estado.
- **Articulo**: id, slug, titulo, extracto, contenido, portadaUrl, categoria (`NOTICIA` | `ENTREVISTA` | `OPINION` | `CRONICA_EVENTO`), autor, fechaPublicacion, estado, patrocinado, talkRelacionado (opcional).
- **Partner**: id, nombre, logoUrl, web, nivel (`PARTNER_FUNDADOR` | `PARTNER` | `ALIADO`), orden, activo. TECPORT = `PARTNER_FUNDADOR`. COEX PUCP y Sarmiento Academia = `ALIADO`.
- **Empresa** (directorio, fase posterior): nombre, rubro, descripcion, web, logoUrl, destacada.
- **Admin**: usuarios del panel.

## Identidad visual (oficial)

- Principal: `#111966` (`marino`) · Secundario: `#e60d55` (`magenta`) · Terciario: `#fefdfd` (`claro`)
- Logo: `docs/marca/logo-talks-portuarios.webp` (bandera de 3 olas, la inferior magenta en forma de globo de diálogo). Trazado SVG en `src/components/Logo.tsx`; favicon/iconos en `src/app/` (favicon.ico, icon.png, apple-icon.png).
- **Tema claro/oscuro**: clase `dark` en `<html>` (botón `BotonTema` + script anti-parpadeo `lib/tema.ts`). En componentes usar los colores semánticos de `globals.css` (`bg-fondo`, `bg-superficie`, `text-texto`, `text-titulo`, `ring-borde`, `bg-suave`), no `bg-white`/`text-marino` fijos.
- Tipografía script en "Talks Portuarios" (Dancing Script) y Montserrat. Mobile-first.
- Botón flotante de WhatsApp visible en todas las páginas públicas.

## Comandos

```bash
npm run dev                 # desarrollo en http://localhost:3000
npx prisma migrate dev      # aplicar cambios del schema
npx prisma db seed          # cargar datos de ejemplo reales
npx prisma studio           # ver la BD
```

BD local: **PostgreSQL instalado directamente en Windows (NO usar Docker en la laptop del desarrollador; no tiene capacidad para Docker Desktop).** Base de datos `talksportuarios`.
`.env`: `DATABASE_URL="postgresql://postgres:CONTRASEÑA@localhost:5432/talksportuarios"`

Docker solo se usará en la VPS (Linux) al desplegar, nunca en local.

## Forma de trabajar

- Trabajar por fases (ver `docs/FASES.md`). No adelantar funcionalidades de fases futuras salvo que se pida.
- Cambios pequeños y verificables; correr `npm run build` y `npm run lint` antes de dar algo por terminado.
- Explicar brevemente las decisiones de Next.js que sean nuevas (el desarrollador viene de Node + Express + React con Vite).
