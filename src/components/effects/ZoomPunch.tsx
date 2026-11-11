import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {CLAMP} from './util';

/**
 * Snap-zoom that settles back to 1. Cheaper than a spring and easier to time.
 * <ZoomPunch start={40} amount={0.18} length={14}>...</ZoomPunch>
 */
export const ZoomPunch: React.FC<{
  start?: number;
  amount?: number;
  length?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({start = 0, amount = 0.16, length = 14, children, style}) => {
  const frame = useCurrentFrame();
  const local = frame - start;
  const scale =
    local < 0 || local > length
      ? 1
      : interpolate(local, [0, length], [1 + amount, 1], {
          ...CLAMP,
          easing: Easing.out(Easing.cubic),
        });

  return <div style={{transform: `scale(${scale})`, ...style}}>{children}</div>;
};
