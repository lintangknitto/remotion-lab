/**
 * Add a file to the library with a correct id, then re-scan.
 *
 *   node scripts/add-asset.mjs ~/Downloads/boom.wav --type sfx --name impact.heavy-03
 *   node scripts/add-asset.mjs ./logo.png --type image --name brand.logo-01 --sub logo
 *
 * The id passed in --name must follow <sub>.<name>-<nn>; the type becomes the
 * first segment. The final file lands in public/library/<type>/ and its id is
 * <type>.<name>.
 */

import {copyFile, access, mkdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const args = process.argv.slice(2);
const src = args[0];
if (!src || src.startsWith('--')) {
  console.error('usage: node scripts/add-asset.mjs <file> --type <type> --name <sub>.<name>-<nn>');
  process.exit(1);
}

const get = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};

const type = get('--type');
const name = get('--name');
if (!type || !name) {
  console.error('--type and --name are required');
  process.exit(1);
}

const ID_RE = /^[a-z][a-z0-9-]*(\.[a-z0-9-]+)+$/;
const id = `${type}.${name}`;
if (!ID_RE.test(id)) {
  console.error(`bad id "${id}" — expected ${type}.<sub>.<name>-<nn>`);
  process.exit(1);
}

const ROOT = path.resolve(import.meta.dirname, '..');
const ext = path.extname(src).toLowerCase();
const dest = path.join(ROOT, 'public', 'library', type, `${id}${ext}`);

try {
  await access(dest);
  console.error(`already exists: ${path.relative(ROOT, dest)}`);
  process.exit(1);
} catch {
  /* good, does not exist */
}

await mkdir(path.dirname(dest), {recursive: true});
await copyFile(src, dest);
console.log(`added ${id}  ->  ${path.relative(ROOT, dest)}`);

await new Promise((resolve, reject) => {
  const p = spawn(process.execPath, [path.join(ROOT, 'scripts', 'scan-library.mjs')], {
    stdio: 'inherit',
  });
  p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`scan exited ${code}`))));
});

console.log(`\nreference it from a pack as "${id}"`);
