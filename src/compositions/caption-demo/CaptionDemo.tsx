import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {assetSrc} from '../../lib/assets';
import {bindPack} from '../../lib/pack';
import {CAPTION_PRESETS, Caption, type CaptionPresetName} from '../../components/text/Caption';
import {FilmGrain, Vignette} from '../../components/effects';
import {CLAMP} from '../../components/effects/util';

/**
 * Caption demo. Assets come from the `clipping` packs, so this composition also
 * proves that adding one caption plate to `_shared` lights up 13 packs at once.
 */

const pack = bindPack('clipping/podcast-clip');

const mono = 'Cascadia Code, Consolas, ui-monospace, monospace';
const sans = 'Segoe UI, Inter, system-ui, sans-serif';
const MUTED = '#8A93B2';
const INK = '#F2F4FF';
const VIOLET = '#7C5CFF';

const ROWS: {preset: CaptionPresetName; text: string}[] = [
  {preset: 'tiktok', text: 'kalau kamu edit pakai react'},
  {preset: 'boxed', text: 'caption otomatis jadi template'},
  {preset: 'marker', text: 'satu plate tiga belas pack'},
  {preset: 'karaoke', text: 'timing dari nomor frame'},
  {preset: 'bubble', text: 'tanpa salinan file'},
];

const Row: React.FC<{preset: CaptionPresetName; text: string; index: number}> = ({
  preset,
  text,
  index,
}) => {
  const frame = useCurrentFrame();
  const start = 8 + index * 8;
  const appear = interpolate(frame, [start - 4, start + 8], [0, 1], CLAMP);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 36,
        opacity: appear,
        transform: `translateX(${interpolate(appear, [0, 1], [-24, 0])}px)`,
      }}
    >
      <div style={{width: 260, textAlign: 'right'}}>
        <div style={{fontFamily: mono, fontSize: 15, color: VIOLET, letterSpacing: '0.12em'}}>
          {preset}
        </div>
        <div style={{fontFamily: mono, fontSize: 13, color: MUTED, marginTop: 4}}>
          {CAPTION_PRESETS[preset].label}
        </div>
      </div>
      <div style={{flex: 1, display: 'flex', justifyContent: 'center'}}>
        <Caption text={text} preset={preset} start={start} perWord={5} maxWidth={1150} />
      </div>
    </div>
  );
};

export const CaptionDemo: React.FC = () => {
  const head = interpolate(useCurrentFrame(), [0, 16], [0, 1], CLAMP);

  return (
    <AbsoluteFill style={{backgroundColor: '#05060F'}}>
      <Img
        src={staticFile('library/images/image.gradient.dark-01.png')}
        style={{width: '100%', height: '100%', objectFit: 'cover'}}
      />
      <Img
        src={assetSrc('image.bokeh.party-01')}
        style={{width: '100%', height: '100%', objectFit: 'cover', opacity: 0.28}}
      />
      <FilmGrain opacity={0.26} />
      <Vignette opacity={0.6} />

      <AbsoluteFill style={{padding: '64px 72px', flexDirection: 'column'}}>
        <div style={{opacity: head}}>
          <div style={{fontFamily: mono, fontSize: 16, letterSpacing: '0.32em', color: VIOLET}}>
            CAPTION PACK · {pack.pack.id}
          </div>
          <div
            style={{
              fontFamily: sans,
              fontSize: 46,
              fontWeight: 800,
              color: INK,
              marginTop: 8,
              letterSpacing: '-0.02em',
            }}
          >
            Satu plate, banyak gaya
          </div>
        </div>

        <div
          style={{
            marginTop: 40,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            paddingBottom: 40,
          }}
        >
          {ROWS.map((row, i) => (
            <Row key={row.preset} preset={row.preset} text={row.text} index={i} />
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: mono,
            fontSize: 14,
            color: MUTED,
            borderTop: '1px solid rgba(255,255,255,0.10)',
            paddingTop: 16,
          }}
        >
          <span>caption slot: {pack.pack.slots.caption?.length ?? 0} id</span>
          <span>{pack.pack.missing.length} catatan material belum ada</span>
        </div>
      </AbsoluteFill>

      <Audio src={pack.src('music')} volume={0.22} />
    </AbsoluteFill>
  );
};
