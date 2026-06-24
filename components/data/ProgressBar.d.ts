import * as React from 'react';

/**
 * Thin horizontal progress bar — read %, studied %, mastery. Violet gradient fill.
 */
export interface ProgressBarProps {
  /** 0–100. */
  value?: number;
  /** Bar thickness in px. @default 6 */
  height?: number;
  /** Solid fill color when `gradient` is false. */
  color?: string;
  trackColor?: string;
  /** Use the indigo→violet gradient fill. @default true */
  gradient?: boolean;
  /** Pill-rounded ends. @default true */
  rounded?: boolean;
  style?: React.CSSProperties;
}

export function ProgressBar(props: ProgressBarProps): JSX.Element;
