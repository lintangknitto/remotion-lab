/**
 * Cari ffmpeg/ffprobe bawaan Remotion di semua OS.
 *
 * Remotion memasang satu paket biner sesuai OS/arsitektur:
 *   @remotion/compositor-win32-x64-msvc | -darwin-arm64 | -darwin-x64 | -linux-x64-gnu | -linux-arm64-gnu | ...
 * Jangan menulis path paket itu langsung di skrip atau skill: hasilnya hanya jalan di satu OS.
 * Cadangan: ffmpeg/ffprobe di PATH. Catatan: ffmpeg bawaan Remotion TIDAK punya filter
 * drawbox/drawtext/color; anotasi dirender lewat Remotion, bukan ffmpeg.
 */
import {existsSync, readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const DEFAULT_ROOT = path.resolve(import.meta.dirname, '..', '..');

/** Folder paket compositor yang cocok dengan OS/arsitektur saat ini (atau null). */
export function compositorDir(root = DEFAULT_ROOT, platform = process.platform, arch = process.arch) {
  const base = path.join(root, 'node_modules', '@remotion');
  if (!existsSync(base)) return null;
  const want = `compositor-${platform}-${arch}`;
  const found = readdirSync(base)
    .filter((n) => n.startsWith('compositor-'))
    .sort((a, b) => Number(b.startsWith(want)) - Number(a.startsWith(want)));
  return found.length ? path.join(base, found[0]) : null;
}

export function bin(name, root = DEFAULT_ROOT, platform = process.platform, arch = process.arch) {
  const file = platform === 'win32' ? `${name}.exe` : name;
  const dir = compositorDir(root, platform, arch);
  if (dir && existsSync(path.join(dir, file))) return path.join(dir, file);
  try {
    execFileSync(name, ['-version'], {stdio: 'ignore'});
    return name; // cadangan: ada di PATH
  } catch {
    throw new Error(`${name} tidak ditemukan. Jalankan "npm install" (memasang biner Remotion untuk OS ini) atau pasang ${name} di PATH.`);
  }
}

export const ffmpegPath = (root) => bin('ffmpeg', root);
export const ffprobePath = (root) => bin('ffprobe', root);
