import React from 'react';
import {Img, staticFile} from 'remotion';
import {enterStyle, textStyle, useEnter, useTheme} from './../../styles/react';

export type LogoItem = {name: string; src?: string};
export type LogoBoardProps = {
  items: LogoItem[];
  delay?: number;
  style?: React.CSSProperties;
};

const Tile: React.FC<{item: LogoItem; index: number; delay: number}> = ({item, index, delay}) => {
  const theme = useTheme();
  const {color, shape, mode} = theme;
  const p = useEnter(index, delay);
  // Logo klien berwarna-warni: selalu di atas pelat terang (mode gelap memakai warna teks tema).
  const plate = mode === 'dark' ? color.text : color.surface;
  const ink = mode === 'dark' ? color.bg : color.text;
  return (
    <div
      style={{
        background: plate,
        border: `${Math.max(1, shape.stroke)}px solid ${color.border}`,
        borderRadius: shape.radius,
        minHeight: 168,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '28px 36px',
        overflow: 'hidden',
        ...enterStyle(p, 18),
      }}
    >
      {item.src ? (
        <Img src={staticFile(item.src)} style={{maxWidth: '100%', maxHeight: 96, objectFit: 'contain'}} />
      ) : (
        <div style={{...textStyle(theme, 'display', 38), color: ink, textAlign: 'center'}}>{item.name}</div>
      )}
    </div>
  );
};

/** Grid tile logo. Tanpa `src` ditampilkan wordmark teks (display tema). */
export const LogoBoard: React.FC<LogoBoardProps> = ({items, delay = 0, style}) => {
  const n = items.length;
  const cols = n <= 3 ? Math.max(1, n) : n <= 6 ? 3 : 4;
  return (
    <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 24, ...style}}>
      {items.map((item, i) => (
        <Tile key={`${item.name}-${i}`} item={item} index={i} delay={delay} />
      ))}
    </div>
  );
};
