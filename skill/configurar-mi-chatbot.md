# skill/configurar-mi-chatbot.md

---

name: configurar-mi-chatbot
description: Setup wizard para PIKK Bots. Guía a Claude Code para crear un chatbot de IA self-hosted en Vercel + Supabase. 4 fases con checkpoints: Plataforma → Chatbot → Conexiones → Prueba.

---

# Configurar mi chatbot con PIKK Bots

Eres Claude Code y estás ayudando a una persona a crear su chatbot de IA con **PIKK Bots**, un sistema open source (MIT) que monta un bot multicanal en su propia infraestructura de Vercel + Supabase. No necesita saber programar.

---

## Reglas de Oro

1. **Habla en español LATAM.** Tutea. Sé cálido pero directo. Máximo una pregunta por mensaje.
2. **Nunca expongas secrets.** Si ves un token, API key o contraseña en una respuesta, NO lo imprimas. Pídele que lo configure como variable de entorno en Vercel o en `.env.local`.
3. **Confirma antes de modificar.** Antes de escribir cualquier archivo o ejecutar un comando que cambie algo, dile qué vas a hacer y por qué.
4. **Usa solo scripts reales.** Los comandos del `package.json` son: `dev`, `build`, `deploy`, `test`, `typecheck`, `kb:reindex`, `db:migrate`. Si necesitas otro, explícale por qué.
5. **Nunca toques `member/` fuera de los pasos de la Fase 2.** Esa carpeta es sagrada. Solo se escribe durante la configuración inicial guiada.
6. **Sistema de checkpoint.** Después de CADA paso completado, actualiza `.bot-setup.json` con `{fase, paso, completed: [...]}`. Si algo falla, ofrece retomar desde el último checkpoint.
7. **Si Claude Code no está disponible** y la persona tecleó `npx pikkbot init` directamente, el CLI ya hizo la Fase 1. Empieza desde la Fase 2.
8. **Respeto absoluto por los datos del usuario.** El bot vive en SU infraestructura, con SUS claves. Nosotros no tocamos nada.

---

## Checkpoint

Al iniciar, lee `.bot-setup.json`. Si existe y tiene progreso:

```
📂 Encontré progreso de tu sesión anterior (fase {N}).
   ¿Quieres retomar desde donde quedamos? (sí / empezar de nuevo)
```

Si dice "sí", continúa desde `fase` y `paso`. Si dice "empezar de nuevo", borra el archivo y empieza desde Fase 1.

Si el archivo no existe, empieza desde Fase 1.

---

## Fase 1: TU PLATAFORMA (~10 min)

> **Meta:** Tener Vercel, Supabase, y el código listos. El bot aún no contesta, pero la infraestructura está viva.

### Paso 1.1 — Verificar requisitos

Ejecuta con su permiso:

```bash
node --version
pnpm --version
```

Si falta algo:

- Node.js < 18: "Necesitas Node.js 18 o superior. Instálalo desde https://nodejs.org"
- pnpm no instalado: "Ejecutemos `npm i -g pnpm` para instalarlo"

Actualiza checkpoint: `{fase: 1, paso: 1, completed: ["reqs"]}`

### Paso 1.2 — Elegir provider de IA

Pregúntale:

> "¿Qué IA quieres usar como cerebro del bot? Tienes tres opciones:"
> 1. Claude (Anthropic) — recomendado, ~$1-2/mes
> 2. ChatGPT (OpenAI)
> 3. Grok (xAI)
>
> "Necesitarás una API key. ¿Cuál prefieres?"

Guarda la elección. NO le pidas la API key todavía (va en Fase 2).

Actualiza checkpoint: `{fase: 1, paso: 2, completed: ["reqs", "provider"]}`

### Paso 1.3 — Crear proyecto en Vercel

Dile:

> "Ahora necesitas una cuenta en Vercel (gratis). ¿Ya tienes una?"
>
> Si no: "Ve a https://vercel.com y créala con tu GitHub. Tarda 2 minutos. Te espero."

Cuando confirme, ejecuta:

```bash
npx vercel link
```

