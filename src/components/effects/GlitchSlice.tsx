import React from 'react';
import {useCurrentFrame} from 'remotion';
import {jitter} from './util';

/**
 * Horizontal slice glitch: the same subtree is drawn four times, each slice
 * clipped and offset. Deterministic — offsets come from the frame number.
 */
export const GlitchSlice: React.FC<{
  start?: number;
  duration?: number;
  strength?: number;
  rgbSplit?: boolean;
  children: React.ReactNode;
}> = ({start = 0, duration = 8, strength = 34, rgbSplit = true, children}) => {
  const frame = useCurrentFrame();
  const local = frame - start;
  const active = local >= 0 && local < duration;

  if (!active) return <div style={{position: 'relative'}}>{children}</div>;

  const split = rgbSplit
    ? 'drop-shadow(4px 0 rgba(255,0,90,0.85)) drop-shadow(-4px 0 rgba(0,220,255,0.85))'
    : undefined;

  return (
    <div style={{position: 'relative'}}>
      <div style={{opacity: 0}}>{children}</div>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            inset: 0,
            clipPath: `inset(${i * 25}% 0 ${100 - (i + 1) * 25}% 0)`,
            transform: `translateX(${jitter(frame + i, i + 1) * strength}px)`,
            filter: split,
          }}
        >
          {children}
        </div>
      ))}
    </div>
  );
};
