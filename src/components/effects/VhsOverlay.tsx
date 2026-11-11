import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {assetSrc} from '../../lib/assets';
import {jitter} from './util';

/**
 * VHS look: scanlines + rolling tracking band + per-frame vertical jitter.
 * Both textures are single files in the library, reused by every pack.
 */
export const VhsOverlay: React.FC<{strength?: number; scanlineOpacity?: number}> = ({
  strength = 1.6,
  scanlineOpacity = 0.5,
}) => {
  const frame = useCurrentFrame();
  const shift = jitter(frame, 5) * strength;

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill
        style={{
          backgroundImage: `url(${assetSrc('texture.vhs.scanline-01')})`,
          backgroundSize: '1024px 1024px',
          mixBlendMode: 'multiply',
          opacity: scanlineOpacity,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `url(${assetSrc('texture.vhs.tracking-01')})`,
          backgroundSize: '100% 160%',
          backgroundPosition: `0% ${(frame * 2.4) % 100}%`,
          mixBlendMode: 'screen',
          opacity: 0.28,
          transform: `translateY(${shift}px)`,
        }}
      />
    </AbsoluteFill>
  );
};
