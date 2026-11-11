/**
 * Pick the best moments from a long transcript and render them as clips.
 *
 *   node scripts/pick-clips.mjs \
 *     --audio vo.podcast.long-01 \
 *     --transcript src/data/podcast-long.transcribed.json \
 *     --count 3 --min 15 --max 35 --out out/clips
 *
 * Heuristics (deliberately explainable, no ML):
 *   + window must start at a sentence boundary
 *   + ends on a full sentence inside [min, max] seconds
 *   + words-per-second density
 *   + hook words ("you", "why", "never", "the thing", ...)
 *   - long pauses inside the window
 */

import {execFileSync} from 'node:child_process';
import {mkdtempSync, readFileSync, writeFileSync, mkdirSync, existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.resolve(import.meta.dirname, '..');
const FPS = 30;

const args = process.argv.slice(2);
const get = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : fallback;
};

const audioId = get('--audio');
const transcriptPath = get('--transcript');
if (!audioId || !transcriptPath) {
  console.error('usage: node scripts/pick-clips.mjs --audio <id> --transcript <json> [--count 3]');
  process.exit(1);
}

const count = Number(get('--count', 3));
const minSec = Number(get('--min', 15));
const maxSec = Number(get('--max', 35));
const outDir = get('--out', 'out/clips');
const slug = get('--slug', path.basename(transcriptPath).replace(/\..*$/, ''));

const library = JSON.parse(readFileSync(path.join(ROOT, 'src', 'library', 'index.generated.json'), 'utf8'));
const asset = library.assets.find((a) => a.id === audioId);
if (!asset) {
  console.error(`asset "${audioId}" tidak ada di library`);
  process.exit(1);
}

const transcript = JSON.parse(readFileSync(transcriptPath, 'utf8'));
const words = transcript.words;
if (!Array.isArray(words) || words.length < 5) {
  console.error('transcript terlalu pendek');
  process.exit(1);
}

const SENTENCE_END = /[.!?]$/;
const HOOKS = [
  'you', 'your', 'why', 'how', 'never', 'mistake', 'secret', 'actually',
  'stop', 'everyone', 'nobody', 'thing', 'workflow', 'here is', 'listen',
  'better', 'beat', 'save',
];

/** Windows that start on a sentence boundary and end on one, within [min,max]. */
function candidates() {
  const out = [];
  for (let i = 0; i < words.length; i++) {
    if (i > 0 && !SENTENCE_END.test(words[i - 1].text)) continue;

    for (let j = i; j < words.length; j++) {
      const dur = (words[j].endMs - words[i].startMs) / 1000;
      if (dur > maxSec) break;
      if (dur < minSec || !SENTENCE_END.test(words[j].text)) continue;
      out.push({from: i, to: j, startMs: words[i].startMs, endMs: words[j].endMs});
      break; // shortest sentence-complete window from this start
    }
  }
  return out;
}

function score(win) {
  const slice = words.slice(win.from, win.to + 1);
  const text = slice.map((w) => w.text).join(' ').toLowerCase();
  const dur = (win.endMs - win.startMs) / 1000;
  const density = slice.length / dur;
  const hooks = HOOKS.filter((h) => text.includes(h)).length;

  let maxGap = 0;
  for (let k = 1; k < slice.length; k++) {
    maxGap = Math.max(maxGap, slice[k].startMs - slice[k - 1].endMs);
  }
  const gapPenalty = Math.max(0, (maxGap - 600) / 1000) * 1.2;

  return density * 1.2 + hooks * 1.3 - gapPenalty;
}

const scored = candidates()
  .map((win) => ({...win, score: score(win)}))
  .sort((a, b) => b.score - a.score);

const picked = [];
for (const win of scored) {
  if (picked.length >= count) break;
  const overlaps = picked.some((p) => win.startMs < p.endMs && win.endMs > p.startMs);
  if (!overlaps) picked.push(win);
}

if (picked.length === 0) {
  console.error('tidak ada kandidat — coba turunkan --min atau perpanjang --max');
  process.exit(1);
}

// envelope for the whole file, once
const tmp = mkdtempSync(path.join(tmpdir(), 'pick-'));
const peaksFile = path.join(tmp, 'peaks.json');
execFileSync(
  'python',
  [path.join(ROOT, 'scripts', 'assets', 'make_waveform.py'), path.join(ROOT, 'public', asset.path), peaksFile],
  {stdio: 'inherit'},
);
const allPeaks = JSON.parse(readFileSync(peaksFile, 'utf8')).peaks;

mkdirSync(path.join(ROOT, outDir), {recursive: true});

picked.sort((a, b) => a.startMs - b.startMs);

const cli = path.join(ROOT, 'node_modules', '@remotion', 'cli', 'remotion-cli.js');
const report = [];

picked.forEach((win, index) => {
  const n = String(index + 1).padStart(2, '0');
  const startMs = win.startMs;
  const endMs = win.endMs + 400;

  const rebased = words
    .slice(win.from, win.to + 1)
    .map((w) => ({
      text: w.text,
      startMs: Math.max(0, w.startMs - startMs),
      endMs: Math.max(0, w.endMs - startMs),
    }));

  const fromFrame = Math.floor((startMs / 1000) * FPS);
  const toFrame = Math.ceil((endMs / 1000) * FPS);
  const peaks = allPeaks.slice(fromFrame, toFrame);

  const props = {
    show: 'CLIPPING ROOM',
    episode: `EP. 42 · CLIP ${n}`,
    speaker: 'David',
    audio: audioId,
    audioTrimBefore: fromFrame,
    broll: ['image.bokeh.party-01', 'image.gradient.mesh-02', 'image.lightleak.cool-01'],
    words: rebased,
    peaks,
    accent: '#7C5CFF',
  };

  const propsFile = path.join(ROOT, 'out', `props-${slug}-${n}.json`);
  writeFileSync(propsFile, JSON.stringify(props, null, 2));

  const outFile = path.join(outDir, `${slug}-${n}.mp4`);
  console.log(
    `\n[${n}] ${(startMs / 1000).toFixed(1)}s–${(endMs / 1000).toFixed(1)}s  skor ${win.score.toFixed(2)}  ` +
      `"${words[win.from].text} … ${words[win.to].text}"`,
  );

  execFileSync(
    process.execPath,
    [cli, 'render', 'src/index.ts', 'PodcastClip', outFile, `--props=${propsFile}`, '--log=error'],
    {stdio: 'inherit', cwd: ROOT},
  );

  report.push({
    clip: outFile,
    from: startMs,
    to: endMs,
    score: Number(win.score.toFixed(2)),
    firstWords: words.slice(win.from, win.from + 6).map((w) => w.text).join(' '),
  });
});

writeFileSync(path.join(ROOT, 'out', `${slug}-picks.json`), JSON.stringify(report, null, 2));

console.log('\nringkasan:');
for (const r of report) {
  console.log(
    `  ${path.basename(r.clip)}  ${(r.from / 1000).toFixed(1)}s–${(r.to / 1000).toFixed(1)}s  ` +
      `skor ${r.score}  "${r.firstWords}…"`,
  );
}
if (!existsSync(path.join(ROOT, report[0].clip))) process.exit(1);
