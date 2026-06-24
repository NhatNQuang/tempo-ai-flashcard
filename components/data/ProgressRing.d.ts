import * as React from 'react';

/**
 * Circular mastery / completion ring with a centered percentage.
 * Stroke auto-colors by value (red→amber→green→violet) unless `color` is set.
 */
export interface ProgressRingProps {
  /** 0–100. */
  value?: number;
  /** Diameter in px. @default 64 */
  size?: number;
  /** Stroke width in px. @default 6 */
  thickness?: number;
  /** Explicit stroke color (overrides auto). */
  color?: string;
  trackColor?: string;
  /** Small label under the value (e.g. "Mastery"). */
  label?: string;
  /** Render the centered % value. @default true */
  showValue?: boolean;
  style?: React.CSSProperties;
}

export function ProgressRing(props: ProgressRingProps): JSX.Element;
