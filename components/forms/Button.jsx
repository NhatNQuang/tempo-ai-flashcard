import React from 'react';

/**
 * Tempo Button — violet-primary CTA and its quieter siblings.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  fullWidth = false,
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  style,
  children,
  ...rest
}) {
  const heights = { sm: 32, md: 40, lg: 48 };
  const pads = { sm: '0 12px', md: '0 16px', lg: '0 22px' };
  const fontSizes = { sm: 13, md: 14, lg: 15 };

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: heights[size],
    padding: pads[size],
    width: fullWidth ? '100%' : undefined,
    fontFamily: 'var(--font-sans)',
    fontSize: fontSizes[size],
    fontWeight: 'var(--fw-semibold)',
    letterSpacing: '-0.005em',
    borderRadius: 'var(--radius-md)',
    border: '1px solid transparent',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    whiteSpace: 'nowrap',
    transition: 'var(--t-colors), transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-base) var(--ease-standard)',
    userSelect: 'none',
  };

  const variants = {
    primary: {
      background: 'var(--grad-cta)',
      color: 'var(--on-accent)',
      boxShadow: 'var(--glow-violet-sm)',
    },
    secondary: {
      background: 'var(--surface-2)',
      color: 'var(--text-primary)',
      borderColor: 'var(--border-strong)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--violet-300)',
      borderColor: 'var(--border-violet)',
    },
    danger: {
      background: 'var(--danger)',
      color: '#fff',
    },
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className="tempo-btn"
      data-variant={variant}
      style={{ ...base, ...variants[variant], ...style }}
      {...rest}
    >
      {loading && <Spinner />}
      {!loading && iconLeft}
      {children}
      {!loading && iconRight}
    </button>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      style={{
        width: 14, height: 14, borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.35)',
        borderTopColor: '#fff',
        display: 'inline-block',
        animation: 'tempo-spin 0.7s linear infinite',
      }}
    />
  );
}

if (typeof document !== 'undefined' && !document.getElementById('tempo-btn-kf')) {
  const s = document.createElement('style');
  s.id = 'tempo-btn-kf';
  s.textContent = `@keyframes tempo-spin{to{transform:rotate(360deg)}}
  .tempo-btn[data-variant="primary"]:hover:not(:disabled){filter:brightness(1.08);box-shadow:var(--glow-violet)}
  .tempo-btn[data-variant="primary"]:active:not(:disabled){transform:translateY(1px) scale(0.99)}
  .tempo-btn[data-variant="secondary"]:hover:not(:disabled){background:var(--surface-3);border-color:var(--border-strong)}
  .tempo-btn[data-variant="secondary"]:active:not(:disabled){transform:translateY(1px)}
  .tempo-btn[data-variant="ghost"]:hover:not(:disabled){background:var(--surface-2);color:var(--text-primary)}
  .tempo-btn[data-variant="outline"]:hover:not(:disabled){background:var(--violet-900);border-color:var(--violet-600)}
  .tempo-btn[data-variant="danger"]:hover:not(:disabled){filter:brightness(1.08)}
  .tempo-btn:active:not(:disabled){transform:translateY(1px)}`;
  document.head.appendChild(s);
}
