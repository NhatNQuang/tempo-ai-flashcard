// Tempo landing — footer

function FooterSection() {
  const colTitle = { fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: 'var(--ls-wider)', marginBottom: 16 };
  const link = { color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14, lineHeight: 2.2, display: 'block', transition: 'color 0.15s ease' };

  return (
    <footer style={{
      padding: '0 24px 40px',
      maxWidth: 1200, margin: '0 auto',
    }}>
      <div style={{
        background: 'rgba(10,12,19,0.72)',
        backdropFilter: 'blur(24px) saturate(1.2)',
        border: '1px solid rgba(38,44,59,0.5)',
        borderRadius: 'var(--radius-2xl)',
        padding: '48px 40px 32px',
      }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
        {/* Brand col */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <img src="../../assets/logo.png" alt="Tempo" style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)' }} />
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20,
              background: 'var(--grad-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>TEMPO</span>
          </div>
          <p style={{ font: 'var(--text-body-md)', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 280, margin: 0 }}>
            Transform your documents into smart flashcards and notes with AI-driven intelligence.
          </p>
          {/* Social icons */}
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            {['twitter', 'github', 'instagram', 'youtube'].map(ic => (
              <a key={ic} href="#" style={{
                width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                background: 'var(--surface-2)', color: 'var(--text-tertiary)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                textDecoration: 'none', transition: 'var(--t-colors)',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-3)'; e.currentTarget.style.color = 'var(--violet-400)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}>
                <i data-lucide={ic} style={{ width: 16, height: 16 }}></i>
              </a>
            ))}
          </div>
        </div>

        {/* Product */}
        <div>
          <p style={colTitle}>Product</p>
          {['Features', 'Pricing', 'Flashcards', 'Notes', 'AI Assistant', 'Study Groups'].map(l => (
            <a key={l} href="#" style={link}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>{l}</a>
          ))}
        </div>

        {/* Company */}
        <div>
          <p style={colTitle}>Company</p>
          {['About', 'Blog', 'Careers', 'Contact'].map(l => (
            <a key={l} href="#" style={link}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>{l}</a>
          ))}
        </div>

        {/* Legal */}
        <div>
          <p style={colTitle}>Legal</p>
          {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
            <a key={l} href="#" style={link}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>{l}</a>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid var(--border)', paddingTop: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: 0 }}>© 2026 Tempo. All rights reserved.</p>
        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: 0 }}>Made with purpose for students everywhere.</p>
      </div>
      </div>
    </footer>
  );
}

Object.assign(window, { FooterSection });
