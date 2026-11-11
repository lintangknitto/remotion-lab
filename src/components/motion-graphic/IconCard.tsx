import React from 'react';
import {onColor, withAlpha} from '../../styles/color';
import {enterStyle, textStyle, useEnter, useTheme} from '../../styles/react';
import {Icon, type IconName} from './icons';

export type IconCardProps = {
  icon: IconName;
  title: string;
  text?: string;
  /** Tambahan tunda (frame) sebelum kartu mulai masuk. */
  delay?: number;
  /** Warna kartu: permukaan netral, atau blok aksen datar. */
  tone?: 'surface' | 'accent' | 'accent2';
  style?: React.CSSProperties;
};

/** Kartu membulat besar: tile ikon, judul, teks. Masuk berurutan (stagger tema). */
export const IconCard: React.FC<IconCardProps> = ({icon, title, text, delay = 0, tone = 'surface', style}) => {
  const theme = useTheme();
  const {color, shape} = theme;
  const pCard = useEnter(0, delay);
  const pIcon = useEnter(1, delay);
  const pTitle = useEnter(2, delay);
  const pText = useEnter(3, delay);

  const solid = tone === 'accent' ? color.accent : tone === 'accent2' ? color.accent2 : null;
  const fg = solid ? onColor(solid) : color.text;
  const tile = solid ? fg : color.accent;
  const glyph = solid ? solid : color.onAccent;

  return (
    <div
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        background: solid ?? color.surface,
        border: solid ? 'none' : `2px solid ${color.border}`,
        borderRadius: shape.radiusLg,
        boxShadow: shape.shadow,
        padding: 32,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        ...enterStyle(pCard, 48),
        transform: `translateY(${(1 - pCard) * 48}px) scale(${0.94 + 0.06 * pCard})`,
        ...style,
      }}
    >
      <div
        style={{
          width: 92,
          height: 92,
          borderRadius: shape.radius,
          background: tile,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: Math.min(1, pIcon * 2),
          transform: `scale(${0.4 + 0.6 * pIcon}) rotate(${(1 - pIcon) * -14}deg)`,
        }}
      >
        <Icon name={icon} size={54} color={glyph} strokeWidth={1.9} />
      </div>
      <div style={{...textStyle(theme, 'display', 36), color: fg, ...enterStyle(pTitle, 20)}}>{title}</div>
      {text && <div style={{...textStyle(theme, 'body', 24), color: solid ? withAlpha(fg, 0.88) : color.muted, ...enterStyle(pText, 16)}}>{text}</div>}
    </div>
  );
};
