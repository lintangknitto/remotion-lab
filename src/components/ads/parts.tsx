import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {onColor, withAlpha} from '../../styles/color';
import {textStyle, useEnter, useTheme} from '../../styles/react';

/** Pecah "KAIN *PREMIUM* murah" menjadi segmen biasa dan segmen sorot (diapit tanda bintang). */
function parseMarks(text: string): {t: string; hi: boolean}[] {
  return text
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .map((s) => (s.startsWith('*') ? {t: s.slice(1, -1), hi: true} : {t: s, hi: false}));
}

/* ---------------------------------------------------------------- BigClaim --- */

/**
 * Klaim besar uppercase yang "menghantam" layar baris demi baris (spring memantul
 * sesuai bahasa gerak ads). Kata dalam *bintang* diberi blok warna aksen.
 */
export const BigClaim: React.FC<{lines: string[]; size?: number; delay?: number; align?: 'left' | 'center'}> = ({lines, size = 130, delay = 0, align = 'left'}) => {
  const t = useTheme();
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start', gap: size * 0.06}}>
      {lines.map((line, i) => (
        <ClaimLine key={i} line={line} index={i} size={size} delay={delay} />
      ))}
      <span style={{display: 'none'}}>{t.family}</span>
    </div>
  );
};

const ClaimLine: React.FC<{line: string; index: number; size: number; delay: number}> = ({line, index, size, delay}) => {
  const t = useTheme();
  const p = useEnter(index, delay);
  const scale = 1 + (1 - Math.min(p, 1)) * 0.45;
  return (
    <div
      style={{
        ...textStyle(t, 'display', size),
        color: t.color.text,
        opacity: Math.min(1, p * 2),
        transform: `scale(${scale}) rotate(${(1 - Math.min(p, 1)) * -3}deg)`,
        transformOrigin: 'left center',
        textShadow: `0 6px 30px ${withAlpha(t.color.bg, 0.55)}`,
        whiteSpace: 'nowrap',
      }}
    >
      {parseMarks(line).map((s, i) =>
        s.hi ? (
          <span key={i} style={{display: 'inline-block', lineHeight: 1.04, background: t.color.accent, color: t.color.onAccent, padding: `${size * 0.02}px ${size * 0.12}px`, borderRadius: t.shape.radiusSm, textShadow: 'none'}}>
            {s.t}
          </span>
        ) : (
          <span key={i}>{s.t}</span>
        ),
      )}
    </div>
  );
};

/* --------------------------------------------------------------- CtaButton --- */

export const CtaButton: React.FC<{label: string; sub?: string; size?: number; delay?: number; pulse?: boolean}> = ({label, sub, size = 58, delay = 0, pulse = true}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const p = useEnter(0, delay);
  const beat = pulse ? 1 + 0.025 * Math.sin(frame / 5) : 1;
  return (
    <div style={{display: 'inline-flex', flexDirection: 'column', alignItems: 'center', opacity: Math.min(1, p * 2), transform: `scale(${(0.7 + 0.3 * Math.min(p, 1)) * beat})`}}>
      <div
        style={{
          background: t.color.accent,
          color: t.color.onAccent,
          borderRadius: t.shape.radius,
          padding: `${size * 0.36}px ${size * 0.9}px`,
          boxShadow: t.shape.shadow,
          ...textStyle(t, 'display', size),
        }}
      >
        {label}
      </div>
      {sub && <div style={{marginTop: size * 0.3, color: t.color.text, ...textStyle(t, 'body', size * 0.5, t.type.strong)}}>{sub}</div>}
    </div>
  );
};

/* ----------------------------------------------------------------- FactTag --- */

/** Stiker fakta (mis. "MIN. ORDER / 1 KG"). Sedikit miring, bayangan keras. */
export const FactTag: React.FC<{label: string; value: string; rotate?: number; size?: number; delay?: number; tone?: 'accent' | 'accent2' | 'surface'}> = ({
  label,
  value,
  rotate = -4,
  size = 64,
  delay = 0,
  tone = 'surface',
}) => {
  const t = useTheme();
  const p = useEnter(0, delay);
  const bg = tone === 'surface' ? t.color.surface : tone === 'accent' ? t.color.accent : t.color.accent2;
  const fg = tone === 'surface' ? t.color.text : onColor(bg);
  return (
    <div
      style={{
        display: 'inline-block',
        background: bg,
        color: fg,
        borderRadius: t.shape.radius,
        padding: `${size * 0.28}px ${size * 0.55}px`,
        boxShadow: t.shape.shadow,
        opacity: Math.min(1, p * 2),
        transform: `rotate(${rotate + (1 - Math.min(p, 1)) * 8}deg) scale(${0.6 + 0.4 * Math.min(p, 1)})`,
      }}
    >
      <div style={{...textStyle(t, 'mono', size * 0.34, 600), opacity: 0.8, letterSpacing: '0.12em', textTransform: 'uppercase'}}>{label}</div>
      <div style={{...textStyle(t, 'display', size), lineHeight: 1}}>{value}</div>
    </div>
  );
};

/* ------------------------------------------------------------------- Badge --- */

