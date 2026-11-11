/**
 * Tangkap tampilan asli sebuah website untuk dijadikan brand kit + footage.
 *
 *   node scripts/capture-site.mjs --url https://knitto.co.id --name knitto
 *
 * Hasil di public/brand/<name>/ :
 *   desktop-full.png, mobile-full.png      screenshot halaman penuh
 *   sections/NN-<slug>.png                 potongan tiap section (desktop)
 *   scroll-desktop.mp4 / scroll-mobile.mp4 rekaman scroll (lewat scripts/record.mjs)
 *   brand.json                             warna, font, ukuran teks hasil ukur DOM
 *   logo.svg                               logo (bila ditemukan)
 *
 * Palet diukur dari computed style elemen yang benar-benar tampil, bukan ditebak.
 */
import {chromium} from 'playwright';
import {mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const get = (f, d) => {
  const i = args.indexOf(f);
  return i >= 0 ? args[i + 1] : d;
};
const url = get('--url');
const name = get('--name', 'site');
if (!url) {
  console.error('usage: node scripts/capture-site.mjs --url <url> --name <nama>');
  process.exit(1);
}

const out = path.join(ROOT, 'public', 'brand', name);
mkdirSync(path.join(out, 'sections'), {recursive: true});

const browser = await chromium.launch({headless: true});

async function settle(page) {
  await page.goto(url, {waitUntil: 'networkidle', timeout: 60000});
  // gulir sekali agar gambar lazy-load ikut termuat, lalu kembali ke atas
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0;
      const t = setInterval(() => {
        window.scrollBy(0, 600);
        y += 600;
        if (y >= document.body.scrollHeight) {
          clearInterval(t);
          res();
        }
      }, 120);
    });
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
}

// ---------- desktop ----------
const desk = await browser.newPage({viewport: {width: 1440, height: 900}});
await settle(desk);
await desk.screenshot({path: path.join(out, 'desktop-full.png'), fullPage: true});

// potong per <section> / blok utama
const sections = await desk.evaluate(() => {
  const els = [...document.querySelectorAll('main > *, body > div > section, section')].filter((e) => {
    const r = e.getBoundingClientRect();
    return r.height > 200 && r.width > 600;
  });
  const seen = new Set();
  return els
    .map((e) => {
      const r = e.getBoundingClientRect();
      return {top: Math.round(r.top + window.scrollY), height: Math.round(r.height), label: (e.querySelector('h1,h2,h3')?.textContent || e.id || e.className || 'section').trim().slice(0, 40)};
    })
    .filter((s) => (seen.has(s.top) ? false : seen.add(s.top)));
});
let n = 0;
for (const s of sections.slice(0, 14)) {
  const slug = s.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
  n += 1;
  await desk.screenshot({
    path: path.join(out, 'sections', `${String(n).padStart(2, '0')}-${slug}.png`),
    clip: {x: 0, y: s.top, width: 1440, height: Math.min(s.height, 1400)},
    fullPage: true,
  });
}

