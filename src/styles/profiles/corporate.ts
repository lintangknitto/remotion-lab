import type {StyleProfile} from '../types.ts';

/**
 * Corporate: tepercaya dan tenang. Kroma rendah, serif untuk judul + sans
 * humanis untuk isi, sudut hampir tajam, tanpa bayangan, gerak lambat.
 */
export const corporate: StyleProfile = {
  family: 'corporate',
  label: 'Corporate',
  mood: 'tepercaya, tenang, rapi',
  color: {mode: 'light', hue: 255, harmony: 'analogous', chroma: 'low', tint: 0.6},
  variants: {
    light: {label: 'Terang (default)'},
    navy: {label: 'Navy (gelap)', mode: 'dark', tint: 0.8},
    warm: {label: 'Hangat', hue: 60, chroma: 'low', tint: 0.5},
  },
  defaultVariant: 'light',
  genres: {
    'company-profile': {label: 'Company profile'},
    testimonial: {label: 'Testimonial', color: {chroma: 'low', tint: 0.4}},
    recruitment: {label: 'Recruitment', color: {chroma: 'mid'}},
    'event-recap': {label: 'Event recap', color: {mode: 'dark'}},
    'internal-comms': {label: 'Internal comms'},
  },
  type: {
    // locked: serif adalah identitas corporate; brand hanya mengganti font isi (body)
    display: {family: 'IBM Plex Serif', weight: 600, leading: 1.15, locked: true},
    body: {family: 'IBM Plex Sans', weight: 400, leading: 1.45},
    strong: 600,
  },
  shape: {radius: 4, stroke: 1, shadow: 'none'},
  motion: {ease: 'out-expo', damping: 200, enter: 24, stagger: 6},
  background: {recipe: 'paper', grain: 0.05, vignette: 0.1},
};
