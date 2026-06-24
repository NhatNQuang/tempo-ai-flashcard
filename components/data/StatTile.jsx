import React from 'react';

/**
 * Tempo StatTile — big KPI number with label, trend delta and optional icon.
 * The Analytics overview row is a grid of these.
 */
export function StatTile({
  label,
  value,
  delta,                 // e.g. "+18%"
  trend = 'up',          // 'up' | 'down' | 'flat'
  caption,               // e.g. "vs May 5 – May 18"
  icon,
  iconTone = 'violet',
  style,
  ...rest
}) {
  const tones = {
    violet: { bg: 'rgba(139,92,246,0.14)', fg: 'var(--violet-300)' },
    blue:   { bg: 'var(--info-soft)',      fg: 'var(--info-text)' },
    green:  { bg: 'var(--success-soft)',   fg: 'var(--success-text)' },
    amber:  { bg: 'var(--warning-soft)',   fg: 'var(--warning-text)' },
  };
  const it = tones[iconTone] || tones.violet;
  const trendColor = trend === 'down' ? 'var(--danger-text)' : trend === 'flat' ? 'var(--text-tertiary)' : 'var(--success-text)';
  const arrow = trend === 'down' ? '▾' : trend === 'flat' ? '–' : '▴';

  return (
    <div
      style={{
        background: 'var(--surface-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)',
        display: 'flex', flexDirection: 'column', gap: 10, ...style,
      }}
      {...rest}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <span style={{ font: 'var(--text-body-sm)', color: 'var(--text-secondary)' }}>{label}</span>
        {icon && (
          <span style={{
            width: 34, height: 34, borderRadius: 'var(--radius-md)',
            background: it.bg, color: it.fg,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 34px',
          }}>{icon}</span>
        )}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1 }}>
        {value}
      </div>
      {(delta || caption) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          {delta && <span style={{ color: trendColor, fontWeight: 700 }}>{arrow} {delta}</span>}
          {caption && <span style={{ color: 'var(--text-tertiary)' }}>{caption}</span>}
        </div>
      )}
    </div>
  );
}
