import React from 'react';

/**
 * Tempo Avatar — user image with initials fallback, optional ring & verified badge.
 */
const SIZES = { xs: 22, sm: 28, md: 36, lg: 44, xl: 56 };

function hashHue(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
  return h;
}

export function Avatar({
  src,
  name = '',
  size = 'md',
  ring = false,
  status,            // 'online' | 'offline' | undefined
  verified = false,
  style,
  ...rest
}) {
  const d = SIZES[size] || SIZES.md;
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  const hue = hashHue(name);

  return (
    <span style={{ position: 'relative', display: 'inline-flex', flex: `0 0 ${d}px`, ...style }} {...rest}>
      <span
        style={{
          width: d, height: d, borderRadius: '50%', overflow: 'hidden',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: src ? 'var(--surface-3)' : `linear-gradient(135deg, hsl(${hue} 60% 42%), hsl(${(hue + 40) % 360} 60% 30%))`,
          color: '#fff', fontFamily: 'var(--font-sans)', fontWeight: 700,
          fontSize: d * 0.4, letterSpacing: '-0.02em',
          border: ring ? '2px solid var(--violet-500)' : '1px solid rgba(255,255,255,0.08)',
          boxShadow: ring ? 'var(--glow-violet-sm)' : 'none',
        }}
      >
        {src ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
      </span>
      {status && (
        <span style={{
          position: 'absolute', right: -1, bottom: -1,
          width: Math.max(8, d * 0.28), height: Math.max(8, d * 0.28), borderRadius: '50%',
          background: status === 'online' ? 'var(--success)' : 'var(--text-tertiary)',
          border: '2px solid var(--bg-base)',
        }} />
      )}
      {verified && (
        <span style={{
          position: 'absolute', right: -3, top: -3,
          width: Math.max(12, d * 0.36), height: Math.max(12, d * 0.36), borderRadius: '50%',
          background: 'var(--info)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid var(--bg-base)', fontSize: d * 0.2, fontWeight: 900,
        }}>✓</span>
      )}
    </span>
  );
}
