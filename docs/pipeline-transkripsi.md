# Pipeline: file mentah → klip

Dari rekaman podcast (atau video apa pun yang ada audionya) sampai MP4 vertikal,
tanpa menyentuh kode komposisi.

```
audio/video  ──►  transcribe.py  ──►  words[]  ──┐
                                                 ├──►  clip.mjs  ──►  MP4
audio/video  ──►  make_waveform.py ─►  peaks[]  ─┘
```

## Perintah

```bash
# 1. transkripsi (model di-cache di .cache/whisper)
python scripts/transcribe.py public/library/vo/vo.podcast.demo-01.wav \
  --out src/data/podcast-demo.transcribed.json --model tiny.en

# 2. hitung envelope + props + render sekaligus
node scripts/clip.mjs \
  --audio vo.podcast.demo-01 \
  --transcript src/data/podcast-demo.transcribed.json \
  --out out/clip-whisper.mp4 \
  --show "CLIPPING ROOM" --episode "EP. 42" --speaker "David"
```

`clip.mjs` menerima hanya **asset id** untuk `--audio`, jadi file harus sudah
berada di `public/library/` dan terdaftar (`npm run scan`).

## Persyaratan

```bash
python -m pip install faster-whisper "av<14"
```

**Pin `av<14` wajib.** faster-whisper 1.2.1 memanggil
`av.open(..., metadata_errors="ignore")`, argumen yang tidak ada di PyAV 19;
tanpa pin, transkripsi gagal dengan `TypeError: open() got an unexpected keyword
argument 'metadata_errors'`.

Model diunduh dari HuggingFace pada pemakaian pertama ke `.cache/whisper`
(gitignored): `tiny.en` ~75 MB, `base.en` ~145 MB. Unduhan bisa terputus —
jalankan ulang, unduhan melanjutkan.

## Format transcript

```json
{
  "text": "Okay. Here is the thing about clipping...",
  "durationMs": 15297,
  "language": "en",
  "model": "tiny.en",
  "words": [{"text": "Okay.", "startMs": 0, "endMs": 1080}]
}
```

`PodcastClip` hanya butuh `words[]`; `text` dipakai untuk debug dan log.

## Auto-select hook

Dari satu podcast panjang, pilih beberapa momen terbaik lalu render semuanya:

```bash
node scripts/pick-clips.mjs \
  --audio vo.podcast.long-01 \
  --transcript src/data/podcast-long.transcribed.json \
  --count 3 --min 15 --max 32 --out out/clips
```

Heuristiknya sengaja bisa dijelaskan (tanpa ML):

| Sinyal | Arah |
| --- | --- |
| window mulai di awal kalimat | wajib |
| berakhir di akhir kalimat, durasi dalam `[min,max]` | wajib |
| kata per detik | + |
| kata pemicu (`you`, `why`, `never`, `the thing`, `workflow`, ...) | + |
| jeda > 600 ms di dalam window | − |

Window yang dipilih tidak boleh tumpang tindih. Hasilnya ditulis ke
`out/<slug>-picks.json` (skor, rentang waktu, kata pembuka) bersama props per
klip, jadi bisa diperiksa sebelum dipakai.

Karena klip mulai di tengah file, `pick-clips.mjs` memotong audio lewat
`trimBefore` (frame), menggeser semua timestamp kata ke 0, dan mengiris array
`peaks` sesuai window — komposisi tidak perlu tahu soal offset.

Contoh hasil pada podcast 60 detik:

```
long-01.mp4  3.6s–22.4s   skor 10.40  "Everyone thinks you need a fancy…"
long-02.mp4  25.3s–41.2s  skor  5.37  "Then add captions, because most people…"
long-03.mp4  43.9s–60.0s  skor 11.11  "And on the punchline, then stop.…"
```

## Durasi video dihitung otomatis

