/**
 * settings-loader.ts — Resuelve la configuración del agente combinando:
 * 1. Env vars (valores por defecto)
 * 2. member/config.local.ts (configuración del usuario)
 * 3. Supabase bot_settings (configuración desde el dashboard)
 *
 * Prioridad: Supabase > member/ > Env vars
 */

import type { AppEnv } from './env';
import { getNichePack } from './niches/types';

export interface AgentConfig {
  businessName: string;
  botName: string;
  language: 'es' | 'en';
  tier: 'free' | 'pro';
  tone: string;
  hours: string;
  services: Array<{ name: string; price: string; duration?: string }>;
  location: string;
  paymentMethods: string[];
  contactPhone: string;
  contactEmail: string;
  nichePlaybook: string;
  kbDocs: string[];
  tools: string[];
}

export async function resolveAgentConfig(env: AppEnv): Promise<AgentConfig> {
  // Cargar config de member/
  let memberConfig: Partial<AgentConfig> = {};
  try {
    const mod = await import('../member/config.local.ts');
    memberConfig = {
      businessName: mod.memberConfig?.businessName ?? env.vars.BUSINESS_NAME,
      botName: mod.memberConfig?.botName ?? env.vars.BOT_NAME,
      language: mod.memberConfig?.language ?? env.vars.BOT_LANGUAGE,
      tier: mod.memberConfig?.tier ?? env.vars.BOT_TIER,
      tone: mod.memberTone ?? 'Amable y cercano',
      hours: mod.businessConfig?.hours ?? 'Lun–Vie 9:00–18:00',
      services: mod.businessConfig?.services ?? [],
      location: mod.businessConfig?.location ?? '',
      paymentMethods: mod.businessConfig?.paymentMethods ?? [],
      contactPhone: mod.businessConfig?.contactPhone ?? '',
      contactEmail: mod.memberConfig?.contactEmail ?? '',
    };
  } catch { /* member/ no existe aún — usar defaults */ }

  // Cargar niche
  const niche = getNichePack(env.vars.BOT_NICHE);

  // Merge con Supabase settings (dashboard)
  let dbSettings: Record<string, unknown> = {};
  try {
    const { data } = await env.bindings.supabase
      .from('bot_settings')
      .select('settings')
      .eq('business_id', env.vars.BUSINESS_NAME)
      .single();
    if (data?.settings) dbSettings = data.settings as Record<string, unknown>;
  } catch { /* no settings yet */ }

  return {
    businessName: (dbSettings.businessName as string) ?? memberConfig.businessName ?? env.vars.BUSINESS_NAME,
    botName: (dbSettings.botName as string) ?? memberConfig.botName ?? env.vars.BOT_NAME,
    language: (dbSettings.language as 'es' | 'en') ?? memberConfig.language ?? env.vars.BOT_LANGUAGE,
    tier: (dbSettings.tier as 'free' | 'pro') ?? memberConfig.tier ?? env.vars.BOT_TIER,
    tone: (dbSettings.tone as string) ?? memberConfig.tone ?? niche.defaultTone,
    hours: (dbSettings.hours as string) ?? memberConfig.hours ?? 'Lun–Vie 9:00–18:00',
    services: (dbSettings.services as AgentConfig['services']) ?? memberConfig.services ?? [],
    location: (dbSettings.location as string) ?? memberConfig.location ?? '',
    paymentMethods: (dbSettings.paymentMethods as string[]) ?? memberConfig.paymentMethods ?? [],
    contactPhone: (dbSettings.contactPhone as string) ?? memberConfig.contactPhone ?? '',
    contactEmail: (dbSettings.contactEmail as string) ?? memberConfig.contactEmail ?? '',
    nichePlaybook: niche.playbook,
    kbDocs: niche.kbDocs,
    tools: niche.tools,
  };
}
