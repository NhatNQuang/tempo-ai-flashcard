import * as React from 'react';

/**
 * KPI stat tile — big number, label, trend delta, optional tinted icon.
 * The Analytics overview row is a horizontal grid of these.
 */
export interface StatTileProps {
  label: string;
  /** The headline value (string so you can format "128h 45m", "3,842"). */
  value: React.ReactNode;
  /** Trend delta text, e.g. "+18%". */
  delta?: string;
  /** @default "up" */
  trend?: 'up' | 'down' | 'flat';
  /** Caption after the delta, e.g. "vs May 5 – May 18". */
  caption?: string;
  icon?: React.ReactNode;
  /** Icon chip tint. @default "violet" */
  iconTone?: 'violet' | 'blue' | 'green' | 'amber';
  style?: React.CSSProperties;
}

export function StatTile(props: StatTileProps): JSX.Element;
