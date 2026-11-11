import React from 'react';
import {useCurrentFrame} from 'remotion';
import {jitter} from './util';

/**
 * Camera shake with exponential decay. Wraps children in a translated div.
 * <Shake start={12} intensity={26} decay={9}>...</Shake>
 */
export const Shake: React.FC<{
  start?: number;
  intensity?: number;
  decay?: number;
  rotate?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({start = 0, intensity = 24, decay = 9, rotate = 0.6, children, style}) => {
  const frame = useCurrentFrame();
  const local = frame - start;
  const amp = local < 0 ? 0 : intensity * Math.exp(-local / decay);

  const x = amp * jitter(frame, 1);
  const y = amp * jitter(frame, 2) * 0.7;
  const r = rotate * Math.exp(-local / decay) * jitter(frame, 3);

  return (
    <div
      style={{
        transform: `translate(${x}px, ${y}px) rotate(${r}deg)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
