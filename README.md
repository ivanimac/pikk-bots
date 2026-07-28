# 🔨 PIKK Bots

### Tu chatbot de IA para WhatsApp, Instagram y Telegram — en **tu propia nube**, gratis y open source.

**Atiende a tus clientes 24/7, responde desde tu base de conocimiento, y te avisa cuando algo lo amerita.** Vive en tu cuenta de Vercel y Supabase, con tu llave de IA. Tus datos son tuyos. Sin mensualidades de SaaS.

_Self-hosted, open-source AI chatbot for small businesses. Lives in **your** Vercel + Supabase, uses **your** AI key. Spanish-first. Deploy in minutes._

[![License: MIT](https://img.shields.io/badge/License-MIT-f59e0b.svg)](LICENSE)
[![Hecho por PIKK](https://img.shields.io/badge/por-PIKK-5CC9BE.svg)](https://pikkweb.es)

[**Instalar**](#-instalar-en-5-minutos) · [**Cómo funciona**](#-cómo-funciona) · [**PIKK+**](#-pikk-los-8-giros-y-el-modo-agencia)

---

## ¿Qué es PIKK Bots?

Un asistente de soporte con IA que montas **en tu propia infraestructura de Vercel + Supabase** en una tarde — sin saber programar. En lugar de pagar una mensualidad a un SaaS que se queda con tus conversaciones, PIKK Bots vive en tu cuenta, con tu llave de IA, y **todo es tuyo**.

- 💬 **Multicanal** — WhatsApp, Instagram, Messenger y Telegram desde un mismo cerebro.
- 📚 **Aprende de tus documentos** — subes tus FAQ, políticas y guías; el bot busca ahí antes de responder (RAG con pgvector).
- 🎙️ **Entiende notas de voz** — transcribe los audios de tus clientes automáticamente.
- 🙋 **Sabe cuándo pedir ayuda** — si algo es delicado o no está seguro, te hace _handoff_ a ti.
- 📊 **Panel de administración** — conversaciones, leads, base de conocimiento y métricas, todo en `/admin`.
- ☁️ **Vive en Vercel + Supabase** — rápido, serverless, y con PostgreSQL de verdad.
- 🧠 **Tu cerebro, tu llave** — Claude, ChatGPT o Grok; tú eliges y pagas solo lo que piensa.
- 👥 **Multi-staff** — varios miembros del equipo pueden operar el mismo bot (PIKK+).

> **No necesitas saber programar.** PIKK Bots se instala y configura con Claude Code como tu copiloto — él ejecuta los comandos por ti, paso a paso.

---

## 🚀 Instalar en 5 minutos

### Opción A — con Claude Code (recomendado, no necesitas saber programar)

Abre [Claude Code](https://claude.com/claude-code) en tu terminal y dile:

```
configúrame un chatbot con PIKK Bots
```

Claude te explica cómo funciona y cuánto cuesta, verifica que tengas lo necesario, y monta todo por ti. Por debajo corre:

```bash
npx pikkbot init
```

### Opción B — manual (si ya programas)

```bash
git clone https://github.com/ivanimac4826-ctrl/pikk-bots mi-chatbot
cd mi-chatbot
pnpm install
# Configura las variables de entorno en Vercel o .env.local
pnpm db:migrate
pnpm run deploy
```

Tu panel queda en `https://<tu-proyecto>.vercel.app/admin`.

---

## 💸 Cuánto cuesta

PIKK Bots es **gratis y open source**. Lo único que pagas es tu propia infraestructura, y arranca casi en cero:

| Pieza | Costo | Notas |
|-------|-------|-------|
| **Vercel** | **$0** para empezar · ~$20/mes ya con tráfico real | Funciones serverless + cron jobs + WebSockets |
| **Supabase** | **$0** para empezar · ~$25/mes con más datos | PostgreSQL + pgvector + Storage |
| **Cerebro de IA** (tu llave) | ~**$1–2/mes** para un negocio normal | Pagas solo lo que el bot piensa; tu llave, cifrada en Vercel |
| **Redis Upstash** | **$0** para empezar | Sesiones conversacionales |

Nadie más toca tus datos ni tus conversaciones.

---

## 🧠 Cómo funciona

```
Cliente → WhatsApp/IG/Telegram → Vercel Function → BotAgent
                                                        ↓
                                          busca contexto en pgvector (RAG)
                                                        ↓
                                          tu IA (Claude/GPT/Grok) piensa
                                                        ↓
                                          guarda en Supabase + responde
                                                        ↓
                                          si delicado → alerta al dueño
```

Un mensaje entra por un canal → el agente arma contexto desde tu base de conocimiento → tu IA redacta la respuesta con la voz de tu negocio → se responde y se guarda. Si algo es delicado, te avisa.

---

## 🧩 Stack

| Capa | Tecnología |
|------|-----------|
| **Runtime** | Vercel Functions (Fluid Compute) con Hono |
| **Dashboard** | Next.js 16 + React + Tailwind v4 + shadcn/ui |
| **IA** | Vercel AI SDK v6 (Anthropic/OpenAI/xAI) |
| **DB** | Supabase PostgreSQL + pgvector |
| **Cache** | Redis Upstash (sesiones) |
| **Media** | Supabase Storage |
| **CLI** | Node.js ESM — `npx pikkbot` |
| **Skill** | Agent Skills spec — `skill/` |

---

## ⭐ PIKK+ — los 8 giros y el Modo Agencia

El Starter de este repo sirve para **cualquier negocio**. Si quieres ir más allá, **PIKK+** desbloquea:

- 🎯 **8 giros con panel a la medida** — salón de belleza, barbería, restaurante, clínica, gimnasio, inmobiliaria, CRM ventas, tienda — cada uno con herramientas específicas.
- 🤖 **Comandos que trabajan por ti** — `/mantenimiento`, `/campaña`, `/afinar`, `/clonar`, `/precios`…
- 💼 **Modo Agencia** — arma y **revende** bots a otros negocios, con cotizador y propuesta incluidos.
- 👥 **Comunidad + soporte** — construyendo con IA en español, y actualizaciones gestionadas.

👉 **[Más info en pikkweb.es →](https://pikkweb.es)**

---

## 🔒 Privacidad — quién ve los datos

**Nadie más que tú.** PIKK Bots corre en TU cuenta de Vercel y Supabase con TUS llaves: las conversaciones de tus clientes viven en tu base de datos y **el bot no envía telemetría ni datos de uso a PIKK ni a nadie**. No hay ping de activación ni analíticas ocultas — puedes revisarlo tú mismo en `src/`.

Lee [`PRIVACY.md`](PRIVACY.md) para el detalle completo.

---

## 📄 Licencia

[MIT](LICENSE) © PIKK. Úsalo, modifícalo y móntalo para quien quieras.

**Hecho con 🔨 por [PIKK](https://pikkweb.es)**
