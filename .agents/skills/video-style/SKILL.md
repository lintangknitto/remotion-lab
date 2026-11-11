---
name: video-style
description: Membuat atau mengubah video Remotion dengan gaya per family (qa, ads, corporate, motion-graphic) dan brand klien memakai style system proyek (tema, token warna, font, UI kit). Pakai ketika user minta video promosi/iklan/QA/corporate/explainer, minta mengganti warna atau brand, menangkap identitas sebuah website, atau menambah family gaya baru di remotion-lab.
---

# Video style system

Setiap family punya gaya sendiri (warna, tipografi, bentuk, gerak, UI kit). Warna **tidak saklek**: profil menyimpan aturan, hex dihitung dari seed/brand.

## Peta file

```
src/styles/profiles/<family>.ts   aturan gaya (mood, mode, harmoni, kroma, font, bentuk, gerak)
src/styles/brands/<brand>.ts      identitas klien (primary, accent, font, radius, logo)
src/styles/resolve.ts             resolveTheme(profile, {variant, genre, seed, brand, mode}) -> Theme
src/styles/react.tsx              ThemeProvider, useTheme, textStyle, useEnter, ThemeBackground, Photo
src/components/<family>/          UI kit family + Proof.tsx
src/compositions/style-proof/     komposisi StyleProof (props bisa diedit di Studio)
public/brand/<brand>/             hasil capture (LOKAL, di-ignore git): brand.json, logo, photos/, sections/
```

Family bergaya saat ini: `qa`, `ads`, `corporate`, `motion-graphic`. Family lain ada di katalog tapi belum punya profil (`getProfile` melempar pesan jelas).

## Alur membuat video

1. **Pilih family + genre** dari `scripts/catalog.mjs` (mis. `ads/iklan`: 9:16, potongan 10-24 frame). Aset audio/tekstur ikut slot pack: `bindPack('ads/iklan').src('music')`.
2. **Brand klien** (bila ada website): `npm run capture -- --url https://situs.id --name <brand>`. Itu mengukur warna/font dari DOM dan mengunduh foto + logo ke `public/brand/<brand>/`. Buat `src/styles/brands/<brand>.ts`: `primary` = warna latar dominan, `accent` = warna tombol CTA (lihat `brand.json`). Jangan menebak warna.
3. **Tema**: `resolveTheme(getProfile('ads'), {brand, genre:'iklan', variant:'punchy'})`, bungkus komposisi dengan `<ThemeProvider theme={theme}>`. Tema bersarang diperbolehkan (adegan terang di video gelap).
4. **Bangun dari kit**, bukan div baru: `BigClaim`, `CtaButton`, `Ticker` (ads); `LowerThird`, `StatCard` (corporate); `Counter`, `BarChart`, `KineticHeadline` (motion-graphic); `Callout`, `StepBadge`, `DeviceFrame` (qa).
5. **Audit**: `npm run typecheck` dan `npm run check:style` (juga `-- --brand <brand>`). Audit gagal bila kontras kurang atau terlalu banyak family bernuansa sama.
6. **Verifikasi visual**: `npx remotion still src/index.ts <Comp> out/x.png --frame=N` lalu `read_image`. Cek tiap adegan; jangan hanya satu frame.

## Aturan keras

- Dilarang menulis hex/rgb di komposisi. Warna dari `useTheme().color.*`, transparansi `withAlpha`. Font lewat `textStyle(theme, role, size)`. Gerak lewat `useEnter`/`enterStyle`.
- Deterministik: tanpa `Math.random`, `Date`, `setTimeout`, CSS animation. Gerak = fungsi frame.
- Font brand menimpa font family kecuali `locked: true` (serif corporate).
- Ganti tampilan tanpa ubah kode: `StyleProof` di Studio (props `family`, `variant`, `genre`, `brand`, `seed`, `mode`) atau `--seed "#hex"`.
- Jangan mengarang statistik/klaim; pakai fakta dari sumber (website klien).
- Foto/logo klien: pastikan user berhak memakainya. `public/brand/` **tidak ikut git** (di-ignore): jangan di-commit dan jangan `git add -f`.
  Yang masuk repo hanya `src/styles/brands/<brand>.ts` (warna, font, nama). Setelah clone, aset dibuat ulang dengan `npm run capture` (atau `npm run brand:knitto`).
- `npm run capture` mengunduh dari situs lain: jalankan hanya untuk situs milik user atau yang diizinkan, hormati lisensi gambar, dan jangan menyalin konten pihak ketiga ke repo publik.
- Jangan menaruh kunci API, token, atau data pelanggan di `src/styles/brands/*` atau `public/brand/*`.
- Setelah mengedit skill: ubah hanya `.agents/skills/` lalu `npm run skills:sync` (jangan edit salinan `.claude/skills/` langsung).

## Menambah family baru

1. `src/styles/profiles/<family>.ts` (aturan) + daftarkan di `profiles/index.ts`.
2. UI kit di `src/components/<family>/` dan `Proof.tsx`; daftarkan di `src/compositions/style-proof/proofs.ts`.
3. Entri di `scripts/catalog.mjs` lalu `npm run packs` dan `npm run check`.
4. `npm run check:style` harus lulus (hue aksen berjarak ≥20° dari family lain; maksimal 4 family per zona hue).
