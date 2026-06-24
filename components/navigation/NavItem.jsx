import React from 'react';

/**
 * Tempo NavItem — a row in the workspace sidebar. Active state shows a violet
 * tint, left accent bar, and brightened label.
 */
export function NavItem({
  icon,
  label,
  active = false,
  badge,
  onClick,
  style,
  ...rest
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="tempo-navitem"
      data-active={active ? 'true' : 'false'}
      style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', gap: 12, width: '100%',
        padding: '9px 12px',
        background: active ? 'rgba(139,92,246,0.12)' : 'transparent',
        border: '1px solid', borderColor: active ? 'var(--border-violet)' : 'transparent',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer', textAlign: 'left',
        fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: active ? 600 : 500,
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        transition: 'var(--t-colors)',
        ...style,
      }}
      {...rest}
    >
      {active && <span style={{ position: 'absolute', left: -1, top: 9, bottom: 9, width: 3, borderRadius: 2, background: 'var(--grad-cta)' }} />}
      <span style={{ display: 'inline-flex', width: 18, height: 18, color: active ? 'var(--violet-300)' : 'var(--text-tertiary)', flex: '0 0 18px' }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge != null && (
        <span style={{
          fontSize: 11, fontWeight: 700, minWidth: 18, height: 18, padding: '0 5px',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 999, background: 'var(--violet-500)', color: '#fff',
        }}>{badge}</span>
      )}
    </button>
  );
}

if (typeof document !== 'undefined' && !document.getElementById('tempo-navitem-kf')) {
  const s = document.createElement('style');
  s.id = 'tempo-navitem-kf';
  s.textContent = `.tempo-navitem[data-active="false"]:hover{background:var(--surface-2);color:var(--text-primary)}
  .tempo-navitem[data-active="false"]:hover span:first-of-type{color:var(--text-secondary)}`;
  document.head.appendChild(s);
}
