import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {CLAMP} from './util';

/**
 * Fast translate + directional blur, for the "whip pan" cut.
 * Direction flips with `reverse`.
 */
export const WhipPan: React.FC<{
  start?: number;
  length?: number;
  distance?: number;
  reverse?: boolean;
  children: React.ReactNode;
}> = ({start = 0, length = 8, distance = 900, reverse = false, children}) => {
  const frame = useCurrentFrame();
  const local = frame - start;
  const dir = reverse ? -1 : 1;

  const progress = interpolate(local, [0, length], [0, 1], {
    ...CLAMP,
    easing: Easing.inOut(Easing.quad),
  });

  const x = dir * interpolate(progress, [0, 0.5, 1], [-distance, 0, distance]);
  const blur = interpolate(progress, [0, 0.5, 1], [26, 0, 26], CLAMP);

  return (
    <div style={{transform: `translateX(${x}px)`, filter: `blur(${blur}px)`}}>{children}</div>
  );
};
