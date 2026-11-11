import React from 'react';
import {withAlpha} from './../../styles/color';
import {enterStyle, textStyle, useEnter, useTheme} from './../../styles/react';

export type LowerThirdProps = {
  name: string;
  title: string;
  /** Tunda animasi masuk (frame). */
  delay?: number;
  /** Override posisi/ukuran. Default: menempel di kiri-bawah. */
  style?: React.CSSProperties;
};

/**
 * Bilah nama kiri-bawah: garis aksen + garis tipis tumbuh dulu, lalu nama
 * (serif display tema) dan jabatan muncul berurutan.
 */
export const LowerThird: React.FC<LowerThirdProps> = ({name, title, delay = 0, style}) => {
  const theme = useTheme();
  const {color, shape} = theme;
  const line = useEnter(0, delay);
  const pName = useEnter(2, delay);
  const pTitle = useEnter(3, delay);

  return (
    <div style={{position: 'absolute', left: 96, bottom: 96, maxWidth: 760, ...style}}>
      <div style={{position: 'relative', height: Math.max(3, shape.stroke * 3), marginBottom: 26}}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 560,
            background: withAlpha(color.text, 0.32),
            transform: `scaleX(${line})`,
            transformOrigin: 'left center',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 96,
            background: color.accent,
            transform: `scaleX(${line})`,
            transformOrigin: 'left center',
          }}
        />
      </div>
      <div style={{...textStyle(theme, 'display', 54), color: color.text, ...enterStyle(pName, 20)}}>{name}</div>
      <div style={{...textStyle(theme, 'body', 27), color: color.muted, marginTop: 8, ...enterStyle(pTitle, 16)}}>{title}</div>
    </div>
  );
};
