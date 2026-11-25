# Prompts para Claude Code (copiar y pegar en orden)

## 1. Arranque

Lee CLAUDE.md, docs/CONTEXTO.md y docs/FASES.md. Resúmeme en 5 líneas qué entendiste del proyecto y cuál es la fase actual. No escribas código todavía.

## 2. Fase 0

Ejecuta la Fase 0 de docs/FASES.md: crea el proyecto Next.js en esta carpeta (sin borrar CLAUDE.md ni docs/), instala e inicializa Prisma y configura el .env para mi PostgreSQL local de Windows (no uso Docker). Base: talksportuarios, usuario: postgres, contraseña: ____. Explícame qué hace cada comando antes de correrlo.

## 3. Fase 1 — modelo y datos

Crea el schema de Prisma de la Fase 1 y el seed con los datos reales de docs/CONTEXTO.md. Corre la migración y el seed. Luego crea los servicios en src/services/.

## 4. Fase 1 — páginas

Construye el layout con el botón de WhatsApp y las páginas de Inicio, /talks, /talks/[slug] y /eventos según docs/FASES.md, respetando las reglas de arquitectura de CLAUDE.md. Al terminar, marca en docs/FASES.md lo completado.
