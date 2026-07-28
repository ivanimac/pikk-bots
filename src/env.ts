/**
 * env.ts — Tipos centrales de entorno, bindings y secrets de PIKK Bots.
 * Una sola fuente de verdad para Vercel env vars y Supabase bindings.
 */

// ─── Secrets (Vercel env vars — cifrados, nunca en código) ──────────────────────

export interface Secrets {
  /** Anthropic API Key — proveedor primario de IA */
  ANTHROPIC_API_KEY?: string;
  /** OpenAI API Key — proveedor alternativo */
  OPENAI_API_KEY?: string;
  /** xAI/Grok API Key — proveedor alternativo */
  XAI_API_KEY?: string;
  /** Contraseña del dashboard /admin (Basic Auth) */
  DASHBOARD_PASSWORD: string;
  /** Token del bot de Telegram */
  TELEGRAM_BOT_TOKEN?: string;
  /** Evolution API Key (WhatsApp vía Baileys) */
  EVOLUTION_API_KEY?: string;
  /** Evolution API instance name */
  EVOLUTION_INSTANCE?: string;
  /** Evolution API server URL */
  EVOLUTION_SERVER_URL?: string;
  /** Meta App Secret (Instagram + Messenger) */
  META_APP_SECRET?: string;
  /** Meta Page Access Token */
  META_PAGE_TOKEN?: string;
  /** Meta Verify Token (webhook verification) */
  META_VERIFY_TOKEN?: string;
  /** ManyChat API Key */
  MANYCHAT_API_KEY?: string;
  /** Supabase Service Role Key (server-side only) */
  SUPABASE_SERVICE_ROLE_KEY: string;
  /** Upstash Redis REST Token */
  UPSTASH_REDIS_TOKEN?: string;
  /** Token para endpoints de reindexación de KB */
  KB_REINDEX_TOKEN?: string;
  /** API Key de Resend (emails de alerta) */
  RESEND_API_KEY?: string;
  /** API Key de Cal.com (reservas) */
  CALCOM_API_KEY?: string;
  /** Telegram Chat ID del dueño para alertas de escalación */
  OWNER_TELEGRAM_CHAT_ID?: string;
  /** Email del dueño para alertas */
  OWNER_EMAIL?: string;
  /** Token del plano de control (API /api/*) */
  CONTROL_PLANE_TOKEN?: string;
}

// ─── Environment Vars (no secretas, en vercel.json vars o .env) ────────────────

export interface EnvVars {
  BOT_NAME: string;
  BUSINESS_NAME: string;
  BOT_LANGUAGE: 'es' | 'en';
  BOT_TIER: 'free' | 'pro';
  BOT_NICHE?: string;
  BUFFER_SECONDS: string;
  DASHBOARD_BASE_URL: string;
  DASHBOARD_PUBLIC?: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  UPSTASH_REDIS_URL?: string;
  NODE_ENV?: string;
  VERCEL_URL?: string;
  VERCEL_ENV?: string;
}

// ─── Bindings (Supabase + Redis clientes) ──────────────────────────────────────

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Redis } from '@upstash/redis';

export interface Bindings {
  supabase: SupabaseClient;
  redis?: Redis;
}

// ─── App Env (unión de todo) ───────────────────────────────────────────────────

export interface AppEnv {
  secrets: Secrets;
  vars: EnvVars;
  bindings: Bindings;
}

// ─── Channel types ─────────────────────────────────────────────────────────────

export interface IncomingMessage {
  channel: 'whatsapp' | 'telegram' | 'instagram' | 'messenger' | 'manychat' | 'twilio';
  userId: string;
  userName?: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'video' | 'document';
  timestamp: number;
  raw: unknown;
}

export interface OutgoingReply {
  userId: string;
  text: string;
  channel: IncomingMessage['channel'];
  replyToMessageId?: string;
}

// ─── Channel Adapter ───────────────────────────────────────────────────────────

export interface ChannelAdapter {
  parseIncoming(req: Request, env: AppEnv): Promise<IncomingMessage | null>;
  sendReply(reply: OutgoingReply, env: AppEnv): Promise<void>;
  showTyping?(userId: string, env: AppEnv): Promise<void>;
}
