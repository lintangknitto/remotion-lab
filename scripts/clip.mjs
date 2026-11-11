/**
 * Build a podcast clip from a raw file + transcript, then render it.
 *
 *   node scripts/clip.mjs \
 *     --audio vo.podcast.demo-01 \
 *     --transcript src/data/podcast-demo.transcribed.json \
 *     --out out/clip-demo.mp4 \
 *     --show "CLIPPING ROOM" --episode "EP. 42" --speaker "David"
 *
 * It computes the RMS envelope, writes a props file, and calls the Remotion CLI,
 * so the composition itself stays a pure function of its props.
 */

import {execFileSync} from 'node:child_process';
import {mkdtempSync, readFileSync, writeFileSync, existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.resolve(import.meta.dirname, '..');

const args = process.argv.slice(2);
const get = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : fallback;
};

const audioId = get('--audio');
const transcriptPath = get('--transcript');
if (!audioId || !transcriptPath) {
  console.error('usage: node scripts/clip.mjs --audio <asset-id> --transcript <json> [--out file]');
  process.exit(1);
}

const library = JSON.parse(
  readFileSync(path.join(ROOT, 'src', 'library', 'index.generated.json'), 'utf8'),
);
const asset = library.assets.find((a) => a.id === audioId);
if (!asset) {
  console.error(`asset "${audioId}" tidak ada di library. Jalankan npm run scan dulu.`);
  process.exit(1);
}

const transcript = JSON.parse(readFileSync(transcriptPath, 'utf8'));
if (!Array.isArray(transcript.words) || transcript.words.length === 0) {
  console.error('transcript tidak punya "words"');
  process.exit(1);
}

const slug = get('--slug', path.basename(transcriptPath).replace(/\..*$/, ''));
const outFile = get('--out', path.join('out', `clip-${slug}.mp4`));

// 1. envelope from the actual audio file
const tmp = mkdtempSync(path.join(tmpdir(), 'clip-'));
const peaksFile = path.join(tmp, 'peaks.json');
execFileSync(
  'python',
  [path.join(ROOT, 'scripts', 'assets', 'make_waveform.py'), path.join(ROOT, 'public', asset.path), peaksFile],
  {stdio: 'inherit'},
);
const peaks = JSON.parse(readFileSync(peaksFile, 'utf8')).peaks;

// 2. props
const broll = get('--broll', 'image.bokeh.party-01,image.gradient.mesh-02,image.lightleak.cool-01')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const props = {
  show: get('--show', 'CLIPPING ROOM'),
  episode: get('--episode', 'EP. 01 · CLIP 01'),
  speaker: get('--speaker', 'Speaker'),
  audio: audioId,
  broll,
  words: transcript.words,
  peaks,
  accent: get('--accent', '#7C5CFF'),
};

const propsFile = path.join(ROOT, 'out', `props-${slug}.json`);
writeFileSync(propsFile, JSON.stringify(props, null, 2));

// 3. render
const lastWord = transcript.words[transcript.words.length - 1];
console.log(
  `merender ${transcript.words.length} kata, ~${Math.round((lastWord.endMs + 400) / 100) / 10}s -> ${outFile}`,
);

const cli = path.join(ROOT, 'node_modules', '@remotion', 'cli', 'remotion-cli.js');
execFileSync(
  process.execPath,
  [cli, 'render', 'src/index.ts', 'PodcastClip', outFile, `--props=${propsFile}`, '--log=error'],
  {stdio: 'inherit', cwd: ROOT},
);

if (!existsSync(path.join(ROOT, outFile))) {
  console.error('render selesai tapi file tidak ditemukan');
  process.exit(1);
}
console.log(`selesai: ${outFile}`);
