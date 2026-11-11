/**
 * Matematika warna untuk style system: sRGB <-> OKLab/OKLCH, kontras WCAG,
 * dan pemaksaan kontras. Murni fungsi (tanpa React/Remotion) supaya bisa
 * dijalankan Node langsung oleh scripts/check-style.mjs.
 *
 * OKLCH dipilih karena perseptual: dua warna dengan L sama terlihat sama terang
 * walau hue-nya beda, jadi tema hasil turunan tetap seimbang.
 *   L  0..1   terang
 *   C  0..~.37 kroma (kejenuhan)
 *   h  0..360  hue: merah 25, oranye 55, kuning 100, hijau 145, teal 190,
 *                   cyan 215, biru 255, violet 290, magenta 330
 */

export type Oklch = {l: number; c: number; h: number};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const mod360 = (h: number) => ((h % 360) + 360) % 360;

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c: number) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const f = h.length === 3 ? h.split('').map((x) => x + x).join('') : h;
  const n = parseInt(f.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const p = (v: number) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
  return `#${p(r)}${p(g)}${p(b)}`;
}

export function hexToOklch(hex: string): Oklch {
  const [r8, g8, b8] = hexToRgb(hex);
  const r = toLinear(r8 / 255);
  const g = toLinear(g8 / 255);
  const b = toLinear(b8 / 255);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const c = Math.hypot(A, B);
  return {l: L, c, h: c < 1e-4 ? 0 : mod360((Math.atan2(B, A) * 180) / Math.PI)};
}

function oklchToLinear(l: number, c: number, h: number): [number, number, number] {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
}

/** OKLCH -> hex. Kalau di luar gamut sRGB, kroma diturunkan (bukan dipotong) agar hue tetap benar. */
export function oklchToHex(l: number, c: number, h: number): string {
  const L = clamp(l, 0, 1);
  let C = Math.max(0, c);
  for (let i = 0; i < 80; i++) {
    const [r, g, b] = oklchToLinear(L, C, h);
    if ([r, g, b].every((v) => v >= -0.0005 && v <= 1.0005)) {
      return rgbToHex(fromLinear(clamp(r, 0, 1)) * 255, fromLinear(clamp(g, 0, 1)) * 255, fromLinear(clamp(b, 0, 1)) * 255);
    }
    C -= 0.004;
    if (C <= 0) break;
  }
  const [r, g, b] = oklchToLinear(L, 0, h);
  return rgbToHex(fromLinear(clamp(r, 0, 1)) * 255, fromLinear(clamp(g, 0, 1)) * 255, fromLinear(clamp(b, 0, 1)) * 255);
}

export const lch = (l: number, c: number, h: number) => oklchToHex(l, c, mod360(h));

/** Luminans relatif WCAG 2.x. */
export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => toLinear(v / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Rasio kontras WCAG (1..21). */
export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Geser lightness `fg` (hue & kroma dijaga) sampai kontras terhadap `bg` >= min.
 * Arah mengikuti latar: latar gelap -> terangkan, latar terang -> gelapkan.
 */
export function ensureContrast(fg: string, bg: string, min: number): string {
  if (contrast(fg, bg) >= min) return fg;
  const {l, c, h} = hexToOklch(fg);
  const lighten = luminance(bg) < 0.4;
  let L = l;
  for (let i = 0; i < 100; i++) {
    L += lighten ? 0.01 : -0.01;
    const next = oklchToHex(L, c, h);
    if (contrast(next, bg) >= min) return next;
    if (L <= 0 || L >= 1) break;
  }
  return lighten ? '#FFFFFF' : '#000000';
}

/**
 * Warna teks di atas `bg`. Putih diutamakan bila kontrasnya >= 3.5 (konvensi
 * tombol/badge: putih di atas warna aksen; teks besar tebal cukup 3.0 menurut WCAG),
 * supaya blok aksen dan aksen2 konsisten; selain itu pilih yang paling terbaca.
 */
export function onColor(bg: string): string {
  const white = contrast('#FFFFFF', bg);
  const black = contrast('#0A0A0A', bg);
  if (white >= 3.5) return '#FFFFFF';
  return white >= black ? '#FFFFFF' : '#0A0A0A';
}

export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Jarak hue melingkar (0..180). */
export const hueDistance = (a: number, b: number) => {
  const d = Math.abs(mod360(a) - mod360(b));
  return d > 180 ? 360 - d : d;
};
