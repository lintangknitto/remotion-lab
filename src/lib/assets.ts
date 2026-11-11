import {staticFile} from 'remotion';
import index from '../library/index.generated.json';
import type {AssetId} from '../library/ids';

export type AssetMeta = {
  id: string;
  type: string;
  sub: string;
  path: string;
  ext: string;
  bytes: number;
  sha256: string;
  width?: number;
  height?: number;
  durationSec?: number | null;
};

const assets = index.assets as AssetMeta[];
const byId = new Map<string, AssetMeta>(assets.map((a) => [a.id, a]));

/** Metadata for one asset, or a loud error listing what is close. */
export function assetMeta(id: AssetId | string): AssetMeta {
  const meta = byId.get(id);
  if (!meta) {
    const hint = assets
      .filter((a) => a.type === id.split('.')[0])
      .slice(0, 6)
      .map((a) => a.id)
      .join(', ');
    throw new Error(`Unknown asset "${id}". Try: ${hint || '(no assets of that type)'}`);
  }
  return meta;
}

/** Path relative to public/, e.g. "library/sfx/sfx.impact.heavy-01.wav". */
export function assetPath(id: AssetId | string): string {
  return assetMeta(id).path;
}

/** Ready-to-use URL for <Img>, <Audio>, backgroundImage, etc. */
export function assetSrc(id: AssetId | string): string {
  return staticFile(assetPath(id));
}

export function assetIds(type?: string): string[] {
  return assets.filter((a) => !type || a.type === type).map((a) => a.id);
}

export const LIBRARY = {
  count: index.count,
  totalBytes: index.totalBytes,
  byType: index.byType as Record<string, number>,
  generatedAt: index.generatedAt,
};
