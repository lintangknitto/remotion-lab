import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export const CLAMP = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

export const BG = '#05060F';
export const INK = '#F2F4FF';
export const MUTED = '#8A93B2';
export const VIOLET = '#7C5CFF';
export const CYAN = '#22D3EE';
export const CORAL = '#FF7A59';

export const sans = 'Segoe UI, Inter, system-ui, -apple-system, sans-serif';
export const mono = 'Cascadia Code, Consolas, ui-monospace, monospace';

/**
 * Ambient background: slowly drifting gradient blobs on top of a masked grid.
 * Everything is a pure function of `useCurrentFrame()` — no CSS animations,
 * no timers. That is the whole Remotion contract in one component.
 */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = (frame / durationInFrames) * Math.PI * 2;

  const blob = (
    x: number,
    y: number,
    size: number,
    color: string,
    dx: number,
    dy: number,
    opacity: number,
  ) => (
    <div
      style={{
        position: 'absolute',
        left: `${x + dx}%`,
        top: `${y + dy}%`,
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color} 0%, transparent 62%)`,
        filter: 'blur(30px)',
        opacity,
        transform: 'translate(-50%, -50%)',
      }}
    />
  );

  return (
    <AbsoluteFill style={{backgroundColor: BG}}>
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage:
            'radial-gradient(ellipse at 50% 42%, black 0%, transparent 72%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at 50% 42%, black 0%, transparent 72%)',
        }}
      />
      {blob(22, 26, 1000, 'rgba(124,92,255,0.55)', Math.sin(t) * 10, Math.cos(t) * 7, 0.9)}
      {blob(78, 72, 900, 'rgba(34,211,238,0.32)', Math.cos(t + 1.2) * 9, Math.sin(t + 1.2) * 6, 0.8)}
      {blob(60, 12, 700, 'rgba(255,122,89,0.18)', Math.sin(t + 2.4) * 6, Math.cos(t + 2.4) * 5, 0.7)}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(3,4,10,0.85) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

/** Scene wrapper: mounts a scene on the timeline and cross-fades its edges. */
export const Scene: React.FC<{
  from: number;
  to: number;
  children: React.ReactNode;
}> = ({from, to, children}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [from, from + 10, to - 10, to],
    [0, 1, 1, 0],
    CLAMP,
  );

  return (
    <Sequence
      from={from}
      durationInFrames={to - from}
      style={{opacity}}
      name={`scene-${from}-${to}`}
    >
      {children}
    </Sequence>
  );
};

/** Bottom-of-frame progress bar + tiny scene label, shared by every scene. */
export const ProgressRail: React.FC<{label: string}> = ({label}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], CLAMP);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 96,
          top: 72,
          fontFamily: mono,
          fontSize: 18,
          letterSpacing: '0.18em',
          color: MUTED,
        }}
      >
        {label}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 96,
          right: 96,
          bottom: 64,
          height: 3,
          borderRadius: 99,
          background: 'rgba(255,255,255,0.10)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${VIOLET}, ${CYAN})`,
          }}
        />
      </div>
    </>
  );
};

export const useSpringIn = (delay = 0, config = {damping: 16, stiffness: 120}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame, fps, delay, config, durationInFrames: 24});
};
