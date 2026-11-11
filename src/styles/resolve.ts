import {ensureContrast, hexToOklch, lch, onColor, withAlpha} from './color.ts';
import type {ChromaLevel, ColorRules, Harmony, Mode, ResolveOptions, StyleProfile, Theme} from './types.ts';

const CHROMA: Record<ChromaLevel, number> = {low: 0.05, mid: 0.12, high: 0.2};
const HARMONY_OFFSET: Record<Harmony, number> = {mono: 0, analogous: 35, complementary: 180, split: 150, triad: 120};

/**
 * Warna semantik TERKUNCI: hue-nya tetap (merah = gagal, hijau = lulus) berapa pun seed-nya.
 * Hanya lightness yang menyesuaikan mode agar terbaca.
 */
const SEMANTIC: Record<Mode, Record<'success' | 'warn' | 'danger' | 'info', [number, number, number]>> = {
  dark: {success: [0.74, 0.16, 150], warn: [0.82, 0.15, 85], danger: [0.68, 0.2, 25], info: [0.74, 0.12, 235]},
  light: {success: [0.55, 0.15, 150], warn: [0.66, 0.15, 70], danger: [0.55, 0.2, 25], info: [0.55, 0.14, 245]},
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function mergeRules(profile: StyleProfile, opts: ResolveOptions): {rules: ColorRules; variant: string} {
  const variant = opts.variant ?? profile.defaultVariant;
  const v = profile.variants[variant];
  if (!v) {
    throw new Error(
      `Varian "${variant}" tidak ada di family "${profile.family}". Pilihan: ${Object.keys(profile.variants).join(', ')}`,
    );
  }
  const {label: _label, ...variantRules} = v;
  const genreRules = opts.genre ? profile.genres?.[opts.genre]?.color : undefined;
  if (opts.genre && !profile.genres?.[opts.genre]) {
    throw new Error(`Genre "${opts.genre}" tidak ada di family "${profile.family}". Pilihan: ${Object.keys(profile.genres ?? {}).join(', ') || '(tidak ada)'}`);
  }
  const rules: ColorRules = {...profile.color, ...variantRules, ...genreRules};
  if (opts.mode) rules.mode = opts.mode;
  return {rules, variant};
}

export function resolveTheme(profile: StyleProfile, opts: ResolveOptions = {}): Theme {
  const {rules, variant} = mergeRules(profile, opts);
  const {mode} = rules;
  const brand = opts.brand;
  const dark = mode === 'dark';

  // ---- seed aksen ------------------------------------------------------------
  const seedHex = opts.seed ?? brand?.accent ?? null;
  const primary = brand?.primary ? hexToOklch(brand.primary) : null;
  const seed = seedHex ? hexToOklch(seedHex) : null;
  const hue0 = seed ? seed.h : primary && !seed ? primary.h : rules.hue;

  // ---- netral (bg/surface/teks) ----------------------------------------------
  const nHue = primary ? primary.h : hue0;
  let bg: string, surface: string, surface2: string, border: string, text: string, muted: string;
  if (dark) {
    if (primary) {
      const L = clamp(primary.l, 0.14, 0.3);
      const c = Math.min(primary.c, 0.09);
      bg = lch(L, c, nHue);
      surface = lch(L + 0.045, c, nHue);
      surface2 = lch(L + 0.1, c * 0.95, nHue);
      border = lch(L + 0.18, c * 0.8, nHue);
      text = lch(0.97, 0.008, nHue);
      muted = lch(0.76, 0.03, nHue);
    } else {
      const c = 0.012 + 0.045 * rules.tint;
      bg = lch(0.17, c, nHue);
      surface = lch(0.215, c, nHue);
      surface2 = lch(0.265, c, nHue);
      border = lch(0.34, c * 0.9, nHue);
      text = lch(0.965, 0.006 + 0.01 * rules.tint, nHue);
      muted = lch(0.74, 0.02 + 0.03 * rules.tint, nHue);
    }
  } else {
    const c = primary ? Math.min(primary.c, 0.05) : 0.004 + 0.014 * rules.tint;
    bg = lch(0.985, c * 0.5, nHue);
    surface = '#FFFFFF';
    surface2 = lch(0.955, c, nHue);
    border = lch(0.885, c * 1.2, nHue);
    text = primary ? lch(Math.min(primary.l, 0.3), Math.min(primary.c, 0.09), nHue) : lch(0.22, 0.02 + 0.03 * rules.tint, nHue);
    muted = lch(0.5, 0.03 + 0.03 * rules.tint, nHue);
  }

  // ---- aksen -------------------------------------------------------------------
  let accent: string;
  let accentHue: number;
  if (brand?.accent && !opts.seed) {
    accent = brand.accent; // setia pada warna merek apa adanya
    accentHue = hexToOklch(accent).h;
  } else if (seed) {
    const L = dark ? clamp(seed.l, 0.62, 0.84) : clamp(seed.l, 0.4, 0.62);
    accent = lch(L, clamp(seed.c, CHROMA.low, CHROMA.high * 1.15), seed.h);
    accentHue = seed.h;
  } else {
    accent = lch(dark ? 0.74 : 0.52, CHROMA[rules.chroma], hue0);
    accentHue = hue0;
  }
  const a = hexToOklch(accent);
  const off = HARMONY_OFFSET[rules.harmony];
  const accent2 =
    rules.harmony === 'mono'
      ? lch(clamp(a.l + (dark ? 0.12 : -0.1), 0.2, 0.92), a.c * 0.7, a.h)
      : lch(a.l, a.c * 0.92, a.h + off);

  // ---- jaminan kontras ---------------------------------------------------------
  text = ensureContrast(text, bg, 7);
  muted = ensureContrast(muted, bg, 4.5);
  accent = ensureContrast(accent, bg, 3);
  const accent2Safe = ensureContrast(accent2, bg, 3);

  const sem = SEMANTIC[mode];
  const semantic = {
    success: ensureContrast(lch(...sem.success), surface, 3),
    warn: ensureContrast(lch(...sem.warn), surface, 3),
    danger: ensureContrast(lch(...sem.danger), surface, 3),
    info: ensureContrast(lch(...sem.info), surface, 3),
  };

  // ---- tipe, bentuk ------------------------------------------------------------
  const mkFont = (role: StyleProfile['type']['display'], override?: string) => ({
    family: role.locked ? role.family : (override ?? role.family),
    weight: role.weight,
    case: role.case ?? ('none' as const),
    tracking: role.tracking ?? 0,
    leading: role.leading ?? 1.2,
  });
  const radius = brand?.radius ?? profile.shape.radius;
  const shadow =
    profile.shape.shadow === 'none'
      ? 'none'
      : profile.shape.shadow === 'hard'
        ? `6px 6px 0 ${dark ? accent2Safe : text}`
        : dark
          ? '0 12px 32px rgba(0, 0, 0, 0.45)'
          : `0 10px 28px ${withAlpha(text, 0.14)}`;

  return {
    family: profile.family,
    variant,
    genre: opts.genre,
    mode,
    brand: brand?.name,
    accentHue,
    color: {
      bg,
      surface,
      surface2,
      border,
      text,
      muted,
      accent,
      accent2: accent2Safe,
      onAccent: onColor(accent),
      ...semantic,
      scrim: withAlpha(bg, 0.72),
    },
    type: {
      display: mkFont(profile.type.display, brand?.fonts?.display),
      body: mkFont(profile.type.body, brand?.fonts?.body),
      strong: profile.type.strong,
      mono: mkFont(profile.type.mono ?? {family: 'JetBrains Mono', weight: 500}, brand?.fonts?.mono),
    },
    shape: {
      radius,
      radiusSm: Math.max(2, Math.round(radius * 0.5)),
      radiusLg: Math.round(radius * 1.6),
      stroke: profile.shape.stroke,
      shadow,
    },
    motion: profile.motion,
    background: profile.background,
    logo: brand?.logo,
  };
}
