/**
 * Bakar anotasi QA ke video (lewat Remotion, bukan ffmpeg sistem) + ekspor frame PNG.
 *
 *   node scripts/annotate.mjs --in out/qa/demo.mp4 --ann out/qa/demo.annotations.json
 *   node scripts/annotate.mjs --in out/qa/demo.mp4 --ann a.json --frames 45,90
 *
 * Format annotations.json (koordinat PIKSEL pada kanvas 1920x1080; gaya dari tema family `qa`):
 *   {"variant":"dark", "items": [
 *     {"type":"box",       "from":1, "to":3, "x":60, "y":344, "w":213, "h":81, "tone":"danger", "label":"BUG", "labelAt":"top|bottom", "kind":"box|circle|spotlight"},
 *     {"type":"caption",   "from":0.5,"to":2.3, "x":60, "y":497, "text":"Tombol tidak merespons"},
 *     {"type":"mention",   "from":0.5,"to":2.3, "x":1152, "y":86, "text":"@david"},
 *     {"type":"step",      "from":0,"to":4, "x":60, "y":60, "step":3, "total":7, "title":"Klik Masuk"},
 *     {"type":"severity",  "from":0,"to":4, "x":60, "y":170, "level":"P1"},
 *     {"type":"status",    "from":2,"to":4, "x":60, "y":240, "status":"fail"},
 *     {"type":"timestamp", "from":0,"to":4, "x":300, "y":170, "seconds":4.2},
 *     {"type":"redline",   "from":1,"to":3, "x1":100,"y1":400, "x2":100,"y2":466, "label":"66 px"}
 *   ]}
 * tone: accent|danger|warn|success|info. Semua x/y/w/h = piksel frame referensi 1920x1080.
 * from/to dalam detik. Dipreview & disesuaikan di Remotion Studio: npm run studio -> QaAnnotate.
 *
 *   --dry   hanya tulis props dan validasi, tidak render (dipakai sebelum Studio)
 *
 * Output: out/qa/<nama>.annotated.mp4 dan out/qa/<nama>.frame-<frame>.png
 */

import {execFileSync} from 'node:child_process';
import {copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {ffprobePath} from './lib/bin.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const get = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : fallback;
};

const input = get('--in');
const annPath = get('--ann');
if (!input || !annPath) {
  console.error('usage: node scripts/annotate.mjs --in <video.mp4> --ann <annotations.json> [--frames 45,90]');
  process.exit(1);
}

const inAbs = path.resolve(ROOT, input);
const annAbs = path.resolve(ROOT, annPath);
if (!existsSync(inAbs)) throw new Error(`video tidak ada: ${input}`);
if (!existsSync(annAbs)) throw new Error(`anotasi tidak ada: ${annPath}`);

const ann = JSON.parse(readFileSync(annAbs, 'utf8'));
if (!Array.isArray(ann.items)) throw new Error('annotations.json butuh field "items" berupa array');

// Validasi koordinat SEBELUM apa pun dirender: piksel harus di dalam kanvas 1920x1080.
const REF_W = 1920, REF_H = 1080;
const TYPES = {
  box: ['x', 'y', 'w', 'h'],
  caption: ['x', 'y', 'text'],
  mention: ['x', 'y', 'text'],
  step: ['x', 'y', 'step', 'total', 'title'],
  severity: ['x', 'y', 'level'],
  status: ['x', 'y', 'status'],
  timestamp: ['x', 'y'],
  redline: ['x1', 'y1', 'x2', 'y2'],
};
const TONES = ['accent', 'danger', 'warn', 'success', 'info'];
const isX = (k) => k === 'x' || k === 'w' || k === 'x1' || k === 'x2';
for (const [i, it] of ann.items.entries()) {
  const need = TYPES[it.type];
  if (!need) throw new Error(`item ${i}: tipe "${it.type}" tidak dikenal. Pilihan: ${Object.keys(TYPES).join(', ')}`);
  if (!(it.to > it.from)) throw new Error(`item ${i}: "to" harus > "from"`);
  for (const k of need) if (it[k] === undefined) throw new Error(`item ${i} (${it.type}): field "${k}" wajib`);
  if (it.tone && !TONES.includes(it.tone)) throw new Error(`item ${i}: tone "${it.tone}" tidak dikenal. Pilihan: ${TONES.join(', ')}`);
  if (it.type === 'timestamp' && it.seconds === undefined && it.text === undefined) throw new Error(`item ${i}: timestamp butuh "seconds" atau "text"`);
  // koordinat piksel: di dalam kanvas, dan bukan pecahan (0 < v < 1 = tanda fraksi)
  for (const k of ['x', 'y', 'w', 'h', 'x1', 'y1', 'x2', 'y2']) {
    const v = it[k];
    if (typeof v !== 'number') continue;
    if (v < 0 || v > (isX(k) ? REF_W : REF_H)) throw new Error(`item ${i}: ${k}=${v} di luar kanvas 1920x1080`);
    if (v > 0 && v < 1) {
      throw new Error(`item ${i}: ${k}=${v} terlihat seperti fraksi. Gunakan piksel 1920x1080 (mis. ${k}=${Math.round(v * (isX(k) ? REF_W : REF_H))})`);
    }
  }
  if (it.type === 'box' && (it.w <= 0 || it.h <= 0)) throw new Error(`item ${i}: w/h harus > 0`);
}

if (args.includes('--dry')) {
  console.log(`props valid: ${ann.items.length} item. Buka Studio: npm run studio -> QaAnnotate`);
  process.exit(0);
}

const base = path.basename(inAbs).replace(/\.[^.]+$/, '');
const outDir = path.join(ROOT, 'out', 'qa');
mkdirSync(outDir, {recursive: true});
const outVideo = path.join(outDir, `${base}.annotated.mp4`);

// Remotion men-serve public/, jadi video sumber disalin ke sana (ditimpa tiap bake).
const publicQa = path.join(ROOT, 'public', 'qa');
mkdirSync(publicQa, {recursive: true});
const staged = `${base}.src.mp4`;
copyFileSync(inAbs, path.join(publicQa, staged));

const props = {videoSrc: `qa/${staged}`, items: ann.items, variant: ann.variant ?? 'dark'};
const propsFile = path.join(outDir, `${base}.props.json`);
writeFileSync(propsFile, JSON.stringify(props, null, 2));

const cli = path.join(ROOT, 'node_modules', '@remotion', 'cli', 'remotion-cli.js');
const remotion = (cmdArgs) => execFileSync(process.execPath, [cli, ...cmdArgs], {stdio: 'inherit', cwd: ROOT});

// Durasi: dibaca dari video sumber dengan ffprobe bawaan compositor Remotion,
// lalu dimasukkan ke props.durationSec agar calculateMetadata di Root.tsx menyesuaikan durasi.
const probe = execFileSync(
  ffprobePath(ROOT),
  ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', path.join(publicQa, staged)],
  {encoding: 'utf8'},
);
props.durationSec = Number(probe.trim());
writeFileSync(propsFile, JSON.stringify(props, null, 2));

remotion(['render', 'src/index.ts', 'QaAnnotate', outVideo, `--props=${propsFile}`, '--log=error']);
console.log(`dibakar: ${path.relative(ROOT, outVideo)}  (${ann.items.length} anotasi)`);

const frames = (get('--frames', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
for (const f of frames) {
  const png = path.join(outDir, `${base}.frame-${f}.png`);
  remotion(['still', 'src/index.ts', 'QaAnnotate', png, `--props=${propsFile}`, `--frame=${f}`, '--log=error']);
  console.log(`frame: ${path.relative(ROOT, png)}`);
}
