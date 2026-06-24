import * as React from 'react';

/**
 * Square icon-only button for toolbars, card overflow menus, and nav rails.
 */
export interface IconButtonProps {
  /** @default "ghost" */
  variant?: 'ghost' | 'solid' | 'accent';
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Accessible label (also the tooltip). */
  label?: string;
  /** Render in the active/selected state. @default false */
  active?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
  /** The icon node. */
  children?: React.ReactNode;
}

export function IconButton(props: IconButtonProps): JSX.Element;
