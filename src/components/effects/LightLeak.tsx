import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {assetSrc} from '../../lib/assets';
import {CLAMP} from './util';

/**
 * Light leak wipe. `warm` and `cool` are the same generated asset family and
 * live in the library, so a pack only stores their ids.
 */
export const LightLeak: React.FC<{
  start?: number;
  length?: number;
  warm?: boolean;
  peak?: number;
}> = ({start = 0, length = 24, warm = true, peak = 0.8}) => {
  const frame = useCurrentFrame();
  const local = frame - start;
  if (local < 0 || local > length * 2) return null;

  const opacity = interpolate(
    local,
    [0, length * 0.4, length * 1.4, length * 2],
    [0, peak, peak * 0.7, 0],
    CLAMP,
  );
  const slide = interpolate(local, [0, length * 2], [-6, 4], CLAMP);

  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${assetSrc(warm ? 'image.lightleak.warm-01' : 'image.lightleak.cool-01')})`,
        backgroundSize: 'cover',
        mixBlendMode: 'screen',
        opacity,
        transform: `translateX(${slide}%)`,
        pointerEvents: 'none',
      }}
    />
  );
};
