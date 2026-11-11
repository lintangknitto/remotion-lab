/**
 * Rough word-level accuracy check between a reference text and a transcript.
 *
 *   node scripts/compare-transcript.mjs \
 *     --truth "oke jadi ini yang paling penting soal clipping ..." \
 *     --transcript src/data/podcast-id.small.json
 *
 * It is deliberately simple (bag-of-words overlap, ignoring order), because the
 * point is to compare models against the text we actually synthesised, not to
 * be a benchmark suite.
 */

import {readFileSync} from 'node:fs';
import process from 'node:process';

const args = process.argv.slice(2);
const get = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : fallback;
};

const truth = get('--truth');
const transcriptPath = get('--transcript');
if (!truth || !transcriptPath) {
  console.error('usage: node scripts/compare-transcript.mjs --truth "..." --transcript file.json');
  process.exit(1);
}

const normalize = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\u00c0-\u024f\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

const ref = normalize(truth);
const hyp = normalize(JSON.parse(readFileSync(transcriptPath, 'utf8')).text);

const refCount = new Map();
for (const w of ref) refCount.set(w, (refCount.get(w) ?? 0) + 1);

let hits = 0;
for (const w of hyp) {
  const left = refCount.get(w) ?? 0;
  if (left > 0) {
    hits += 1;
    refCount.set(w, left - 1);
  }
}

const precision = hyp.length ? hits / hyp.length : 0;
const recall = ref.length ? hits / ref.length : 0;
const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;

console.log(`referensi   : ${ref.length} kata`);
console.log(`transkrip   : ${hyp.length} kata`);
console.log(`presisi     : ${(precision * 100).toFixed(1)}%`);
console.log(`recall      : ${(recall * 100).toFixed(1)}%`);
console.log(`F1          : ${(f1 * 100).toFixed(1)}%`);
