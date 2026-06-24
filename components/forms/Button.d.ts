import * as React from 'react';

/**
 * Primary action button for Tempo. Violet gradient CTA plus secondary,
 * ghost, outline and danger variants.
 */
export interface ButtonProps {
  /** Visual style. @default "primary" */
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  /** Control height. @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Icon node rendered before the label. */
  iconLeft?: React.ReactNode;
  /** Icon node rendered after the label. */
  iconRight?: React.ReactNode;
  /** Stretch to fill container width. @default false */
  fullWidth?: boolean;
  disabled?: boolean;
  /** Show a spinner and block clicks. @default false */
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function Button(props: ButtonProps): JSX.Element;
