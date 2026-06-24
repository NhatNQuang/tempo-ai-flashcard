import * as React from 'react';

/**
 * Toggle switch for settings and filter rows. Controlled or uncontrolled.
 */
export interface SwitchProps {
  /** Controlled on/off. Omit for uncontrolled. */
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  /** @default "md" */
  size?: 'sm' | 'md';
  /** Optional text label rendered to the right. */
  label?: string;
  onChange?: (checked: boolean) => void;
  style?: React.CSSProperties;
}

export function Switch(props: SwitchProps): JSX.Element;