// ---------- ukur brand dari DOM ----------
const brand = await desk.evaluate(() => {
  const toHex = (c) => {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(',').map((x) => parseFloat(x));
    if (a === 0) return null;
    return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  };
  const bg = {}, fg = {}, fonts = {}, radius = {};
  const area = (e) => {
    const r = e.getBoundingClientRect();
    return Math.max(0, r.width * r.height);
  };
  for (const e of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(e);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    const a = area(e);
    if (a < 400) continue;
    const b = toHex(cs.backgroundColor);
    if (b) bg[b] = (bg[b] || 0) + a;
    if (e.childNodes.length && [...e.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim())) {
      const f = toHex(cs.color);
      if (f) fg[f] = (fg[f] || 0) + 1;
      const ff = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
      fonts[ff] = (fonts[ff] || 0) + 1;
    }
    if (cs.borderRadius && cs.borderRadius !== '0px') radius[cs.borderRadius] = (radius[cs.borderRadius] || 0) + 1;
  }
  const top = (o, k = 8) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, k).map(([v, w]) => ({value: v, weight: Math.round(w)}));
  const btn = [...document.querySelectorAll('a,button')]
    .filter((e) => /belanja|mulai|akses|order/i.test(e.textContent) && e.getBoundingClientRect().width > 80)
    .slice(0, 4)
    .map((e) => {
      const cs = getComputedStyle(e);
      return {text: e.textContent.trim().slice(0, 30), bg: toHex(cs.backgroundColor), color: toHex(cs.color), radius: cs.borderRadius, font: cs.fontFamily.split(',')[0], weight: cs.fontWeight};
    });
  const h = (sel) => {
    const e = document.querySelector(sel);
    if (!e) return null;
    const cs = getComputedStyle(e);
    return {font: cs.fontFamily.split(',')[0].replace(/["']/g, ''), size: cs.fontSize, weight: cs.fontWeight, color: toHex(cs.color)};
  };
  return {
    title: document.title,
    backgrounds: top(bg),
    textColors: top(fg),
    fonts: top(fonts, 4),
    radii: top(radius, 4),
    buttons: btn,
    h1: h('h1'),
    h2: h('h2'),
    h3: h('h3'),
    body: h('p'),
    themeColor: document.querySelector('meta[name="theme-color"]')?.content || null,
  };
});

// ---------- logo ----------
const logoUrl = await desk.evaluate(() => {
  const img = document.querySelector('header img, nav img, a[href="/"] img');
  return img ? img.currentSrc || img.src : null;
});
if (logoUrl) {
  try {
    const res = await desk.request.get(new URL(logoUrl, url).toString());
    const body = await res.body();
    const ext = logoUrl.includes('.svg') ? 'svg' : 'png';
    writeFileSync(path.join(out, `logo.${ext}`), body);
    brand.logo = `logo.${ext}`;
  } catch (e) {
    brand.logoError = String(e.message).slice(0, 80);
  }
}

// ---------- foto asli (hero, produk, fasilitas) ----------
// Ambil <img> yang benar-benar besar (>= 480px), bongkar proxy /_next/image?url=...
// ke URL aslinya, buang duplikat, simpan maksimal 30.
mkdirSync(path.join(out, 'photos'), {recursive: true});
const imgs = await desk.evaluate(() =>
  [...document.querySelectorAll('img')]
    .filter((i) => i.naturalWidth >= 480 && i.naturalHeight >= 240)
    .map((i) => ({src: i.currentSrc || i.src, alt: (i.alt || '').trim().slice(0, 60), w: i.naturalWidth, h: i.naturalHeight})),
);
const seenPhoto = new Set();
const photos = [];
for (const im of imgs) {
  let u = im.src;
  try {
    const parsed = new URL(u, url);
    if (parsed.pathname.startsWith('/_next/image') && parsed.searchParams.get('url')) u = parsed.searchParams.get('url');
    else u = parsed.toString();
  } catch {
    continue;
  }
  if (u.startsWith('data:') || u.endsWith('.svg') || seenPhoto.has(u)) continue;
  seenPhoto.add(u);
  const ext = (u.split('?')[0].match(/\.(jpe?g|png|webp)$/i) || [, 'jpg'])[1].toLowerCase();
  const slug = (im.alt || path.basename(u.split('?')[0], '.' + ext)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'foto';
  const file = `${String(photos.length + 1).padStart(2, '0')}-${slug}.${ext}`;
  try {
    const res = await desk.request.get(u);
    if (!res.ok()) continue;
    writeFileSync(path.join(out, 'photos', file), await res.body());
    photos.push({file, src: u, alt: im.alt, w: im.w, h: im.h});
  } catch {
    /* lewati foto yang gagal diunduh */
  }
  if (photos.length >= 30) break;
}
brand.photos = photos;

// ---------- mobile ----------
const mob = await browser.newPage({viewport: {width: 390, height: 844}, deviceScaleFactor: 2, isMobile: true});
await settle(mob);
await mob.screenshot({path: path.join(out, 'mobile-full.png'), fullPage: true});
await mob.screenshot({path: path.join(out, 'mobile-hero.png')});

brand.url = url;
brand.capturedAt = new Date().toISOString();
brand.sections = sections.slice(0, 14);
writeFileSync(path.join(out, 'brand.json'), JSON.stringify(brand, null, 2));

await browser.close();
console.log(`selesai: public/brand/${name}/  (${n} section, logo: ${brand.logo ?? 'tidak ada'})`);
