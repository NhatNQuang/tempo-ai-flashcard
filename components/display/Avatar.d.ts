import * as React from 'react';

/**
 * User avatar with initials fallback (deterministic color from name),
 * optional violet ring, online status dot, and verified check.
 */
export interface AvatarProps {
  /** Image URL; falls back to initials when absent. */
  src?: string;
  /** Full name — drives initials and fallback color. */
  name?: string;
  /** @default "md" */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Violet ring + glow (current user / selected). @default false */
  ring?: boolean;
  /** Presence dot. */
  status?: 'online' | 'offline';
  /** Show a blue verified check. @default false */
  verified?: boolean;
  style?: React.CSSProperties;
}

export function Avatar(props: AvatarProps): JSX.Element;
