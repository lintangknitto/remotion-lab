import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {EASE, enterStyle, textStyle, useEnter, useTheme} from '../../styles/react';

export type CounterProps = {
  to: number;
  prefix?: string;
  suffix?: string;
  label: string;
  delay?: number;
  /** Ukuran angka (px). Default 160. */
  size?: number;
  /** Warna angka & label; default dari tema. Beri color.onAccent bila di atas blok aksen. */
  color?: string;
  accentColor?: string;
  align?: 'left' | 'center';
};

const fmt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/** Angka naik deterministik (interpolate dari frame, tanpa state). */
export const Counter: React.FC<CounterProps> = ({to, prefix = '', suffix = '', label, delay = 0, size = 160, color, accentColor, align = 'left'}) => {
  const theme = useTheme();
  const frame = useCurrentFrame();
  const pNum = useEnter(0, delay);
  const pLabel = useEnter(2, delay);
  const fg = color ?? theme.color.text;
  const ac = accentColor ?? theme.color.accent;
  const labelColor = color ?? theme.color.muted;

  const dur = Math.max(30, theme.motion.enter * 4);
  const t = interpolate(frame - delay - theme.motion.stagger, [0, dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE[theme.motion.ease],
  });
  const value = Math.round(t * to);

  const parts = (v: number) => (
    <>
      {prefix && <span style={{color: ac}}>{prefix}</span>}
      <span>{fmt(v)}</span>
      {suffix && <span style={{color: ac}}>{suffix}</span>}
    </>
  );
  const numStyle: React.CSSProperties = {
    ...textStyle(theme, 'display', size, 800),
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    lineHeight: 1,
    color: fg,
  };

  return (
    <div style={{display: 'inline-flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start', gap: Math.round(size * 0.1)}}>
      <div style={{position: 'relative', ...enterStyle(pNum, 36)}}>
        {/* salinan tak terlihat: menahan lebar akhir supaya tata letak tidak bergeser saat angka naik */}
        <div style={{...numStyle, visibility: 'hidden'}}>{parts(to)}</div>
        <div style={{...numStyle, position: 'absolute', inset: 0, textAlign: align === 'center' ? 'center' : 'left'}}>{parts(value)}</div>
      </div>
      <div style={{...textStyle(theme, 'body', Math.max(22, Math.round(size * 0.24)), theme.type.strong), color: labelColor, ...enterStyle(pLabel, 18)}}>{label}</div>
    </div>
  );
};
