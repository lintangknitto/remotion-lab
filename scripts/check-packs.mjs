/**
 * Audit every pack: dangling references, empty slots, missing material.
 *
 *   node scripts/check-packs.mjs          # summary
 *   node scripts/check-packs.mjs --all    # list every pack
 *
 * Exit code 1 if a pack references an asset id that is not in the library.
 */

import {readFile} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.resolve(import.meta.dirname, '..');
const packs = JSON.parse(await readFile(path.join(ROOT, 'src', 'packs', 'index.generated.json'), 'utf8'));
const lib = JSON.parse(await readFile(path.join(ROOT, 'src', 'library', 'index.generated.json'), 'utf8'));
const known = new Set(lib.assets.map((a) => a.id));

const all = process.argv.includes('--all');
const dangling = [];
const rows = new Map();

for (const [id, pack] of Object.entries(packs)) {
  const refs = Object.values(pack.slots).flat();
  for (const ref of refs) if (!known.has(ref)) dangling.push(`${id} -> ${ref}`);

  const filled = Object.entries(pack.slots).filter(([, v]) => v.length > 0).map(([k]) => k);
  const emptyRequired = pack.required.filter((k) => !(pack.slots[k]?.length > 0));
  const total = refs.length;
  const status = total === 0 ? 'empty' : emptyRequired.length === 0 && total >= 6 ? 'ready' : 'partial';

  const fam = rows.get(pack.family) ?? {ready: 0, partial: 0, empty: 0, packs: []};
  fam[status] += 1;
  fam.packs.push({id, label: pack.label, status, filled, emptyRequired, total, missing: pack.missing});
  rows.set(pack.family, fam);
}

const ICON = {ready: 'OK  ', partial: '~   ', empty: '.   '};

for (const [family, fam] of rows) {
  console.log(
    `\n${family.padEnd(16)} ${String(fam.packs.length).padStart(2)} pack   ` +
      `ready ${fam.ready}  partial ${fam.partial}  empty ${fam.empty}`,
  );
  if (all) {
    for (const p of fam.packs) {
      const miss = p.emptyRequired.length ? `  kurang: ${p.emptyRequired.join(',')}` : '';
      const note = p.missing.length ? `  catatan: ${p.missing.length}` : '';
      console.log(`  ${ICON[p.status]}${p.id.padEnd(30)} ${String(p.total).padStart(2)} aset${miss}${note}`);
    }
  }
}

const totals = {ready: 0, partial: 0, empty: 0};
for (const fam of rows.values()) for (const k of Object.keys(totals)) totals[k] += fam[k];

console.log(
  `\ntotal: ${Object.keys(packs).length} pack  ready ${totals.ready}  partial ${totals.partial}  empty ${totals.empty}`,
);
console.log(`library: ${lib.count} aset, ${(lib.totalBytes / 1024 / 1024).toFixed(1)} MB`);
const notes = Object.values(packs).reduce((a, p) => a + p.missing.length, 0);
console.log(`catatan material belum ada: ${notes} item (jalankan --all untuk detail)`);

if (dangling.length) {
  console.error(`\n${dangling.length} referensi rusak:`);
  for (const d of dangling) console.error('  - ' + d);
  process.exit(1);
}
console.log('semua referensi valid');
