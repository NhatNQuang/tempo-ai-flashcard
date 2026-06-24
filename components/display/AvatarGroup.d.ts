import * as React from 'react';

export interface AvatarUser { src?: string; name?: string; }

/**
 * Overlapping avatar stack with a "+N" overflow chip — group members,
 * session participants, contributors.
 */
export interface AvatarGroupProps {
  users: AvatarUser[];
  /** @default "sm" */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Max avatars before collapsing into +N. @default 4 */
  max?: number;
  style?: React.CSSProperties;
}

export function AvatarGroup(props: AvatarGroupProps): JSX.Element;
