# Template: PodcastClip

Template klip podcast vertikal (1080×1920). Semua isi adalah **props** — tidak ada
teks atau aset yang di-hardcode, jadi satu komposisi bisa dipakai untuk episode
apa pun.

```
src/compositions/podcast-clip/
├─ PodcastClip.tsx     layout: header, b-roll, waveform, caption, progress
├─ Waveform.tsx        bar dari envelope RMS (bukan FFT)
├─ TimedCaption.tsx    halaman caption dari timing per kata
├─ types.ts            PodcastClipProps
└─ demo.ts             instance demo (TTS + pack clipping)
```

## Props

```ts
type PodcastClipProps = {
  show: string;          // "CLIPPING ROOM"
  episode: string;       // "EP. 42"
  speaker: string;
  audio: string;         // asset id, mis. "vo.podcast.demo-01"
  broll: string[];       // asset id, berganti tiap 5,2 detik
  words: {text: string; startMs: number; endMs: number}[];
  peaks?: number[];      // envelope RMS, 1 nilai per frame
  music?: string;        // asset id music bed, di-loop
  sfx?: {id: string; atMs: number}[];
  accent?: string;
};
```

## Pipeline demo (semua reproducible)

```
npm run vo      # 1. TTS + timestamp per kata
                # 2. normalisasi WAV ke 44.1k stereo
                # 3. envelope RMS -> podcast-demo-waveform.generated.json
npm run clip    # 4. render 471 frame
```

| Langkah | Skrip | Output |
| --- | --- | --- |
| TTS + timing | `scripts/assets/make_vo.ps1` | `public/library/vo/*.wav` + `src/data/podcast-demo.generated.json` |
| Normalisasi | `scripts/assets/polish_wav.py` | WAV 44.1k stereo |
| Envelope | `scripts/assets/make_waveform.py` | `src/data/podcast-demo-waveform.generated.json` |

## Catatan teknis yang penting

**1. Timing dari `SpeakProgress.AudioPosition` tidak sama dengan durasi file.**
SAPI melaporkan posisi pada rate internalnya; selisihnya ~28% dari WAV yang
ditulis. `make_vo.ps1` karena itu men-skala ulang semua timing ke durasi file
asli (`Get-WavDurationMs`), bukan memakai angka mentah.

**2. Waveform sengaja tidak memakai FFT.**
`visualizeAudio()` (via `useAudioData`) men-decode WAV TTS di headless Chrome
menjadi sampel ~1e-7 — durasi benar, isinya nyaris senyap — sehingga spektrum
tampil sebagai garis rata. Envelope RMS yang dihitung Python dari file yang sama
menghindari decoder sepenuhnya, deterministik, dan lebih cepat saat render.

**3. Audio di MP4 tetap benar.** `@remotion/media` mengekstrak audio lewat
Mediabunny/WebCodecs, bukan `decodeAudioData`, jadi hasil render punya suara
walau visualisasi FFT bermasalah. Diverifikasi dengan membandingkan ukuran
render `--muted` vs normal: 83 KB / 2 detik (~333 kbps).

## Untuk episode asli

1. Ganti `audio` dengan asset id klip asli (mp3/m4a/wav di `public/library/vo/`).
2. Hasilkan `words[]` dari transkripsi (mis. Whisper) dan `peaks[]` dari
   `make_waveform.py`.
3. Ganti `broll` dengan footage/episode terkait.
4. Sesuaikan `show`, `episode`, `speaker`.

Tidak ada perubahan kode yang diperlukan.
