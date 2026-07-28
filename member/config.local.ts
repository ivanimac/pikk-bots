/**
 * member/config.local.ts — TU CONFIGURACIÓN (nunca se sobrescribe en updates)
 *
 * Esta carpeta `member/` es sagrada. Cuando ejecutes `npx pikkbot update`,
 * el agente actualizará `src/` sin tocar nada de aquí.
 *
 * Llena este archivo con los datos de tu negocio.
 * El bot los leerá para personalizar sus respuestas.
 */

// ─── Identidad del negocio ───────────────────────────────────────────────────

export const memberConfig = {
  /** Nombre comercial del negocio (ej: "Don José Barbershop") */
  businessName: 'Mi Negocio',
  /** Nombre del bot como aparece en los canales (sin espacios) */
  botName: 'MiNegocioBot',
  /** Idioma principal: 'es' (español) o 'en' (English) */
  language: 'es' as const,
  /** Tier: 'free' (Starter) o 'pro' (PIKK+) */
  tier: 'free' as const,
  /** Zona horaria IANA (ej: 'Atlantic/Canary', 'Europe/Madrid', 'America/Mexico_City') */
  timezone: 'Atlantic/Canary',
  /** Email de contacto (para alertas de escalación, opcional) */
  contactEmail: '',
};

// ─── Operación del negocio ───────────────────────────────────────────────────

export const businessConfig = {
  /** Horario de atención (texto libre) */
  hours: 'Lunes a Viernes 9:00–18:00, Sábados 9:00–14:00',
  /** Servicios con precios (máximo 20) */
  services: [
    // { name: 'Corte de cabello', price: '15€', duration: '30 min' },
    // { name: 'Afeitado', price: '10€', duration: '20 min' },
  ],
  /** Ubicación física (dirección o ciudad) */
  location: '',
  /** Métodos de pago aceptados */
  paymentMethods: ['Efectivo', 'Tarjeta', 'Bizum'],
  /** Teléfono de contacto (visible en el bot) */
  contactPhone: '',
  /** Campos personalizados (los que necesites) */
  customFields: {} as Record<string, string>,
};

// ─── Tono de voz ─────────────────────────────────────────────────────────────

/**
 * Tono del bot. Opciones sugeridas:
 * - 'Amable y cercano' (recomendado para negocios locales)
 * - 'Profesional y formal' (clínicas, abogados, finanzas)
 * - 'Divertido y casual' (bares, ocio, tiendas jóvenes)
 * - 'Eficiente y directo' (servicios técnicos, logística)
 */
export const memberTone = 'Amable y cercano';

// ─── Catálogo (solo Pro) ─────────────────────────────────────────────────────

export const catalog: Array<{ name: string; price: string; description: string }> = [
  // { name: 'Producto 1', price: '9.99€', description: 'Descripción breve' },
];
