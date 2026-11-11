# Style system (rancangan)

Status: **fase 0 dan 1 selesai** (engine + 4 family: `qa`, `ads`, `corporate`, `motion-graphic`).
Fase 2 sebagian (QaAnnotate dan KnittoPromo sudah memakai tema; LaunchVideo, StudioProof, PodcastClip
masih berwarna hardcode). Fase 3 (14 family lain) dan fase 4 (aset berwarna jadi prosedural) belum.
Tujuan: tiap family punya gaya sendiri (warna, tipografi, UI, gerak) dan warnanya **tidak saklek**
— bisa di-rebrand dari satu warna seed tanpa menyentuh komposisi.

Keputusan yang diambil: font dibundel (opsi A di bagian 5), dan fase 1 mencakup empat family di atas.
Lokasi kode: `src/styles/` (engine), `src/components/<family>/` (UI kit), `scripts/check-style.mjs` (audit).

## 1. Diagnosis (terukur dari repo)

| Temuan | Bukti |
| --- | --- |
| Warna tersebar | ~120 hex/rgba di 15 file; tiap komposisi punya konstanta sendiri |
| Font tidak terkelola | `Segoe UI`/`Cascadia Code` (Windows-only) disalin ke ~8 file; slot `font` kosong |
| Warna terbakar di aset | pill kuning, mesh ungu, light-leak = PNG berwarna, tidak bisa di-tema |
| Pack tidak membawa gaya | pack = daftar id file; 17 family berbagi ~16 gambar latar |
| Salah nada | fashion-beauty hanya `vhs.scanline`; food hanya satu light-leak; meme tanpa latar |

Akar masalah: katalog mendefinisikan **format** (rasio, fps, tempo potong, slot
file) tetapi tidak mendefinisikan **gaya**.

## 2. Arsitektur: tiga lapis

```
src/styles/profiles/<family>.ts   ATURAN gaya (bukan hex): mood, mode, harmoni, chroma, font, UI, gerak
src/styles/resolve.ts             resolveTheme(family, {genre?, variant?, seed?, brand?}) -> Theme konkret
src/styles/ThemeProvider.tsx      useTheme() dipakai komposisi; komposisi tidak menulis warna
```

Alur: `profil family` + (opsional) `genre override` + (opsional) `brand/seed`
-> `Theme` (hex per role, dihitung deterministik). Komposisi hanya membaca
`theme.color.accent`, `theme.type.display`, `theme.radius.card`, dst.

## 3. Warna yang tidak saklek

Profil **tidak menyimpan hex**. Ia menyimpan aturan:

```ts
color: {
  mode: 'dark' | 'light' | 'either',
  seed: 'brand' | {h: [min, max]},   // hue boleh brand, atau rentang hue family
  harmony: 'mono' | 'analogous' | 'complementary' | 'split' | 'triad',
  chroma: 'low' | 'mid' | 'high',
  variants: {punchy: ..., clean: ..., luxury: ...},   // 3-4 mood per family
  lock: {success: 'green', danger: 'red', warn: 'amber'}   // semantik tidak ikut bergeser
}
```

Resolver bekerja di **OKLCH** (perseptual, jadi terang-gelap konsisten antar hue):

1. Ambil seed: `--seed #hex` > `brand.json` (hasil `capture-site`) > default family.
2. Turunkan role: `bg, surface, surface2, text, muted, accent, accent2, border`.
3. Pasang warna semantik terkunci (fail tetap merah, pass tetap hijau).
4. **Jaminan kontras:** teks vs latar minimal 4.5:1; kalau kurang, lightness digeser otomatis.

Hasilnya satu Knitto-biru bisa jadi tema `corporate` (tenang), `ads` (nyala),
dan `qa` (netral) — tiga tampilan berbeda dari seed yang sama.

**Uji anti-"ungu semua"** (`npm run check:style`): bucket hue accent ke 6 zona
60°; gagal bila satu zona memuat lebih dari 4 family kromatik, atau kontras
teks < 4.5 pada tema mana pun.

## 4. Aset: pisahkan "mask" dari "warna"

| Jenis | Perlakuan |
| --- | --- |
| Mask netral (grain, scratches, halftone, scanline, vignette, grid) | tetap PNG, diwarnai lewat blend/mask memakai warna tema |
| Layer berwarna (gradient, mesh, light-leak, bokeh) | jadi komponen prosedural dari token (`<MeshBackground/>`, `<LightLeak/>`) |
| Plate caption (pill, box, bubble) | jadi komponen (div + radius + fill token), bukan PNG |

14 dari 26 gambar library sudah netral; yang berwarna (12) yang diganti.

## 5. Font

Pilih satu (perlu keputusan):

- **A. Bundel woff2** di `public/library/fonts/` (lisensi OFL, boleh redistribusi,
  ~100-300 KB per font). Render identik di semua OS, tanpa internet. *Direkomendasikan.*
- B. `@remotion/google-fonts`: lebih ringan di repo, tapi butuh jaringan saat render.

Tiap family memakai pasangan display + body (+ mono bila perlu), maksimal ~10 font total.

## 6. Matriks gaya 18 family

`qa` adalah family baru (lihat bagian 7).

