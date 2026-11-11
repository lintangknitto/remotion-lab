import type {StyleProfile} from '../types.ts';

/**
 * Ads: konversi. Kontras tinggi, tipografi tebal uppercase, bayangan keras,
 * gerak snappy memantul. CTA harus paling mencolok di layar.
 */
export const ads: StyleProfile = {
  family: 'ads',
  label: 'Ads',
  mood: 'konversi, tegas, mencolok',
  color: {mode: 'dark', hue: 45, harmony: 'complementary', chroma: 'high', tint: 0.5},
  variants: {
    punchy: {label: 'Punchy (gelap, jenuh)'},
    clean: {label: 'Clean (terang)', mode: 'light', chroma: 'mid', tint: 0.3},
    luxury: {label: 'Luxury (gelap, emas)', hue: 85, harmony: 'analogous', chroma: 'low', tint: 0.35},
  },
  defaultVariant: 'punchy',
  genres: {
    iklan: {label: 'Iklan'},
    'product-demo': {label: 'Product demo', color: {mode: 'light', chroma: 'mid'}},
    'before-after': {label: 'Before / after'},
    'live-shop-recap': {label: 'Live shop recap'},
    'ugc-ad': {label: 'UGC ad'},
    'sizzle-reel': {label: 'Sizzle reel'},
  },
  type: {
    display: {family: 'Archivo', weight: 900, case: 'upper', tracking: -0.01, leading: 1.02},
    body: {family: 'Archivo', weight: 500, leading: 1.3},
    strong: 800,
  },
  shape: {radius: 14, stroke: 0, shadow: 'hard'},
  motion: {ease: 'out-cubic', damping: 12, enter: 10, stagger: 3},
  background: {recipe: 'spotlight', grain: 0.07, vignette: 0.35},
};