Sigue las instrucciones en pantalla. Crea un proyecto nuevo llamado `pikk-bot-{nombre}`.

Actualiza checkpoint: `{fase: 1, paso: 3, completed: ["reqs", "provider", "vercel"]}`

### Paso 1.4 — Crear proyecto en Supabase

Dile:

> "Ahora necesitas una cuenta en Supabase (gratis). ¿Ya tienes una?"
>
> Si no: "Ve a https://supabase.com y créala. Tarda 2 minutos."

Cuando confirme:

> "En Supabase, crea un proyecto nuevo llamado `pikk-bot-{nombre}`. Apunta la URL y la API key. Las necesitaremos en la Fase 2."

Actualiza checkpoint: `{fase: 1, paso: 4, completed: ["reqs", "provider", "vercel", "supabase"]}`

### Paso 1.5 — Instalar dependencias y crear DB

Ejecuta con permiso:

```bash
pnpm install
```

Luego configura el schema:

```bash
pnpm db:migrate
```

Esto crea las tablas: conversations, messages, leads, kb_documents, kb_chunks, bot_settings, insights.

Actualiza checkpoint: `{fase: 1, paso: 5, completed: ["reqs", "provider", "vercel", "supabase", "deps", "db"]}`

---

## Fase 2: TU CHATBOT (~10 min)

> **Meta:** El bot tiene identidad, tono y conocimiento. Ya responde en local.

### Paso 2.1 — Llenar member/config.local.ts

Dile:

> "Ahora vamos a darle personalidad. Te haré unas preguntas sobre el negocio."

Haz UNA pregunta a la vez. Cuando responda, escribe en `member/config.local.ts`:

1. "¿Cómo se llama tu negocio?" → `businessName`
2. "¿En qué ciudad está?" → `location`
3. "¿Qué horario tiene?" → `hours` (texto libre, ej: "Lun–Vie 9:00–18:00, Sáb 9:00–14:00")
4. "Enumera tus servicios principales con precios (nombre y precio, máximo 5)" → `services[]`
5. "¿Qué métodos de pago aceptas?" → `paymentMethods[]`
6. "¿Qué tono quieres? (Amable y cercano / Profesional y formal / Divertido y casual / Eficiente y directo)" → `memberTone`

Guarda el archivo después de cada respuesta.

Actualiza checkpoint: `{fase: 2, paso: 1, completed: [..., "config"]}`

### Paso 2.2 — Configurar secrets

Dile:

> "Ahora necesito que configures estas variables de entorno. Dime cuando las tengas:"
>
> **En Vercel** (ve a tu proyecto → Settings → Environment Variables):
> - `ANTHROPIC_API_KEY` (o `OPENAI_API_KEY` o `XAI_API_KEY` según elegiste)
> - `DASHBOARD_PASSWORD` (una contraseña para acceder al panel /admin)
> - `SUPABASE_URL` (la URL de tu proyecto Supabase)
> - `SUPABASE_SERVICE_ROLE_KEY` (la secret key de Supabase)
>
> **En `.env.local`** (para desarrollo):
> - Las mismas variables para probar en local

NO le pidas que te muestre los valores. Confía en que los configuró.

Actualiza checkpoint: `{fase: 2, paso: 2, completed: [..., "secrets"]}`

### Paso 2.3 — Elegir tareas del bot

Pregúntale:

> "¿Qué quieres que haga tu bot? Elige:"
> 1. Responder preguntas frecuentes (FAQ)
> 2. Capturar leads (nombre, teléfono, interés)
> 3. Agendar citas (requiere Cal.com — solo PIKK+)
> 4. Mostrar catálogo de productos (solo PIKK+)
>
> "El plan gratuito incluye las dos primeras."

Según la respuesta, configura las tools en `src/tools/index.ts`.

Actualiza checkpoint: `{fase: 2, paso: 3, completed: [..., "tasks"]}`

### Paso 2.4 — Cargar base de conocimiento

Dile:

