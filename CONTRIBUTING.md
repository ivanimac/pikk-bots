# CONTRIBUTING.md — PIKK Bots

¡Gracias por contribuir! PIKK Bots es open source (MIT) y los PRs son bienvenidos.

## Flujo de contribución

1. **Abre un issue primero** explicando qué vas a hacer. Así evitamos trabajo duplicado.
2. **Fork el repo** y crea una rama: `git checkout -b feat/tu-feature`
3. **Escribe tests** para el cambio. Usamos vitest.
4. **Asegura que todo pase**: `pnpm test && pnpm typecheck`
5. **Abre un PR** a `main` con descripción clara.

## Antes de enviar un PR

- [ ] Tests pasan (`pnpm test`)
- [ ] TypeScript compila (`pnpm typecheck`)
- [ ] No hay secrets hardcodeados
- [ ] No se modificó `member/` (sagrado)
- [ ] El PR tiene una descripción clara del cambio

## Convenciones de commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: añadir channel adapter para Telegram
fix: spam guard no reseteaba contador diario
docs: actualizar README con nuevas variables de entorno
refactor: extraer provider selection a llm/provider.ts
test: añadir tests para el budget guard
```

## Convenciones de PR

- Título: misma convención que commits
- Descripción: qué cambia, por qué, cómo probarlo
- Si cierra un issue: `Closes #123`

## Estructura del código

```
src/
├── index.ts           # Entry point Hono app
├── agent.ts           # BufferedAgent: buffer + LLM loop
├── system-prompt.ts   # Plantilla del system prompt
├── config.ts          # Feature gating (free/pro)
├── budget.ts          # Cost guard + pricing
├── spam.ts            # Spam guardrails
├── settings-loader.ts # Merge config layers
├── env.ts             # Tipos centrales
├── channels/          # Channel adapters
├── db/                # Supabase layer
├── kb/                # Knowledge base + pgvector
├── llm/               # LLM provider abstraction
├── tools/             # Agent tools
├── niches/            # Industry templates (NichePacks)
├── admin/             # Dashboard React
├── media/             # Audio transcription + vision
└── upgrade/           # Model tier selector
```

## Cómo añadir un nuevo canal

1. Crea `src/channels/tu-canal.ts` implementando `ChannelAdapter`
2. Regístralo en `src/channels/shared.ts`
3. Añade la ruta webhook en `src/index.ts`
4. Añade las variables de entorno en `src/env.ts`
5. Documenta la conexión en `skill/configurar-mi-chatbot.md`

## Cómo añadir un nuevo niche (industria)

1. Crea `src/niches/tu-nicho.ts` implementando `NichePack`
2. Regístralo en `src/niches/types.ts` en el `PACKS` registry
3. Añade el playbook, tono, herramientas y FAQs sugeridas

---

**Hecho con 🔨 por [PIKK](https://pikkweb.es)**
