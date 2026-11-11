/**
 * Jaga salinan skill tetap sama di semua lokasi yang dibaca agen.
 *
 *   .agents/skills/  = SUMBER (dibaca Antigravity dan OpenCode)
 *   .claude/skills/  = salinan (dibaca Claude Code; OpenCode juga membacanya)
 *
 *   npm run skills:sync     salin dari .agents/skills ke .claude/skills
 *   npm run skills:check    gagal (exit 1) bila ada perbedaan, dipakai sebelum commit
 *
 * Edit skill HANYA di .agents/skills lalu jalankan skills:sync.
 */
import {cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync} from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, '.agents', 'skills');
const DST = path.join(ROOT, '.claude', 'skills');
const check = process.argv.includes('--check');

if (!existsSync(SRC)) {
  console.error('.agents/skills tidak ada');
  process.exit(1);
}

const files = (dir, base = dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = path.join(dir, n);
    return statSync(p).isDirectory() ? files(p, base) : [path.relative(base, p)];
  });

const srcFiles = files(SRC);
const dstFiles = existsSync(DST) ? files(DST) : [];
const diffs = [];
for (const f of srcFiles) {
  const d = path.join(DST, f);
  if (!existsSync(d)) diffs.push(`hilang di .claude: ${f}`);
  else if (!readFileSync(path.join(SRC, f)).equals(readFileSync(d))) diffs.push(`berbeda: ${f}`);
}
for (const f of dstFiles) if (!srcFiles.includes(f)) diffs.push(`berlebih di .claude (tidak ada di sumber): ${f}`);

if (check) {
  if (diffs.length) {
    console.error(`skill tidak sinkron (${diffs.length}):\n  - ${diffs.join('\n  - ')}\nJalankan: npm run skills:sync`);
    process.exit(1);
  }
  console.log(`skill sinkron: ${srcFiles.length} file`);
  process.exit(0);
}

if (existsSync(DST)) rmSync(DST, {recursive: true, force: true});
mkdirSync(path.dirname(DST), {recursive: true});
cpSync(SRC, DST, {recursive: true});
console.log(`disalin ${srcFiles.length} file: .agents/skills -> .claude/skills${diffs.length ? ` (${diffs.length} perbedaan diperbaiki)` : ''}`);
