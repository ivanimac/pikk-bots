import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
      <div style={{ textAlign: 'center', maxWidth: 600 }}>
        <div style={{ fontSize: '3rem', marginBottom: 8 }}>&#x1f528;</div>
        <h1 style={{ color: '#5CC9BE', fontSize: '2.2rem', fontWeight: 700, margin: '0 0 8px' }}>PIKK Bots</h1>
        <p style={{ color: '#888', fontSize: '1.1rem', margin: '0 0 32px', lineHeight: 1.6 }}>
          Tu chatbot de IA para WhatsApp, Instagram y Telegram.<br />
          Self-hosted en tu Vercel + Supabase. Open source.
        </p>
        <div style={{ display: 'inline-block', background: 'rgba(92,201,190,0.12)', color: '#5CC9BE', padding: '6px 16px', borderRadius: 20, fontSize: '0.85rem', marginBottom: 24 }}>
          v0.1.0 · Online
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32, textAlign: 'left' }}>
          {[
            ['💬', 'Multicanal', 'WhatsApp, Instagram, Messenger y Telegram.'],
            ['🧠', 'RAG', 'Responde desde tu base de conocimiento con pgvector.'],
            ['📊', 'Dashboard', 'Conversaciones, leads y métricas en tiempo real.'],
            ['🔐', 'Tus datos', 'En tu Supabase, con tus llaves. Sin telemetría.'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ border: '1px solid rgba(92,201,190,0.13)', borderRadius: 12, padding: 16 }}>
              <h3 style={{ color: '#5CC9BE', fontSize: '0.95rem', marginBottom: 4 }}>{icon} {title}</h3>
              <p style={{ color: '#777', fontSize: '0.85rem', lineHeight: 1.4 }}>{desc}</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/admin" style={{ color: '#5CC9BE', textDecoration: 'none', padding: '8px 20px', border: '1px solid rgba(92,201,190,0.27)', borderRadius: 8, fontSize: '0.9rem' }}>Dashboard</Link>
          <Link href="https://github.com/ivanimac/pikk-bots" style={{ color: '#5CC9BE', textDecoration: 'none', padding: '8px 20px', border: '1px solid rgba(92,201,190,0.27)', borderRadius: 8, fontSize: '0.9rem' }}>GitHub</Link>
          <Link href="/api/health" style={{ color: '#5CC9BE', textDecoration: 'none', padding: '8px 20px', border: '1px solid rgba(92,201,190,0.27)', borderRadius: 8, fontSize: '0.9rem' }}>API Health</Link>
        </div>
        <p style={{ color: '#555', fontSize: '0.8rem', marginTop: 32 }}>MIT © PIKK · pikkweb.es</p>
      </div>
    </main>
  );
}
