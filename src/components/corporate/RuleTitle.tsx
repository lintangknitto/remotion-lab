import React from 'react';
import {withAlpha} from './../../styles/color';
import {enterStyle, textStyle, useEnter, useTheme} from './../../styles/react';

export type RuleTitleProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  delay?: number;
  /** Ukuran judul (px). Default 88. */
  size?: number;
  style?: React.CSSProperties;
};

/** Eyebrow mono kapital tracking lebar + garis tipis yang tumbuh, judul display, subjudul opsional. */
export const RuleTitle: React.FC<RuleTitleProps> = ({eyebrow, title, subtitle, delay = 0, size = 88, style}) => {
  const theme = useTheme();
  const {color, shape} = theme;
  const pEyebrow = useEnter(0, delay);
  const pLine = useEnter(1, delay);
  const pTitle = useEnter(2, delay);
  const pSub = useEnter(4, delay);

  return (
    <div style={{maxWidth: 1100, ...style}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 28, ...enterStyle(pEyebrow, 14)}}>
        <div style={{...textStyle(theme, 'mono', 24), letterSpacing: '0.28em', textTransform: 'uppercase', color: color.accent, whiteSpace: 'nowrap'}}>
          {eyebrow}
        </div>
        <div
          style={{
            flex: 1,
            height: Math.max(1, shape.stroke),
            background: withAlpha(color.text, 0.34),
            transform: `scaleX(${pLine})`,
            transformOrigin: 'left center',
          }}
        />
      </div>
      <div style={{...textStyle(theme, 'display', size), color: color.text, marginTop: 26, textWrap: 'balance', ...enterStyle(pTitle, 26)}}>{title}</div>
      {subtitle ? (
        <div style={{...textStyle(theme, 'body', 32), color: color.muted, marginTop: 24, maxWidth: 900, ...enterStyle(pSub, 16)}}>{subtitle}</div>
      ) : null}
    </div>
  );
};

