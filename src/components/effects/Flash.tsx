import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {CLAMP} from './util';

/**
 * Impact flash. Sits on top of everything, peaks for 2 frames, fades out.
 * <Flash start={30} length={10} color="#ffffff" peak={0.85} />
 */
export const Flash: React.FC<{
  start?: number;
  length?: number;
  color?: string;
  peak?: number;
  blend?: React.CSSProperties['mixBlendMode'];
}> = ({start = 0, length = 10, color = '#ffffff', peak = 0.85, blend = 'screen'}) => {
  const frame = useCurrentFrame();
  const local = frame - start;
  if (local < 0 || local > length) return null;

  const opacity = interpolate(local, [0, 2, length], [0, peak, 0], CLAMP);

  return (
    <AbsoluteFill
      style={{backgroundColor: color, opacity, mixBlendMode: blend, pointerEvents: 'none'}}
    />
  );
};
