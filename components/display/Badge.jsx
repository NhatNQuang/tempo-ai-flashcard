import React from 'react';

/**
 * Tempo Badge — compact status / level pill. Used for note levels
 * (DETAILED / NORMAL / BASIC), visibility (PUBLIC / PRIVATE / SHARED),
 * counts, and "Pro" markers.
 */
const TONES = {
  violet:  { fg: 'var(--violet-300)',  bg: 'rgba(139,92,246,0.16)', bd: 'rgba(139,92,246,0.35)', solid: 'var(--violet-500)' },
  blue:    { fg: 'var(--info-text)',   bg: 'var(--info-soft)',      bd: 'rgba(91,157,248,0.35)', solid: 'var(--info)' },
  green:   { fg: 'var(--success-text)',bg: 'var(--success-soft)',   bd: 'rgba(63,209,128,0.35)', solid: 'var(--success)' },
  amber:   { fg: 'var(--warning-text)',bg: 'var(--warning-soft)',   bd: 'rgba(246,178,60,0.35)', solid: 'var(--warning)' },
  red:     { fg: 'var(--danger-text)', bg: 'var(--danger-soft)',    bd: 'rgba(240,88,79,0.35)',  solid: 'var(--danger)' },
  neutral: { fg: 'var(--text-secondary)', bg: 'var(--surface-3)',   bd: 'var(--border)',         solid: 'var(--surface-4)' },
};

export function Badge({
  tone = 'neutral',
  variant = 'soft',
  size = 'md',
  uppercase = false,
  dot = false,
  icon,
  style,
  children,
  ...rest
}) {
  const t = TONES[tone] || TONES.neutral;
  const sizes = {
    sm: { fs: 10.5, pad: '2px 7px', h: 18, ls: '0.04em' },
    md: { fs: 11,   pad: '3px 9px', h: 22, ls: '0.03em' },
    lg: { fs: 12,   pad: '4px 11px', h: 26, ls: '0.02em' },
  };
  const s = sizes[size];

  const skin = variant === 'solid'
    ? { background: t.solid, color: '#fff', border: '1px solid transparent' }
    : variant === 'outline'
    ? { background: 'transparent', color: t.fg, border: `1px solid ${t.bd}` }
    : { background: t.bg, color: t.fg, border: `1px solid ${t.bd}` };

  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        height: s.h, padding: s.pad,
        font: 'var(--text-caption)',
        fontSize: s.fs, fontWeight: 'var(--fw-bold)',
        letterSpacing: uppercase ? '0.06em' : s.ls,
        textTransform: uppercase ? 'uppercase' : 'none',
        borderRadius: 'var(--radius-xs)',
        whiteSpace: 'nowrap', lineHeight: 1,
        ...skin, ...style,
      }}
      {...rest}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', flex: '0 0 6px' }} />}
      {icon}
      {children}
    </span>
  );
}
