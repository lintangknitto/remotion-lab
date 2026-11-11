import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {assetSrc} from '../../lib/assets';

/**
 * Animated film grain. One texture, shifted per frame so it reads as moving
 * grain instead of a static pattern.
 */
export const FilmGrain: React.FC<{
  opacity?: number;
  size?: number;
  animate?: boolean;
  blend?: React.CSSProperties['mixBlendMode'];
}> = ({opacity = 0.32, size = 512, animate = true, blend = 'overlay'}) => {
  const frame = useCurrentFrame();
  const x = animate ? (frame * 13) % size : 0;
  const y = animate ? (frame * 29) % size : 0;

  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${assetSrc('texture.noise.film-4k')})`,
        backgroundSize: `${size}px ${size}px`,
        backgroundPosition: `${x}px ${y}px`,
        opacity,
        mixBlendMode: blend,
        pointerEvents: 'none',
      }}
    />
  );
};
