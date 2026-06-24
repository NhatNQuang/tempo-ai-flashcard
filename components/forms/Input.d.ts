import * as React from 'react';

/**
 * Text input field. Supports leading/trailing icons (used for the global
 * search bar) and validation state.
 */
export interface InputProps {
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  /** Red border / error state. @default false */
  invalid?: boolean;
  disabled?: boolean;
  /** @default true */
  fullWidth?: boolean;
  type?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  style?: React.CSSProperties;
}

export function Input(props: InputProps): JSX.Element;
