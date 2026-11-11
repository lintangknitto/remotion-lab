# remotion-lab

Studio video berbasis [Remotion](https://www.remotion.dev): komposisi React, plus
**asset library berlapis** yang memisahkan file dari kategori.

```
57 aset · 32 MB · 18 family · 78 genre · 72 pack ready · 11 komponen efek · 4 family bergaya (qa, ads, corporate, motion-graphic)
```

> **Untuk agen AI** (Claude Code, OpenCode, Antigravity): baca [AGENTS.md](AGENTS.md). Skill proyek ada di
> `.agents/skills/` (sumber) dan `.claude/skills/` (salinan); sinkronkan dengan `npm run skills:sync`.

## Tiga hal yang ada di repo ini

1. **Asset system** — `public/library` (file) + `src/packs` (referensi) +
   `src/library` (index). 78 genre memakai 55 dari 57 file tanpa duplikasi.
2. **Template** — `PodcastClip` (9:16, waveform + caption sinkron + progress),
   `LaunchVideo` (demo 12 detik), `StudioProof` (bukti asset system + efek),
   `CaptionDemo` (5 gaya caption), `Poster` (still).
3. **Efek & teks** — 11 komponen efek + `Caption` dengan 5 preset.

```
out/podcast-clip.mp4   15 detik, 1080x1920, voiceover + waveform sinkron
out/clip-whisper.mp4   hasil pipeline: Whisper → caption → render
out/podcast-clip.png   still template
out/studio-proof.png   1920x1080, bukti library + efek
out/studio-proof.mp4   4 detik, ada audio
out/caption-demo.png   5 gaya caption dari satu plate
out/caption-demo.mp4   4 detik, ada audio
out/launch.mp4         12 detik, demo naratif
```

## Pipeline mentah → klip

```bash
python -m pip install faster-whisper "av<14"          # sekali saja

python scripts/transcribe.py public/library/vo/vo.podcast.demo-01.wav \
  --out src/data/podcast-demo.transcribed.json --model tiny.en

node scripts/clip.mjs --audio vo.podcast.demo-01 \
  --transcript src/data/podcast-demo.transcribed.json \
  --out out/clip-whisper.mp4 --episode "EP. 42 · CLIP 01" --speaker David
```

Untuk bahasa Indonesia pakai `--model small --language id --prompt "..."` — lihat
[docs/pipeline-transkripsi.md](docs/pipeline-transkripsi.md#bahasa-indonesia).

`clip.mjs` menghitung envelope, menulis props, lalu memanggil Remotion CLI.
Durasi video dihitung dari kata terakhir lewat `calculateMetadata`.
Detail: [docs/pipeline-transkripsi.md](docs/pipeline-transkripsi.md).

## Struktur

```
public/library/       file aset, disusun per TIPE (bukan per genre)
  audio/ sfx/ images/ video/ textures/ lottie/ fonts/ brand/
src/packs/            daftar referensi per genre: <family>/<genre>.json
  index.generated.json  gabungan siap pakai
src/library/          index.generated.json + ids.ts (generated)
src/compositions/     satu folder per video (podcast-clip, studio-proof, ...)
src/components/effects/  11 efek siap pakai (Flash, Shake, GlitchSlice, ...)
src/lib/              assets.ts, pack.ts
scripts/catalog.mjs   sumber data 18 family + 78 genre
scripts/assets/generate.py   generator texture/gambar/SFX/musik
scripts/assets/make_vo.ps1   TTS + timestamp per kata
docs/aset.md          penjelasan lengkap sistem aset
```

## Perintah

| Perintah | Fungsi |
| --- | --- |
| `npm run studio` | buka Remotion Studio |
| `npm run clip:still` | render still template podcast |
| `npm run clip` | render MP4 podcast clip (9:16) |
| `npm run proof:still` | render bukti jadi PNG |
| `npm run proof` | render bukti jadi MP4 |
| `npm run caption:still` | render demo caption jadi PNG |
| `npm run caption` | render demo caption jadi MP4 |
| `npm run vo` | generate voiceover + timestamp + waveform |
| `npm run assets` | generate ulang texture/gambar/SFX/musik/caption |
| `npm run scan` | scan library, deteksi duplikat (sha256) |
| `npm run packs` | generate 73 pack dari `scripts/catalog.mjs` |
| `npm run check` | audit: referensi rusak, slot kosong, status pack |
| `npm run check:style` | audit style system: kontras (WCAG), sebaran hue antar family, konversi warna |
| `npm run capture -- --url <url> --name <brand>` | tangkap identitas website: warna & font terukur, logo, foto, screenshot |
| `npm run clean` | hapus scratch `tmp/` (profil Chrome + bundling) |
| `npm run record -- --url <url>` | rekam halaman web → MP4 (Playwright) |
| `npm run annotate -- --in <mp4> --ann <json> --dry` | validasi anotasi QA (tanpa render) |
| `npm run annotate -- --in <mp4> --ann <json>` | bakar anotasi QA ke video + ekspor frame PNG |
| `npm run studio` → `QaAnnotate` | preview & edit props anotasi di Remotion Studio |

### Rekam & QA

```bash
npm run record -- --url http://localhost:3000 --name demo-login --duration 2000
# 1. ukur koordinat piksel dari frame referensi, tulis out/qa/demo-login.annotations.json
npm run annotate -- --in out/record/demo-login.mp4 --ann out/qa/demo-login.annotations.json --dry
# 2. (opsional) preview & sesuaikan di Studio: npm run studio -> QaAnnotate
npm run annotate -- --in out/record/demo-login.mp4 --ann out/qa/demo-login.annotations.json --frames 45
```

- `record` menyimpan ke `out/record/` (raw). `--as asset` menaruhnya di
  `public/library/video/` (jalankan `npm run scan` setelahnya), `--as qa` di `out/qa/`.
- Anotasi memakai **piksel pada kanvas 1920×1080** (bukan fraksi) dan detik. Nilai pecahan
  antara 0 dan 1 ditolak validasi. Tidak ada editor HTML — anotasi adalah data yang diukur
  dari frame asli, supaya tidak meleset.
- Bake dilakukan lewat komposisi Remotion `QaAnnotate`, bukan ffmpeg sistem —
  binary ffmpeg dari Remotion tidak punya filter `drawbox`/`drawtext`. Gayanya dari tema family `qa`.
- Tipe anotasi: `box`, `caption`, `mention`, `step`, `severity`, `status`, `timestamp`, `redline`
  (format lengkap di komentar `scripts/annotate.mjs` dan skill `qa-annotate`).
- **Koordinat hanya valid selama isi layar diam.** `record` menulis `<nama>.timeline.json` (kapan tiap
  scroll/klik terjadi) dan memotong detik memuat halaman (layar putih); batasi `from`/`to` anotasi di
  dalam jendela diam, dan ukur frame referensi di tengah jendela itu.

Menambah aset:

```bash
node scripts/add-asset.mjs ./boom.wav --type sfx --name impact.heavy-03
```

Menambah genre: edit `scripts/catalog.mjs` → `npm run packs` → `npm run check`.

## Pakai pack di komposisi

```tsx
import {bindPack} from '../../lib/pack';

const pack = bindPack('beat-edit/jedag-jedug');

<Audio src={pack.src('music')} />
<Img src={pack.pickSrc('texture', frame)} />
```

## Catatan

- Semua aset sekarang **digenerate** (`scripts/assets/generate.py`) — bebas
  lisensi, tapi SFX/musik-nya sintesis sederhana: cukup untuk template, bukan
  pengganti library produksi.
- Yang belum ada dan tidak bisa digenerate: footage klien, klip anime, transkrip,
  font, lottie. Semuanya tercatat di field `missing` tiap pack dan muncul di
  `npm run check`.
- `remotion.config.ts` mengarahkan `TEMP`/`TMP` ke `<project>/tmp` sebelum CLI
  men-spawn Chrome, jadi scratch tidak lagi menumpuk di `%TEMP%` Windows (dulu
  muncul `Unable to create cache` / `Access is denied`). Tiap render menyisakan
  profil Chrome ~1,7 MB di `tmp/`; bersihkan dengan `npm run clean`.
- `spawn EPERM` yang muncul **sebelum** Chrome sempat jalan bukan masalah TEMP —
  itu proses anak (Chrome/FFmpeg) diblokir kebijakan sandbox. Jalankan render
  dengan akses proses penuh.

## Style system (gaya per family)

Setiap family punya gaya sendiri (warna, tipografi, bentuk, gerak, UI kit). Warna **tidak saklek**:
profil menyimpan aturan, hex dihitung dari seed atau brand lewat `resolveTheme()` (OKLCH, kontras
dijamin WCAG). Rancangan lengkap: [docs/style-system.md](docs/style-system.md).

| Family | Gaya | UI kit |
| --- | --- | --- |
| `qa` | netral, presisi, font mono, warna semantik terkunci | `src/components/qa/` (Callout, StepBadge, Redline, TestMatrix, DeviceFrame...) |
| `ads` | kapital tebal, kontras tinggi, bayangan keras, gerak memantul | `src/components/ads/` (BigClaim, CtaButton, Ticker, Badge...) |
| `corporate` | serif editorial, kroma rendah, gerak lambat | `src/components/corporate/` (LowerThird, StatCard, RuleTitle...) |
| `motion-graphic` | blok datar, bentuk besar, gerak berurutan | `src/components/motion-graphic/` (Counter, BarChart, KineticHeadline...) |

- Lihat gayanya: `npm run studio` → komposisi **StyleProof**, ubah props `family`, `variant`, `genre`, `brand`, `seed`.
- Brand klien: `npm run capture -- --url https://knitto.co.id --name knitto` lalu isi `src/styles/brands/<brand>.ts`
  (contoh: [knitto.ts](src/styles/brands/knitto.ts), warnanya diukur dari DOM website, bukan ditebak).
- Contoh video: `npm run render` memakai `LaunchVideo`; iklan Knitto: `npx remotion render src/index.ts KnittoPromo out/knitto-promo.mp4`.
- 14 family lain sudah ada di katalog tetapi belum punya profil gaya (fase 3 di dokumen rancangan).
- Font dibundel di `public/library/fonts/` (SIL OFL, lihat `LICENSE.md` di sana), jadi render identik di semua OS.
- **Aset brand bersifat lokal.** `public/brand/` (foto, logo, screenshot, `brand.json`) adalah hasil `npm run capture`, **tidak ikut git**
  (ada di `.gitignore`) karena foto dan logo milik pihak lain. Setelah clone, buat ulang dengan `npm run brand:knitto`
  (butuh internet dan `npx playwright install chromium-headless-shell`). Tanpa itu komposisi `KnittoPromo`, `StyleProof`, dan
  `QaAnnotate` contoh yang memakai foto/logo Knitto tidak bisa dirender; komposisi lain tidak terpengaruh. Hanya warna, font,
  dan nama brand (`src/styles/brands/knitto.ts`) yang ada di repo. Gunakan aset brand hanya bila kamu berhak memakainya.

## Kebutuhan sistem

Angka di bawah **diukur** di satu mesin (Windows, Intel i5-11400 6 core/12 thread, RAM 15,8 GB, SSD), bukan spesifikasi resmi.
Mesin yang lebih lemah per core akan lebih lambat; yang di bawah ini hanya perkiraan.

**Disk**

| Komponen | Ukuran |
| --- | --- |
| Repo hasil clone (tanpa node_modules) | ~52 MB |
| `npm install` (paket) | ~250 MB |
| Chrome Headless Shell milik Remotion (diunduh saat render pertama, butuh internet) | ~300 MB |
| Playwright `chromium-headless-shell` (hanya untuk `record`/`capture`) | ~290 MB |
| Cache bundler `node_modules/.cache` (tumbuh bersama render, bisa dihapus) | ~250-500 MB |
| Model Whisper (opsional, transkripsi) | 72-461 MB per model |

Minimum untuk merender saja ~0,6 GB; dengan rekam/capture ~0,9 GB; sisakan 1 GB lagi untuk cache dan hasil.

**Waktu dan RAM** (iklan `KnittoPromo`, 15 detik, 1080x1920, 450 frame; cache hangat kecuali disebut)

| Kondisi | Waktu | RAM puncak |
| --- | --- | --- |
| 12 thread, 4 worker | 29 dtk | 2,7 GB |
| 12 thread, 2 worker | 36 dtk | 2,1 GB |
| 12 thread, 1 worker | 46 dtk | 1,6 GB |
| Pertama kali / cache bundler kosong, 4 worker | 47 dtk | 3,1 GB |
| Simulasi 4 thread (2 core), 2 worker* | 39 dtk | 2,0 GB |
| Simulasi 2 thread (1 core), 1 worker* | 62 dtk | 1,3 GB |

\*Simulasi lewat pembatasan afinitas CPU: jumlah thread dibatasi, tetapi kecepatan clock tetap tinggi. Laptop hemat daya (clock rendah,
throttling) bisa 1,5-2x lebih lambat; itu perkiraan, belum diukur.

Komposisi lain pada mesin yang sama (2 worker): `LaunchVideo` 12 detik 1080p 44 dtk (1,6 GB), `PodcastClip` 15,7 detik 40 dtk (2,2 GB),
`StyleProof` 5 detik 1080p 19 dtk (1,9 GB). Rekam halaman 7 detik: 14 dtk, 0,9 GB. Remotion Studio: server ~0,9 GB (belum termasuk tab
browser), siap dalam ~3 dtk dengan cache hangat. Ada biaya tetap ~12 detik per render (bundling dan start browser), lalu
kira-kira 0,04-0,09 dtk per frame; jadi 1 menit video sekitar 1,5-3 menit render di mesin ini.

**Rekomendasi (perkiraan dari angka di atas)**

- Nyaman: 4+ core, RAM 16 GB, SSD. Cocok untuk Studio sambil render.
- Bisa dipakai: 2 core/4 thread, RAM 8 GB. Render jalan dengan 1-2 worker (otomatis); jangan membuka render dan Studio sekaligus.
- Tidak disarankan: RAM 4 GB. Tidak diuji; puncak render saja sudah 1,3-2,7 GB di luar sistem operasi dan browser.
- GPU khusus tidak diperlukan, tetapi penggunaannya tidak diukur. Internet dibutuhkan untuk `npm install`, unduhan Chrome pertama, dan `capture`.
- Timpa jumlah worker kapan saja: `npx remotion render ... --concurrency=1`.
