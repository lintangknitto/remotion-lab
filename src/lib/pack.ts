import packsJson from '../packs/index.generated.json';
import {assetSrc} from './assets';

export type PackDefaults = {
  aspect: string;
  fps: number;
  cutFrames: [number, number];
  duration: [number, number];
};

export type Pack = {
  id: string;
  family: string;
  genre: string;
  label: string;
  extends: string;
  defaults: PackDefaults;
  slots: Record<string, string[]>;
  missing: string[];
  required: string[];
};

const registry = packsJson as unknown as Record<string, Pack>;
const byGenre = new Map<string, Pack>();
for (const pack of Object.values(registry)) {
  if (!byGenre.has(pack.genre)) byGenre.set(pack.genre, pack);
}

/**
 * Resolve a pack by "family/genre" or by a bare genre slug.
 * Throws with a helpful list instead of returning undefined at render time.
 */
export function getPack(idOrGenre: string): Pack {
  const pack = registry[idOrGenre] ?? byGenre.get(idOrGenre);
  if (!pack) {
    const known = Object.keys(registry).join(', ');
    throw new Error(`Unknown pack "${idOrGenre}". Known packs: ${known}`);
  }
  return pack;
}

export function listPacks(): Pack[] {
  return Object.values(registry);
}

export function listFamilies(): string[] {
  return [...new Set(Object.values(registry).map((p) => p.family))];
}

/** Deterministic integer hash so frame-parallel renders never disagree. */
function hash(seed: number): number {
  let x = seed | 0;
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  return Math.abs(x ^ (x >>> 16));
}

export type BoundPack = {
  pack: Pack;
  /** All asset ids in a slot. */
  all: (slot: string) => string[];
  /** First asset id in a slot. */
  id: (slot: string) => string;
  /** Same as id(), but already resolved to a staticFile URL. */
  src: (slot: string) => string;
  /** Deterministic pick from a slot, driven by a seed (usually the frame). */
  pick: (slot: string, seed: number) => string;
  pickSrc: (slot: string, seed: number) => string;
  has: (slot: string) => boolean;
};

/** Bind a pack once, then read slots without repeating the id. */
export function bindPack(idOrGenre: string): BoundPack {
  const pack = getPack(idOrGenre);

  const all = (slot: string) => pack.slots[slot] ?? [];
  const id = (slot: string) => {
    const list = all(slot);
    if (list.length === 0) throw new Error(`Pack "${pack.id}" has no asset in slot "${slot}"`);
    return list[0];
  };
  const pick = (slot: string, seed: number) => {
    const list = all(slot);
    if (list.length === 0) throw new Error(`Pack "${pack.id}" has no asset in slot "${slot}"`);
    return list[hash(seed) % list.length];
  };

  return {
    pack,
    all,
    id,
    src: (slot) => assetSrc(id(slot)),
    pick,
    pickSrc: (slot, seed) => assetSrc(pick(slot, seed)),
    has: (slot) => all(slot).length > 0,
  };
}
