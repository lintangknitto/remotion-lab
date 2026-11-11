import React from 'react';
import {enterStyle, textStyle, useEnter, useTheme} from '../../styles/react';

export type BarChartProps = {
  data: {label: string; value: number}[];
  /** Nilai penuh sumbu; default = nilai terbesar. */
  max?: number;
  title?: string;
};

const LABEL_W = 300;
const VALUE_W = 96;

const Row: React.FC<{label: string; value: number; ratio: number; index: number; tone: 'accent' | 'accent2'}> = ({label, value, ratio, index, tone}) => {
  const theme = useTheme();
  const {color, shape} = theme;
  // judul masuk di indeks 0-1; baris mulai dari indeks 2 dengan jeda ekstra supaya terbaca berurutan
  const p = useEnter(index, 6 + index * 3);
  const w = Math.max(0, Math.min(1, ratio)) * p;
  const endCalc = `calc((100% - ${VALUE_W}px) * ${w})`;

  return (
    <div style={{display: 'flex', alignItems: 'center', height: 56}}>
      <div style={{...textStyle(theme, 'body', 26, theme.type.strong), color: color.text, width: LABEL_W, flexShrink: 0, whiteSpace: 'nowrap', opacity: Math.min(1, p * 2)}}>{label}</div>
      <div style={{position: 'relative', flex: 1, height: '100%', borderLeft: `3px solid ${color.border}`}}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 6,
            bottom: 6,
            width: endCalc,
            background: color[tone],
            borderRadius: `0 ${shape.radiusSm}px ${shape.radiusSm}px 0`,
          }}
        />
        <div
          style={{
            ...textStyle(theme, 'display', 38),
            position: 'absolute',
            top: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            left: `calc(${endCalc} + 14px)`,
            color: color.text,
            opacity: Math.min(1, p * 1.6),
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {Math.round(value * p)}
        </div>
      </div>
    </div>
  );
};

/** Batang horizontal beranimasi berurutan; warna selang-seling accent/accent2, nilai di ujung batang. */
export const BarChart: React.FC<BarChartProps> = ({data, max, title}) => {
  const theme = useTheme();
  const top = max ?? Math.max(1, ...data.map((d) => d.value));
  const pTitle = useEnter(0);

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 10, width: '100%'}}>
      {title && <div style={{...textStyle(theme, 'body', 30, theme.type.strong), color: theme.color.muted, marginBottom: 10, ...enterStyle(pTitle, 18)}}>{title}</div>}
      {data.map((d, i) => (
        <Row key={d.label} label={d.label} value={d.value} ratio={d.value / top} index={i + 1} tone={i % 2 === 0 ? 'accent' : 'accent2'} />
      ))}
    </div>
  );
};
