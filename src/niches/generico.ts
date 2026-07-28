/**
 * niches/generico.ts — NichePack genérico (Starter, gratuito).
 */

import type { NichePack } from './types';

export const generico: NichePack = {
  id: 'generico',
  recordSingular: 'Lead',
  recordPlural: 'Leads',
  navLabel: 'Negocio',
  icon: '🏪',
  kpiLabel: 'Leads capturados',
  defaultTone: 'Amable y cercano',
  playbook: `## Playbook genérico
Este bot sirve para cualquier tipo de negocio. El dueño lo configura con sus datos.

### Tareas principales
- Responder preguntas frecuentes desde la base de conocimiento.
- Capturar leads cuando un cliente muestra interés.
- Transferir a un humano cuando la consulta es compleja o el cliente está molesto.

### Horario
Responde según el horario configurado. Fuera de horario, informa amablemente.

### Precios y servicios
NUNCA inventes precios. Si no están en la KB, ofrece que el equipo los consulte.`,
  kbDocs: [
    'Horarios de atención',
    'Lista de precios y servicios',
    'Políticas de cancelación',
    'Preguntas frecuentes',
    'Métodos de pago aceptados',
  ],
  tools: ['searchKb', 'handoffHuman', 'captureLead'],
};
