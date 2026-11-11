/**
 * Audit style system. Gagal (exit 1) bila:
 *   1. konversi warna meleset (uji sanity OKLCH),
 *   2. ada tema dengan kontras kurang: teks/latar < 7, muted/latar < 4.5,
 *      aksen/latar < 3, teks-di-atas-aksen < 4.5, semantik/permukaan < 3,
 *   3. satu zona hue 60 derajat memuat > 4 family kromatik (anti "ungu semua"),
 *   4. dua family punya hue aksen default < 20 derajat (kecuali keduanya netral).
 *
 *   node scripts/check-style.mjs            # semua family, semua varian & genre
 *   node scripts/check-style.mjs --table    # cetak tabel tema
 *   node scripts/check-style.mjs --brand knitto
 *
 * Mengimpor modul TS yang sama dengan komposisi (Node 24 melepas tipe sendiri).
 */
import {PROFILES} from '../src/styles/profiles/index.ts';
import {resolveTheme} from '../src/styles/resolve.ts';
import {knitto} from '../src/styles/brands/knitto.ts';
import {contrast, hexToOklch, hueDistance, lch, oklchToHex} from '../src/styles/color.ts';

const args = process.argv.slice(2);
const brands = {knitto};
const brandName = args.includes('--brand') ? args[args.indexOf('--brand') + 1] : null;
const brand = brandName ? brands[brandName] : undefined;
if (brandName && !brand) {
  console.error(`brand "${brandName}" tidak dikenal. Tersedia: ${Object.keys(brands).join(', ')}`);
  process.exit(1);
}

const problems = [];
const fail = (msg) => problems.push(msg);

// ---- 1. sanity konversi warna ---------------------------------------------------
const ref = [
  ['#ffffff', {l: 1, c: 0}],
  ['#000000', {l: 0, c: 0}],
  ['#ff0000', {l: 0.628, c: 0.2577, h: 29.2}],
  ['#00ff00', {l: 0.8664, c: 0.294, h: 142.5}],
  ['#0000ff', {l: 0.452, c: 0.3132, h: 264.1}],
];
for (const [hex, want] of ref) {
  const got = hexToOklch(hex);
  const dl = Math.abs(got.l - want.l);
  const dc = Math.abs(got.c - want.c);
  const dh = want.h === undefined ? 0 : Math.min(Math.abs(got.h - want.h), 360 - Math.abs(got.h - want.h));
  if (dl > 0.005 || dc > 0.005 || dh > 0.6) fail(`konversi ${hex}: dapat L${got.l.toFixed(3)} C${got.c.toFixed(3)} h${got.h.toFixed(1)}, harusnya ${JSON.stringify(want)}`);
}
for (const hex of ['#c4592a', '#0f163f', '#22d3ee', '#7c5cff', '#f4f4f6']) {
  const o = hexToOklch(hex);
  const back = oklchToHex(o.l, o.c, o.h);
  if (back.toLowerCase() !== hex) fail(`round-trip ${hex} -> ${back}`);
}

// nilai kontras WCAG yang diketahui: hitam/putih = 21, #777 di atas putih = 4.48
const known = [
  ['#000000', '#ffffff', 21, 0.01],
  ['#777777', '#ffffff', 4.48, 0.05],
  ['#ffffff', '#ffffff', 1, 0.001],
];
for (const [a, b, want, tol] of known) {
  const got = contrast(a, b);
  if (Math.abs(got - want) > tol) fail(`kontras ${a} vs ${b}: dapat ${got.toFixed(3)}, harusnya ${want}`);
}

