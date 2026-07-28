/**
 * niches/types.ts — NichePack interface y registry.
 * Cada plantilla de industria es un NichePack que inyecta
 * playbook, tono, y configuración en el system prompt.
 */

export interface NichePack {
  /** ID único: "barberia", "salon", "restaurante"... */
  id: string;
  /** Singular del registro del negocio: "Cita", "Reserva", "Lead" */
  recordSingular: string;
  /** Plural: "Citas", "Reservas", "Leads" */
  recordPlural: string;
  /** Etiqueta en la sidebar del dashboard */
  navLabel: string;
  /** Ícono de la sidebar (emoji) */
  icon: string;
  /** Etiqueta del KPI principal en el resumen */
  kpiLabel: string;
  /** Playbook inyectado en el system prompt (instrucciones específicas del giro) */
  playbook: string;
  /** Tono de voz por defecto */
  defaultTone: string;
  /** FAQs sugeridas para la base de conocimiento inicial */
  kbDocs: string[];
  /** Tools habilitadas para este niche */
  tools: string[];
}

/** Registry de todos los niches disponibles */
import { generico } from './generico';

export const PACKS: Record<string, NichePack> = {
  generico,
};

export function getNichePack(id?: string): NichePack {
  return PACKS[id ?? 'generico'] ?? PACKS.generico;
}
