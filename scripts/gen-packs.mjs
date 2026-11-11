/**
 * Generate pack files from scripts/catalog.mjs.
 *
 *   node scripts/gen-packs.mjs
 *
 * Writes:
 *   src/packs/<family>/_shared.json      shared slots for the family
 *   src/packs/<family>/<genre>.json      genre-specific slots + defaults
 *   src/packs/index.generated.json       merged view used at runtime
 *   src/registry/catalog.generated.json  families + genres for UI/registry
 *
 * Genres never own binary files. They only reference asset ids that exist in
 * src/library/index.generated.json, which is why one texture can serve 40 packs.
 */

import {readFile, writeFile, mkdir, rm} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {FAMILIES, SLOT_KEYS} from './catalog.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const PACKS = path.join(ROOT, 'src', 'packs');
const LIB_INDEX = path.join(ROOT, 'src', 'library', 'index.generated.json');

const ASPECTS = new Set(['9:16', '16:9', '1:1', '4:5']);

const lib = JSON.parse(await readFile(LIB_INDEX, 'utf8'));
const known = new Map(lib.assets.map((a) => [a.id, a]));

const errors = [];
const seenGenres = new Map();

function checkId(id, where) {
  if (!known.has(id)) errors.push(`${where}: unknown asset id "${id}"`);
  return id;
}

function mergeSlots(shared = {}, own = {}) {
  const out = {};
  for (const key of new Set([...Object.keys(shared), ...Object.keys(own)])) {
    const list = [...(shared[key] ?? []), ...(own[key] ?? [])];
    out[key] = [...new Set(list)];
  }
  return out;
}

function checkSlots(slots, where) {
  for (const [slot, ids] of Object.entries(slots)) {
    if (!SLOT_KEYS.includes(slot)) errors.push(`${where}: unknown slot "${slot}"`);
    if (!Array.isArray(ids)) errors.push(`${where}.${slot}: must be an array`);
    else ids.forEach((id) => checkId(id, `${where}.${slot}`));
  }
}

function checkDefaults(d, where) {
  if (d.aspect && !ASPECTS.has(d.aspect)) errors.push(`${where}: bad aspect "${d.aspect}"`);
  if (typeof d.fps !== 'number') errors.push(`${where}: fps must be a number`);
  if (!Array.isArray(d.cutFrames) || d.cutFrames.length !== 2)
    errors.push(`${where}: cutFrames must be [min, max]`);
  if (!Array.isArray(d.duration) || d.duration.length !== 2)
    errors.push(`${where}: duration must be [min, max] seconds`);
}

const familyOut = [];
const mergedPacks = {};

for (const [familyId, family] of Object.entries(FAMILIES)) {
  const familyDir = path.join(PACKS, familyId);
  await rm(familyDir, {recursive: true, force: true});
  await mkdir(familyDir, {recursive: true});

  const shared = family.shared ?? {};
  checkSlots(shared, `${familyId}/_shared`);

  await writeFile(
    path.join(familyDir, '_shared.json'),
    JSON.stringify(
      {id: `${familyId}/_shared`, family: familyId, label: `${family.label} (shared)`, slots: shared},
      null,
      2,
    ) + '\n',
  );

  const genresOut = [];

  for (const [genreId, genre] of Object.entries(family.genres)) {
    const key = `${familyId}/${genreId}`;
    if (seenGenres.has(genreId)) {
      errors.push(`genre "${genreId}" appears in ${seenGenres.get(genreId)} and ${familyId}`);
    }
    seenGenres.set(genreId, familyId);

    const where = key;
    checkDefaults(genre.defaults, where);
    checkSlots(genre.slots ?? {}, where);

    const pack = {
      id: key,
      family: familyId,
      genre: genreId,
      label: genre.label,
      extends: '_shared',
      defaults: genre.defaults,
      slots: genre.slots ?? {},
      missing: genre.missing ?? [],
    };

    await writeFile(path.join(familyDir, `${genreId}.json`), JSON.stringify(pack, null, 2) + '\n');

    mergedPacks[key] = {
      ...pack,
      required: family.required ?? [],
      slotNames: SLOT_KEYS,
      slots: mergeSlots(shared, pack.slots),
    };

    genresOut.push({
      id: genreId,
      packId: key,
      label: genre.label,
      defaults: genre.defaults,
      missing: genre.missing ?? [],
    });
  }

  familyOut.push({
    id: familyId,
    label: family.label,
    required: family.required ?? [],
    sharedSlots: Object.keys(shared),
    genres: genresOut,
  });
}

if (errors.length) {
  console.error(`${errors.length} catalog error(s):`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}

await writeFile(path.join(PACKS, 'index.generated.json'), JSON.stringify(mergedPacks, null, 2) + '\n');

const registry = {
  generatedAt: new Date().toISOString(),
  stats: {
    families: familyOut.length,
    genres: familyOut.reduce((a, f) => a + f.genres.length, 0),
    referencedAssets: new Set(
      Object.values(mergedPacks).flatMap((p) => Object.values(p.slots).flat()),
    ).size,
  },
  families: familyOut,
};
await mkdir(path.join(ROOT, 'src', 'registry'), {recursive: true});
await writeFile(
  path.join(ROOT, 'src', 'registry', 'catalog.generated.json'),
  JSON.stringify(registry, null, 2) + '\n',
);

console.log(
  `packed ${registry.stats.genres} genres in ${registry.stats.families} families, ` +
    `referencing ${registry.stats.referencedAssets}/${known.size} library assets`,
);
console.log('wrote src/packs/** and src/packs/index.generated.json');
console.log('wrote src/registry/catalog.generated.json');
