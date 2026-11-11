import React, {createContext, useContext, useMemo} from 'react';
import {AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {assetSrc} from '../lib/assets';
import {withAlpha} from './color.ts';
import type {Theme} from './types.ts';

/* ------------------------------------------------------------------ fonts --- */

/** Bobot yang tersedia di public/library/fonts/<slug>-<bobot>.woff2 (lihat LICENSE.md di sana). */
const FONT_WEIGHTS: Record<string, number[]> = {
  Inter: [400, 600, 700],
  'JetBrains Mono': [400, 500],
  Archivo: [500, 800, 900],
  'IBM Plex Sans': [400, 600],
  'IBM Plex Serif': [500, 600],
  Poppins: [500, 700, 800],
  'Open Sans': [400, 600, 700, 800],
  'Source Sans 3': [400, 600, 700],
};

const FALLBACK: Record<string, string> = {
  'IBM Plex Serif': 'Georgia, serif',
  'JetBrains Mono': 'ui-monospace, Consolas, monospace',
};

const slug = (family: string) => family.toLowerCase().replace(/\s+/g, '-');
const loaded = new Set<string>();

/** Muat semua bobot satu family. loadFont() menahan render sampai font siap. */
export function loadFamily(family: string): void {
  const weights = FONT_WEIGHTS[family];
  if (!weights) return; // font sistem: tidak perlu dimuat
  for (const weight of weights) {
    const key = `${family}-${weight}`;
    if (loaded.has(key)) continue;
    loaded.add(key);
    void loadFont({
      family,
      url: staticFile(`library/fonts/${slug(family)}-${weight}.woff2`),
      weight: String(weight),
    }).catch(() => undefined);
  }
}

export const fontStack = (family: string) => `"${family}", ${FALLBACK[family] ?? 'system-ui, sans-serif'}`;

/* ------------------------------------------------------------------ theme --- */

const ThemeContext = createContext<Theme | null>(null);

export const ThemeProvider: React.FC<{theme: Theme; children: React.ReactNode}> = ({theme, children}) => {
  useMemo(() => {
    loadFamily(theme.type.display.family);
    loadFamily(theme.type.body.family);
    loadFamily(theme.type.mono.family);
  }, [theme]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export function useTheme(): Theme {
  const t = useContext(ThemeContext);
  if (!t) throw new Error('useTheme() dipanggil di luar <ThemeProvider>. Bungkus komposisi dengan <ThemeProvider theme={...}>.');
  return t;
}

/** CSS tipografi dari role tema. Komposisi tidak menulis fontFamily sendiri. */
export function textStyle(theme: Theme, role: 'display' | 'body' | 'mono', size: number, weight?: number): React.CSSProperties {
  const r = theme.type[role];
  return {
    fontFamily: fontStack(r.family),
    fontWeight: weight ?? r.weight,
    fontSize: size,
    lineHeight: r.leading,
    letterSpacing: `${r.tracking}em`,
    textTransform: r.case === 'upper' ? 'uppercase' : 'none',
  };
}

/* ----------------------------------------------------------------- motion --- */

/**
 * Progres masuk 0..1 mengikuti bahasa gerak family (damping, durasi, stagger).
 * `index` = urutan elemen; tiap elemen tertunda `index * stagger` frame.
 */
export function useEnter(index = 0, extraDelay = 0): number {
  const theme = useTheme();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {damping, enter, stagger} = theme.motion;
  return spring({
    frame: frame - index * stagger - extraDelay,
    fps,
    config: {damping, mass: 0.8},
    durationInFrames: Math.max(6, enter * 2),
  });
}

/** Style masuk siap pakai: fade + naik halus. */
export function enterStyle(p: number, distance = 28): React.CSSProperties {
  return {opacity: Math.min(1, Math.max(0, p * 1.4)), transform: `translateY(${(1 - p) * distance}px)`};
}

export const EASE = {
  // kurva easeOutExpo baku (cubic-bezier); berbeda dari Easing.out(Easing.exp) ia mencapai tepat 1
  'out-expo': Easing.bezier(0.16, 1, 0.3, 1),
  'out-cubic': Easing.out(Easing.cubic),
  'in-out': Easing.inOut(Easing.cubic),
};

/* ------------------------------------------------------------- background --- */

/**
 * Latar prosedural dari token tema (bukan PNG berwarna), ditambah tekstur NETRAL
 * dari library (grain, vignette, serat kertas) yang ikut warna tema lewat blend.
 */
export const ThemeBackground: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const theme = useTheme();
  const {color, background, mode} = theme;
  const dark = mode === 'dark';

  let base: React.CSSProperties = {background: color.bg};
  if (background.recipe === 'spotlight') {
    base = {background: `radial-gradient(ellipse 80% 60% at 50% 38%, ${color.surface2} 0%, ${color.bg} 72%)`};
  } else if (background.recipe === 'mesh') {
    base = {
      background: [
        `radial-gradient(ellipse 60% 50% at 18% 22%, ${withAlpha(color.accent, 0.35)}, transparent 70%)`,
        `radial-gradient(ellipse 55% 45% at 85% 80%, ${withAlpha(color.accent2, 0.3)}, transparent 70%)`,
        color.bg,
      ].join(','),
    };
  } else if (background.recipe === 'grid') {
    base = {
      background: [
        `linear-gradient(${withAlpha(color.border, 0.55)} 1px, transparent 1px) 0 0 / 64px 64px`,
        `linear-gradient(90deg, ${withAlpha(color.border, 0.55)} 1px, transparent 1px) 0 0 / 64px 64px`,
        `radial-gradient(ellipse 70% 55% at 50% 40%, ${color.surface} 0%, ${color.bg} 75%)`,
      ].join(','),
    };
  }

  return (
    <AbsoluteFill style={{...base, overflow: 'hidden'}}>
      {background.recipe === 'paper' && (
        <Img
          src={assetSrc('texture.paper.fiber-01')}
          style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35, mixBlendMode: 'multiply'}}
        />
      )}
      {background.grain > 0 && (
        <Img
          src={assetSrc('texture.noise.film-4k')}
          style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: background.grain, mixBlendMode: 'overlay'}}
        />
      )}
      {children}
      {background.vignette > 0 && (
        <Img
          src={assetSrc('texture.vignette.soft-01')}
          style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: background.vignette * (dark ? 1 : 0.35)}}
        />
      )}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ photo --- */

/**
 * Foto dengan gerak Ken Burns (zoom + geser perlahan), deterministik per frame.
 * `src` relatif ke public/, mis. brand/knitto/photos/03-....webp
 */
export const Photo: React.FC<{
  src: string;
  /** Berapa frame zoom berjalan dari 1 ke `zoom`. Default: seluruh durasi komposisi. */
  duration?: number;
  zoom?: number;
  /** Titik fokus 0..1 */
  focus?: [number, number];
  fit?: 'cover' | 'contain';
  style?: React.CSSProperties;
}> = ({src, duration, zoom = 1.12, focus = [0.5, 0.5], fit = 'cover', style}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = interpolate(frame, [0, duration ?? durationInFrames], [0, 1], {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const s = 1 + (zoom - 1) * t;
  return (
    <Img
      src={staticFile(src)}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: fit,
        objectPosition: `${focus[0] * 100}% ${focus[1] * 100}%`,
        transform: `scale(${s})`,
        transformOrigin: `${focus[0] * 100}% ${focus[1] * 100}%`,
        ...style,
      }}
    />
  );
};
