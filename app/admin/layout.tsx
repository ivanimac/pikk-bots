import Link from 'next/link';

const NAV = [
  { href: '/admin', label: 'Resumen', icon: '📊' },
  { href: '/admin/conversations', label: 'Conversaciones', icon: '💬' },
  { href: '/admin/leads', label: 'Leads', icon: '👤' },
  { href: '/admin/kb', label: 'Conocimiento', icon: '📚' },
  { href: '/admin/config', label: 'Config', icon: '⚙️' },
  { href: '/admin/conexiones', label: 'Conexiones', icon: '🔌' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: 'var(--panel)', borderRight: '1px solid var(--border)',
        padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 4,
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 10,
      }}>
        <div style={{ padding: '0 8px 20px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
          <Link href="/admin" style={{ textDecoration: 'none', color: 'var(--accent)', fontSize: '1.1rem', fontWeight: 700 }}>
            &#x1f528; PIKK Bots
          </Link>
        </div>
        {NAV.map(({ href, label, icon }) => (
          <Link key={href} href={href} style={{
            textDecoration: 'none', color: 'var(--text)', padding: '8px 12px',
            borderRadius: 8, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span>{icon}</span> {label}
          </Link>
        ))}
        <div style={{ marginTop: 'auto', padding: '16px 8px 0', borderTop: '1px solid var(--border)' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'var(--muted)', fontSize: '0.8rem' }}>← Volver al sitio</Link>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: 220, padding: '32px 40px' }}>
        {children}
      </main>
    </div>
  );
}
