import React from 'react';
import { Avatar } from './Avatar.jsx';

/**
 * Tempo AvatarGroup — overlapping avatar stack with a "+N" overflow chip.
 */
export function AvatarGroup({
  users = [],
  size = 'sm',
  max = 4,
  style,
  ...rest
}) {
  const dims = { xs: 22, sm: 28, md: 36, lg: 44, xl: 56 };
  const d = dims[size] || dims.sm;
  const shown = users.slice(0, max);
  const extra = users.length - shown.length;
  const overlap = Math.round(d * 0.32);

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', ...style }} {...rest}>
      {shown.map((u, i) => (
        <span key={i} style={{ marginLeft: i === 0 ? 0 : -overlap, borderRadius: '50%', boxShadow: '0 0 0 2px var(--bg-base)', zIndex: shown.length - i }}>
          <Avatar src={u.src} name={u.name} size={size} />
        </span>
      ))}
      {extra > 0 && (
        <span style={{
          marginLeft: -overlap, zIndex: 0,
          width: d, height: d, borderRadius: '50%',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--surface-3)', color: 'var(--text-secondary)',
          fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: d * 0.34,
          boxShadow: '0 0 0 2px var(--bg-base)',
        }}>+{extra}</span>
      )}
    </span>
  );
}
