export default function ConexionesPage() {
  const channels = [
    { name: 'WhatsApp', status: 'pendiente', icon: '💬', desc: 'Evolution API (Baileys)', color: '#25D366' },
    { name: 'Telegram', status: 'pendiente', icon: '✈️', desc: 'BotFather token', color: '#26A5E4' },
    { name: 'Instagram', status: 'pendiente', icon: '📷', desc: 'Meta Graph API', color: '#E4405F' },
    { name: 'Messenger', status: 'pendiente', icon: '💭', desc: 'Meta Graph API', color: '#0084FF' },
  ];

  return (
    <div>
      <h1 style={{ color: 'var(--accent)', fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>Conexiones</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
        Conecta los canales donde quieres que tu bot responda. Configura las variables de entorno en Vercel.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {channels.map((ch) => (
          <div key={ch.name} style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{ch.icon} {ch.name}</div>
              <span style={{
                padding: '2px 10px', borderRadius: 10, fontSize: '0.75rem',
                background: 'rgba(245,158,11,0.15)', color: 'var(--warning)',
              }}>{ch.status}</span>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem', margin: '0 0 16px' }}>{ch.desc}</p>
            <div style={{
              background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8,
              padding: '8px 12px', fontSize: '0.8rem', color: 'var(--dim)', fontFamily: 'monospace',
            }}>
              {ch.name === 'WhatsApp' ? 'EVOLUTION_API_KEY + EVOLUTION_INSTANCE' :
               ch.name === 'Telegram' ? 'TELEGRAM_BOT_TOKEN' :
               'META_APP_SECRET + META_PAGE_TOKEN'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
