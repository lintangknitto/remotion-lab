import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {CLAMP} from './util';

/** Cinematic bars that close in, or stay fixed. */
export const Letterbox: React.FC<{bar?: number; animate?: boolean; frames?: number}> = ({
  bar = 96,
  animate = false,
  frames = 30,
}) => {
  const frame = useCurrentFrame();
  const h = animate ? interpolate(frame, [0, frames], [0, bar], CLAMP) : bar;

  return (
    <>
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: h, background: '#000'}} />
      <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: h, background: '#000'}} />
    </>
  );
};
