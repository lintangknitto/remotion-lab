---
name: qa-annotate
description: Menandai area, menulis caption, mention, step, severity, status, timestamp, dan garis ukur (redline) pada video QA (MP4 hasil rekaman) lewat props Remotion dengan koordinat piksel presisi, lalu membakar anotasi ke video dan mengekspor frame PNG untuk lampiran bug. Pakai ketika user minta "anotasi", "tandai area", "kasih caption ke video", "mention", atau menyiapkan bukti bug visual.
---

# QA annotate

Anotasi adalah **data (props Remotion)**, bukan gambar yang digambar dengan mouse. Agent mengukur koordinat piksel dari frame asli, menulisnya ke JSON, lalu merender. Gaya (warna, font, bentuk) datang dari tema family `qa` (`src/styles/profiles/qa.ts`) lewat kit `src/components/qa/`.

## Aturan emas: koordinat hanya valid selama isi layar DIAM

Koordinat piksel mengacu ke satu frame. Begitu halaman di-scroll, diklik, atau berganti slide, posisi elemen berubah dan kotak akan **meleset ke area kosong**. Jadi:

1. Rekam dengan `record-web`; ia menulis `out/qa/<nama>.timeline.json` berisi kapan tiap aksi mulai (`at`) dan kapan aksi berikutnya mulai (`next`).
2. Jendela diam = dari `at` aksi `wait` sampai `next`-nya (beri jeda ±0,7 dtk setelah scroll agar animasi scroll selesai).
3. Ambil **frame referensi di tengah tiap jendela**, ukur elemen di frame itu.
4. Batasi `from`/`to` anotasi **di dalam jendela itu**. Jangan menampilkan anotasi saat halaman bergerak.
5. Verifikasi dengan frame hasil bake di tengah tiap jendela.

## Langkah

1. **Rekam**: `npm run record -- --url <url> --as qa --name <nama> --steps <steps.json>` (lihat skill `record-web`). Baca `out/qa/<nama>.timeline.json`.
2. **Frame referensi** per jendela (detik = tengah jendela):
   ```bash
   npm run frame -- --in out/qa/<nama>.mp4 --at <detik> --out tmp/ref.png
   ```
   (lintas OS; jangan memanggil biner ffmpeg langsung dari `node_modules`)
3. **Ukur** dengan `read_image` pada `tmp/ref.png`: piksel kiri-atas `x,y` dan ukuran `w,h` elemen (kanvas 1920×1080).
4. **Tulis** `out/qa/<nama>.annotations.json`:
   ```json
   {"variant": "dark", "items": [
     {"type": "step",      "from": 0.2, "to": 2.2, "x": 40,  "y": 120, "step": 1, "total": 2, "title": "Periksa hero slider"},
     {"type": "severity",  "from": 0.35,"to": 2.2, "x": 40,  "y": 250, "level": "P2"},
     {"type": "timestamp", "from": 0.35,"to": 2.2, "x": 330, "y": 250, "seconds": 1.0},
     {"type": "box",       "from": 0.5, "to": 2.2, "x": 190, "y": 687, "w": 152, "h": 59, "tone": "warn", "label": "CTA", "labelAt": "bottom"},
     {"type": "redline",   "from": 0.8, "to": 2.2, "x1": 150, "y1": 632, "x2": 150, "y2": 697},
     {"type": "caption",   "from": 1.0, "to": 2.2, "x": 430, "y": 690, "text": "Catatan", "tone": "warn"},
     {"type": "mention",   "from": 1.3, "to": 2.2, "x": 430, "y": 775, "text": "@david"},
     {"type": "status",    "from": 4.9, "to": 7.0, "x": 40,  "y": 250, "status": "pass"}
   ]}
   ```
   Tipe: `box` (kind `box|circle|spotlight`, `labelAt` `top|bottom`), `caption`, `mention`, `step`, `severity` (P0-P3), `status` (`pass|fail|warn|skip`), `timestamp` (`seconds` atau `text`), `redline`. Nada (`tone`): `accent|danger|warn|success|info`. `variant`: `dark|light|contrast`.
5. **Validasi** (cepat, tanpa render): `npm run annotate -- --in out/qa/<nama>.mp4 --ann out/qa/<nama>.annotations.json --dry`. Nilai pecahan (0<v<1) ditolak karena itu tanda fraksi, bukan piksel.
6. **Preview** opsional di Remotion Studio: `npm run studio` → `QaAnnotate` (props bisa diedit langsung).
7. **Bake + ekspor frame**: `npm run annotate -- --in out/qa/<nama>.mp4 --ann out/qa/<nama>.annotations.json --frames 50,175` (nomor frame = detik × 30). Hasil: `out/qa/<nama>.annotated.mp4` dan `out/qa/<nama>.frame-<n>.png`.
8. **Verifikasi** tiap frame dengan `read_image`. Kotak meleset = ukur ulang di frame jendela yang benar; jangan ubah angka tanpa mengukur.

## Batasan

- Kotak diukur dari rekaman; bila halaman berubah tinggi/tata letak di antara dua rekaman, ukur ulang.
- Konten catatan di contoh harus ditandai "CONTOH" bila bukan temuan sungguhan; jangan mengarang bug pada situs orang.
- Bake memakai Remotion, bukan ffmpeg sistem (ffmpeg bawaan tidak punya `drawbox`/`drawtext`).
- Video sumber disalin ke `public/qa/` saat bake (di-ignore git). `--dry` tidak menyalin apa pun.
- Tema `QaAnnotate` baru mendukung `variant`; belum menerima brand.
