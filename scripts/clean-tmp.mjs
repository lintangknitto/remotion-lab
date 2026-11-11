import fs from 'node:fs';
import path from 'node:path';

/**
 * Bersihkan scratch dir <project>/tmp: sisa profil Chrome Headless
 * (satu folder ~1.7 MB per render) dan folder bundling Remotion.
 * Dipakai kalau tmp/ sudah membengkak; render berikutnya membuatnya ulang
 * otomatis lewat remotion.config.ts.
 */
const root = process.cwd();
const tmp = path.join(root, 'tmp');

if (!tmp.startsWith(root + path.sep)) {
  throw new Error(`Path tmp tidak masuk akal: ${tmp}`);
}

if (!fs.existsSync(tmp)) {
  console.log('tmp/ belum ada — tidak ada yang dibersihkan.');
  process.exit(0);
}

const sizeOf = (p) => {
  const stat = fs.lstatSync(p);
  if (!stat.isDirectory()) return stat.size;
  return fs
    .readdirSync(p)
    .reduce((sum, name) => sum + sizeOf(path.join(p, name)), 0);
};

let bytes = 0;
let count = 0;
for (const name of fs.readdirSync(tmp)) {
  const target = path.join(tmp, name);
  bytes += sizeOf(target);
  fs.rmSync(target, {recursive: true, force: true});
  count += 1;
}

console.log(
  `Dibersihkan ${count} item (${(bytes / 1024 / 1024).toFixed(1)} MB) dari ${tmp}`,
);

// --cache: hapus juga cache bundler Remotion (node_modules/.cache, bisa 250-500 MB; dibuat ulang saat render berikutnya,
// render pertama sesudahnya lebih lambat ~15 detik).
if (process.argv.includes('--cache')) {
  const cache = path.join(root, 'node_modules', '.cache');
  if (cache.startsWith(root + path.sep) && fs.existsSync(cache)) {
    fs.rmSync(cache, {recursive: true, force: true});
    console.log(`Cache bundler dihapus: ${cache}`);
  } else {
    console.log('Tidak ada cache bundler.');
  }
}
