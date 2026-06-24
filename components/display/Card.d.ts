import * as React from 'react';

/**
 * Core surface container — dark panel, hairline border, optional hover lift.
 * Wraps stats, study spaces, notes, groups, sidebar widgets.
 */
export interface CardProps {
  /** Enable hover-lift + pointer cursor (clickable cards). @default false */
  interactive?: boolean;
  /** Add a violet glow (featured / selected). @default false */
  glow?: boolean;
  /** Inner padding. @default "md" */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Element/tag to render. @default "div" */
  as?: keyof JSX.IntrinsicElements;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function Card(props: CardProps): JSX.Element;
