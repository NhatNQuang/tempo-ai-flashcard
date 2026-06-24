import React from 'react';

/**
 * Tempo Input — text field with optional leading icon and search styling.
 */
export function Input({
  size = 'md',
  iconLeft,
  iconRight,
  invalid = false,
  disabled = false,
  fullWidth = true,
  type = 'text',
  value,
  defaultValue,
  placeholder,
  onChange,
  style,
  ...rest
}) {
  const heights = { sm: 34, md: 40, lg: 46 };
  const h = heights[size];
  const [focus, setFocus] = React.useState(false);

  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        height: h, width: fullWidth ? '100%' : undefined,
        padding: '0 12px',
        background: 'var(--surface-2)',
        border: `1px solid ${invalid ? 'var(--danger)' : focus ? 'var(--violet-500)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: focus ? 'var(--glow-focus)' : 'none',
        opacity: disabled ? 0.5 : 1,
        transition: 'var(--t-colors), box-shadow var(--dur-fast) var(--ease-standard)',
        ...style,
      }}
    >
      {iconLeft && <span style={{ display: 'flex', color: 'var(--text-tertiary)', flex: '0 0 auto' }}>{iconLeft}</span>}
      <input
        type={type}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        onChange={onChange}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          flex: 1, minWidth: 0, height: '100%',
          background: 'transparent', border: 'none', outline: 'none',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-sans)', fontSize: 14,
        }}
        {...rest}
      />
      {iconRight && <span style={{ display: 'flex', color: 'var(--text-tertiary)', flex: '0 0 auto' }}>{iconRight}</span>}
    </div>
  );
}

if (typeof document !== 'undefined' && !document.getElementById('tempo-input-ph')) {
  const s = document.createElement('style');
  s.id = 'tempo-input-ph';
  s.textContent = `.tempo-input-ph input::placeholder{color:var(--text-tertiary)}`;
  document.head.appendChild(s);
}
