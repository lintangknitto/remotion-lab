import React from 'react';
import {AbsoluteFill} from 'remotion';
import {assetSrc} from '../../lib/assets';

/** Soft edge darkening. Uses the shared vignette texture instead of a gradient. */
export const Vignette: React.FC<{opacity?: number}> = ({opacity = 0.75}) => (
  <AbsoluteFill
    style={{
      backgroundImage: `url(${assetSrc('texture.vignette.soft-01')})`,
      backgroundSize: 'cover',
      opacity,
      mixBlendMode: 'multiply',
      pointerEvents: 'none',
    }}
  />
);
