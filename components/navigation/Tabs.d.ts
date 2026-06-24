import * as React from 'react';

export interface TabItem { id: string; label: string; count?: number; }

/**
 * Underline tab bar with gradient active indicator and optional count pills.
 *
 * @startingPoint section="Navigation" subtitle="Underline tabs" viewport="700x150"
 */
export interface TabsProps {
  items: TabItem[];
  /** Controlled active id. */
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  style?: React.CSSProperties;
}

export function Tabs(props: TabsProps): JSX.Element;
