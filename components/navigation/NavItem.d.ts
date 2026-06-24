import * as React from 'react';

/**
 * Sidebar navigation row — workspace nav (Learn, Library, Explore…).
 * Active row gets a violet tint, left accent bar and icon highlight.
 */
export interface NavItemProps {
  icon?: React.ReactNode;
  label: React.ReactNode;
  /** @default false */
  active?: boolean;
  /** Count/notification pill on the right. */
  badge?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

export function NavItem(props: NavItemProps): JSX.Element;
