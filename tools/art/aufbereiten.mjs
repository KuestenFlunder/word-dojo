#!/usr/bin/env node
// Bereitet die Rohbilder des Bildmodells (tools/art/roh/) für die App auf:
//   - figuren/   Magenta-Hintergrund freistellen, eng zuschneiden, lange Kante 1024 px
//   - abzeichen/ freistellen, zuschneiden, mittig auf transparentes Quadrat 512 px
//   - szenen/    nur zuschneiden/verkleinern (titel wird mittig auf 16:9 beschnitten)
// Ausgabe als WebP nach assets/art/{figuren,abzeichen,szenen}/.
//
// Das Freistell-Verfahren ist aus GrosseFahrt/tools/art/aufbereiten.mjs übernommen.
//
// Abhängigkeit: sharp. Es ist im Vokabeltrainer-Projekt NICHT installiert; das
// Skript sucht es zuerst regulär und sonst im aktuellen Arbeitsverzeichnis.
// Aufruf deshalb aus einem Ordner, der sharp in node_modules hat, z. B.:
//   cd ../GrosseFahrt && node ../Vokabeltrainer/tools/art/aufbereiten.mjs [--vorschau <ordner>]
//
// --vorschau legt PNG-Kontrollbilder ab, auf denen jedes freigestellte Bild
// einmal auf Nachtblau und einmal auf Papierweiß liegt.

import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  sharp = createRequire(path.join(process.cwd(), 'package.json'))('sharp');
}

const hier = path.dirname(fileURLToPath(import.meta.url));
const quelle = path.join(hier, 'roh');
const ziel = path.resolve(hier, '../../assets/art');

const args = process.argv.slice(2);
const vorschauIdx = args.indexOf('--vorschau');
const vorschau = vorschauIdx >= 0 ? path.resolve(args[vorschauIdx + 1]) : null;

const GROESSE = { figurKante: 1024, abzeichenKante: 512, szeneBreite: 1600 };
const WEBP_SZENE = { quality: 86, effort: 6 };
const WEBP_ALPHA = { quality: 88, alphaQuality: 100, effort: 6 };

// ---------------------------------------------------------------------------
// Freistellen
// ---------------------------------------------------------------------------

/**
 * „Magenta-Stärke“ eines Pixels: min(R,B) − G. Reines Magenta ≈ 255.
 * Die Palettenfarben (Nachtblau, Gelb, Korallrot, Papierweiß, Tusche) liegen
 * bei ≤ 15, werden also nie angegriffen.
 */
const magenta = (r, g, b) => Math.min(r, b) - g;
/** Ab dieser Stärke ist ein Pixel sicher Hintergrund. */
const HG_SICHER = 170;
/** Breite des Kantenbandes (px), in dem weiche Alpha-Werte entstehen. */
const BAND = 3;
const clamp255 = (v) => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v));

/**
 * Stellt Magenta frei, liefert einen RGBA-Puffer.
 * 1. Hintergrundmaske: Pixel mit Magenta-Stärke ≥ HG_SICHER.
 * 2. Kantenband (BAND px um die Maske): a = 1 − m/255, Farbe wird entmischt
 *    (F = (C − (1−a)·Magenta) / a), damit kein rosa Saum bleibt.
 * 3. Alles außerhalb des Bandes bleibt unangetastet.
 */
function freistellen(data, w, h) {
  const n = w * h;
  const out = Buffer.alloc(n * 4);
  const dist = new Uint8Array(n).fill(255);
  for (let i = 0; i < n; i++) {
    if (magenta(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]) >= HG_SICHER) dist[i] = 0;
  }
  for (let step = 1; step <= BAND; step++) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (dist[i] !== 255) continue;
        let nah = false;
        for (let dy = -1; dy <= 1 && !nah; dy++) {
          const yy = y + dy;
          if (yy < 0 || yy >= h) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx;
            if (xx < 0 || xx >= w) continue;
            if (dist[yy * w + xx] === step - 1) { nah = true; break; }
          }
        }
        if (nah) dist[i] = step;
      }
    }
  }
  for (let i = 0; i < n; i++) {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    let a = 1;
    let fr = r, fg = g, fb = b;
    if (dist[i] === 0) {
      a = 0;
    } else if (dist[i] <= BAND) {
      const m = Math.max(0, magenta(r, g, b));
      a = Math.min(1, Math.max(0, 1 - m / 255));
      if (a < 0.06) a = 0;
      if (a > 0) {
        fr = (r - (1 - a) * 255) / a;
        fg = g / a;
        fb = (b - (1 - a) * 255) / a;
        const m2 = Math.min(fr, fb) - fg;
        if (m2 > 0) { fr -= m2; fb -= m2; }
      }
    }
    out[i * 4] = clamp255(fr);
    out[i * 4 + 1] = clamp255(fg);
    out[i * 4 + 2] = clamp255(fb);
    out[i * 4 + 3] = clamp255(a * 255);
  }
  return out;
}

