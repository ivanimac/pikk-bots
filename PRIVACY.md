# PRIVACY.md — PIKK Bots

## Quién ve los datos

**Nadie más que tú.** PIKK Bots corre en TU cuenta de Vercel y Supabase con TUS llaves de API. Las conversaciones de tus clientes viven en tu base de datos. El bot **no envía telemetría ni datos de uso a PIKK ni a terceros**. No hay ping de activación ni analíticas ocultas.

## Qué datos se guardan

| Dato | Ubicación | Duración |
|------|-----------|----------|
| Mensajes de clientes | Supabase `messages` | 90 días (purga automática diaria) |
| Conversaciones | Supabase `conversations` | Indefinido (hasta archivar/borrar) |
| Leads (nombre, teléfono, interés) | Supabase `leads` | Hasta que los borres |
| Documentos de conocimiento | Supabase `kb_documents` + `kb_chunks` | Hasta que los borres |
| Configuración del bot | Supabase `bot_settings` + `member/` | Indefinido |
| Archivos multimedia | Supabase Storage | 90 días |

## Qué NO se guarda

- **Audios de clientes**: se transcriben y solo queda el texto. El audio original no se almacena.
- **Imágenes**: se describen y solo queda el texto. La imagen original no se almacena.
- **Direcciones IP**: no se registran.
- **Datos de navegación**: no se usan cookies ni tracking.
- **Ubicación GPS**: no se solicita ni almacena.

## A qué terceros salen los datos

El **texto de la conversación** viaja al proveedor de IA que elegiste (Anthropic, OpenAI, o xAI) usando **tu propia API key**. El proveedor procesa el texto para generar la respuesta. Sus políticas de privacidad aplican:

- Anthropic: https://www.anthropic.com/legal/privacy
- OpenAI: https://openai.com/policies/privacy-policy
- xAI: https://x.ai/privacy-policy

Los mensajes enviados por WhatsApp, Instagram, Messenger o Telegram viajan a través de sus respectivas APIs. Las políticas de Meta, Telegram y Evolution API aplican para el transporte del mensaje.

## Seguridad

- Las API keys se almacenan como **variables de entorno cifradas** en Vercel (`vercel env`).
- La contraseña del dashboard usa **bcrypt** (nunca en texto plano).
- Las conexiones a Supabase usan **TLS 1.3**.
- El acceso al dashboard requiere Basic Auth.

## Tus responsabilidades como dueño del bot

Al operar un chatbot de IA que interactúa con clientes:

1. **Avisa a tus clientes** que están hablando con un asistente automatizado. El bot lo dirá si le preguntan.
2. **Atiende solicitudes de borrado**: si un cliente pide que elimines sus datos, puedes borrarlos desde el panel `/admin` o directamente en Supabase.
3. **Protege el acceso al panel**: usa una contraseña fuerte para `/admin` y no la compartas.
4. **Cumple con LOPD/GDPR**: si operas en España/UE, eres el responsable del tratamiento. PIKK Bots es solo la herramienta.
5. **Revisa periódicamente** los leads y conversaciones guardados.

## Cumplimiento GDPR/LOPD

PIKK Bots está diseñado para facilitar el cumplimiento:

- **Derecho de acceso**: los datos están en tu Supabase. Puedes exportarlos desde `/admin`.
- **Derecho de rectificación**: edita o borra datos desde `/admin` o Supabase.
- **Derecho de supresión**: borra mensajes, conversaciones o leads individualmente.
- **Derecho a la portabilidad**: exporta leads a CSV desde `/admin`.
- **Minimización de datos**: solo se guarda lo necesario. Los mensajes se purgan a 90 días.

## Contacto

Para dudas sobre privacidad: hola@pikkweb.es
