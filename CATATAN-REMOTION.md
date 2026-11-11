# Catatan belajar Remotion (v4.0.542)

## 1. Mental model

> "Video is a function of images over time."

Remotion tidak merekam layar dan tidak punya timeline editor seperti After Effects.
Yang terjadi:

1. Kamu tulis komponen React biasa.
2. Remotion memberi komponen itu **nomor frame** (`useCurrentFrame()`).
3. Komponen merender tampilan untuk frame tersebut.
4. Headless Chrome men-*screenshot* tiap frame → FFmpeg menyambungnya jadi MP4.

Konsekuensinya: tidak ada animasi implisit. Semua yang bergerak harus dihitung
dari frame. Tidak boleh ada `setTimeout`, CSS `@keyframes`, `requestAnimationFrame`,
atau state yang bergantung pada wall-clock — render bisa jalan paralel di banyak
worker, dan tiap frame harus deterministik.

Properti video = 4 angka: `width`, `height`, `fps`, `durationInFrames`.
Frame pertama `0`, terakhir `durationInFrames - 1`.

## 2. Building block

```tsx
// src/Root.tsx
<Composition
  id="LaunchVideo"           // dipakai di CLI: remotion render LaunchVideo
  component={LaunchVideo}
  durationInFrames={360}
  fps={30}
  width={1920}
  height={1080}
  defaultProps={{...}}       // opsional
/>
<Still id="Poster" component={Poster} width={1920} height={1080} />
```

| API | Fungsi |
| --- | --- |
| `useCurrentFrame()` | frame saat ini (di dalam `<Sequence>` sudah digeser) |
| `useVideoConfig()` | `{fps, width, height, durationInFrames}` |
| `interpolate(v, in[], out[], opts)` | mapping linear; opsi `clamp`, `easing`, `posterize` |
| `spring({frame, fps, config, delay, durationInFrames})` | animasi fisika, hasil 0→1 |
| `Easing.*` | `Easing.bezier`, `Easing.out(Easing.cubic)`, `Easing.step1` |
| `<AbsoluteFill>` | div `position:absolute; inset:0` |
| `<Sequence from durationInFrames>` | menaruh komponen di timeline; frame anak digeser |
| `<Freeze frame={n}>` | membekukan subtree di frame tertentu (dipakai di scene 2) |
| `<Img>`, `<Audio>`, `<Video>`, `staticFile()` | media |
| `delayRender()` / `continueRender()` | menahan render sampai data async siap |
| `<Composition calculateMetadata>` | durasi/props dihitung runtime (mis. dari API) |

`<Sequence>` makin jarang dipakai langsung — versi baru punya `<Track>` dan
`<Interactive.Div>` yang tampil sebagai layer di timeline Studio dan bisa
di-drag/edit di Studio (nilainya ditulis balik ke kode).

## 3. Timeline & transisi

- Beberapa `<Sequence>` = layer bertumpuk; `from` mengatur kapan muncul.
- Crossfade manual: bungkus tiap scene dan animasikan `opacity` dari frame global
  (itu yang dipakai di `Scene` pada `src/Background.tsx`).
- Untuk transisi siap pakai ada `@remotion/transitions` (`TransitionSeries`:
  fade, slide, wipe, flip, clockWipe).
- Audio/Video punya props timing sendiri (`from`, `trimBefore`,
  `durationInFrames`, `playbackRate`) sehingga tidak perlu dibungkus Sequence.

## 4. Pipeline render

```
bundle (esbuild/webpack) → Chrome Headless Shell (1 tab per worker)
   → screenshot per frame → FFmpeg encode → out.mp4
```

Perintah CLI penting:

```bash
npx remotion studio                # preview + timeline + props editor
npx remotion render <entry> <id> out.mp4
npx remotion still  <entry> <id> out.png --frame=175
npx remotion compositions <entry>  # list composition
npx remotion bundle <entry>        # bundle statis untuk hosting
npx remotion benchmark             # cari concurrency optimal
```

