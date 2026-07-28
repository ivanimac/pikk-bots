/**
 * config.ts — Feature gating y tier management.
 * Free: 5 tools. Pro: +2 tools +5 dashboard tabs.
 */

import type { AppEnv } from './env';

// ─── Tool availability ────────────────────────────────────────────────────────

export const FREE_TOOLS = [
  'searchKb',
  'handoffHuman',
  'pauseBot',
  'snoozeUser',
  'captureLead',
] as const;

export const PRO_ONLY_TOOLS = [
  'scheduleAppointment',
  'catalogQuery',
  'sendCampaign',
] as const;

export const ALL_TOOLS = [...FREE_TOOLS, ...PRO_ONLY_TOOLS] as const;

export type ToolName = (typeof ALL_TOOLS)[number];

// ─── Dashboard tabs ────────────────────────────────────────────────────────────

export const FREE_TABS = [
  'overview',
  'conversations',
  'agente',
  'leads',
  'kb',
  'config',
  'conexiones',
  'perfil',
] as const;

export const PRO_ONLY_TABS = [
  'insights',
  'stats',
  'costs',
  'mejoras',
  'campanas',
] as const;

export const ALL_TABS = [...FREE_TABS, ...PRO_ONLY_TABS] as const;

export type TabName = (typeof ALL_TABS)[number];

// ─── Tier check ────────────────────────────────────────────────────────────────

export function isPro(env: AppEnv): boolean {
  return env.vars.BOT_TIER === 'pro';
}

export function isToolAvailable(tool: ToolName, env: AppEnv): boolean {
  if (isPro(env)) return true;
  return (FREE_TOOLS as readonly string[]).includes(tool);
}

export function isTabAvailable(tab: TabName, env: AppEnv): boolean {
  if (isPro(env)) return true;
  return (FREE_TABS as readonly string[]).includes(tab);
}

export function getAvailableTools(env: AppEnv): ToolName[] {
  return ALL_TOOLS.filter((t) => isToolAvailable(t, env));
}
