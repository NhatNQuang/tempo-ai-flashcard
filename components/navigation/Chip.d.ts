import * as React from 'react';

/**
 * Selectable filter pill — Explore category tabs, subject filters.
 */
export interface ChipProps {
  /** @default false */
  selected?: boolean;
  icon?: React.ReactNode;
  /** @default "md" */
  size?: 'sm' | 'md';
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function Chip(props: ChipProps): JSX.Element;