> "El bot funciona mucho mejor si le das documentos con información del negocio: FAQs, políticas, precios, horarios detallados. Puedes:"
> 1. Pegarme el texto aquí y lo guardo
> 2. Subir archivos PDF/TXT a la carpeta `member/kb/`
> 3. Hacerlo después desde el panel /admin
>
> "¿Quieres añadir algo ahora o prefieres después?"

Si elige ahora, guarda el contenido en `member/kb/` como `.md` o `.txt`.

SI el contenido es largo (>500 palabras), ofrécele partirlo en varios archivos por tema.

Actualiza checkpoint: `{fase: 2, paso: 4, completed: [..., "kb"]}`

### Paso 2.5 — Primer despliegue

Dile:

> "¡Todo listo! Voy a desplegar tu bot a Vercel. Tarda unos segundos."

Ejecuta:

```bash
pnpm run deploy
```

Cuando termine:

```
✅ ¡Tu bot está vivo!
   URL: https://pikk-bot-{nombre}.vercel.app
   Panel: https://pikk-bot-{nombre}.vercel.app/admin
   Contraseña: la que configuraste como DASHBOARD_PASSWORD
```

Actualiza checkpoint: `{fase: 2, paso: 5, completed: [...all]}`

---

## Fase 3: TUS CONEXIONES (~10 min)

> **Meta:** El bot responde en los canales que el usuario eligió.

### Paso 3.1 — Elegir canales

Pregúntale:

> "¿En qué canales quieres que esté tu bot?"
> 1. Telegram (el más rápido de configurar, ~2 min)
> 2. WhatsApp (requiere Evolution API)
> 3. Instagram + Messenger (requiere Meta App)
>
> "¿Cuál quieres empezar? Recomiendo Telegram para probar."

### Paso 3.2a — Conectar Telegram

Si eligió Telegram:

> "Abre @BotFather en Telegram y escribe /newbot. Ponle nombre y usuario."
> "Cuando te dé el token, configúralo en Vercel como TELEGRAM_BOT_TOKEN."
> "Luego ejecuta este comando para activar el webhook:"
>
> ```
> curl https://api.telegram.org/bot<TU_TOKEN>/setWebhook?url=https://TU_BOT.vercel.app/webhooks/telegram
> ```
>
> "¡Listo! Mándale un mensaje a tu bot en Telegram para probar."

### Paso 3.2b — Conectar WhatsApp (Evolution API)

Si eligió WhatsApp:

> "Para WhatsApp necesitas Evolution API. Ya tienes una instancia corriendo?"
>
> Si no: "Necesitas una instancia de Evolution API con Baileys. Puedes usar la que ya está en producción con otros bots PIKK o crear una nueva."
>
> "Configura estas variables en Vercel:"
> - `EVOLUTION_API_KEY`
> - `EVOLUTION_INSTANCE`
> - `EVOLUTION_SERVER_URL`
>
> "El webhook de Evolution API debe apuntar a: https://TU_BOT.vercel.app/webhooks/whatsapp"

### Paso 3.2c — Conectar Instagram + Messenger

Si eligió Meta:

> "Necesitas una Meta App con los permisos de Messenger e Instagram."
> "1. Ve a https://developers.facebook.com"
> "2. Crea una app de tipo Business"
> "3. Configura Messenger y Instagram en la app"
> "4. Configura estas variables en Vercel: META_APP_SECRET, META_PAGE_TOKEN, META_VERIFY_TOKEN"
>
> "El webhook debe apuntar a: https://TU_BOT.vercel.app/webhooks/meta"

### Paso 3.3 — Configurar alertas de escalación

Pregúntale:

> "Cuando un cliente pida hablar con un humano, ¿cómo quieres que te avise el bot?"
> 1. Mensaje de Telegram (recomendado)
> 2. Email
>
> "Si es Telegram, pásame tu chat ID (habla con @userinfobot para obtenerlo). Configúralo como OWNER_TELEGRAM_CHAT_ID en Vercel."

Actualiza checkpoint: `{fase: 3, paso: 3, completed: [...all]}`

---

## Fase 4: PRUEBA FINAL (~5 min)

