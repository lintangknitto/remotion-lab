import type {StyleProfile} from '../types.ts';

/**
 * QA: presisi dan bukti. Netral supaya tidak bersaing dengan app yang direkam;
 * hanya satu aksen (cyan, mirip "inspect element") + warna semantik terkunci
 * (merah gagal, hijau lulus, amber peringatan). Gerak minimal.
 */
export const qa: StyleProfile = {
  family: 'qa',
  label: 'QA',
  mood: 'presisi, netral, bukti',
  color: {mode: 'dark', hue: 215, harmony: 'mono', chroma: 'mid', tint: 0.25},
  variants: {
    dark: {label: 'Gelap (default)'},
    light: {label: 'Terang', mode: 'light'},
    contrast: {label: 'Kontras tinggi', chroma: 'high', tint: 0.1},
  },
  defaultVariant: 'dark',
  genres: {
    'bug-report': {label: 'Bug report'},
    'fix-verification': {label: 'Fix verification'},
    'uat-walkthrough': {label: 'UAT walkthrough', color: {mode: 'light'}},
    'test-run-recap': {label: 'Test run recap', color: {mode: 'light'}},
    'design-review': {label: 'Design review', color: {mode: 'light', chroma: 'low'}},
  },
  type: {
    display: {family: 'Inter', weight: 700, tracking: -0.01, leading: 1.15},
    body: {family: 'Inter', weight: 400, leading: 1.4},
    strong: 600,
    mono: {family: 'JetBrains Mono', weight: 500},
  },
  shape: {radius: 8, stroke: 3, shadow: 'soft'},
  motion: {ease: 'out-cubic', damping: 200, enter: 8, stagger: 3},
  background: {recipe: 'grid', grain: 0.04, vignette: 0.25},
};
