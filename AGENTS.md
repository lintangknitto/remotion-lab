# remotion-lab: panduan untuk agen AI

Studio video berbasis Remotion 4 (React) dengan asset library berlapis, style system per family, dan
pipeline rekam/anotasi QA. Dokumentasi manusia: [README.md](README.md), rancangan gaya:
[docs/style-system.md](docs/style-system.md), sistem aset: [docs/aset.md](docs/aset.md).

## Mulai

```bash
npm install
npx playwright install chromium-headless-shell   # ~290 MB; cukup untuk npm run record / capture (Chromium penuh tidak perlu)
npm run typecheck && npm run check:style && npm run check     # harus hijau sebelum dan sesudah mengubah kode
npm run studio                      # Remotion Studio (komposisi StyleProof punya props family/variant/brand/seed)
```

Butuh Node >= 22.18 (`check:style` mengimpor modul TS langsung). Python 3 hanya untuk `npm run assets` dan
transkripsi. `npm run vo` memakai PowerShell + TTS Windows, jadi **hanya Windows**.

## Perintah penting

| Tujuan | Perintah |
| --- | --- |
| Render video | `npx remotion render src/index.ts <IdKomposisi> out/<nama>.mp4` |
| Render satu frame | `npx remotion still src/index.ts <Id> out/x.png --frame=<n> [--props='{"family":"ads"}']` |
| Audit gaya (kontras, sebaran hue) | `npm run check:style` (juga `-- --brand knitto`) |
| Audit aset/pack | `npm run check`; setelah mengubah `scripts/catalog.mjs` jalankan `npm run packs` |
| Tangkap identitas website | `npm run capture -- --url <url> --name <brand>` |
| Rekam halaman -> MP4 | `npm run record -- --url <url> --as qa --steps <json>` |
| Ambil satu frame dari video | `npm run frame -- --in <mp4> --at <detik> --out tmp/ref.png` |
| Anotasi QA | `npm run annotate -- --in <mp4> --ann <json> [--dry] [--frames 50,175]` |
| Bersihkan scratch | `npm run clean` |
| Sinkronkan skill | `npm run skills:sync` (cek: `npm run skills:check`) |

## Struktur

- `src/Root.tsx` mendaftarkan komposisi. Komposisi: `src/compositions/*`.
- `src/styles/` style system: `profiles/<family>.ts` (aturan), `brands/<brand>.ts`, `resolve.ts`, `react.tsx`.
- `src/components/<family>/` UI kit per family (`qa`, `ads`, `corporate`, `motion-graphic`); `effects/` dan `text/` umum.
- `public/library/` aset berdasarkan tipe (satu file satu tempat), `src/packs/` referensi per genre, `scripts/catalog.mjs` sumber 18 family / 78 genre.
- `public/brand/<brand>/` hasil capture website (foto, logo, `brand.json`): **lokal, di-ignore git, jangan di-commit**. Buat ulang dengan
  `npm run brand:knitto` (atau `npm run capture`). Tanpa itu `KnittoPromo`, `StyleProof`, dan contoh QA berfoto Knitto gagal dirender.
  `public/library/fonts/` font bundel (SIL OFL).
- Skill: `.agents/skills/` (sumber) disalin ke `.claude/skills/`. Skill: `record-web`, `qa-annotate`, `video-style`.

## Aturan

- **Gaya**: komposisi tidak menulis hex/rgb. Warna dari `useTheme().color.*` (`withAlpha` untuk transparansi), font lewat
  `textStyle(theme, role, size)`, gerak lewat `useEnter`. Bangun dari kit family, jangan div baru. Baca skill `video-style` dulu.
- **Deterministik**: tanpa `Math.random`, `Date`, `setTimeout`, CSS animation/keyframes. Semua gerak fungsi dari frame.
- **Aset**: id = nama file tanpa ekstensi (`assetSrc('image.gradient.dark-01')`). Jangan menyalin file ke folder lain.
- **Jangan edit manual** file hasil generate: `src/library/*.generated.json`, `src/library/ids.ts`, `src/packs/**`,
  `src/registry/catalog.generated.json`. Ubah sumbernya (`scripts/catalog.mjs`) lalu `npm run packs`.
- **Verifikasi sebelum mengklaim selesai**: typecheck + `check:style`, lalu render still dan LIHAT gambarnya. Satu frame tidak
  cukup; cek tiap adegan. Koordinat anotasi QA hanya valid selama layar diam (lihat skill `qa-annotate`).
- Jangan mengarang statistik atau klaim di video; pakai fakta dari sumber yang disebut user.
- Jangan memakai biner ffmpeg langsung dari `node_modules` (nama paketnya beda per OS); pakai `npm run frame` atau `scripts/lib/bin.mjs`.

## Lingkungan dan batasan

- **Beban** (terukur di Windows, i5-11400 6 core/12 thread, 15,8 GB RAM; detail di README "Kebutuhan sistem"): iklan 15 detik 1080x1920
  dirender 29 dtk dengan 4 worker (RAM puncak 2,7 GB) atau 46 dtk dengan 1 worker (1,6 GB). Jumlah worker default menyesuaikan
  core dan RAM (`remotion.config.ts`); jangan menaikkannya di mesin kecil, dan bersihkan cache dengan `npm run clean -- --cache`.
- Render menjalankan Chrome Headless + FFmpeg lewat proses anak. Di lingkungan yang membatasi proses anak muncul `spawn EPERM`;
  itu masalah izin lingkungan, bukan kode. `remotion.config.ts` mengarahkan TEMP ke `./tmp` (bersihkan dengan `npm run clean`).
- ffmpeg bawaan Remotion tidak punya filter `drawbox`/`drawtext`/`color`; anotasi dirender lewat komposisi `QaAnnotate`.
- Aset berwarna di library (gradient, light-leak, plate caption) masih PNG yang tidak bisa di-tema; gunakan `ThemeBackground`.
- Baru 4 dari 18 family punya profil gaya; yang lain memicu error jelas dari `getProfile`.
- Pencarian biner untuk macOS/Linux sudah ditulis tetapi belum diuji dengan biner aslinya.

## Keamanan

- Jangan commit `out/`, `tmp/`, `.cache/`, `node_modules/` (sudah di `.gitignore`), rekaman layar, atau secret.
- `npm run capture` dan `record` mengakses situs lain: hanya untuk situs milik user atau yang diizinkan. Jangan merekam halaman
  berisi kredensial atau data pribadi.
- `public/brand/` berisi foto/logo pihak lain dan sengaja **tidak** ikut git. Jangan menghapusnya dari `.gitignore`, jangan `git add -f`.
- Repo ini publik: jangan commit email pribadi (pakai alamat noreply GitHub), secret, atau aset yang hak pakainya tidak jelas.
- Jangan membuat server, jaringan, atau perubahan di luar repo tanpa diminta user.
