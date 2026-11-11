import React from 'react';
import {withAlpha} from './../../styles/color';
import {enterStyle, textStyle, useEnter, useTheme} from './../../styles/react';

export type QuoteCardProps = {
  quote: string;
  name: string;
  role: string;
  delay?: number;
  style?: React.CSSProperties;
};

/** Kartu testimoni: tanda kutip besar warna aksen, kutipan display, garis tipis, nama + jabatan. */
export const QuoteCard: React.FC<QuoteCardProps> = ({quote, name, role, delay = 0, style}) => {
  const theme = useTheme();
  const {color, shape} = theme;
  const pMark = useEnter(0, delay);
  const pQuote = useEnter(1, delay);
  const pLine = useEnter(3, delay);
  const pWho = useEnter(4, delay);

  return (
    <div
      style={{
        background: color.surface,
        border: `${Math.max(1, shape.stroke)}px solid ${color.border}`,
        borderRadius: shape.radiusLg,
        boxShadow: shape.shadow,
        padding: '56px 72px 60px',
        maxWidth: 1180,
        ...style,
      }}
    >
      <div
        style={{
          ...textStyle(theme, 'display', 220),
          lineHeight: 0.7,
          height: 110,
          color: color.accent,
          ...enterStyle(pMark, 18),
        }}
      >
        {'\u201C'}
      </div>
      <div style={{...textStyle(theme, 'display', 48), color: color.text, ...enterStyle(pQuote, 24)}}>{quote}</div>
      <div
        style={{
          height: Math.max(1, shape.stroke),
          background: withAlpha(color.text, 0.28),
          margin: '40px 0 28px',
          transform: `scaleX(${pLine})`,
          transformOrigin: 'left center',
        }}
      />
      <div style={enterStyle(pWho, 14)}>
        <div style={{...textStyle(theme, 'body', 30, theme.type.strong), color: color.text}}>{name}</div>
        <div style={{...textStyle(theme, 'mono', 22), color: color.muted, marginTop: 6, letterSpacing: '0.14em', textTransform: 'uppercase'}}>{role}</div>
      </div>
    </div>
  );
};
