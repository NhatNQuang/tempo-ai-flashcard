import React from 'react';

/**
 * Tempo ProgressRing — circular mastery / completion indicator with a
 * centered value. Stroke color follows the value by default (red→amber→green→violet)
 * or can be set explicitly.
 */
function autoColor(v) {
  if (v >= 80) return 'var(--violet-400)';
  if (v >= 65) return 'var(--success)';
  if (v >= 50) return 'var(--warning)';
  return 'var(--danger)';
}

export function ProgressRing({
  value = 0,
  size = 64,
  thickness = 6,
  color,
  trackColor = 'var(--surface-4)',
  label,
  showValue = true,
  style,
  ...rest
}) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const stroke = color || autoColor(v);

  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: size, height: size, ...style }} {...rest}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={thickness} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={stroke} strokeWidth={thickness} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)}
          style={{ transition: 'stroke-dashoffset var(--dur-slower) var(--ease-out)' }}
        />
      </svg>
      {showValue && (
        <span style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 0,
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: size * 0.28, color: 'var(--text-primary)', lineHeight: 1 }}>
            {Math.round(v)}<span style={{ fontSize: size * 0.16 }}>%</span>
          </span>
          {label && <span style={{ fontSize: size * 0.13, color: 'var(--text-tertiary)', marginTop: 2 }}>{label}</span>}
        </span>
      )}
    </span>
  );
}
