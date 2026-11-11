import React from 'react';

/**
 * RGB fringe. Two offset drop-shadows cost almost nothing, unlike rendering
 * the subtree three times.
 */
export const Chromatic: React.FC<{
  amount?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({amount = 3, children, style}) => (
  <div
    style={{
      filter: `drop-shadow(${amount}px 0 rgba(255,0,90,0.65)) drop-shadow(${-amount}px 0 rgba(0,200,255,0.65))`,
      ...style,
    }}
  >
    {children}
  </div>
);
