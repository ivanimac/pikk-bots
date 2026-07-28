/**
 * agent.ts — PIKK Bot Agent.
 * Buffer de mensajes + loop de LLM con tool calling + envío de respuestas.
 * El equivalente del SupportAgent Durable Object de Forja, pero serverless.
 */

import { streamText, generateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createXai } from '@ai-sdk/xai';
import { systemPromptFromEnv } from './system-prompt';
import { getAvailableTools } from './config';
import { createToolDefinitions } from './tools';
import { resolveChannel } from './channels/shared';
import { recordMessage, recordLead, getRecentMessages } from './db/messages';
import type { AppEnv, IncomingMessage, OutgoingReply } from './env';

// ─── LLM Provider Selection ──────────────────────────────────────────────────

function getModel(env: AppEnv) {
  const tier = env.vars.BOT_TIER === 'pro' ? 'smart' : 'fast';

  // Anthropic es el default
  if (env.secrets.ANTHROPIC_API_KEY) {
    const anthropic = createAnthropic({ apiKey: env.secrets.ANTHROPIC_API_KEY });
    return anthropic(tier === 'smart' ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001');
  }
  if (env.secrets.OPENAI_API_KEY) {
    const openai = createOpenAI({ apiKey: env.secrets.OPENAI_API_KEY });
    return openai(tier === 'smart' ? 'gpt-4o' : 'gpt-4o-mini');
  }
  if (env.secrets.XAI_API_KEY) {
    const xai = createXai({ apiKey: env.secrets.XAI_API_KEY });
    return xai('grok-2');
  }
  throw new Error('No AI provider configured. Set ANTHROPIC_API_KEY, OPENAI_API_KEY, or XAI_API_KEY.');
}

// ─── Buffered Agent ──────────────────────────────────────────────────────────

interface BufferEntry {
  message: IncomingMessage;
  resolve: (reply: string) => void;
}

class BufferedAgent {
  private buffer: BufferEntry[] = [];
  private processing = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private bufferMs: number;

  constructor(bufferMs: number = 3000) {
    this.bufferMs = bufferMs;
  }

  /** Añade un mensaje al buffer. Retorna la respuesta cuando se procese. */
  async ingest(message: IncomingMessage, env: AppEnv): Promise<string> {
    return new Promise((resolve) => {
      this.buffer.push({ message, resolve });
      this.scheduleFlush(env);
    });
  }

  private scheduleFlush(env: AppEnv) {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(env), this.bufferMs);
  }

  private async flush(env: AppEnv) {
    if (this.processing || this.buffer.length === 0) return;
    this.processing = true;

    const batch = [...this.buffer];
    this.buffer = [];

    try {
      const replies = await this.processBatch(batch, env);
      batch.forEach((entry, i) => entry.resolve(replies[i] ?? 'Lo siento, hubo un error al procesar tu mensaje.'));
    } catch (err) {
      console.error('Agent flush error:', err);
      batch.forEach((entry) => entry.resolve('Lo siento, hubo un error interno. ¿Puedes intentarlo de nuevo?'));
    } finally {
      this.processing = false;
      // Si llegaron más mensajes mientras procesábamos
      if (this.buffer.length > 0) this.scheduleFlush(env);
    }
  }

  private async processBatch(entries: BufferEntry[], env: AppEnv): Promise<string[]> {
    if (entries.length === 1) {
      const reply = await this.generateReply(entries[0].message, env);
      return [reply];
    }

    // Multi-mensaje: unir contexto
    const messages = entries.map((e) => e.message);
    const replies: string[] = [];
    for (const msg of messages) {
      const reply = await this.generateReply(msg, env);
      replies.push(reply);
    }
    return replies;
  }

  private async generateReply(msg: IncomingMessage, env: AppEnv): Promise<string> {
    // Guardar mensaje entrante
    await recordMessage({
      conversationId: msg.userId,
      channel: msg.channel,
      direction: 'in',
      content: msg.text ?? '[media]',
      userId: msg.userId,
      userName: msg.userName,
    }).catch(() => { /* non-blocking */ });

    // Spam guard: 3 mensajes idénticos = cooldown
    const spamScore = await checkSpam(msg, env);
    if (spamScore.blocked) {
      return spamScore.reply ?? 'Mensaje bloqueado temporalmente.';
    }

    // Construir historial
    const history = await getRecentMessages(msg.userId, 20);

    const systemPrompt = systemPromptFromEnv(env);
    const tools = createToolDefinitions(env);

    try {
      const result = await generateText({
        model: getModel(env),
        system: systemPrompt,
        messages: [
          ...history.map((m) => ({
            role: m.direction === 'in' ? 'user' as const : 'assistant' as const,
            content: m.content,
          })),
          { role: 'user' as const, content: msg.text ?? '[media]' },
        ],
        tools,
        maxSteps: 5,
      });

      const reply = result.text;

      // Guardar respuesta
      await recordMessage({
        conversationId: msg.userId,
        channel: msg.channel,
        direction: 'out',
        content: reply,
        userId: msg.userId,
        userName: 'bot',
      }).catch(() => { /* non-blocking */ });

      return reply;
    } catch (err) {
      console.error('LLM error:', err);

      // Guardar error como respuesta fallida
      await recordMessage({
        conversationId: msg.userId,
        channel: msg.channel,
        direction: 'out',
        content: 'Algo falló…',
        userId: msg.userId,
        userName: 'bot',
      }).catch(() => { /* non-blocking */ });

      return 'Algo falló al procesar tu mensaje. El equipo recibirá una alerta. ¿Puedes intentarlo de nuevo en un momento?';
    }
  }
}

// ─── Spam Guard ──────────────────────────────────────────────────────────────

const spamCache = new Map<string, { text: string; count: number; until: number }>();
const DAILY_CAP = 50;
const dailyCounts = new Map<string, number>();

async function checkSpam(
  msg: IncomingMessage,
  _env: AppEnv,
): Promise<{ blocked: boolean; reply?: string }> {
  const key = `${msg.channel}:${msg.userId}`;
  const now = Date.now();
  const entry = spamCache.get(key);

  // Cooldown activo
  if (entry && entry.until > now) return { blocked: true };

  // Mismo texto repetido
  if (entry && entry.text === (msg.text ?? '')) {
    entry.count++;
    if (entry.count >= 3) {
      entry.until = now + 3600000; // 1 hora
      spamCache.set(key, entry);
      return { blocked: true, reply: 'He recibido el mismo mensaje varias veces. Si necesitas ayuda, por favor reformula tu consulta.' };
    }
  } else {
    spamCache.set(key, { text: msg.text ?? '', count: 1, until: 0 });
  }

  // Daily cap
  const today = new Date().toISOString().split('T')[0];
  const dailyKey = `${key}:${today}`;
  const count = (dailyCounts.get(dailyKey) ?? 0) + 1;
  dailyCounts.set(dailyKey, count);
  if (count > DAILY_CAP) {
    return { blocked: true };
  }

  return { blocked: false };
}

// ─── Singleton ────────────────────────────────────────────────────────────────

const agents = new Map<string, BufferedAgent>();

export function getAgent(agentId: string, bufferMs?: number): BufferedAgent {
  if (!agents.has(agentId)) {
    agents.set(agentId, new BufferedAgent(bufferMs));
  }
  return agents.get(agentId)!;
}

export { BufferedAgent };
