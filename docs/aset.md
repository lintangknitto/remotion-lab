# Sistem aset remotion-lab

Tujuan: **73 genre, 17 family, 55 aset — tanpa satu pun file terduplikasi.**

## Tiga lapis, satu arah

```
public/library/          file fisik, 1 file = 1 tempat, disusun per tipe
      ↑
src/packs/               daftar referensi per genre (JSON, bukan salinan)
      ↑
src/library/index        id -> path, hash, ukuran (generated)
```

- **Library** menyimpan byte. Tidak ada yang tahu genre di sini.
- **Pack** menyimpan pilihan. Tidak ada byte di sini, cuma id.
- **Index** menjembatani keduanya dan mendeteksi duplikat.

Ganti `texture.noise.film-4k` sekali di library → 30+ pack yang menyebutnya
langsung ikut berubah. Tidak ada folder yang perlu diedit.

## Skema id

```
<type>.<sub>.<nama>-<nn>.<ext>
sfx.impact.heavy-01.wav
texture.vhs.scanline-01.png
image.gradient.mesh-02.png
music.remix.punchy-01.wav
```

`id` = nama file tanpa ekstensi. Karena itu file boleh dipindah antar subfolder
tanpa mengubah referensi.

## Pack: `src/packs/<family>/<genre>.json`

```json
{
  "id": "beat-edit/jedag-jedug",
  "family": "beat-edit",
  "genre": "jedag-jedug",
  "label": "Jedag Jedug",
  "extends": "_shared",
  "defaults": {"aspect": "9:16", "fps": 30, "cutFrames": [4, 10], "duration": [15, 30]},
  "slots": {
    "music": ["music.remix.punchy-01"],
    "impact": ["sfx.impact.heavy-01", "sfx.impact.heavy-02"],
    "texture": ["texture.vhs.scanline-01", "texture.vhs.tracking-01"]
  },
  "missing": []
}
```

`_shared.json` di folder family berisi slot umum. Saat generate, keduanya
digabung (genre menang untuk slot yang sama, isi digabung lalu di-dedup) menjadi
`src/packs/index.generated.json` yang dipakai runtime.

Slot yang dipakai: `music ambience impact whoosh transition ui glitch texture
overlay background image caption font clip lottie`.

## Pakai di komposisi

```tsx
import {bindPack} from '../lib/pack';

const pack = bindPack('beat-edit/jedag-jedug');

pack.src('music')            // staticFile URL aset pertama di slot
pack.pick('texture', frame)  // pilih deterministik per frame
pack.all('impact')           // semua id di slot
pack.pack.missing            // material yang belum ada
```

Tanpa bind:

```tsx
import {assetSrc} from '../lib/assets';
<Img src={assetSrc('image.gradient.dark-01')} />
```

`assetSrc()` melempar error yang menyebut id terdekat kalau salah ketik —
gagal di awal render, bukan jadi frame kosong.

## Caption

Caption bukan teks yang disimpan di pack. Pack hanya menyimpan **plate** —
gambar yang duduk di belakang kata. Gaya dan animasinya ada di kode:

`src/components/text/Caption.tsx`

| Preset | Plate | Ciri |
| --- | --- | --- |
| `tiktok` | `image.caption.pill-01` | pill kuning, huruf hitam, uppercase |
| `boxed` | `image.caption.box-01` | plat gelap, aman di atas footage ramai |
| `marker` | `image.caption.stroke-01` | garis marker di bawah baris (`bgMode: underline`) |
| `karaoke` | — | kata aktif membesar + ganti warna |
| `bubble` | `image.caption.bubble-01` | balon bicara, huruf gelap |

```tsx
<Caption text="kalau kamu edit pakai react" preset="karaoke" start={12} perWord={5} />
```

Karena plate-nya satu file, mengganti `image.caption.pill-01` sekali akan
mengubah semua pack yang memakainya — persis alasan sistem ini dibuat.

Menambah plate kedua (mis. pill biru) cukup: generate PNG baru, daftarkan di
`clipping/_shared` atau `talking-head/_shared` pada `scripts/catalog.mjs`, lalu
`npm run packs`. Nol perubahan kode.

## Alur kerja

| Tugas | Perintah |
| --- | --- |
| Regenerate seluruh aset | `npm run assets` |
| Tambah file dengan id benar | `node scripts/add-asset.mjs file.wav --type sfx --name impact.heavy-03` |
| Scan ulang + deteksi duplikat | `npm run scan` |
| Tambah/ubah genre | edit `scripts/catalog.mjs` lalu `npm run packs` |
| Audit pack | `npm run check` |

### Menambah genre

1. Tambahkan entri di `scripts/catalog.mjs` (di bawah family yang sesuai).
2. `npm run packs` → JSON pack + `index.generated.json` + `catalog.generated.json`.
3. `npm run check` → pastikan tidak ada referensi rusak.

Tidak ada folder binary baru. Nambah kategori = nambah satu entri katalog.

### Menambah aset

```bash
node scripts/add-asset.mjs ./boom.wav --type sfx --name impact.heavy-03
```

Skrip menyalin ke `public/library/sfx/`, menjalankan scan, lalu menyarankan id
untuk dipakai di pack.

## File yang tidak boleh diedit manual

- `src/library/index.generated.json`
- `src/library/ids.ts`
- `src/packs/index.generated.json`
- `src/packs/<family>/*.json` (hasil `gen-packs`)
- `src/registry/catalog.generated.json`

Semuanya ditandai `AUTO-GENERATED` atau ditimpa tiap generate.

## Status pack

`npm run check --all` membaca `status`:

- **ready** — semua slot wajib terisi, minimal 6 aset
- **partial** — ada aset, tapi slot wajib masih kosong (mis. `amv` belum punya klip)
- **empty** — belum ada aset sama sekali

Field `missing` mencatat material yang belum ada dan tidak bisa digenerate
(footage klien, klip anime, transkrip). Ini yang harus dicari manual.

## Lisensi

Semua file di `public/library` saat ini **digenerate** oleh
`scripts/assets/generate.py` — bebas dipakai, tanpa atribusi. Musik dan SFX
adalah sintesis sederhana: cukup untuk template dan demo, bukan pengganti
library berlisensi untuk produksi klien.

Kalau nanti memasukkan aset pihak ketiga, catat sumbernya di `LICENSES.md`
per folder dan jangan taruh aset berlisensi terbatas di repo publik.
