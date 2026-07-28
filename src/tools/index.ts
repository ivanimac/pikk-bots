/**
 * tools/index.ts — Agent tool definitions for the LLM.
 * Tools disponibles según el tier (free/pro).
 */

import type { AppEnv } from '../env';
import { isToolAvailable } from '../config';
import { tool as zodTool } from 'ai';
import { z } from 'zod';

export function createToolDefinitions(env: AppEnv) {
  const tools: Record<string, ReturnType<typeof zodTool>> = {};

  if (isToolAvailable('searchKb', env)) {
    tools.searchKb = zodTool({
      description: 'Busca en la base de conocimiento del negocio (FAQ, políticas, guías). Usa esto antes de responder cualquier pregunta operativa.',
      parameters: z.object({ query: z.string().describe('La pregunta o término a buscar') }),
      execute: async ({ query }) => searchKb(query, env),
    });
  }

  if (isToolAvailable('handoffHuman', env)) {
    tools.handoffHuman = zodTool({
      description: 'Transfiere la conversación a un humano. Usa cuando el cliente está molesto, pide hablar con una persona, es una emergencia, o no estás seguro de la respuesta.',
      parameters: z.object({
        reason: z.string().describe('El motivo de la transferencia'),
        summary: z.string().optional().describe('Resumen de lo que el cliente necesita'),
      }),
      execute: async ({ reason, summary }) => handoffHuman(reason, summary, env),
    });
  }

  if (isToolAvailable('pauseBot', env)) {
    tools.pauseBot = zodTool({
      description: 'Pausa el bot por N minutos. Solo el dueño puede usar esto.',
      parameters: z.object({ minutes: z.number().min(1).max(480).describe('Minutos a pausar') }),
      execute: async ({ minutes }) => `Bot pausado por ${minutes} minutos.`,
    });
  }

  if (isToolAvailable('captureLead', env)) {
    tools.captureLead = zodTool({
      description: 'Guarda los datos de un cliente potencial. Usa cuando el cliente muestra interés en los servicios o pide información de precios.',
      parameters: z.object({
        name: z.string().describe('Nombre del cliente'),
        phone: z.string().optional().describe('Teléfono de contacto'),
        interest: z.string().optional().describe('Qué le interesa'),
      }),
      execute: async ({ name, phone, interest }) => captureLead(name, phone, interest, env),
    });
  }

  if (isToolAvailable('scheduleAppointment', env)) {
    tools.scheduleAppointment = zodTool({
      description: 'Agenda una cita con el negocio. Pide fecha, hora y tipo de servicio antes de usar.',
      parameters: z.object({
        date: z.string().describe('Fecha en formato YYYY-MM-DD'),
        time: z.string().describe('Hora en formato HH:MM'),
        service: z.string().describe('Tipo de servicio'),
        clientName: z.string().describe('Nombre del cliente'),
        clientPhone: z.string().describe('Teléfono del cliente'),
      }),
      execute: async (args) => `Cita agendada: ${args.service} el ${args.date} a las ${args.time} para ${args.clientName}.`,
    });
  }

  if (isToolAvailable('catalogQuery', env)) {
    tools.catalogQuery = zodTool({
      description: 'Consulta el catálogo de productos o servicios con precios.',
      parameters: z.object({ item: z.string().optional().describe('Producto o servicio específico (vacío = todos)') }),
      execute: async ({ item }) => item ? `Catálogo: ${item}` : 'Catálogo completo disponible en la web del negocio.',
    });
  }

  return tools;
}

// ─── Tool Implementations ─────────────────────────────────────────────────────

async function searchKb(query: string, env: AppEnv): Promise<string> {
  try {
    const { data, error } = await env.bindings.supabase.rpc('search_kb', {
      query_embedding: query, // pgvector lo convierte
      match_threshold: 0.3,
      match_count: 3,
    });
    if (error || !data?.length) return 'No encontré información sobre eso en la base de conocimiento. ¿Quieres que le pregunte al equipo?';
    return data.map((d: { content: string; title: string }) => `📚 ${d.title}:\n${d.content}`).join('\n\n');
  } catch {
    return 'No pude acceder a la base de conocimiento en este momento.';
  }
}

async function handoffHuman(reason: string, summary: string | undefined, env: AppEnv): Promise<string> {
  // Enviar alerta al dueño por Telegram
  if (env.secrets.TELEGRAM_BOT_TOKEN && env.secrets.OWNER_TELEGRAM_CHAT_ID) {
    await fetch(`https://api.telegram.org/bot${env.secrets.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.secrets.OWNER_TELEGRAM_CHAT_ID,
        text: `🚨 HANDOFF\nMotivo: ${reason}\nResumen: ${summary ?? 'No proporcionado'}\n⏰ ${new Date().toLocaleString('es-ES')}`,
      }),
    }).catch(() => {});
  }

  return `Te he transferido al equipo de ${env.vars.BUSINESS_NAME}. ${reason === 'emergencia' ? 'Si es una emergencia, por favor contacta también a los servicios de emergencia.' : 'Te contactarán pronto.'}`;
}

async function captureLead(name: string, phone: string | undefined, interest: string | undefined, env: AppEnv): Promise<string> {
  try {
    const { error } = await env.bindings.supabase
      .from('leads')
      .insert([{ name, phone: phone ?? null, interest: interest ?? null, business_id: env.vars.BUSINESS_NAME }]);
    if (error) throw error;
    return `¡Gracias ${name}! He guardado tus datos. El equipo de ${env.vars.BUSINESS_NAME} te contactará pronto.`;
  } catch {
    return 'Hubo un problema al guardar tus datos. Por favor, intenta de nuevo o contacta directamente.';
  }
}
