import type {StyleProfile} from '../types.ts';
import {ads} from './ads.ts';
import {corporate} from './corporate.ts';
import {motionGraphic} from './motion-graphic.ts';
import {qa} from './qa.ts';

/** Fase 1: empat family. Family lain menyusul (lihat docs/style-system.md, fase 3). */
export const PROFILES: Record<string, StyleProfile> = {
  qa,
  ads,
  corporate,
  'motion-graphic': motionGraphic,
};

export function getProfile(family: string): StyleProfile {
  const p = PROFILES[family];
  if (!p) throw new Error(`Family "${family}" belum punya style profile. Tersedia: ${Object.keys(PROFILES).join(', ')}`);
  return p;
}