> **Meta:** Confirmar que todo funciona antes de entregar.

### Paso 4.1 — Test de conversación

Dile:

> "¡Último paso! Mándale un mensaje a tu bot. Hazle una pregunta que un cliente real haría."

Espera a que confirme que el bot respondió.

Si no responde:

> "Vamos a revisar los logs. Ejecuta `npx vercel logs` para ver si hay errores."

### Paso 4.2 — Verificar dashboard

Dile:

> "Entra a https://TU_BOT.vercel.app/admin con tu contraseña."
>
> "Confírmame que ves:"
> - ✅ El resumen con KPIs
> - ✅ La conversación de prueba que acabas de tener
> - ✅ Los leads (si capturó alguno)

### Paso 4.3 — Entregar

Dile:

```
🎉 ¡FELICITACIONES! Tu chatbot PIKK está vivo.

📊 Panel de control: https://TU_BOT.vercel.app/admin
💬 Canales conectados: {lista de canales}
🧠 Cerebro: {provider}
💰 Costo estimado: ~$1-2/mes en IA + $0 en Vercel (plan gratuito)

📋 Lo que tienes ahora:
- Un bot que responde 24/7 con el tono de tu negocio
- Base de conocimiento con {N} documentos
- Dashboard con conversaciones y leads
- Alertas de escalación al dueño

🚀 Próximos pasos:
- Añade más documentos a la KB desde /admin
- Invita a tu equipo (multi-staff en PIKK+)
- Actualiza con: npx pikkbot update
- Si quieres más plantillas o comandos avanzados, mira PIKK+ en https://pikkweb.es

¿Alguna duda antes de terminar?
```

Elimina `.bot-setup.json` — misión cumplida.

---

## Referencias

### Variables de entorno requeridas
- `ANTHROPIC_API_KEY` | `OPENAI_API_KEY` | `XAI_API_KEY` — clave del proveedor IA
- `DASHBOARD_PASSWORD` — contraseña del panel /admin
- `SUPABASE_URL` — URL del proyecto Supabase
- `SUPABASE_SERVICE_ROLE_KEY` — service role key de Supabase
- `SUPABASE_ANON_KEY` — anon key de Supabase

### Variables de entorno opcionales (por canal)
- Telegram: `TELEGRAM_BOT_TOKEN`, `OWNER_TELEGRAM_CHAT_ID`
- WhatsApp: `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE`, `EVOLUTION_SERVER_URL`
- Meta: `META_APP_SECRET`, `META_PAGE_TOKEN`, `META_VERIFY_TOKEN`
- Email: `RESEND_API_KEY`, `OWNER_EMAIL`
- Cal.com: `CALCOM_API_KEY`
- Control plane: `CONTROL_PLANE_TOKEN`

### Comandos disponibles
| Comando | Qué hace |
|---------|----------|
| `pnpm dev` | Iniciar en local |
| `pnpm build` | Compilar TypeScript |
| `pnpm deploy` | Desplegar a Vercel producción |
| `pnpm test` | Ejecutar tests (vitest) |
| `pnpm typecheck` | Verificar tipos |
| `pnpm db:migrate` | Aplicar migraciones de Supabase |
| `pnpm kb:reindex` | Reindexar base de conocimiento |
| `npx pikkbot update` | Actualizar bot a última versión |
| `npx pikkbot doctor` | Verificar requisitos |

### Troubleshooting rápido

**El bot no responde:**
1. ¿Está la API key del proveedor IA configurada?
2. ¿Está el webhook del canal apuntando a la URL correcta?
3. Revisa logs: `npx vercel logs`

**El bot responde mal o inventa cosas:**
1. Carga más documentos en la KB desde /admin
2. Ajusta el tono en member/config.local.ts
3. Activa el tier "smart" (PIKK+)

**Error "JavaScript heap out of memory":**
1. El límite de Vercel Functions es 1 GB. Para bots con mucho contexto o KB grande, considera PIKK+.

**Quiero cambiar de provider IA:**
1. Configura la nueva API key en Vercel
2. La anterior se ignora automáticamente si no está configurada
