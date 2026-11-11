import type {InterpolateOptions} from 'remotion';

export const CLAMP = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const satisfies InterpolateOptions;

/** Deterministic integer hash: same frame -> same jitter, every render. */
export function hash(n: number): number {
  let x = n | 0;
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  return Math.abs(x ^ (x >>> 16));
}

/** -1..1 noise from a frame number. */
export function jitter(frame: number, channel = 0): number {
  return ((hash(frame * 7919 + channel * 104729) % 2001) - 1000) / 1000;
}
