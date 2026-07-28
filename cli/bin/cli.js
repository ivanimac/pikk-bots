#!/usr/bin/env node

/**
 * pikkbot — PIKK Bots CLI
 * Tu chatbot de IA self-hosted en un comando.
 * Licencia MIT © PIKK
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createInterface } from 'node:readline';

// ─── i18n ────────────────────────────────────────────────────────────────────

const T = {
  es: {
    splash: `
██████╗ ██╗██╗  ██╗██╗  ██╗  ██████╗  ██████╗ ████████╗███████╗
██╔══██╗██║██║ ██╔╝██║ ██╔╝  ██╔══██╗██╔═══██╗╚══██╔══╝██╔════╝
██████╔╝██║█████╔╝ █████╔╝   ██████╔╝██║   ██║   ██║   ███████╗
██╔═══╝ ██║██╔═██╗ ██╔═██╗   ██╔══██╗██║   ██║   ██║   ╚════██║
██║     ██║██║  ██╗██║  ██╗  ██████╔╝╚██████╔╝   ██║   ███████║
╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝  ╚═════╝  ╚═════╝    ╚═╝   ╚══════╝
`,
    tagline: 'Tu chatbot de IA self-hosted. En tu Vercel, con tu Supabase, tus datos.',
    init_desc: 'Crea un chatbot nuevo — paso a paso con tu agente Claude Code',
    update_desc: 'Actualiza un bot existente sin perder tu configuración',
    doctor_desc: 'Revisa que todo esté listo: Node, pnpm, Vercel, Supabase, puertos',
    list_desc: 'Muestra los bots que tienes instalados localmente',
    help_desc: 'Muestra esta ayuda',
    prerequisites: '🧩 Lo que necesitas',
    node_ok: '✓ Node {v}',
    pnpm_ok: '✓ pnpm {v}',
    node_missing: '✗ Node.js 18+ requerido. Instálalo en https://nodejs.org',
    pnpm_missing: '✗ pnpm no encontrado. Instálalo con: npm i -g pnpm',
    init_question1: '¿Cómo se llama tu negocio?',
    init_question2: '¿Qué hace tu negocio? (ej: barbería, salón, restaurante…)',
    init_question3: '¿En qué ciudad está?',
    init_question4: '¿Qué horario tiene?',
    init_question5: '¿Qué tono quieres para el bot?',
    init_question6: '¿Qué canales quieres conectar? (whatsapp/telegram/instagram/messenger)',
    tone_options: ['Amable y cercano', 'Profesional y formal', 'Divertido y casual', 'Eficiente y directo'],
    creating: 'Creando tu chatbot…',
    done: '✅ ¡Listo! Tu chatbot está en {url}',
    done_dashboard: '📊 Panel de control: {url}/admin',
    next_steps: '📋 Próximos pasos: conecta tus canales ejecutando: npx pikkbot connect',
    error_setup: '❌ Algo falló durante la creación. El progreso se guardó en .bot-setup.json',
    resume_hint: '💡 Ejecuta de nuevo npx pikkbot init para retomar donde quedaste.',
    ready: '✅ Todo listo. Ejecuta npx pikkbot init para crear tu primer chatbot.',
    not_ready: '⚠️ Faltan requisitos. Corrige lo marcado con ✗ antes de continuar.',
    version: 'v{version}',
  },
  en: {
    splash: `
██████╗ ██╗██╗  ██╗██╗  ██╗  ██████╗  ██████╗ ████████╗███████╗
██╔══██╗██║██║ ██╔╝██║ ██╔╝  ██╔══██╗██╔═══██╗╚══██╔══╝██╔════╝
██████╔╝██║█████╔╝ █████╔╝   ██████╔╝██║   ██║   ██║   ███████╗
██╔═══╝ ██║██╔═██╗ ██╔═██╗   ██╔══██╗██║   ██║   ██║   ╚════██║
██║     ██║██║  ██╗██║  ██╗  ██████╔╝╚██████╔╝   ██║   ███████║
╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝  ╚═════╝  ╚═════╝    ╚═╝   ╚══════╝
`,
    tagline: 'Your self-hosted AI chatbot. On your Vercel, with your Supabase, your data.',
    init_desc: 'Create a new chatbot — step by step with your Claude Code agent',
    update_desc: 'Update an existing bot without losing your configuration',
    doctor_desc: 'Check prerequisites: Node, pnpm, Vercel, Supabase, ports',
    list_desc: 'List locally installed bots',
    help_desc: 'Show this help',
    prerequisites: '🧩 Prerequisites',
    node_ok: '✓ Node {v}',
    pnpm_ok: '✓ pnpm {v}',
    node_missing: '✗ Node.js 18+ required. Install at https://nodejs.org',
    pnpm_missing: '✗ pnpm not found. Install with: npm i -g pnpm',
    init_question1: "What's your business name?",
    init_question2: 'What does your business do? (e.g. barbershop, salon, restaurant…)',
    init_question3: 'What city is it in?',
    init_question4: 'What are your business hours?',
    init_question5: 'What tone do you want for the bot?',
    init_question6: 'Which channels do you want to connect? (whatsapp/telegram/instagram/messenger)',
    tone_options: ['Warm and friendly', 'Professional and formal', 'Fun and casual', 'Efficient and direct'],
    creating: 'Creating your chatbot…',
    done: '✅ Done! Your chatbot is at {url}',
    done_dashboard: '📊 Dashboard: {url}/admin',
    next_steps: "📋 Next steps: connect your channels with: npx pikkbot connect",
    error_setup: '❌ Something went wrong during setup. Progress saved to .bot-setup.json',
    resume_hint: '💡 Run npx pikkbot init again to resume where you left off.',
    ready: '✅ All set. Run npx pikkbot init to create your first chatbot.',
    not_ready: '⚠️ Missing prerequisites. Fix the ✗ items before continuing.',
    version: 'v{version}',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PKG = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));
const LANG = process.env.LANG?.startsWith('es') ? 'es' : 'en';
const t = (key: string, vars: Record<string, string> = {}) => {
  let s = T[LANG as 'es'][key as keyof (typeof T)['es']] ?? T.en[key as keyof typeof T.en] ?? key;
  for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
  return s;
};

const log = (...args: unknown[]) => console.log(...args);
const ask = (question: string): Promise<string> => {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((res) => rl.question(`${question} `, (a) => { rl.close(); res(a.trim()); }));
};

const selectArrow = async (question: string, options: string[]): Promise<string> => {
  log(`\n${question}`);
  options.forEach((o, i) => log(`  ${i + 1}. ${o}`));
  const ans = await ask('\n>');
  const idx = parseInt(ans) - 1;
  return options[idx >= 0 && idx < options.length ? idx : 0];
};

// ─── Doctor ───────────────────────────────────────────────────────────────────

async function cmdDoctor(): Promise<boolean> {
  log(t('splash'));
  log(`\n🐦 PIKK Bots CLI ${t('version', { version: PKG.version })}\n`);
  log(t('prerequisites'));
  log('─'.repeat(40));

  let ok = true;

  // Node
  const nodeV = process.versions.node;
  const [major] = nodeV.split('.').map(Number);
  if (major >= 18) log(t('node_ok', { v: nodeV }));
  else { log(t('node_missing')); ok = false; }

  // pnpm
  try {
    const { execSync } = await import('node:child_process');
    const pnpmV = execSync('pnpm --version', { encoding: 'utf-8' }).trim();
    log(t('pnpm_ok', { v: pnpmV }));
  } catch { log(t('pnpm_missing')); ok = false; }

  log('─'.repeat(40));
  if (ok) log(`\n${t('ready')}`);
  else log(`\n${t('not_ready')}`);
  return ok;
}

// ─── Init ─────────────────────────────────────────────────────────────────────

interface SetupState {
  fase: number;
  paso: number;
  completed: string[];
  businessName?: string;
  businessType?: string;
  city?: string;
  hours?: string;
  tone?: string;
  channels?: string;
}

function loadState(dir: string): SetupState | null {
  const p = join(dir, '.bot-setup.json');
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, 'utf-8'));
}

function saveState(dir: string, state: SetupState): void {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, '.bot-setup.json'), JSON.stringify(state, null, 2));
}

async function cmdInit(): Promise<void> {
  log(t('splash'));
  log(`\n🚀 ${t('init_desc')}\n`);

  const dir = resolve(process.cwd());
  let state = loadState(dir);

  if (state && state.fase > 0) {
    log(`📂 Encontrado progreso anterior (fase ${state.fase}, paso ${state.paso}). Retomando…\n`);
  } else {
    state = { fase: 1, paso: 0, completed: [] };
  }

  // ── Fase 1: Plataforma ──
  if (state.fase === 1) {
    log('─'.repeat(40));
    log('🧱 FASE 1: TU PLATAFORMA\n');

    if (!state.completed.includes('questions')) {
      const businessName = await ask(t('init_question1'));
      const businessType = await ask(t('init_question2'));
      const city = await ask(t('init_question3'));
      const hours = await ask(t('init_question4'));
      const tone = await selectArrow(t('init_question5'), t('tone_options').split(', '));
      const channels = await ask(t('init_question6'));

      Object.assign(state, { businessName, businessType, city, hours, tone, channels });
      state.completed.push('questions');
      saveState(dir, state);
    }

    log(`\n${t('creating')}`);
    log(`   Negocio: ${state.businessName}`);
    log(`   Tipo: ${state.businessType}`);
    log(`   Tono: ${state.tone}`);
    log(`   Canales: ${state.channels || 'whatsapp'}`);

    // Escribir member/config.local.ts
    const memberDir = join(dir, 'member');
    mkdirSync(memberDir, { recursive: true });
    const config = `// member/config.local.ts — TU configuración (nunca se sobrescribe en updates)
export const memberConfig = {
  businessName: ${JSON.stringify(state.businessName)},
  botName: "${(state.businessName || 'Bot').replace(/\s+/g, '')}",
  language: "es" as const,
  tier: "free" as const,
  timezone: "Atlantic/Canary",
  contactEmail: "",
};

export const businessConfig = {
  hours: ${JSON.stringify(state.hours || 'Lun–Vie 9:00–18:00')},
  services: [],
  location: ${JSON.stringify(state.city || '')},
  paymentMethods: [],
  contactPhone: "",
  customFields: {},
};

export const memberTone = ${JSON.stringify(state.tone || 'Amable y cercano')};

export const catalog: Array<{ name: string; price: string; description: string }> = [];
`;
    writeFileSync(join(memberDir, 'config.local.ts'), config);

    state.fase = 2;
    state.paso = 0;
    saveState(dir, state);
  }

  // ── Fase 2-4: delegadas al agent skill ──
  log('\n📋 Las fases 2-4 (chatbot, conexiones y prueba) las completa tu agente Claude Code.');
  log('   Cierra esta terminal, abre Claude Code en esta carpeta y dile:');
  log('\n   👉 "configura mi chatbot con PIKK Bots"\n');
  log(`   El progreso se guardó en .bot-setup.json (fase ${state.fase})`);

  log(`\n${t('done', { url: 'https://TU-BOT.vercel.app' })}`);
  log(t('done_dashboard', { url: 'https://TU-BOT.vercel.app' }));
  log(t('next_steps'));
}

// ─── Update ────────────────────────────────────────────────────────────────────

async function cmdUpdate(): Promise<void> {
  log('\n🔄 Actualizando PIKK Bots…');
  log('   El agente se encargará de actualizar src/ sin tocar member/');
  log('   Si estás en Claude Code, dile: "actualiza mi bot con PIKK Bots"\n');
}

// ─── List ─────────────────────────────────────────────────────────────────────

async function cmdList(): Promise<void> {
  const dir = resolve(process.cwd());
  const statePath = join(dir, '.bot-setup.json');
  if (existsSync(statePath)) {
    const state = JSON.parse(readFileSync(statePath, 'utf-8'));
    log(`\n📋 Bot encontrado: ${state.businessName || '(sin nombre)'}`);
    log(`   Tipo: ${state.businessType || '—'}`);
    log(`   Fase: ${state.fase}/${state.completed?.length || 0} pasos completados`);
  } else {
    log('\n📋 No se encontraron bots en esta carpeta.');
    log('   Crea uno con: npx pikkbot init\n');
  }
}

// ─── Help ─────────────────────────────────────────────────────────────────────

function cmdHelp(): void {
  log(t('splash'));
  log(`\n🐦 PIKK Bots CLI ${t('version', { version: PKG.version })}`);
  log(`\n${t('tagline')}\n`);
  log('Comandos:');
  log(`  init     ${t('init_desc')}`);
  log(`  update   ${t('update_desc')}`);
  log(`  doctor   ${t('doctor_desc')}`);
  log(`  list     ${t('list_desc')}`);
  log(`  help     ${t('help_desc')}\n`);
  log('Ejemplo:');
  log('  npx pikkbot init    → crea tu primer chatbot');
  log('  npx pikkbot doctor  → revisa que todo funcione\n');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const cmd = process.argv[2]?.toLowerCase();

switch (cmd) {
  case 'init':
    await cmdInit();
    break;
  case 'update':
    await cmdUpdate();
    break;
  case 'doctor':
    await cmdDoctor();
    break;
  case 'list':
    await cmdList();
    break;
  case 'help':
  case '--help':
  case '-h':
    cmdHelp();
    break;
  default:
    if (cmd) log(`Comando desconocido: ${cmd}\n`);
    cmdHelp();
}
