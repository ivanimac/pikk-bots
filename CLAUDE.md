# CLAUDE.md — PIKK Bots

## Project overview

PIKK Bots is a self-hosted, open-source AI chatbot system for small businesses. It runs on Vercel + Supabase and connects to WhatsApp (Evolution API), Telegram, Instagram, and Messenger. Uses Vercel AI SDK for multi-provider LLM support and pgvector for RAG.

**Language:** TypeScript, Spanish-first
**License:** MIT
**Stack:** Hono + Next.js 16 + Vercel AI SDK v6 + Supabase (pgvector) + Redis Upstash + Tailwind v4 + shadcn/ui

## Critical rules

1. **`member/` is SACRED.** Never overwrite user config during updates. Pattern: `git checkout --ours -- member/` on merge.
2. **No PII in logs.** Truncate user IDs to last 4 chars, never log full names, phones, or message content.
3. **The bot admits it's AI.** Never configure it to deny being a bot. Stored in system-prompt anti-patterns.
4. **Secrets in Vercel env vars only.** Never in code, never in `member/`, never in git.
5. **Privacy by default.** Messages auto-purge at 90 days. No telemetry. No analytics pings.

## Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Local dev server |
| `pnpm build` | Build TypeScript + Next.js |
| `pnpm test` | Run vitest suite |
| `pnpm typecheck` | TypeScript check |
| `pnpm deploy` | Deploy to Vercel production |
| `pnpm db:migrate` | Apply Supabase migrations |
| `pnpm kb:reindex` | Reindex KB embeddings |

## Key files

- `src/index.ts` — Hono entry point with webhooks
- `src/agent.ts` — BufferedAgent: message buffer + LLM loop + tool calling
- `src/system-prompt.ts` — System prompt template with `{{placeholders}}`
- `src/config.ts` — Tier gating (free: 5 tools, pro: 8 tools + 5 tabs)
- `src/budget.ts` — Monthly AI cost guard + per-model pricing
- `src/spam.ts` — Spam guardrails (repeat detection + daily cap)
- `src/env.ts` — Central types: Secrets, EnvVars, ChannelAdapter interface
- `src/channels/` — Channel adapters (Adapter pattern): telegram, whatsapp, meta, manychat
- `src/tools/` — Agent tools with Zod schemas
- `src/niches/` — NichePack interface + registry (industry templates)
- `src/llm/provider.ts` — LLM provider abstraction + fallback
- `member/config.local.ts` — User-owned business identity (never overwritten)
- `skill/configurar-mi-chatbot.md` — Agent skill: 4-phase setup wizard with checkpoints
- `cli/bin/cli.js` — Single-file CLI: `npx pikkbot {init,update,doctor,list}`
- `supabase/schema.sql` — Full DB schema (conversations, messages, leads, KB, insights, campaigns)

## Architecture

```
Webhook → Channel Adapter → BufferedAgent → LLM (with tools) → Channel Adapter → Reply
                               ↓                    ↓
                          Spam guard         Budget guard
                               ↓                    ↓
                          Supabase DB        Supabase RAG
```

## Channel adapters

Each channel implements `ChannelAdapter { parseIncoming, sendReply, showTyping }`. Normalizes platform-specific payloads into common `IncomingMessage` format. Registered in `src/channels/shared.ts`.

## Tier gating

- **Free (Starter):** 5 tools, 8 dashboard tabs
- **Pro (PIKK+):** +3 tools (scheduleAppointment, catalogQuery, sendCampaign), +5 tabs (insights, stats, costs, mejoras, campanas), white-label, multi-staff

## Testing

- Framework: vitest
- Pattern: mirror `src/` structure under `test/`
- Minimum: 400+ tests, typecheck clean
