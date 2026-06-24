// Tempo UI kit - workspace sidebar (collapsible)
function Sidebar({ active, onNavigate }) {
  const { NavItem } = window.TempoDesignSystem_e112f2;
  const [collapsed, setCollapsed] = React.useState(false);
  const [langToken, setLangToken] = React.useState(0);
  const W = collapsed ? 76 : 240;

  React.useEffect(() => {
    const handleLangChange = () => setLangToken(t => t + 1);
    window.addEventListener('languagechange', handleLangChange);
    return () => window.removeEventListener('languagechange', handleLangChange);
  }, []);

  const t = window.t;

  const Toggle = (
    <button
      type="button"
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      onClick={() => setCollapsed(c => !c)}
      className="tempo-sidebar-toggle"
      style={{
        width: 28, height: 28, flex: '0 0 28px',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent', border: '1px solid var(--border)',
        borderRadius: 8, color: 'var(--text-tertiary)', cursor: 'pointer',
        transition: 'var(--t-colors)',
      }}
    >
      <Icon name={collapsed ? 'chevrons-right' : 'chevrons-left'} size={14} />
    </button>
  );

  const sectionLabel = (lbl) => collapsed ? null : (
    <div style={{ font: 'var(--text-eyebrow)', textTransform: 'uppercase', letterSpacing: 'var(--ls-wider)', color: 'var(--text-tertiary)', padding: '0 12px', margin: '18px 0 8px' }}>{lbl}</div>
  );

  const navRow = (n) => {
    const translatedLabel = t(n.id) || n.label;
    return collapsed ? (
      <button
        key={n.id}
        title={translatedLabel}
        onClick={() => onNavigate(n.id)}
        style={{
          position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 44, height: 40, margin: '0 auto',
          background: active === n.id ? 'rgba(139,92,246,0.14)' : 'transparent',
          border: '1px solid', borderColor: active === n.id ? 'var(--border-violet)' : 'transparent',
          borderRadius: 'var(--radius-md)', cursor: 'pointer',
          color: active === n.id ? 'var(--violet-300)' : 'var(--text-tertiary)',
          transition: 'var(--t-colors)',
        }}
      >
        {active === n.id && <span style={{ position: 'absolute', left: -1, top: 8, bottom: 8, width: 3, borderRadius: 2, background: 'var(--grad-cta)' }} />}
        <Icon name={n.icon} size={18} />
      </button>
    ) : (
      <NavItem key={n.id} icon={<Icon name={n.icon} />} label={translatedLabel} active={active === n.id} onClick={() => onNavigate(n.id)} />
    );
  };

  return (
    <aside style={{
      width: W, flex: `0 0 ${W}px`, height: '100%',
      background: 'var(--bg-sunken)', borderRight: '1px solid var(--border-subtle)',
      display: 'flex', flexDirection: 'column',
      padding: collapsed ? '18px 12px' : '20px 14px',
      overflow: 'hidden',
      transition: 'width var(--dur-base) var(--ease-standard), padding var(--dur-base) var(--ease-standard)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: collapsed ? 6 : 10, padding: '0 2px 6px', minWidth: 0 }}>
        <img src="../../assets/logo.png" alt="" style={{ width: 30, height: 30, borderRadius: 8, flex: '0 0 auto' }} />
        {!collapsed && (
          <span className="tempo-wordmark" style={{ fontSize: 22, flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden' }}>Tempo</span>
        )}
        {Toggle}
      </div>

      {sectionLabel(t('workspace'))}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: collapsed ? 8 : 0 }}>
        {window.NAV_MAIN.map(navRow)}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8, borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
        {navRow({ id: 'settings', icon: 'settings', label: 'Settings' })}
        {navRow({ id: 'support', icon: 'life-buoy', label: 'Help & Support' })}
      </div>
    </aside>
  );
}

if (typeof document !== 'undefined' && !document.getElementById('tempo-sidebar-toggle-css')) {
  const s = document.createElement('style');
  s.id = 'tempo-sidebar-toggle-css';
  s.textContent = `.tempo-sidebar-toggle:hover { background: var(--surface-2); color: var(--text-primary); border-color: var(--border-strong); }`;
  document.head.appendChild(s);
}

Object.assign(window, { Sidebar });
