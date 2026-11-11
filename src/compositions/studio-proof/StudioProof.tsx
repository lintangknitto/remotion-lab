import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {assetSrc, LIBRARY} from '../../lib/assets';
import {bindPack} from '../../lib/pack';
import {
  Chromatic,
  FilmGrain,
  Flash,
  GlitchSlice,
  Shake,
  Vignette,
  ZoomPunch,
} from '../../components/effects';
import {CLAMP} from '../../components/effects/util';

/**
 * Proof composition for the asset system: it renders one pack's assets plus a
 * few effects, all resolved from the library by id. Nothing here hardcodes a
 * file path.
 */

const pack = bindPack('beat-edit/jedag-jedug');

const TILES: {id: string; label: string; bg?: string; blend?: React.CSSProperties['mixBlendMode']}[] = [
  {
    id: 'texture.vhs.scanline-01',
    label: 'VHS scanline',
    bg: 'linear-gradient(135deg, #6C5CE7, #0F5F73)',
    blend: 'multiply',
  },
  {
    id: 'texture.halftone.dots-01',
    label: 'Halftone',
    bg: 'linear-gradient(135deg, #F5B971, #E4573D)',
    blend: 'multiply',
  },
  {id: 'image.gradient.mesh-02', label: 'Gradient mesh'},
  {id: 'image.bokeh.party-01', label: 'Bokeh'},
  {id: 'image.lightleak.cool-01', label: 'Light leak'},
  {id: 'image.confetti.burst-01', label: 'Confetti'},
];

const mono = 'Cascadia Code, Consolas, ui-monospace, monospace';
const sans = 'Segoe UI, Inter, system-ui, sans-serif';
const MUTED = '#8A93B2';
const INK = '#F2F4FF';
const VIOLET = '#7C5CFF';
const CYAN = '#22D3EE';

const Tile: React.FC<{
  id: string;
  label: string;
  delay: number;
  bg?: string;
  blend?: React.CSSProperties['mixBlendMode'];
}> = ({id, label, delay, bg, blend}) => {
  const frame = useCurrentFrame();
  const appear = interpolate(frame, [delay, delay + 14], [0, 1], CLAMP);

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 14,
        overflow: 'hidden',
        background: bg ?? '#080C1A',
        border: '1px solid rgba(255,255,255,0.10)',
        opacity: appear,
        transform: `translateY(${interpolate(appear, [0, 1], [24, 0])}px)`,
      }}
    >
      <Img
        src={assetSrc(id)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.95,
          mixBlendMode: blend,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: '10px 14px',
          background: 'linear-gradient(transparent, rgba(3,4,10,0.92))',
          fontFamily: mono,
          fontSize: 15,
          color: INK,
        }}
      >
        {label}
        <span style={{color: MUTED, marginLeft: 10, fontSize: 13}}>{id}</span>
      </div>
    </div>
  );
};

const EffectPanel: React.FC<{title: string; children: React.ReactNode}> = ({title, children}) => (
  <div
    style={{
      position: 'relative',
      borderRadius: 14,
      overflow: 'hidden',
      background: '#0A0F1E',
      border: '1px solid rgba(255,255,255,0.10)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {children}
    <div
      style={{
        position: 'absolute',
        left: 14,
        top: 12,
        fontFamily: mono,
        fontSize: 14,
        letterSpacing: '0.18em',
        color: MUTED,
      }}
    >
      {title}
    </div>
  </div>
);

const Big: React.FC<{text: string; color?: string}> = ({text, color = INK}) => (
  <div style={{fontFamily: sans, fontWeight: 800, fontSize: 64, color, letterSpacing: '-0.02em'}}>
    {text}
  </div>
);

export const StudioProof: React.FC = () => {
  const frame = useCurrentFrame();
  const head = interpolate(frame, [0, 16], [0, 1], CLAMP);
  const slots = Object.entries(pack.pack.slots).filter(([, v]) => v.length > 0);

  return (
    <AbsoluteFill style={{backgroundColor: '#05060F'}}>
      <Img
        src={staticFile('library/images/image.gradient.dark-01.png')}
        style={{width: '100%', height: '100%', objectFit: 'cover'}}
      />
      <FilmGrain opacity={0.28} />
      <Vignette opacity={0.6} />

      <AbsoluteFill style={{padding: '56px 64px', flexDirection: 'column'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', opacity: head}}>
          <div>
            <div style={{fontFamily: mono, fontSize: 16, letterSpacing: '0.34em', color: VIOLET}}>
              REMOTION-LAB · ASSET LIBRARY
            </div>
            <div style={{fontFamily: sans, fontSize: 54, fontWeight: 800, color: INK, marginTop: 10, letterSpacing: '-0.02em'}}>
              {LIBRARY.count} aset · 17 family · 73 pack
            </div>
            <div style={{fontFamily: sans, fontSize: 22, color: MUTED, marginTop: 8}}>
              Satu file di library, dipakai berlapis oleh banyak pack. Tidak ada duplikat.
            </div>
          </div>

          <div
            style={{
              width: 520,
              padding: '18px 20px',
              borderRadius: 14,
              background: 'rgba(8,12,24,0.82)',
              border: '1px solid rgba(255,255,255,0.10)',
            }}
          >
            <div style={{fontFamily: mono, fontSize: 15, color: MUTED}}>pack</div>
            <div style={{fontFamily: mono, fontSize: 22, color: CYAN, marginTop: 4}}>
              {pack.pack.id}
            </div>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14}}>
              {slots.map(([slot, ids]) => (
                <div
                  key={slot}
                  style={{
                    fontFamily: mono,
                    fontSize: 13,
                    color: INK,
                    padding: '5px 9px',
                    borderRadius: 6,
                    background: 'rgba(124,92,255,0.18)',
                    border: '1px solid rgba(124,92,255,0.35)',
                  }}
                >
                  {slot}:{ids.length}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 34,
            flex: 1,
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridTemplateRows: '1fr 1fr 200px',
            gap: 22,
          }}
        >
          {TILES.map((t, i) => (
            <Tile key={t.id} id={t.id} label={t.label} bg={t.bg} blend={t.blend} delay={8 + i * 4} />
          ))}

          <EffectPanel title="FLASH">
            <Flash start={40} length={14} color={VIOLET} peak={0.55} />
            <Big text="FLASH" />
          </EffectPanel>

          <EffectPanel title="GLITCH SLICE">
            <GlitchSlice start={38} duration={18} strength={16}>
              <Big text="GLITCH" color={CYAN} />
            </GlitchSlice>
          </EffectPanel>

          <EffectPanel title="SHAKE + ZOOM">
            <Shake start={38} intensity={12} decay={7}>
              <ZoomPunch start={38} amount={0.12} length={16}>
                <Chromatic amount={3}>
                  <Big text="SHAKE" color="#FF7A59" />
                </Chromatic>
              </ZoomPunch>
            </Shake>
          </EffectPanel>
        </div>
      </AbsoluteFill>

      <Audio src={pack.src('music')} volume={0.32} />
      <Audio src={pack.src('impact')} from={38} volume={0.9} />
      <Audio src={pack.src('glitch')} from={42} volume={0.5} />
    </AbsoluteFill>
  );
};
