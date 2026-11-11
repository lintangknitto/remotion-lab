import React from 'react';
import {Img, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {assetSrc} from '../../lib/assets';

export type CaptionPreset = {
  label: string;
  font: string;
  size: number;
  weight: number;
  color: string;
  activeColor: string;
  uppercase?: boolean;
  /** Asset id drawn behind the words. */
  bg?: string;
  /** 'fill' stretches behind the line; 'underline' pins the plate to the bottom. */
  bgMode?: 'fill' | 'underline';
  /** Extra padding when a background plate is used. */
  pad?: string;
  shadow?: string;
  scaleActive?: number;
};

export type CaptionPresetName = 'tiktok' | 'boxed' | 'marker' | 'karaoke' | 'bubble';

const SANS = 'Segoe UI, Inter, system-ui, sans-serif';

export const CAPTION_PRESETS: Record<CaptionPresetName, CaptionPreset> = {
  /** Yellow pill, black type — the default TikTok look. */
  tiktok: {
    label: 'Pill',
    font: SANS,
    size: 54,
    weight: 800,
    color: '#0B0D16',
    activeColor: '#0B0D16',
    uppercase: true,
    bg: 'image.caption.pill-01',
    bgMode: 'fill',
    pad: '16px 46px',
    scaleActive: 1.02,
  },
  /** Dark plate with a hairline border — safe over busy footage. */
  boxed: {
    label: 'Box',
    font: SANS,
    size: 44,
    weight: 700,
    color: '#F4F6FF',
    activeColor: '#22D3EE',
    bg: 'image.caption.box-01',
    bgMode: 'fill',
    pad: '16px 38px',
    scaleActive: 1.03,
  },
  /** Marker stroke under the line, no plate. */
  marker: {
    label: 'Marker',
    font: SANS,
    size: 48,
    weight: 800,
    color: '#F4F6FF',
    activeColor: '#FFE066',
    uppercase: true,
    bg: 'image.caption.stroke-01',
    bgMode: 'underline',
    pad: '10px 6px 34px',
    scaleActive: 1.02,
  },
  /** Word-by-word pop with an accent colour on the active word. */
  karaoke: {
    label: 'Karaoke',
    font: SANS,
    size: 48,
    weight: 800,
    color: '#8A93B2',
    activeColor: '#F4F6FF',
    uppercase: true,
    scaleActive: 1.1,
  },
  /** Speech bubble, dark type. */
  bubble: {
    label: 'Bubble',
    font: SANS,
    size: 40,
    weight: 700,
    color: '#10131F',
    activeColor: '#5B3FD6',
    bg: 'image.caption.bubble-01',
    bgMode: 'fill',
    pad: '20px 50px 50px',
    scaleActive: 1.03,
  },
};

/**
 * Word-by-word caption. Timing is a pure function of the frame, so it stays in
 * sync when frames are rendered in parallel.
 */
export const Caption: React.FC<{
  text: string;
  preset?: CaptionPresetName;
  start?: number;
  perWord?: number;
  maxWidth?: number;
  align?: 'center' | 'left';
}> = ({text, preset = 'tiktok', start = 0, perWord = 8, maxWidth = 1400, align = 'center'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = CAPTION_PRESETS[preset];

  const local = frame - start;
  if (local < 0) return null;

  const words = text.split(' ').filter(Boolean);
  const activeIndex = Math.min(words.length - 1, Math.max(0, Math.floor(local / perWord)));

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        maxWidth,
        padding: p.pad ?? '8px 4px',
      }}
    >
      {p.bg ? (
        <Img
          src={assetSrc(p.bg)}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            zIndex: 0,
            width: '100%',
            objectFit: 'fill',
            ...(p.bgMode === 'underline'
              ? {bottom: 0, height: '60%'}
              : {top: 0, height: '100%'}),
          }}
        />
      ) : null}

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: align === 'center' ? 'center' : 'flex-start',
          columnGap: 16,
          rowGap: 4,
        }}
      >
        {words.map((word, i) => {
          const appear = spring({
            frame: local,
            fps,
            delay: i * perWord,
            durationInFrames: 12,
            config: {damping: 16, stiffness: 220, mass: 0.5},
          });
          const isActive = i === activeIndex;
          const scale = isActive ? (p.scaleActive ?? 1) : 1;

          return (
            <span
              key={`${word}-${i}`}
              style={{
                display: 'inline-block',
                fontFamily: p.font,
                fontSize: p.size,
                fontWeight: p.weight,
                letterSpacing: p.uppercase ? '-0.01em' : '0em',
                textTransform: p.uppercase ? 'uppercase' : 'none',
                color: isActive ? p.activeColor : p.color,
                textShadow: p.shadow,
                opacity: appear,
                transform: `translateY(${(1 - appear) * 16}px) scale(${scale})`,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