Opsi render yang sering dipakai: `--concurrency`, `--crf`, `--codec=h264|vp8|prores|gif`,
`--image-format=jpeg|png`, `--scale`, `--every-nth-frame` (gif),
`--muted`, `--props='{"json":true}'`, `--log=verbose`.

Server-side / otomatis (mis. dari Next.js route atau cron):

```ts
import {bundle} from '@remotion/bundler';
import {selectComposition, renderMedia} from '@remotion/renderer';

const serveUrl = await bundle({entryPoint: './src/index.ts'});
const composition = await selectComposition({serveUrl, id: 'LaunchVideo', inputProps});
await renderMedia({composition, serveUrl, codec: 'h264', outputLocation: 'out.mp4', inputProps});
```

Untuk volume besar: **Remotion Lambda** (`@remotion/lambda`) menyebar frame ke
banyak fungsi AWS Lambda, lalu menyatukannya — ini jalur yang dipakai untuk
render massal (mis. 1000 video personalisasi).

## 5. Ekosistem paket

`@remotion/cli` `@remotion/bundler` `@remotion/renderer` (inti) ·
`@remotion/player` (putar komposisi di React app) ·
`@remotion/transitions` · `@remotion/shapes` · `@remotion/paths` ·
`@remotion/animation-utils` (CSS transform string) · `@remotion/layout-utils`
(measure text) · `@remotion/google-fonts` · `@remotion/lottie` · `@remotion/gif` ·
`@remotion/three` (react-three-fiber) · `@remotion/skia` · `@remotion/rive` ·
`@remotion/captions` · `@remotion/media-utils` · `@remotion/motion-blur` ·
`@remotion/tailwind` · `@remotion/zod-types` (schema props).

## 6. Lisensi (penting untuk kerja kantor)

Remotion gratis untuk individu dan perusahaan kecil; perusahaan besar kena
license fee. Cek halaman pricing: https://www.remotion.dev/docs/license/pricing
Jadi sebelum dipakai di produk komersial, pastikan ukuran tim/company cocok.

## 7. Kapan cocok, kapan tidak

Cocok:
- video yang isinya data / teks / angka yang berubah-ubah (report, invoice, recap),
- batch render (1000 variasi dari satu template),
- video yang harus konsisten dengan design system (pakai komponen React yang sama),
- konten yang digenerate otomatis (chart, subtitle, sosmed clip).

Kurang cocok:
- editing footage kamera manual (itu ranah Premiere/DaVinci),
- efek visual sinematik berat,
- video panjang dengan banyak potongan footage.

## 8. Jebakan yang saya temui / perlu diingat

- **Determinisme**: jangan pakai `Math.random()` langsung (pakai `random()` dari
  Remotion yang di-seed per frame), jangan andalkan waktu sistem.
- **Font**: font dari `@remotion/google-fonts` atau `delayRender` saat load font,
  kalau tidak frame pertama bisa render dengan font fallback.
- **Layout stabil**: animasikan `transform`/`opacity`, hindari animasi
  `width/height/top/left` supaya tidak reflow dan tidak geser antar frame.
- **Gambar/audio remote**: bungkus dengan `delayRender()` + `continueRender()`,
  atau pakai komponen media Remotion yang sudah menangani itu.
- **Render pertama lambat** karena download Chrome Headless Shell (~131 MB) dan
  FFmpeg; setelah itu cache-nya dipakai ulang.
- **Windows + sandbox**: spawn Chrome/FFmpeg butuh akses proses; di environment
  yang membatasi spawn, render gagal dengan `spawn EPERM` / `FFmpeg ... Permission denied`.
  Solusi: jalankan render dengan akses penuh, dan arahkan `TEMP` ke folder project.
- **Memori**: banyak layer blur/shadow besar + concurrency tinggi bisa bikin
  worker kehabisan RAM; turunkan `--concurrency` atau `--disallow-parallel-encoding`.
