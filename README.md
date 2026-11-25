# Talks Portuarios — Plataforma web

Plataforma de conocimiento, networking y posicionamiento de **Talks Portuarios**, comunidad del sector marítimo-portuario peruano (Callao, desde 2020). Desarrollada por **TECPORT**, partner fundador.

Objetivo: convertir los Talks, eventos e invitados en páginas que Google y las IA puedan leer y citar (SEO + GEO).

## Stack

Next.js 16 (App Router, Cache Components) · TypeScript · PostgreSQL · Prisma 7 · Tailwind CSS 4

## Puesta en marcha (local, Windows)

Requisitos: Node.js 24+ y PostgreSQL instalado localmente (sin Docker).

```bash
npm install
# Crear .env con la conexión a la base local:
# DATABASE_URL="postgresql://postgres:CONTRASEÑA@localhost:5432/talksportuarios?schema=public"
npx prisma migrate dev      # crea las tablas
npx prisma db seed          # carga los datos reales (docs/datos-reales.json)
npm run dev                 # http://localhost:3000
```

Antes de dar un cambio por terminado: `npm run lint` y `npm run build`.

## Documentación

- [`CLAUDE.md`](CLAUDE.md) — reglas de arquitectura, modelo de datos e identidad visual
- [`docs/CONTEXTO.md`](docs/CONTEXTO.md) — contexto de negocio y estrategia
- [`docs/FASES.md`](docs/FASES.md) — plan por fases y estado actual
- [`docs/DATOS_REALES.md`](docs/DATOS_REALES.md) — datos reales del canal y pendientes
