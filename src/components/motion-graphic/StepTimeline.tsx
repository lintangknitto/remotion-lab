import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {onColor} from '../../styles/color';
import {EASE, enterStyle, textStyle, useEnter, useTheme} from '../../styles/react';

export type StepTimelineProps = {
  steps: {title: string; text?: string}[];
  /** Tambahan tunda (frame) sebelum langkah pertama. */
  delay?: number;
};

const NODE = 96;
const LINE = 8;

const Step: React.FC<{index: number; count: number; title: string; text?: string; gap: number; delay: number}> = ({index, count, title, text, gap, delay}) => {
  const theme = useTheme();
  const frame = useCurrentFrame();
  const {color} = theme;
  const start = delay + index * gap;
  const pNode = useEnter(0, start);
  const pTitle = useEnter(2, start);
  const pText = useEnter(3, start);
  // garis ke langkah berikutnya menggambar diri setelah node muncul
  const draw = interpolate(frame - start - theme.motion.stagger * 2, [0, gap + 6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE[theme.motion.ease],
  });
  const tone = index % 2 === 0 ? color.accent : color.accent2;

  return (
    <div style={{flex: 1, minWidth: 0, position: 'relative'}}>
      <div style={{position: 'relative', height: NODE}}>
        {index < count - 1 && (
          <div style={{position: 'absolute', left: NODE - 4, right: -4, top: (NODE - LINE) / 2, height: LINE, background: color.border, borderRadius: LINE}}>
            <div style={{width: '100%', height: '100%', background: color.text, borderRadius: LINE, transformOrigin: 'left center', transform: `scaleX(${draw})`}} />
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: NODE,
            height: NODE,
            borderRadius: '50%',
            background: tone,
            color: onColor(tone),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: theme.shape.shadow,
            ...textStyle(theme, 'display', 46),
            opacity: Math.min(1, pNode * 2),
            transform: `scale(${0.3 + 0.7 * pNode})`,
          }}
        >
          {index + 1}
        </div>
      </div>
      <div style={{...textStyle(theme, 'display', 38), color: color.text, marginTop: 24, paddingRight: 24, ...enterStyle(pTitle, 22)}}>{title}</div>
      {text && <div style={{...textStyle(theme, 'body', 26), color: color.muted, marginTop: 10, paddingRight: 24, ...enterStyle(pText, 16)}}>{text}</div>}
    </div>
  );
};

/** Node bernomor + garis penghubung yang menggambar diri, muncul berurutan. */
export const StepTimeline: React.FC<StepTimelineProps> = ({steps, delay = 0}) => {
  const theme = useTheme();
  const gap = theme.motion.stagger * 5;
  return (
    <div style={{display: 'flex', width: '100%', alignItems: 'flex-start'}}>
      {steps.map((s, i) => (
        <Step key={s.title} index={i} count={steps.length} title={s.title} text={s.text} gap={gap} delay={delay} />
      ))}
    </div>
  );
};
