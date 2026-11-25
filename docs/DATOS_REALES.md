# Datos reales de Talks Portuarios

Fuente: canal de YouTube @TalksPortuarios (36 videos) y LinkedIn de Talks Portuarios, revisados el 25/11/2026.
Los datos estructurados están en `docs/datos-reales.json`: úsalo para reemplazar los datos inventados del seed.

## Hallazgos importantes

- **Son 36 Talks, no 9.** Están todos en el JSON con youtubeId, título, fecha real de publicación, duración, serie, número de edición e invitados.
- **Fundadora: Stephany Del Pino.** Lo dice la descripción del Talk "El Impacto de la Experiencia al Cliente en el Sector Marítimo". Usar en `/nosotros`.
- **WhatsApp real:** el link de inscripción de sus posts es `https://wa.me/message/CT2HK4NK3NHZE1` (link de WhatsApp Business). Usarlo en el botón flotante en lugar de `wa.me/51997000170`.
- **Series reales:**
  - `TALKS`: ediciones numeradas, de la 1ª (sept. 2024) a la 25ª (nov. 2025).
  - `NEXT_GENERATION`: 7 ediciones en 2026 sobre los actores de la cadena (Consolidador, Terminal, Depósito Temporal, Agente de Aduanas, Línea Naviera, Agencia de Carga, Agencia General).
  - `EDICION_ESPECIAL`: 4 videos (Avería Gruesa, People Technology & Education, Harina de pescado, Marca Profesional).
- **José Mamani**, invitado del evento del 16 de diciembre, ya dio un Talk en sept. 2024 ("Operadores de Comercio Exterior..."). Enlazar su perfil de invitado al evento.

## Invitados repetidos (deduplicar en el seed)

- **Daniel Lastra** = **Daniel Lastra Granda** (ZIM / Transmares). Talks: "Logística de la carga refrigerada" (2024) y "La Agencia General" (2026). Cargo actual: Documentation Operation & Equipment Manager.
- **Omar Córdova** = **Omar Martín Córdova Cordoví** (Rodrigo, Elías & Medrano Abogados). Talks: "El contrato de transporte de mercancías por mar" y "Avería Gruesa".

## Lo que todavía falta (pedir a Talks Portuarios)

| Dato | Estado |
|---|---|
| Lugar del evento del 16/12 ("La Agencia Marítima") | No está publicado. Pedir a la organizadora |
| Cargo/empresa de: Benazir Benavente, Olga Rimayhuaman, Paula Aguilar, César Salerno, Alexis Zurita Ruiz, Eduardo Bueno, Victor Delgado | No figura en YouTube |
| Empresa de Sheila Samamé | Solo dice "una importante empresa del rubro" |
| Número de edición de 3 Talks de 2024 (Chartering, LinkedIn, Operadores de Comercio Exterior) | No lo indican (probablemente 2ª, 4ª y 5ª) |
| Fotos de invitados | Recortes de las miniaturas o pedirlas |
| Logos y webs de TECPORT y COEX PUCP | Pedir archivos oficiales. Academia Sarmiento: sarmientoacademia.com |
| Paleta y logo oficiales de Talks Portuarios | Pendiente |
| Resúmenes y puntos clave reales | Generar desde las transcripciones de YouTube (Fase 2 con MCP, o manualmente) |

## Prompt sugerido para Claude Code

Lee docs/DATOS_REALES.md y docs/datos-reales.json. Actualiza prisma/seed.ts para cargar los 36 Talks reales desde ese JSON (deduplicando invitados como indica el .md), los 2 eventos y los 3 partners. Agrega el campo `edicion` (Int opcional) al modelo Talk si no existe. Usa el campo `tema` como resumen provisional y mantén el aviso de "Resumen provisional". Cambia el link del botón de WhatsApp al link real. Corre la migración y el seed, y verifica que /talks muestre los 36.