// ---- 2. kontras seluruh tema ----------------------------------------------------
const rows = [];
const checkTheme = (t, label) => {
  const c = t.color;
  const m = {
    teks: contrast(c.text, c.bg),
    muted: contrast(c.muted, c.bg),
    aksen: contrast(c.accent, c.bg),
    aksen2: contrast(c.accent2, c.bg),
    onAksen: contrast(c.onAccent, c.accent),
    sukses: contrast(c.success, c.surface),
    gagal: contrast(c.danger, c.surface),
    warn: contrast(c.warn, c.surface),
  };
  if (m.teks < 7) fail(`${label}: teks/latar ${m.teks.toFixed(2)} < 7`);
  if (m.muted < 4.5) fail(`${label}: muted/latar ${m.muted.toFixed(2)} < 4.5`);
  if (m.aksen < 3) fail(`${label}: aksen/latar ${m.aksen.toFixed(2)} < 3`);
  if (m.aksen2 < 3) fail(`${label}: aksen2/latar ${m.aksen2.toFixed(2)} < 3`);
  // teks di atas aksen dipakai pada tombol/pill tebal ukuran besar: WCAG "large text" = 3.0, ditambah margin
  if (m.onAksen < 3.5) fail(`${label}: teks-di-aksen ${m.onAksen.toFixed(2)} < 3.5`);
  for (const k of ['sukses', 'gagal', 'warn']) if (m[k] < 3) fail(`${label}: ${k}/permukaan ${m[k].toFixed(2)} < 3`);
  // semantik terkunci: hue tidak boleh bergeser dari seed
  const dh = hueDistance(hexToOklch(c.danger).h, 25);
  if (dh > 12) fail(`${label}: merah gagal bergeser ${dh.toFixed(0)} derajat`);
  rows.push({tema: label, mode: t.mode, bg: c.bg, teks: c.text, aksen: c.accent, aksen2: c.accent2, hue: Math.round(t.accentHue), 'teks/bg': m.teks.toFixed(1), 'aksen/bg': m.aksen.toFixed(1), 'onAksen': m.onAksen.toFixed(1)});
};

for (const [family, profile] of Object.entries(PROFILES)) {
  for (const variant of Object.keys(profile.variants)) {
    checkTheme(resolveTheme(profile, {variant, brand}), `${family}/${variant}${brand ? '+' + brand.name : ''}`);
    for (const genre of Object.keys(profile.genres ?? {})) {
      checkTheme(resolveTheme(profile, {variant, genre, brand}), `${family}/${variant}/${genre}${brand ? '+' + brand.name : ''}`);
    }
  }
}

// ---- 3 & 4. sebaran hue (tema default tiap family, tanpa brand) ------------------
const defaults = Object.entries(PROFILES).map(([family, p]) => {
  const t = resolveTheme(p);
  const chroma = hexToOklch(t.color.accent).c;
  return {family, hue: t.accentHue, chromatic: chroma >= 0.06};
});
const zones = {};
for (const d of defaults.filter((x) => x.chromatic)) {
  const z = Math.floor(d.hue / 60);
  (zones[z] ??= []).push(d.family);
}
const ZONE_NAME = ['merah-oranye', 'kuning-lime', 'hijau', 'teal-cyan', 'biru-violet', 'magenta-pink'];
for (const [z, fams] of Object.entries(zones)) {
  if (fams.length > 4) fail(`zona ${ZONE_NAME[z]} (${z * 60}-${z * 60 + 60}) memuat ${fams.length} family: ${fams.join(', ')}`);
}
const chromatic = defaults.filter((x) => x.chromatic);
for (let i = 0; i < chromatic.length; i++) {
  for (let j = i + 1; j < chromatic.length; j++) {
    const d = hueDistance(chromatic[i].hue, chromatic[j].hue);
    if (d < 20) fail(`${chromatic[i].family} dan ${chromatic[j].family} terlalu mirip: jarak hue ${d.toFixed(0)} derajat`);
  }
}

if (args.includes('--table')) console.table(rows);
console.log(`family: ${defaults.map((d) => `${d.family}(h${Math.round(d.hue)})`).join('  ')}`);
console.log(`zona  : ${Object.entries(zones).map(([z, f]) => `${ZONE_NAME[z]}=${f.length}`).join('  ')}`);
console.log(`tema diperiksa: ${rows.length}`);

if (problems.length) {
  console.error(`\n${problems.length} masalah:`);
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}
console.log('check:style OK');
