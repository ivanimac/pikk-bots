/**
 * budget.ts — Monthly AI cost guard + per-model pricing rates.
 * Si se alcanza el budget mensual, downgrade automático al tier "fast".
 */

import type { AppEnv } from './env';

// ─── Pricing (USD por millón de tokens) ──────────────────────────────────────

const PRICING: Record<string, { input: number; output: number }> = {
  'claude-fable-5': { input: 15, output: 75 },
  'claude-opus-4-8': { input: 15, output: 75 },
  'claude-sonnet-4-6': { input: 3, output: 15 },
  'claude-haiku-4-5-20251001': { input: 0.80, output: 4 },
  'gpt-4o': { input: 2.50, output: 10 },
  'gpt-4o-mini': { input: 0.15, output: 0.60 },
  'grok-2': { input: 2, output: 10 },
};

// ─── Budget config ───────────────────────────────────────────────────────────

const MONTHLY_BUDGET_CENTS = 500; // $5.00 por defecto para Starter
const MONTHLY_BUDGET_PRO_CENTS = 2000; // $20.00 para Pro

export function getMonthlyBudgetCents(env: AppEnv): number {
  return env.vars.BOT_TIER === 'pro' ? MONTHLY_BUDGET_PRO_CENTS : MONTHLY_BUDGET_CENTS;
}

// ─── Cost calculation ────────────────────────────────────────────────────────

export function costOfUsage(model: string, inputTokens: number, outputTokens: number): number {
  const rates = PRICING[model];
  if (!rates) return 0;
  return (inputTokens / 1_000_000) * rates.input + (outputTokens / 1_000_000) * rates.output;
}

// ─── Budget check ────────────────────────────────────────────────────────────

interface BudgetStatus {
  spentCents: number;
  budgetCents: number;
  exceeded: boolean;
  mustDowngrade: boolean;
}

export async function checkBudget(env: AppEnv): Promise<BudgetStatus> {
  // En prod: SUM(cost_cents) FROM messages WHERE created_at > start of month
  const spentCents = 0;
  const budgetCents = getMonthlyBudgetCents(env);
  return {
    spentCents,
    budgetCents,
    exceeded: spentCents >= budgetCents,
    mustDowngrade: spentCents >= budgetCents,
  };
}

// ─── Tier model selection ────────────────────────────────────────────────────

export function selectModel(env: AppEnv, forceDowngrade = false): string {
  if (forceDowngrade) {
    // Forzar modelo barato
    if (env.secrets.ANTHROPIC_API_KEY) return 'claude-haiku-4-5-20251001';
    if (env.secrets.OPENAI_API_KEY) return 'gpt-4o-mini';
    return 'grok-2';
  }

  // Pro tier: modelo inteligente
  if (env.vars.BOT_TIER === 'pro') {
    if (env.secrets.ANTHROPIC_API_KEY) return 'claude-sonnet-4-6';
    if (env.secrets.OPENAI_API_KEY) return 'gpt-4o';
    return 'grok-2';
  }

  // Free tier: modelo rápido y barato
  if (env.secrets.ANTHROPIC_API_KEY) return 'claude-haiku-4-5-20251001';
  if (env.secrets.OPENAI_API_KEY) return 'gpt-4o-mini';
  return 'grok-2';
}
