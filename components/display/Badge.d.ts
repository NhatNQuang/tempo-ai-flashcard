import * as React from 'react';

/**
 * Compact status / level pill: note levels (DETAILED/NORMAL/BASIC),
 * visibility (PUBLIC/PRIVATE/SHARED/STUDYING), counts, "Pro" markers.
 */
export interface BadgeProps {
  /** Color family. @default "neutral" */
  tone?: 'violet' | 'blue' | 'green' | 'amber' | 'red' | 'neutral';
  /** Fill style. @default "soft" */
  variant?: 'soft' | 'solid' | 'outline';
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Force UPPERCASE + wide tracking (level/visibility tags). @default false */
  uppercase?: boolean;
  /** Show a leading status dot. @default false */
  dot?: boolean;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function Badge(props: BadgeProps): JSX.Element;