`Composition` memakai `calculateMetadata`, jadi `durationInFrames` diambil dari
kata terakhir (`endMs + 400 ms`), bukan angka hardcode. Konsekuensinya: file
audio 30 detik menghasilkan klip 30 detik tanpa mengubah kode, dan `--props`
dari `clip.mjs` bisa langsung dipakai.

## Hasil uji

| Model | Waktu | Akurasi pada VO demo |
| --- | --- | --- |
| `tiny.en` | ~8 s untuk 15 s audio (CPU, int8) | 33/34 kata benar — "hook" terbaca "look" |
| `base.en` | ~2–3× lebih lambat | belum diuji ulang setelah pin `av` |

Untuk bahasa Indonesia tambahkan `--language id` (model `.en` hanya bahasa
Inggris; pakai model multilingual seperti `small` untuk hasil lebih baik).

## Bahasa Indonesia

Model `.en` **tidak bisa** dipakai untuk audio Indonesia — pakai model
multilingual (`base`, `small`, `medium`) dan kunci bahasanya:

```bash
python scripts/transcribe.py public/library/vo/vo.podcast.id-demo-01.mp3 \
  --out src/data/podcast-id.json \
  --model small --language id \
  --prompt "Transkrip bahasa Indonesia tentang editing video: clipping, transkrip, hook, caption, irama."
```

`--prompt` bukan optional untuk bahasa Indonesia: kata pinjaman seperti
"clipping", "hook", "caption" sering dipaksakan ke ejaan Inggris.

Hasil uji pada audio 12,17 detik (29 kata):

| Model | F1 | Kesalahan |
| --- | --- | --- |
| `base` (145 MB) | 83% | "hook"→"hock", "kuat"→"kuak", "gaya caption"→"ga yakeption" |
| `small` (461 MB) + prompt | **96,6%** | hanya "transkrip"→"transcript" |

Kesimpulan: `small` adalah titik seimbang. `base` cukup untuk mencari momen,
tidak cukup untuk caption yang tampil di layar.

### Membuat bahan uji Indonesia

Tidak perlu rekaman: `edge-tts` bisa menyintesis suara Indonesia.

```bash
python -m pip install edge-tts
python -m edge_tts --voice id-ID-ArdiNeural \
  --text "Oke, jadi ini yang paling penting soal clipping..." \
  --write-media public/library/vo/vo.podcast.id-demo-01.mp3
```

Hasilnya mp3 — `make_waveform.py` mendekode lewat `av`, jadi tidak perlu
konversi ke WAV dulu.

## Glossary (koreksi ejaan)

Whisper `small` masih menulis kata serapan dengan ejaan Inggris
("transkrip" → "transcript"). Alih-alih menambal transkrip mentah, koreksi
dilakukan **di lapisan render** — transkrip asli tetap utuh untuk audit.

`src/lib/glossary.ts`:

```ts
export const DEFAULT_GLOSSARY = {
  transcript: 'transkrip',
  hock: 'hook',
  cliping: 'clipping',
  // ...
};
```

Berlaku otomatis di `TimedCaption`. Untuk satu kasus khusus, kirim override
lewat prop `glossary` pada komposisi. Pratinjau dampaknya:

```bash
node scripts/glossary.mjs src/data/podcast-id.small.json
```

```
kata berubah: 1
  transcript,  ->  transkrip,
```

Tanda baca dan huruf besar dipertahankan (kata dipecah jadi
`lead + core + trail` sebelum dicocokkan), jadi "Transcript," tetap jadi
"Transkrip,". Karena koreksi per kata, tidak ada risiko mengubah timing.

## Batasan

- CPU-only (`compute_type="int8"`). Untuk podcast 1 jam, potong dulu per segmen
  atau jalankan di mesin lain; transkripsi penuh bisa puluhan menit.
- VAD (`vad_filter=True`) memangkas bagian senyap — timing tetap absolut
  terhadap file asli, jadi caption tidak bergeser.
- Whisper memberi timestamp per kata, bukan per fonem; untuk caption karaoke
  yang sangat rapat, `perWord` di komponen caption tetap jadi penyetel terakhir.
