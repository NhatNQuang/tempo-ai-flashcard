import React from 'react';

/**
 * Tempo ProgressBar — thin horizontal progress (read %, studied %, mastery).
 */
export function ProgressBar({
  value = 0,
  height = 6,
  color = 'var(--violet-500)',
  trackColor = 'var(--surface-4)',
  gradient = true,
  rounded = true,
  style,
  ...rest
}) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <span
      style={{
        display: 'block', width: '100%', height,
        background: trackColor,
        borderRadius: rounded ? 999 : 0,
        overflow: 'hidden',
        ...style,
      }}
      {...rest}
    >
      <span style={{
        display: 'block', height: '100%', width: `${v}%`,
        background: gradient ? 'linear-gradient(90deg, var(--indigo-500), var(--violet-400))' : color,
        borderRadius: rounded ? 999 : 0,
        transition: 'width var(--dur-slower) var(--ease-out)',
      }} />
    </span>
  );
}
