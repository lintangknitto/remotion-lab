/**
 * Rekam halaman web lewat Playwright lalu konversi ke MP4.
 *
 *   node scripts/record.mjs --url http://localhost:3000 --out out/record/demo.mp4
 *   node scripts/record.mjs --url https://example.com --as asset --name video.web.example-01
 *
 * Output:
 *   --as raw    (default)  out/record/<name>.mp4
 *   --as asset             public/library/video/<name>.mp4  (id = nama file tanpa ext)
 *   --as qa                out/qa/<name>.mp4
 *
 * Langkah (--steps, opsional): file JSON berisi array aksi, contoh:
 *   [{"action":"goto","url":"..."},{"action":"click","selector":"button"},
 *    {"action":"wait","ms":800},{"action":"fill","selector":"input","value":"x"}]
 */

import {chromium} from 'playwright';
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, readdirSync} from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {ffmpegPath} from './lib/bin.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const get = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : fallback;
};

const url = get('--url');
if (!url) {
  console.error('usage: node scripts/record.mjs --url <url> [--out file] [--as raw|asset|qa] [--name id] [--steps file.json] [--width 1920] [--height 1080] [--duration 0]');
  process.exit(1);
}

const as = get('--as', 'raw');
const name = get('--name', `record-${Date.now()}`);
const width = Number(get('--width', '1920'));
const height = Number(get('--height', '1080'));
const extraMs = Number(get('--duration', '0'));
const stepsFile = get('--steps');

const destDir =
  as === 'asset' ? path.join(ROOT, 'public', 'library', 'video')
  : as === 'qa' ? path.join(ROOT, 'out', 'qa')
  : path.join(ROOT, 'out', 'record');
const outFile = get('--out', path.join(destDir, `${name}.mp4`));
const absOut = path.resolve(ROOT, outFile);

// Playwright menulis .webm ke folder ini; kita pindahkan setelah konversi.
const rawDir = path.join(ROOT, 'tmp', `rec-${Date.now()}`);
mkdirSync(rawDir, {recursive: true});
mkdirSync(path.dirname(absOut), {recursive: true});

const steps = stepsFile ? JSON.parse(readFileSync(path.resolve(ROOT, stepsFile), 'utf8')) : [];

const browser = await chromium.launch({headless: true});
const context = await browser.newContext({
  viewport: {width, height},
  recordVideo: {dir: rawDir, size: {width, height}},
});
const page = await context.newPage();

// Rekaman Playwright mulai saat halaman dibuat, jadi detik memuat halaman ikut terekam
// sebagai layar putih. Waktu muat diukur lalu dipotong dari awal video (kecuali --keep-load).
const t0 = Date.now();
let loadSec = 0;
/** Catatan waktu tiap langkah; ditulis sebagai <video>.timeline.json (waktu relatif ke video hasil potong). */
const marks = [];

try {
  await page.goto(url, {waitUntil: 'load'});
  loadSec = (Date.now() - t0) / 1000;
  for (const step of steps) {
    marks.push({...step, startedAt: (Date.now() - t0) / 1000});
    switch (step.action) {
      case 'goto': await page.goto(step.url, {waitUntil: 'load'}); break;
      case 'click': await page.click(step.selector); break;
      case 'fill': await page.fill(step.selector, step.value ?? ''); break;
      case 'wait': await page.waitForTimeout(step.ms ?? 500); break;
      case 'scroll': await page.mouse.wheel(0, step.dy ?? 400); break;
      default: throw new Error(`aksi tidak dikenal: ${step.action}`);
    }
  }
  if (extraMs > 0) await page.waitForTimeout(extraMs);
} finally {
  await context.close();
  await browser.close();
}

const webm = readdirSync(rawDir).find((f) => f.endsWith('.webm'));
if (!webm) {
  console.error('Playwright tidak menghasilkan video');
  process.exit(1);
}

// 2. webm -> mp4 pakai ffmpeg bawaan Remotion (tidak perlu install ffmpeg sistem)
const trim = args.includes('--keep-load') ? 0 : Math.max(0, loadSec - 0.1);
execFileSync(
  ffmpegPath(ROOT),
  ['-y', '-loglevel', 'error', ...(trim > 0 ? ['-ss', trim.toFixed(2)] : []), '-i', path.join(rawDir, webm),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', absOut],
  {stdio: 'inherit'},
);
if (trim > 0) console.log(`dipotong ${trim.toFixed(1)} dtk awal (waktu muat halaman)`);

// timeline: kapan tiap aksi mulai di video. Dipakai menentukan jendela waktu anotasi:
// koordinat piksel hanya valid selama isi layar diam (antara dua aksi scroll/klik).
const timeline = marks.map((m, i) => ({
  action: m.action,
  ...(m.selector ? {selector: m.selector} : {}),
  ...(m.dy ? {dy: m.dy} : {}),
  ...(m.ms ? {ms: m.ms} : {}),
  at: Math.max(0, +(m.startedAt - trim).toFixed(2)),
  next: marks[i + 1] ? Math.max(0, +(marks[i + 1].startedAt - trim).toFixed(2)) : null,
}));
writeFileSync(absOut.replace(/\.mp4$/, '.timeline.json'), JSON.stringify({loadTrimmedSec: +trim.toFixed(2), steps: timeline}, null, 2));

rmSync(rawDir, {recursive: true, force: true});
console.log(`selesai: ${path.relative(ROOT, absOut)}  (${as === 'asset' ? 'library asset, jalankan npm run scan' : as})`);
