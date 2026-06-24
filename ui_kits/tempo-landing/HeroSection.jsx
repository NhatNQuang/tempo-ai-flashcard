// Tempo landing — hero section with DotField interactive background

function HeroSection({ onSignup }) {
  return (
    <section style={{
      position: 'relative', overflow: 'hidden',
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '120px 24px 80px',
    }}>
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 820 }}>
        {/* Headline */}
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1.06,
          letterSpacing: '-0.025em',
          color: 'var(--text-primary)',
          margin: '0 0 24px',
          textWrap: 'balance',
        }}>
          Transform your docs into{' '}
          <span style={{ background: 'var(--grad-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            smart flashcards
          </span>
          {' '}& notes
        </h1>

        {/* Subtitle */}
        <p style={{
          font: 'var(--text-body-lg)', color: 'var(--text-secondary)',
          maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.6, fontSize: 18,
          textWrap: 'pretty',
        }}>
          Upload any document and let Tempo's AI assistant instantly generate study materials.
          Review, learn, and ace your exams — all in one workspace.
        </p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          <button onClick={onSignup} style={{
            height: 52, padding: '0 32px',
            background: 'var(--grad-brand)', color: '#fff',
            border: 'none', borderRadius: 'var(--radius-pill)',
            fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 16,
            cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            boxShadow: '0 8px 32px -8px rgba(139,92,246,0.55)',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow = '0 12px 40px -8px rgba(139,92,246,0.65)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px -8px rgba(139,92,246,0.55)'; }}>
            Start for free
            <i data-lucide="arrow-right" style={{ width: 18, height: 18 }}></i>
          </button>
          <a href="#features" style={{
            height: 52, padding: '0 28px',
            background: 'transparent', color: 'var(--text-primary)',
            border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-pill)',
            fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 16,
            cursor: 'pointer', transition: 'var(--t-colors), transform 0.15s ease',
            display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--violet-500)'; e.currentTarget.style.color = 'var(--violet-300)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}>
            See how it works
          </a>
        </div>

        {/* Social proof */}
        <div style={{ marginTop: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, flexWrap: 'wrap' }}>
          <StatPill icon="users" value="12,000+" label="students" />
          <div style={{ width: 1, height: 28, background: 'var(--border)' }} />
          <StatPill icon="layers" value="2M+" label="flashcards created" />
          <div style={{ width: 1, height: 28, background: 'var(--border)' }} />
          <StatPill icon="star" value="4.9" label="avg rating" />
        </div>
      </div>
    </section>
  );
}

function StatPill({ icon, value, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <i data-lucide={icon} style={{ width: 16, height: 16, color: 'var(--violet-400)' }}></i>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{value}</span>
      <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{label}</span>
    </div>
  );
}

Object.assign(window, { HeroSection });
