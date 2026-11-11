/**
 * Ekstrak satu frame dari video menjadi PNG (untuk mengukur koordinat anotasi / memeriksa hasil).
 *
 *   npm run frame -- --in out/qa/demo.mp4 --at 1.2
 *   npm run frame -- --in out/qa/demo.mp4 --at 5.6 --out tmp/ref.png
 *
 * Memakai ffmpeg bawaan Remotion (lintas OS lewat scripts/lib/bin.mjs).
 * Default output: tmp/frame-<detik>.png. Cetak path hasilnya.
 */
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync} from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {ffmpegPath} from './lib/bin.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const get = (f, d) => {
  const i = args.indexOf(f);
  return i >= 0 ? args[i + 1] : d;
};

const input = get('--in');
const at = get('--at', '0');
if (!input || Number.isNaN(Number(at)) || Number(at) < 0) {
  console.error('usage: npm run frame -- --in <video.mp4> --at <detik> [--out <file.png>]');
  process.exit(1);
}
const inAbs = path.resolve(ROOT, input);
if (!existsSync(inAbs)) {
  console.error(`video tidak ada: ${input}`);
  process.exit(1);
}
const out = path.resolve(ROOT, get('--out', path.join('tmp', `frame-${at}.png`)));
mkdirSync(path.dirname(out), {recursive: true});

execFileSync(ffmpegPath(ROOT), ['-y', '-loglevel', 'error', '-ss', String(at), '-i', inAbs, '-frames:v', '1', '-update', '1', out], {stdio: 'inherit'});
if (!existsSync(out)) {
  console.error(`tidak ada frame di detik ${at} (di luar durasi video?)`);
  process.exit(1);
}
console.log(path.relative(ROOT, out));
