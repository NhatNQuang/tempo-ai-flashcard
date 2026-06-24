import React from 'react';

/**
 * Tempo Switch — toggle for settings and filters (e.g. "Verified only").
 */
export function Switch({
  checked,
  defaultChecked = false,
  disabled = false,
  size = 'md',
  onChange,
  label,
  style,
  ...rest
}) {
  const isControlled = checked !== undefined;
  const [on, setOn] = React.useState(defaultChecked);
  const val = isControlled ? checked : on;

  const dims = size === 'sm' ? { w: 34, h: 20, k: 14 } : { w: 42, h: 24, k: 18 };

  const toggle = () => {
    if (disabled) return;
    if (!isControlled) setOn(v => !v);
    onChange && onChange(!val);
  };

  const track = (
    <span
      role="switch"
      aria-checked={val}
      onClick={toggle}
      style={{
        position: 'relative', display: 'inline-block',
        width: dims.w, height: dims.h, flex: `0 0 ${dims.w}px`,
        borderRadius: 999,
        background: val ? 'var(--violet-500)' : 'var(--surface-4)',
        boxShadow: val ? 'var(--glow-violet-sm)' : 'var(--inner-hair)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background var(--dur-base) var(--ease-standard)',
      }}
    >
      <span style={{
        position: 'absolute', top: (dims.h - dims.k) / 2,
        left: val ? dims.w - dims.k - (dims.h - dims.k) / 2 : (dims.h - dims.k) / 2,
        width: dims.k, height: dims.k, borderRadius: '50%',
        background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
        transition: 'left var(--dur-base) var(--ease-spring)',
      }} />
    </span>
  );

  if (!label) return <span style={style} {...rest}>{track}</span>;

  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer', ...style }} {...rest}>
      {track}
      <span style={{ font: 'var(--text-body-md)', color: 'var(--text-secondary)' }}>{label}</span>
    </label>
  );
}
