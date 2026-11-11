import type {Brand} from '../types.ts';

/**
 * Identitas Knitto, DIUKUR dari https://knitto.co.id lewat
 * `node scripts/capture-site.mjs --url https://knitto.co.id --name knitto`
 * (hasil lengkap di public/brand/knitto/brand.json, LOKAL dan tidak ikut git: buat ulang dengan `npm run brand:knitto`).
 * Bukan tebakan:
 *   latar dominan  #0f163f  (navy)        -> primary
 *   tombol CTA     #c4592a  (terakota)    -> accent
 *   font           Open Sans (judul 700, tombol 600)
 *   radius         2.5-10px (sudut hampir tajam)
 */
export const knitto: Brand = {
  name: 'Knitto',
  primary: '#0f163f',
  accent: '#c4592a',
  fonts: {display: 'Open Sans', body: 'Open Sans'},
  radius: 6,
  logo: 'brand/knitto/logo.svg',
};
