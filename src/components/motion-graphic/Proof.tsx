import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {onColor, withAlpha} from '../../styles/color';
import {enterStyle, textStyle, useEnter, useTheme} from '../../styles/react';
import {BarChart} from './BarChart';
import {Counter} from './Counter';
import {IconCard} from './IconCard';
import {KineticHeadline} from './KineticHeadline';
import {ShapeWipe} from './ShapeWipe';

/** Satu bentuk datar besar yang masuk dengan spring lalu melayang halus (fungsi frame, deterministik). */
const Blob: React.FC<{
  cx: number;
  cy: number;
  d: number;
  fill: string;
  index: number;
  delay: number;
  bob?: number;
  phase?: number;
  children?: React.ReactNode;
}> = ({cx, cy, d, fill, index, delay, bob = 8, phase = 0, children}) => {
  const frame = useCurrentFrame();
  const p = useEnter(index, delay);
  const dy = Math.sin(frame / 24 + phase) * bob;
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - d / 2,
        top: cy - d / 2 + dy,
        width: d,
        height: d,
        borderRadius: '50%',
        background: fill,
        transform: `scale(${p})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  );
};

/** Satu frame video explainer Knitto (1920x1080): bentuk besar, blok datar, hierarki jelas. */
export const Proof: React.FC = () => {
  const theme = useTheme();
  const {color} = theme;
  const pChip = useEnter(0, 12);
  const pRing = useEnter(0, 8);

  return (
    <AbsoluteFill style={{color: color.text, overflow: 'hidden'}}>
      {/* lapis bentuk latar */}
      <div
        style={{
          position: 'absolute',
          left: 1520 - 480,
          top: 200 - 480,
          width: 960,
          height: 960,
          borderRadius: '50%',
          border: `6px solid ${withAlpha(color.accent, 0.28)}`,
          boxSizing: 'border-box',
          transform: `scale(${pRing})`,
        }}
      />
      <Blob cx={1520} cy={250} d={800} fill={color.accent} index={0} delay={10} bob={10}>
        <div style={{marginTop: 40}}>
          <Counter to={500} suffix="+" label="jenis kain" size={210} delay={16} color={onColor(color.accent)} accentColor={onColor(color.accent)} align="center" />
        </div>
      </Blob>
      <Blob cx={1215} cy={525} d={290} fill={color.accent2} index={1} delay={14} bob={9} phase={2}>
        <Counter to={115} prefix="+" label="stok warna" size={88} delay={24} color={onColor(color.accent2)} accentColor={onColor(color.accent2)} align="center" />
      </Blob>

      {/* kolom kiri: judul besar */}
      <div style={{position: 'absolute', left: 100, top: 58, ...enterStyle(pChip, 20)}}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 14,
            padding: '12px 26px 12px 18px',
            background: color.surface,
            border: `2px solid ${color.border}`,
            borderRadius: 999,
            ...textStyle(theme, 'body', 24, theme.type.strong),
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: color.text,
          }}
        >
          <span style={{width: 18, height: 18, borderRadius: '50%', background: color.accent2}} />
          Knitto · toko bahan kaos
        </div>
      </div>
      <div style={{position: 'absolute', left: 100, top: 148, width: 1020}}>
        <KineticHeadline text="Kain *premium* langsung dari *pabrik sendiri*" size={112} delay={8} />
      </div>

      {/* tiga kartu, turun bertangga ke kanan */}
      <div style={{position: 'absolute', left: 100, top: 618, display: 'flex', gap: 22, alignItems: 'flex-start'}}>
        <IconCard icon="factory" tone="accent" title="Pabrik sendiri" text="Mesin teknologi Eropa terbaru" delay={30} style={{width: 310, marginTop: 0}} />
        <IconCard icon="palette" title="Custom warna" text="Lewat pre-order" delay={34} style={{width: 310, marginTop: 34}} />
        <IconCard icon="box" title="Mulai 1 kg" text="Order online mudah" delay={38} style={{width: 310, marginTop: 68}} />
      </div>

      {/* grafik */}
      <div style={{position: 'absolute', left: 1110, top: 712, width: 730}}>
        <BarChart
          title="Pilihan ukuran benang per kelompok kain"
          data={[
            {label: 'Cotton Combed', value: 8},
            {label: 'CVC', value: 3},
            {label: 'Cotton Carded', value: 2},
            {label: 'Combed Enzywash', value: 2},
          ]}
        />
      </div>

      <ShapeWipe kind="diagonal" start={0} duration={30} />
    </AbsoluteFill>
  );
};