| Family | Mood | Mode | Warna | Tipografi | UI kit | Gerak |
| --- | --- | --- | --- | --- | --- | --- |
| beat-edit | agresif, ritmis | dark | mono + 1 aksen panas, chroma tinggi | condensed heavy, uppercase | tanpa UI; flash hitam/putih | hard cut 4-10f, shake/zoom-punch |
| vfx-edit | teknis, eksperimen | dark | analogous dingin + split RGB | grotesk + mono | HUD tipis, scanline | glitch, whip-pan |
| amv | sinematik anime | dark | split-complementary teal-oranye, chroma tinggi | sans JP-style | letterbox, subtitle kuning | speed-ramp, light-leak |
| clipping | informatif, cepat | dark | netral + 1 aksen brand | heavy sans | caption karaoke, progress, speaker chip, waveform | pop per kata |
| talking-head / UGC | personal, hangat | light | analogous hangat, pastel | rounded ramah | bubble, sticker, panah | spring memantul |
| meme | kasar, lucu | either | hitam/putih + kuning | impact-style | teks atas-bawah, sticker | patah, zoom, shake |
| motion-graphic | bersih, edukatif | either | complementary seimbang, blok warna datar | geometric sans | bentuk, ikon, chart, lower third | ease-out-expo, stagger |
| corporate | tepercaya | light/navy | chroma rendah, analogous, brand | humanist sans + serif judul | lower third, logo board, stat card, garis tipis | fade/slide lambat |
| ads | konversi | either | complementary, chroma tinggi, CTA kontras | bold grotesk | price tag, badge diskon, tombol CTA, endcard, countdown | pop snappy 10-24f |
| cinematic | emosional | dark | chroma rendah, teal-oranye / mono hangat | serif elegan / sans tipis tracking lebar | letterbox 2.39, title card minimal | push lambat, fade |
| slideshow | nostalgia | light (kertas) | krem/sepia, chroma rendah | serif / tulisan tangan | bingkai polaroid, tape, cap tanggal | Ken Burns, crossfade lembut |
| gaming | intens | dark | **neon memang cocok**: cyan/magenta/hijau | techno / condensed | HUD, killfeed, hitmarker, scoreboard | impact shake, glitch |
| sports | energi atletik | either | warna tim (seed), chroma tinggi, bentuk diagonal | italic condensed bold | scoreboard, stat card, timer | whip, speed line |
| food | hangat, menggugah | light | **hanya hangat** (merah-oranye-kuning-krem), tanpa biru | serif ramah / rounded | price tag, kartu langkah resep, daftar bahan | makro lambat, lembut |
| fashion-beauty | editorial, chic | either | netral + 1 blush/earth | serif kontras tinggi + sans lebar | caption kecil, garis tipis, product tag | fade lambat, jump cut halus |
| ai-generated | futuristik | dark | gradien iridescent (**ungu/cyan boleh di sini**) | sans netral modern | subtitle bersih, chip prompt, badge "AI" | morph, blur lembut |
| greeting | perayaan, kultural | per genre | palet per genre (lebaran hijau-emas, natal merah-hijau, wisuda navy-emas, anniversary rose-gold) | script/ornamental + serif | bingkai ornamen, kartu ucapan | reveal lambat, kilau |
| **qa** | presisi, bukti | dark & light (ikut app yang direkam) | netral + 1 aksen anotasi; **semantik terkunci** | sans UI + mono (timestamp, selector) | callout, step badge, timestamp chip, severity tag, pill pass/fail, redline, split before-after, tabel matriks tes, device frame | minimal, tidak mengalihkan; spotlight area, ripple klik |

## 7. Family baru: `qa`

Alasan: sudah ada pipeline nyata ([record-web](../.agents/skills/record-web/SKILL.md) +
[qa-annotate](../.agents/skills/qa-annotate/SKILL.md)) tapi belum ada family di katalog.

| Genre | Isi | Rasio |
| --- | --- | --- |
| `bug-report` | rekaman + kotak/caption area bermasalah, severity tag, langkah reproduksi | 16:9 |
| `fix-verification` | split before/after, pill FAIL -> PASS | 16:9 |
| `uat-walkthrough` | alur fitur dengan step badge "STEP 3/7" + caption | 16:9 / 9:16 |
| `test-run-recap` | tabel matriks tes, hitungan pass/fail/skip, durasi | 16:9 |
| `design-review` | redline jarak/ukuran, perbandingan desain vs implementasi | 16:9 |

Slot: `ui` (`sfx.click.ui-01/02`, `sfx.pop.notify-01`), musik opsional (default senyap).
`missing`: footage rekaman (dibuat `record-web`), komponen redline, tabel matriks.

## 8. Fase implementasi

| Fase | Isi | Hasil yang bisa dilihat |
| --- | --- | --- |
| 0 Fondasi | `src/styles/` (tipe, OKLCH, resolver, kontras), `useTheme`, `check:style`, keputusan font | `npm run check:style` lulus/gagal |
| 1 Prioritas | family `qa`, `ads`, `corporate`, `motion-graphic` + UI kit nyata | video Knitto + contoh QA dari footage website |
| 2 Migrasi | pindahkan komposisi lama ke theme (LaunchVideo, StudioProof, PodcastClip, KnittoPromo, QaAnnotate) | nol hex di komposisi |
| 3 Sisa family | profil + satu "style proof" per family | `StyleGallery`: 18 panel berdampingan |
| 4 Aset | ganti PNG berwarna jadi komponen prosedural; generator hanya buat mask netral | `npm run assets` tidak lagi memproduksi warna terbakar |

Catatan: footage Knitto (screenshot/rekaman website, logo, foto kain) diambil
dengan [scripts/capture-site.mjs](../scripts/capture-site.mjs) — skrip sudah ada, belum dijalankan.
