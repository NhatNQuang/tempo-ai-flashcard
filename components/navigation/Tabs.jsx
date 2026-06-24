import React from 'react';

/**
 * Tempo Tabs — underline tab bar (Overview / Study Spaces / Flashcards …).
 * Controlled via `value`/`onChange` or uncontrolled with `defaultValue`.
 */
export function Tabs({
  items = [],          // [{ id, label, count }]
  value,
  defaultValue,
  onChange,
  style,
  ...rest
}) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue ?? items[0]?.id);
  const active = isControlled ? value : internal;

  const select = (id) => {
    if (!isControlled) setInternal(id);
    onChange && onChange(id);
  };

  return (
    <div
      role="tablist"
      style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-6)',
        borderBottom: '1px solid var(--border)',
        ...style,
      }}
      {...rest}
    >
      {items.map((it) => {
        const on = it.id === active;
        return (
          <button
            key={it.id}
            role="tab"
            aria-selected={on}
            onClick={() => select(it.id)}
            className="tempo-tab"
            style={{
              position: 'relative',
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '0 2px 12px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-sans)', fontSize: 14,
              fontWeight: on ? 700 : 500,
              color: on ? 'var(--text-primary)' : 'var(--text-secondary)',
              transition: 'var(--t-colors)',
            }}
          >
            {it.label}
            {it.count != null && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 999,
                background: on ? 'var(--violet-500)' : 'var(--surface-3)',
                color: on ? '#fff' : 'var(--text-secondary)',
              }}>{it.count}</span>
            )}
            <span style={{
              position: 'absolute', left: 0, right: 0, bottom: -1, height: 2,
              borderRadius: 2,
              background: on ? 'var(--grad-cta)' : 'transparent',
              transition: 'background var(--dur-fast) var(--ease-standard)',
            }} />
          </button>
        );
      })}
    </div>
  );
}

if (typeof document !== 'undefined' && !document.getElementById('tempo-tab-kf')) {
  const s = document.createElement('style');
  s.id = 'tempo-tab-kf';
  s.textContent = `.tempo-tab:hover{color:var(--text-primary)}`;
  document.head.appendChild(s);
}
