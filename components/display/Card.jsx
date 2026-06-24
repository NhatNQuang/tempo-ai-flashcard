import React from 'react';

/**
 * Tempo Card — the core surface container. Default dark panel with hairline
 * border; optional hover lift and accent glow for interactive cards.
 */
export function Card({
  interactive = false,
  glow = false,
  padding = 'md',
  as = 'div',
  style,
  children,
  onClick,
  ...rest
}) {
  const pads = { none: 0, sm: 'var(--space-4)', md: 'var(--space-5)', lg: 'var(--space-6)' };
  const Tag = as;

  return (
    <Tag
      onClick={onClick}
      className={interactive ? 'tempo-card tempo-card--interactive' : 'tempo-card'}
      style={{
        position: 'relative',
        background: 'var(--surface-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--card-radius)',
        padding: pads[padding],
        boxShadow: glow ? 'var(--glow-violet-sm)' : 'var(--shadow-sm)',
        cursor: interactive ? 'pointer' : undefined,
        transition: 'var(--t-colors), transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-standard)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

if (typeof document !== 'undefined' && !document.getElementById('tempo-card-kf')) {
  const s = document.createElement('style');
  s.id = 'tempo-card-kf';
  s.textContent = `.tempo-card--interactive:hover{transform:translateY(-2px);border-color:var(--border-strong);box-shadow:var(--shadow-md)}
  .tempo-card--interactive:active{transform:translateY(0)}`;
  document.head.appendChild(s);
}
