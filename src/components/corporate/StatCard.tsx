import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {withAlpha} from './../../styles/color';
import {EASE, enterStyle, textStyle, useEnter, useTheme} from './../../styles/react';
import {formatId} from './util';

export type StatCardProps = {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  delay?: number;
  /** Ukuran angka (px). Default 92. */
  size?: number;
  style?: React.CSSProperties;
};

/** Angka besar count-up deterministik (interpolate dari frame), garis tipis di atas, label muted. */
export const StatCard: React.FC<StatCardProps> = ({value, label, prefix, suffix, delay = 0, size = 92, style}) => {
  const theme = useTheme();
  const {color, shape} = theme;
  const frame = useCurrentFrame();
  const pLine = useEnter(0, delay);
  const pNum = useEnter(1, delay);
  const pLabel = useEnter(3, delay);

  const start = delay + theme.motion.stagger;
  // out-expo hanya mencapai 0.999 di ujung; skala 1.001 + clamp supaya angka akhir tepat.
  const raw = interpolate(frame, [start, start + 42], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE[theme.motion.ease],
  });
  const t = Math.min(1, raw * 1.001);
  const accentStyle = {...textStyle(theme, 'display', size * 0.62), color: color.accent};

  return (
    <div style={{minWidth: 0, ...style}}>
      <div
        style={{
          height: Math.max(1, shape.stroke),
          background: withAlpha(color.text, 0.34),
          transform: `scaleX(${pLine})`,
          transformOrigin: 'left center',
          marginBottom: 22,
        }}
      />
      <div style={{display: 'flex', alignItems: 'baseline', gap: 4, whiteSpace: 'nowrap', color: color.text, ...enterStyle(pNum, 22)}}>
        {prefix ? <span style={accentStyle}>{prefix}</span> : null}
        <span style={{...textStyle(theme, 'display', size), fontVariantNumeric: 'tabular-nums', lineHeight: 1}}>{formatId(value * t)}</span>
        {suffix ? <span style={accentStyle}>{suffix}</span> : null}
      </div>
      <div style={{...textStyle(theme, 'body', 26), color: color.muted, marginTop: 14, ...enterStyle(pLabel, 14)}}>{label}</div>
    </div>
  );
};