/** Badge bintang bergerigi (mis. "WARNA BARU"). */
export const Badge: React.FC<{text: string; sub?: string; size?: number; rotate?: number; delay?: number}> = ({text, sub, size = 300, rotate = 10, delay = 0}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const p = useEnter(0, delay);
  const spikes = 14;
  const pts = Array.from({length: spikes * 2}, (_, i) => {
    const a = (Math.PI * 2 * i) / (spikes * 2) - Math.PI / 2;
    const r = i % 2 === 0 ? 50 : 42;
    return `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`;
  }).join(' ');
  const fill = t.color.accent2;
  return (
    <div style={{position: 'relative', width: size, height: size, opacity: Math.min(1, p * 2), transform: `rotate(${rotate + Math.sin(frame / 14) * 2}deg) scale(${0.3 + 0.7 * Math.min(p, 1)})`}}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{position: 'absolute', inset: 0, filter: `drop-shadow(6px 6px 0 ${withAlpha(t.color.bg, 0.6)})`}}>
        <polygon points={pts} fill={fill} />
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: onColor(fill), textAlign: 'center'}}>
        <div style={{...textStyle(t, 'display', size * 0.2), lineHeight: 0.95}}>{text}</div>
        {sub && <div style={{...textStyle(t, 'body', size * 0.1, t.type.strong), marginTop: size * 0.03}}>{sub}</div>}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ Ticker --- */

/** Pita teks berjalan. Posisi murni fungsi frame (tidak berulang mulus, cukup untuk iklan pendek). */
export const Ticker: React.FC<{items: string[]; height?: number; speed?: number; tone?: 'accent' | 'surface'}> = ({items, height = 96, speed = 5, tone = 'accent'}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const bg = tone === 'accent' ? t.color.accent : t.color.surface;
  const fg = tone === 'accent' ? t.color.onAccent : t.color.text;
  const unit = items.join('   ◆   ') + '   ◆   ';
  const repeats = Math.ceil((durationInFrames * speed) / (unit.length * height * 0.45)) + 2;
  return (
    <div style={{width: '100%', height, background: bg, overflow: 'hidden', display: 'flex', alignItems: 'center'}}>
      <div style={{whiteSpace: 'nowrap', transform: `translateX(${-frame * speed}px)`, color: fg, ...textStyle(t, 'display', height * 0.46)}}>
        {Array.from({length: repeats}, () => unit).join('')}
      </div>
    </div>
  );
};

/* --------------------------------------------------------------- PhotoCard --- */

export const PhotoCard: React.FC<{src: string; width: number; height: number; rotate?: number; delay?: number; fit?: 'cover' | 'contain'; caption?: string}> = ({
  src,
  width,
  height,
  rotate = 0,
  delay = 0,
  fit = 'cover',
  caption,
}) => {
  const t = useTheme();
  const p = useEnter(0, delay);
  return (
    <div
      style={{
        width,
        height,
        background: t.color.surface,
        borderRadius: t.shape.radiusLg,
        boxShadow: t.shape.shadow,
        padding: 14,
        opacity: Math.min(1, p * 2),
        transform: `rotate(${rotate + (1 - Math.min(p, 1)) * 6}deg) translateY(${(1 - Math.min(p, 1)) * 80}px)`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{flex: 1, borderRadius: t.shape.radius, overflow: 'hidden', position: 'relative', background: t.color.surface2}}>
        <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: fit}} />
      </div>
      {caption && <div style={{textAlign: 'center', paddingTop: 10, color: t.color.text, ...textStyle(t, 'display', 30)}}>{caption}</div>}
    </div>
  );
};

/* -------------------------------------------------------------------- Logo --- */

/** `ring` menambah lingkar terang di sekeliling logo supaya terbaca di atas latar gelap. */
export const Logo: React.FC<{width: number; ring?: boolean; style?: React.CSSProperties}> = ({width, ring = false, style}) => {
  const t = useTheme();
  if (!t.logo) return null;
  const img = <Img src={staticFile(t.logo)} style={{width, height: 'auto', display: 'block', ...style}} />;
  if (!ring) return img;
  return <div style={{display: 'inline-block', padding: width * 0.05, borderRadius: 999, background: t.color.text, lineHeight: 0}}>{img}</div>;
};

/* ------------------------------------------------------------- FeatureChip --- */

/** Baris fitur dengan ikon centang, muncul bergantian. */
export const FeatureChip: React.FC<{text: string; index?: number; delay?: number; size?: number}> = ({text, index = 0, delay = 0, size = 50}) => {
  const t = useTheme();
  const p = useEnter(index, delay);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: size * 0.4,
        background: t.color.surface,
        borderRadius: t.shape.radius,
        padding: `${size * 0.3}px ${size * 0.55}px`,
        boxShadow: t.shape.shadow,
        opacity: Math.min(1, p * 2),
        transform: `translateX(${(1 - Math.min(p, 1)) * -120}px)`,
        color: t.color.text,
        ...textStyle(t, 'body', size, t.type.strong),
      }}
    >
      <div style={{width: size * 1.1, height: size * 1.1, borderRadius: 999, background: t.color.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
        <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 24 24" fill="none" stroke={t.color.onAccent} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </div>
      {text}
    </div>
  );
};

/* ----------------------------------------------------------------- CutWipe --- */

/** Blok warna aksen menyapu layar; pergantian adegan terjadi tepat di tengah sapuan. */
export const CutWipe: React.FC<{at: number; duration?: number}> = ({at, duration = 14}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const x = interpolate(frame, [at - duration / 2, at, at + duration / 2], [-110, 0, 110], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (frame < at - duration / 2 || frame > at + duration / 2) return null;
  return (
    <div style={{position: 'absolute', inset: 0, background: t.color.accent, transform: `translateX(${x}%) skewX(-8deg)`, boxShadow: `0 0 0 40px ${t.color.accent}`}} />
  );
};
