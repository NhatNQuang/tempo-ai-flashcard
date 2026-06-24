import React from 'react';

/**
 * Tempo IconButton — square icon-only control for toolbars, card menus, nav.
 */
export function IconButton({
  variant = 'ghost',
  size = 'md',
  label,
  active = false,
  disabled = false,
  onClick,
  style,
  children,
  ...rest
}) {
  const dims = { sm: 30, md: 36, lg: 42 };
  const d = dims[size];

  const variants = {
    ghost: {
      background: active ? 'var(--surface-3)' : 'transparent',
      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
      border: '1px solid transparent',
    },
    solid: {
      background: 'var(--surface-2)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border)',
    },
    accent: {
      background: 'var(--violet-900)',
      color: 'var(--violet-300)',
      border: '1px solid var(--border-violet)',
    },
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="tempo-iconbtn"
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: d, height: d, flex: `0 0 ${d}px`,
        borderRadius: 'var(--radius-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'var(--t-colors), transform var(--dur-fast) var(--ease-out)',
        ...variants[variant], ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

if (typeof document !== 'undefined' && !document.getElementById('tempo-iconbtn-kf')) {
  const s = document.createElement('style');
  s.id = 'tempo-iconbtn-kf';
  s.textContent = `.tempo-iconbtn:hover:not(:disabled){background:var(--surface-3);color:var(--text-primary)}
  .tempo-iconbtn:active:not(:disabled){transform:scale(0.92)}`;
  document.head.appendChild(s);
}
