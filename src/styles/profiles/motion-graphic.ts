import type {StyleProfile} from '../types.ts';

/**
 * Motion graphic: bersih dan edukatif. Blok warna datar, komplementer seimbang,
 * sans geometris, sudut membulat besar, gerak ease-out-expo berurutan (stagger).
 */
export const motionGraphic: StyleProfile = {
  family: 'motion-graphic',
  label: 'Motion graphic',
  mood: 'bersih, edukatif, ringan',
  color: {mode: 'light', hue: 160, harmony: 'complementary', chroma: 'mid', tint: 0.35},
  variants: {
    bright: {label: 'Terang (default)'},
    night: {label: 'Malam', mode: 'dark', tint: 0.5},
    pop: {label: 'Pop', chroma: 'high', harmony: 'triad'},
  },
  defaultVariant: 'bright',
  genres: {
    explainer: {label: 'Explainer'},
    'kinetic-typography': {label: 'Kinetic typography', color: {chroma: 'high'}},
    'lyric-video': {label: 'Lyric video', color: {mode: 'dark'}},
    'data-viz': {label: 'Data viz', color: {chroma: 'low', harmony: 'analogous'}},
    tutorial: {label: 'Tutorial'},
    infographic: {label: 'Infographic'},
    'wedding-invitation': {label: 'Wedding invitation', color: {hue: 20, chroma: 'low', harmony: 'analogous'}},
  },
  type: {
    display: {family: 'Poppins', weight: 800, tracking: -0.02, leading: 1.05},
    body: {family: 'Poppins', weight: 500, leading: 1.4},
    strong: 700,
  },
  shape: {radius: 20, stroke: 0, shadow: 'soft'},
  motion: {ease: 'out-expo', damping: 18, enter: 14, stagger: 4},
  background: {recipe: 'flat', grain: 0.03, vignette: 0},
};