/** Enger Begrenzungsrahmen der sichtbaren Pixel (Alpha > 10), plus Rand. */
function rahmen(rgba, w, h, rand) {
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (rgba[(y * w + x) * 4 + 3] > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  minX = Math.max(0, minX - rand);
  minY = Math.max(0, minY - rand);
  maxX = Math.min(w - 1, maxX + rand);
  maxY = Math.min(h - 1, maxY + rand);
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

/** Freigestelltes, eng zugeschnittenes Bild als sharp-Pipeline. */
async function freigestellt(datei) {
  const { data, info } = await sharp(datei).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const rgba = freistellen(data, info.width, info.height);
  const r = rahmen(rgba, info.width, info.height, 4);
  return sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } }).extract(r);
}

// ---------------------------------------------------------------------------

const ergebnisse = [];

/** Zählt sichtbare Pixel mit Rest-Magenta (Kontrolle auf rosa Säume). */
async function restMagenta(datei) {
  const { data, info } = await sharp(datei).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let z = 0;
  for (let i = 0; i < info.width * info.height; i++) {
    if (data[i * 4 + 3] > 40 && magenta(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]) > 60) z++;
  }
  return z;
}

async function schreibe(pipeline, zielDatei, webp, alpha) {
  mkdirSync(path.dirname(zielDatei), { recursive: true });
  const info = await pipeline.webp(webp).toFile(zielDatei);
  ergebnisse.push({
    datei: path.relative(path.resolve(hier, '../..'), zielDatei),
    w: info.width,
    h: info.height,
    bytes: info.size,
    magenta: alpha ? await restMagenta(zielDatei) : 0,
  });
  return zielDatei;
}

async function kontrollbild(webpDatei, name) {
  if (!vorschau) return;
  mkdirSync(vorschau, { recursive: true });
  const meta = await sharp(webpDatei).metadata();
  const w = meta.width, h = meta.height;
  const pad = 16;
  const flaeche = (farbe) => sharp({ create: { width: w + 2 * pad, height: h + 2 * pad, channels: 4, background: farbe } });
  const png = await sharp(webpDatei).png().toBuffer();
  const dunkel = await flaeche('#14213D').composite([{ input: png, left: pad, top: pad }]).png().toBuffer();
  const hell = await flaeche('#F6F0E1').composite([{ input: png, left: pad, top: pad }]).png().toBuffer();
  await sharp({ create: { width: 2 * (w + 2 * pad), height: h + 2 * pad, channels: 4, background: '#000' } })
    .composite([{ input: dunkel, left: 0, top: 0 }, { input: hell, left: w + 2 * pad, top: 0 }])
    .png()
    .toFile(path.join(vorschau, `${name}.png`));
}

const pngs = (ordner) =>
  existsSync(ordner) ? readdirSync(ordner).filter((f) => f.endsWith('.png')).sort() : [];

// Figuren: eng zugeschnitten, lange Kante 1024 px
for (const f of pngs(path.join(quelle, 'figuren'))) {
  const name = path.basename(f, '.png');
  const k = GROESSE.figurKante;
  const pipeline = (await freigestellt(path.join(quelle, 'figuren', f)))
    .resize({ width: k, height: k, fit: 'inside', withoutEnlargement: true, kernel: 'lanczos3' });
  const out = await schreibe(pipeline, path.join(ziel, 'figuren', `${name}.webp`), WEBP_ALPHA, true);
  await kontrollbild(out, name);
}

// Abzeichen: zugeschnitten, mittig auf transparentes Quadrat 512 px
for (const f of pngs(path.join(quelle, 'abzeichen'))) {
  const name = path.basename(f, '.png');
  const k = GROESSE.abzeichenKante;
  const pipeline = (await freigestellt(path.join(quelle, 'abzeichen', f)))
    .resize({ width: k, height: k, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: 'lanczos3' });
  const out = await schreibe(pipeline, path.join(ziel, 'abzeichen', `${name}.webp`), WEBP_ALPHA, true);
  await kontrollbild(out, name);
}

// Szenen: titel mittig auf 16:9, sonst nur verkleinern. Nie hochskalieren.
for (const f of pngs(path.join(quelle, 'szenen'))) {
  const name = path.basename(f, '.png');
  let pipeline = sharp(path.join(quelle, 'szenen', f));
  if (name === 'titel') {
    const meta = await pipeline.metadata();
    const h = Math.round((meta.width * 9) / 16);
    if (h < meta.height) {
      pipeline = pipeline.extract({ left: 0, top: Math.round((meta.height - h) / 2), width: meta.width, height: h });
    }
  }
  pipeline = pipeline.resize({ width: GROESSE.szeneBreite, withoutEnlargement: true, kernel: 'lanczos3' });
  await schreibe(pipeline, path.join(ziel, 'szenen', `${name}.webp`), WEBP_SZENE, false);
}

let summe = 0;
for (const e of ergebnisse) {
  summe += e.bytes;
  console.log(
    `${e.datei.padEnd(42)} ${String(e.w).padStart(5)}×${String(e.h).padEnd(5)} ${(e.bytes / 1024).toFixed(0).padStart(5)} KB` +
      (e.magenta ? `   ACHTUNG: ${e.magenta} px Rest-Magenta` : ''),
  );
}
console.log(`Summe: ${(summe / 1024).toFixed(0)} KB in ${ergebnisse.length} Dateien`);
