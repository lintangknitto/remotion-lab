import React from 'react';
import {Easing, useCurrentFrame, useVideoConfig} from 'remotion';
import {EASE, useTheme} from '../../styles/react';
import type {Theme} from '../../styles/types';

export type ShapeWipeProps = {
  kind: 'circle' | 'bar' | 'diagonal';
  /** Frame mulai (relatif ke Sequence induk). */
  start: number;
  /** Total frame menutup lalu membuka. Default 30. */
  duration?: number;
};

type Layer = {color: string; cover: number; reveal: number};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** Kebalikan ease tema untuk fase membuka (menutup = ease tema, membuka = lawannya). */
const REVEAL_EASE: Record<Theme['motion']['ease'], (t: number) => number> = {
  'out-expo': Easing.in(Easing.exp),
  'out-cubic': Easing.in(Easing.cubic),
  'in-out': Easing.inOut(Easing.cubic),
};
const norm = (fn: (t: number) => number, v: number) => (fn(v) - fn(0)) / (fn(1) - fn(0));

/**
 * Overlay transisi blok warna aksen yang menyapu layar: menutup (0 -> 1) lalu membuka (1 -> 2).
 * Pasang di PALING ATAS konten; ganti scene saat layar tertutup penuh (start + duration/2).
 */
export const ShapeWipe: React.FC<ShapeWipeProps> = ({kind, start, duration = 30}) => {
  const frame = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();
  const theme = useTheme();
  const {color, motion} = theme;
  if (frame < start || frame > start + duration) return null;

  const maxLag = Math.max(2, Math.round(duration * 0.18));
  const half = duration / 2 - maxLag;
  const coverEase = EASE[motion.ease];
  const revealEase = REVEAL_EASE[motion.ease];
  const f = frame - start;

  /** u: 0 = belum tampil, 1 = menutup penuh, 2 = sudah lewat. */
  const u = (l: Layer) => norm(coverEase, clamp01((f - l.cover) / half)) + norm(revealEase, clamp01((f - half - maxLag - l.reveal) / half));

  const fill: React.CSSProperties = {position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none'};

  if (kind === 'circle') {
    const R = (Math.hypot(W, H) / 2) * 1.02;
    // lapisan bawah (aksen2) memimpin saat menutup; lapisan atas (aksen) memimpin saat membuka
    const layers: Layer[] = [
      {color: color.accent2, cover: 0, reveal: maxLag},
      {color: color.accent, cover: maxLag, reveal: 0},
    ];
    return (
      <div style={fill}>
        {layers.map((l) => {
          const v = u(l);
          if (v <= 0 || v >= 2) return null;
          const covering = v <= 1;
          const r = covering ? R * v : R * (v - 1);
          return (
            <div
              key={l.color}
              style={{
                position: 'absolute',
                left: W / 2 - r,
                top: H / 2 - r,
                width: r * 2,
                height: r * 2,
                borderRadius: '50%',
                background: covering ? l.color : 'transparent',
                // lubang yang melebar: bayangan menutupi semua di luar lingkaran
                boxShadow: covering ? 'none' : `0 0 0 ${R * 2.4}px ${l.color}`,
              }}
            />
          );
        })}
      </div>
    );
  }

  if (kind === 'bar') {
    const n = 6;
    const h = Math.ceil(H / n);
    return (
      <div style={fill}>
        {Array.from({length: n}, (_, i) => {
          const lag = (i * maxLag) / (n - 1);
          const v = u({color: '', cover: lag, reveal: lag});
          if (v <= 0 || v >= 2) return null;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 0,
                top: i * (H / n),
                width: W,
                height: h + 1,
                background: i % 2 === 0 ? color.accent : color.accent2,
                transform: `translateX(${(v - 1) * W}px)`,
              }}
            />
          );
        })}
      </div>
    );
  }

  // diagonal: dua pita lebar miring menyapu kiri -> kanan
  const angle = 20;
  const rad = (angle * Math.PI) / 180;
  const extent = W * Math.cos(rad) + H * Math.sin(rad);
  const band = extent * 1.04;
  const travel = (band + extent) / 2;
  const layers: Layer[] = [
    {color: color.accent2, cover: 0, reveal: maxLag},
    {color: color.accent, cover: maxLag, reveal: 0},
  ];
  return (
    <div style={fill}>
      {layers.map((l) => {
        const v = u(l);
        if (v <= 0 || v >= 2) return null;
        return (
          <div
            key={l.color}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: band,
              height: Math.hypot(W, H) * 2,
              background: l.color,
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(${(v - 1) * travel}px)`,
            }}
          />
        );
      })}
    </div>
  );
};
