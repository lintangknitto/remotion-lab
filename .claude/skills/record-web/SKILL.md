---
name: record-web
description: Rekam halaman web (URL lokal atau publik) menjadi MP4 memakai Playwright lalu konversi lewat ffmpeg Remotion, lengkap dengan timeline aksi untuk menentukan jendela anotasi. Pakai ketika user minta "record", "rekam layar/halaman", "screen recording", atau membuat aset video / bahan QA dari halaman web di remotion-lab.
---

# Record web

Merekam halaman lewat Chromium headless (Playwright), hasilnya MP4 1920×1080 (atau sesuai `--width/--height`).

## Perintah

```bash
npm run record -- --url <url> [--name <id>] [--duration <ms>] [--as raw|asset|qa] [--steps <file.json>] [--out <path>] [--keep-load]
```

| Flag | Fungsi |
| --- | --- |
| `--url` | halaman yang direkam (wajib) |
| `--name` | nama file tanpa ekstensi |
| `--duration` | tambahan jeda (ms) di akhir |
| `--as raw` (default) | `out/record/<name>.mp4` |
| `--as asset` | `public/library/video/<name>.mp4` — setelah itu `npm run scan` |
| `--as qa` | `out/qa/<name>.mp4` — bahan QA |
| `--steps` | JSON array aksi: `goto`, `click`, `fill`, `wait`, `scroll` |
| `--keep-load` | jangan potong detik memuat halaman (default: dipotong) |

Contoh langkah:

```json
[
  {"action": "wait", "ms": 2200},
  {"action": "scroll", "dy": 420},
  {"action": "wait", "ms": 1500},
  {"action": "click", "selector": "button#login"}
]
```

## Keluaran

- `<name>.mp4`: detik memuat halaman **otomatis dipotong** (Playwright merekam layar putih saat halaman memuat). Pesan `dipotong N dtk awal` menunjukkan berapa.
- `<name>.timeline.json`: `{loadTrimmedSec, steps:[{action, at, next, ...}]}` dengan waktu relatif ke video hasil potong. `at`..`next` = lamanya satu aksi. Pakai ini untuk menentukan jendela diam sebelum menganotasi (skill `qa-annotate`).

## Alur keputusan

1. Halaman butuh server lokal yang belum jalan? Jalankan sebagai background job, cek URL-nya merespons. Jangan mulai server baru tanpa diminta user.
2. Butuh interaksi? Tulis `--steps`. Selector yang tidak ketemu akan error.
3. Untuk anotasi: simpan ke `--as qa`, baca timeline, lanjut ke `qa-annotate`.
4. Untuk video Remotion: `--as asset`, lalu `npm run scan`.
5. Cek hasil: `npm run frame -- --in <mp4> --at <detik>` lalu lihat PNG-nya dengan `read_image` (jangan klaim sukses hanya dari exit code).

## Batasan

- Merekam **halaman web**, bukan layar/jendela desktop.
- Browser Playwright harus terpasang (`npx playwright install chromium`).
- Konversi memakai ffmpeg bawaan Remotion yang dicari otomatis sesuai OS (`scripts/lib/bin.mjs`); tidak perlu ffmpeg sistem.
- Situs dengan banner cookie/popup akan terekam apa adanya; tutup dengan langkah `click` bila mengganggu.
- Hasil di `out/` tidak di-commit. Aset library di-commit hanya bila diminta.

## Keamanan dan etika

- Rekam hanya situs/halaman milik user atau yang user izinkan. Jangan merekam halaman berisi kredensial, token, atau data pribadi; rekaman menyimpan semua yang tampil di layar.
- Jangan mengetik password/token ke `fill`. Untuk halaman yang perlu login, minta user menyiapkan akun uji atau sesi yang aman.
- `--url` dapat berupa alamat internal (`localhost`, intranet). Jangan merekam alamat internal yang tidak disebut user.
- Jangan membuka server atau jaringan baru tanpa diminta.
