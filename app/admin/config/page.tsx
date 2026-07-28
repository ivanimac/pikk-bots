export default function ConfigPage() {
  return (
    <div>
      <h1 style={{ color: 'var(--accent)', fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>Configuración</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[
          { label: 'Nombre del negocio', value: 'Mi Negocio', key: 'businessName' },
          { label: 'Nombre del bot', value: 'MiNegocioBot', key: 'botName' },
          { label: 'Idioma', value: 'Español (es)', key: 'language' },
          { label: 'Zona horaria', value: 'Atlantic/Canary', key: 'timezone' },
          { label: 'Horario', value: 'Lun–Vie 9:00–18:00', key: 'hours' },
          { label: 'Tono del bot', value: 'Amable y cercano', key: 'tone' },
          { label: 'Buffer de respuesta', value: '3 segundos', key: 'buffer' },
          { label: 'Proveedor IA', value: 'Anthropic (Claude)', key: 'provider' },
          { label: 'Tier', value: 'Starter (free)', key: 'tier' },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{label}</span>
            <span style={{ fontWeight: 500 }}>{value}</span>
          </div>
        ))}
      </div>

      <p style={{ color: 'var(--dim)', fontSize: '0.85rem', marginTop: 24 }}>
        Estos valores se configuran en <code>member/config.local.ts</code> y en las variables de entorno de Vercel.
        Usa el agent skill o edita los archivos directamente.
      </p>
    </div>
  );
}
