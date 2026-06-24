import React from 'react';

/**
 * Tempo Chip — selectable filter pill (Explore tabs, subject filters).
 */
export function Chip({
  selected = false,
  icon,
  onClick,
  size = 'md',
  style,
  children,
  ...rest
}) {
  const sizes = { sm: { h: 28, fs: 12.5, pad: '0 12px' }, md: { h: 34, fs: 13.5, pad: '0 16px' } };
  const s = sizes[size];
  return (
    <button
      type="button"
      onClick={onClick}
      className="tempo-chip"
      data-selected={selected ? 'true' : 'false'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        height: s.h, padding: s.pad,
        borderRadius: 'var(--radius-pill)',
        fontFamily: 'var(--font-sans)', fontSize: s.fs, fontWeight: 600,
        cursor: 'pointer',
        background: selected ? 'var(--violet-500)' : 'var(--surface-2)',
        color: selected ? '#fff' : 'var(--text-secondary)',
        border: `1px solid ${selected ? 'transparent' : 'var(--border)'}`,
        boxShadow: selected ? 'var(--glow-violet-sm)' : 'none',
        transition: 'var(--t-colors), transform var(--dur-fast) var(--ease-out)',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

if (typeof document !== 'undefined' && !document.getElementById('tempo-chip-kf')) {
  const s = document.createElement('style');
  s.id = 'tempo-chip-kf';
  s.textContent = `.tempo-chip[data-selected="false"]:hover{background:var(--surface-3);color:var(--text-primary);border-color:var(--border-strong)}
  .tempo-chip:active{transform:scale(0.96)}`;
  document.head.appendChild(s);
}
