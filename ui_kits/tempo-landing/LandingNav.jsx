// Tempo landing — sticky navigation bar

function LandingNav({ onLogin, onSignup }) {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
    padding: '0 max(24px, calc((100vw - 1200px) / 2))',
    background: scrolled ? 'rgba(10,12,19,0.88)' : 'rgba(10,12,19,0.6)',
    backdropFilter: 'blur(20px) saturate(1.3)',
    borderBottom: scrolled ? '1px solid var(--border-subtle)' : '1px solid rgba(28,33,48,0.4)',
    transition: 'background 0.3s ease, border-color 0.3s ease',
  };
  const inner = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    height: 64, maxWidth: 1200, margin: '0 auto',
  };
  const linkStyle = {
    color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500,
    textDecoration: 'none', padding: '6px 14px', borderRadius: 'var(--radius-sm)',
    transition: 'var(--t-colors)', cursor: 'pointer', background: 'none', border: 'none',
    fontFamily: 'var(--font-sans)',
  };

  const links = ['Features', 'Pricing', 'FAQ', 'About'];

  return (
    <nav style={navStyle}>
      <div style={inner}>
        {/* Logo */}
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="../../assets/logo.png" alt="Tempo" style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)' }} />
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22,
            letterSpacing: 'var(--ls-tight)',
            background: 'var(--grad-brand)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>TEMPO</span>
        </a>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={linkStyle}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>{l}</a>
          ))}
        </div>

        {/* Auth buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onLogin} style={{
            ...linkStyle, color: 'var(--text-primary)', fontWeight: 600,
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--violet-300)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}>
            Log in
          </button>
          <button onClick={onSignup} style={{
            height: 38, padding: '0 20px',
            background: 'var(--grad-brand)', color: '#fff',
            border: 'none', borderRadius: 'var(--radius-pill)',
            fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 14,
            cursor: 'pointer', transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            boxShadow: 'var(--glow-violet-sm)',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = 'var(--glow-violet)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--glow-violet-sm)'; }}>
            Get Started Free
          </button>
        </div>
      </div>
    </nav>
  );
}

Object.assign(window, { LandingNav });
