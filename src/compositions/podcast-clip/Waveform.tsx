import React from 'react';
import {useCurrentFrame} from 'remotion';

/**
 * Scrolling waveform from a precomputed RMS envelope (one value per frame).
 *
 * We deliberately do not run an FFT here: decoding the TTS wav inside headless
 * Chrome returns a correct duration but ~1e-7 amplitude, so an in-browser
 * spectrum collapses to a flat line. The envelope is computed from the same
 * file by scripts/assets/make_waveform.py, which is deterministic and makes
 * rendering cheaper too.
 */
export const Waveform: React.FC<{
  peaks: number[];
  height: number;
  bars?: number;
  color?: string;
  gap?: number;
  radius?: number;
  /** 0..1, where the current frame sits inside the window. */
  playhead?: number;
}> = ({peaks, height, bars = 64, color = '#F4F6FF', gap = 6, radius = 5, playhead = 0.72}) => {
  const frame = useCurrentFrame();
  const start = frame - Math.floor(bars * playhead);

  return (
    <div
      style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap,
        width: '100%',
      }}
    >
      {new Array(bars).fill(true).map((_, i) => {
        const value = peaks[start + i] ?? 0;
        const amp = Math.min(1, value ** 0.8);
        const h = Math.max(5, Math.round(amp * height));
        const isPlayhead = i === Math.floor(bars * playhead);

        return (
          <div
            key={i}
            style={{
              flex: 1,
              maxWidth: 9,
              height: h,
              borderRadius: radius,
              backgroundColor: isPlayhead ? '#22D3EE' : color,
              opacity: isPlayhead ? 1 : 0.42 + amp * 0.58,
            }}
          />
        );
      })}
    </div>
  );
};
