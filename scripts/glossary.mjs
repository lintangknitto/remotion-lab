/**
 * Preview what the glossary does to a transcript.
 *
 *   node scripts/glossary.mjs src/data/podcast-id.small.json
 */

import {readFileSync} from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {pathToFileURL} from 'node:url';

const ROOT = path.resolve(import.meta.dirname, '..');
const file = process.argv[2];
if (!file) {
  console.error('usage: node scripts/glossary.mjs <transcript.json>');
  process.exit(1);
}

// The glossary lives in TS, so mirror the lookup here with a tiny loader instead
// of adding a TS runtime: read the module source and evaluate the default map.
const src = readFileSync(path.join(ROOT, 'src', 'lib', 'glossary.ts'), 'utf8');
const body = src.match(/export const DEFAULT_GLOSSARY: Glossary = \{([\s\S]*?)\n\};/);
if (!body) {
  console.error('tidak bisa membaca DEFAULT_GLOSSARY');
  process.exit(1);
}

const glossary = {};
for (const line of body[1].split('\n')) {
  const m = line.match(/^\s*['"]?([\w-]+)['"]?:\s*['"]([^'"]+)['"],?/);
  if (m) glossary[m[1]] = m[2];
}

const transcript = JSON.parse(readFileSync(path.resolve(ROOT, file), 'utf8'));

const splitWord = (word) => {
  const match = word.match(/^([^\p{L}\p{N}]*)(.*?)([^\p{L}\p{N}]*)$/u);
  return match ? {lead: match[1], core: match[2], trail: match[3]} : {lead: '', core: word, trail: ''};
};

const fix = (word) => {
  const {lead, core, trail} = splitWord(word);
  if (!core) return word;
  const rep = glossary[core.toLowerCase()];
  return rep ? `${lead}${rep}${trail}` : word;
};

const before = transcript.text;
const after = before.split(' ').map(fix).join(' ');

const changed = before
  .split(' ')
  .map((w, i) => ({w, fixed: after.split(' ')[i]}))
  .filter((x) => x.w !== x.fixed);

console.log(`glossary: ${Object.keys(glossary).length} entri`);
console.log(`kata berubah: ${changed.length}\n`);
for (const c of changed) console.log(`  ${c.w}  ->  ${c.fixed}`);
console.log('\nsebelum :', before);
console.log('sesudah :', after);
