#!/usr/bin/env node
// Bereitet die Rohbilder des Dojo-Bildsatzes (dojo/roh/) auf und legt sie nach
// assets/art/dojo/{figuren,szenen,guertel}/ sowie icon.webp/icon.png/favicon.png.
//
// Aufruf aus einem Ordner mit sharp in node_modules:
//   cd ../GrosseFahrt && node ../Vokabeltrainer/tools/art/dojo/aufbereiten.mjs [name ...]
// Ohne Namen wird alles aufbereitet, was als Rohbild vorhanden ist.
//
// Freistellen von Papier (Figuren, Gürtel)
// ----------------------------------------
// Gemessen: Gi, Socken-Weiß und der weiße Gürtel haben praktisch DIESELBE Farbe
// wie das Papier (≈ #ECE0CA). Über die Farbe lässt sich innen und außen also
// nicht trennen, nur über die Tuschekontur:
//  1. Papierfarbe = Median der Bildränder; „papierartig“ = max. Kanalabstand ≤ TOL.
//  2. Vom Bildrand aus wird mit einer SCHEIBE (Radius SONDE) geflutet: Die Scheibe
//     muss ganz auf Papier liegen. Durch Lücken in trockenen Konturen, die
//     schmaler als der Scheibendurchmesser sind, läuft sie nicht in den Gi.
//  3. Von dort höchstens NACHLAUF px weiter in papierartige Pixel (füllt Ritzen
//     zwischen Haarspitzen und Pinselfasern).
//  4. Innen liegende Papierinseln (zwischen Arm und Körper, Gürtelschlaufe)
//     werden über Saatpunkte je Bild (INSELN, Rohbild-Koordinaten) geflutet.
//  5. Weiche Kante: Pixel bis 2 px neben dem Hintergrund, die dunkler als Papier
//     sind, werden per „Farbe zu Alpha“ vom Papier entmischt. Auf Papierton
//     ergibt das exakt das Original, auf Weiß einen sauberen Übergang.

import { existsSync, mkdirSync } from 'node:fs';
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
const ziel = path.resolve(hier, '../../../assets/art/dojo');
const roh = (n) => path.join(hier, 'roh', `${n}.png`);
const vorschau = (n) => path.join(hier, 'vorschau', `${n}.png`);
for (const d of ['figuren', 'szenen', 'guertel']) mkdirSync(path.join(ziel, d), { recursive: true });
mkdirSync(path.join(hier, 'vorschau'), { recursive: true });

const ZIELTON = [0xed, 0xe1, 0xcb];
const WEBP = { quality: 92, effort: 6, smartSubsample: true };
const WEBP_ALPHA = { quality: 92, alphaQuality: 100, effort: 6 };

const FIGUREN = ['bereit', 'jubel', 'denken', 'nochmal', 'schreiben', 'gruss'];
const FIGUR_KANTE = 1200;
// Szenen: Zuschnitt in Rohbild-Pixeln (ohne Eintrag: ganzes Bild).
const SZENEN = {
  landschaft: { left: 0, top: 132, width: 1536, height: 768 },
  fertig: null,
  dojo: 'mitte2zu1',
};
const GUERTEL = ['guertel_1', 'guertel_2', 'guertel_3', 'guertel_4', 'guertel_5'];

// Einstellungen je Rohbild: sonde/nachlauf in px, inseln = Saatpunkte [x, y].
const STANDARD = { sonde: 3, nachlauf: 4, inseln: [], melden: process.env.MELDEN === '1' };
const EINSTELLUNG = JSON.parse(
  existsSync(path.join(hier, 'freistellen.json'))
    ? (await import('node:fs')).readFileSync(path.join(hier, 'freistellen.json'), 'utf8')
    : '{}',
);
const einstellung = (n) => ({ ...STANDARD, ...(EINSTELLUNG[n] ?? {}) });

const hex = (r, g, b) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
const median = (a) => a.sort((p, q) => p - q)[a.length >> 1];
const clamp255 = (v) => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v));

/** Median-Farbe der vier Randstreifen (s px breit) eines RGB-Rohpuffers. */
function randMedian(data, w, h, ch, s = 8) {
  const k = [[], [], []];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (x >= s && x < w - s && y >= s && y < h - s) { x = w - s - 1; continue; }
      const i = (y * w + x) * ch;
      k[0].push(data[i]); k[1].push(data[i + 1]); k[2].push(data[i + 2]);
    }
  }
  return k.map(median);
}

async function randfarbe(datei) {
  const { data, info } = await sharp(datei).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return randMedian(data, info.width, info.height, 3);
}

/** Papier-Toleranz aus der Streuung am Rand: 99,5-%-Abstand + Zuschlag. */
function toleranz(data, w, h, papier) {
  const d = [];
  const s = 12;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (x >= s && x < w - s && y >= s && y < h - s) { x = w - s - 1; continue; }
      const i = (y * w + x) * 3;
      d.push(Math.max(Math.abs(data[i] - papier[0]), Math.abs(data[i + 1] - papier[1]), Math.abs(data[i + 2] - papier[2])));
    }
  }
  d.sort((p, q) => p - q);
  return Math.max(10, d[Math.floor(d.length * 0.995)] + 6);
}

/** Erosion/Dilatation mit Quadrat-Kern (Chebyshev-Radius r), separierbar. */
function morph(src, w, h, r, erode) {
  if (r <= 0) return Uint8Array.from(src);
  const tmp = new Uint8Array(w * h);
  const out = new Uint8Array(w * h);
  const rand = erode ? 0 : 0; // außerhalb des Bildes: bei Erosion als Papier (1) werten
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = erode ? 1 : 0;
      for (let dx = -r; dx <= r; dx++) {
        const xx = x + dx;
        const s = xx < 0 || xx >= w ? (erode ? 1 : rand) : src[y * w + xx];
        if (erode ? !s : s) { v = erode ? 0 : 1; break; }
      }
      tmp[y * w + x] = v;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = erode ? 1 : 0;
      for (let dy = -r; dy <= r; dy++) {
        const yy = y + dy;
        const s = yy < 0 || yy >= h ? (erode ? 1 : rand) : tmp[yy * w + x];
        if (erode ? !s : s) { v = erode ? 0 : 1; break; }
      }
      out[y * w + x] = v;
    }
  }
  return out;
}

/** 4er-Flutung in maske ab den Startindizes; liefert markierte Pixel. */
function fluten(maske, w, h, start) {
  const reg = new Uint8Array(w * h);
  const stapel = [];
  for (const i of start) if (maske[i] && !reg[i]) { reg[i] = 1; stapel.push(i); }
  while (stapel.length) {
    const i = stapel.pop();
    const x = i % w;
    if (x > 0 && maske[i - 1] && !reg[i - 1]) { reg[i - 1] = 1; stapel.push(i - 1); }
    if (x < w - 1 && maske[i + 1] && !reg[i + 1]) { reg[i + 1] = 1; stapel.push(i + 1); }
    if (i >= w && maske[i - w] && !reg[i - w]) { reg[i - w] = 1; stapel.push(i - w); }
    if (i < w * (h - 1) && maske[i + w] && !reg[i + w]) { reg[i + w] = 1; stapel.push(i + w); }
  }
  return reg;
}

/** Schichtweises Wachsen von reg in maske, höchstens `schritte` px (8er). */
function wachsen(reg, maske, w, h, schritte) {
  let front = [];
  for (let i = 0; i < w * h; i++) if (reg[i]) front.push(i);
  for (let s = 0; s < schritte; s++) {
    const neu = [];
    for (const i of front) {
      const x = i % w, y = (i / w) | 0;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= w) continue;
          const j = yy * w + xx;
          if (!reg[j] && maske[j]) { reg[j] = 1; neu.push(j); }
        }
      }
    }
    front = neu;
  }
  return reg;
}

/** Papier freistellen. Liefert RGBA-Puffer und Kennzahlen. */
function freistellen(data, w, h, opt) {
  const n = w * h;
  const papier = randMedian(data, w, h, 3);
  const tol = opt.tol ?? toleranz(data, w, h, papier);
  const pap = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const d = Math.max(Math.abs(data[i * 3] - papier[0]), Math.abs(data[i * 3 + 1] - papier[1]), Math.abs(data[i * 3 + 2] - papier[2]));
    if (d <= tol) pap[i] = 1;
  }
  // Scheiben-Flutung: Kern = Papier erodiert; vom Rand (und von den Saatpunkten) fluten; zurück dilatieren.
  const kern = morph(pap, w, h, opt.sonde, true);
  const start = [];
  for (let x = 0; x < w; x++) { start.push(x, (h - 1) * w + x); }
  for (let y = 0; y < h; y++) { start.push(y * w, y * w + w - 1); }
  let bg = morph(fluten(kern, w, h, start), w, h, opt.sonde, false);
  // Inseln: eigene, feinere Sonde (Radius 1), weil die Inseln oft schmal sind.
  const fehlSaat = [];
  if (opt.inseln.length) {
    const kern1 = morph(pap, w, h, 1, true);
    const saat = [];
    for (const [sx, sy] of opt.inseln) {
      const i = sy * w + sx;
      if (kern1[i]) saat.push(i); else fehlSaat.push(`${sx},${sy}`);
    }
    const insel = morph(fluten(kern1, w, h, saat), w, h, 1, false);
    for (let i = 0; i < n; i++) if (insel[i]) bg[i] = 1;
  }
  for (let i = 0; i < n; i++) if (!pap[i]) bg[i] = 0;
  bg = wachsen(bg, pap, w, h, opt.nachlauf);

  // Papierkorn-Reste: kleine, helle, frei stehende Flecken (keine Tuschespritzer) entfernen.
  // Nebenbei: eingeschlossene Papierflächen melden (Kandidaten für INSELN).
  const marke = new Int32Array(n);
  const kandidaten = [];
  let nr = 0;
  for (let i0 = 0; i0 < n; i0++) {
    if (bg[i0] || marke[i0]) continue;
    nr++;
    const stapel = [i0], teil = [];
    marke[i0] = nr;
    let summe = 0;
    while (stapel.length) {
      const i = stapel.pop();
      teil.push(i);
      summe += Math.max(Math.abs(data[i * 3] - papier[0]), Math.abs(data[i * 3 + 1] - papier[1]), Math.abs(data[i * 3 + 2] - papier[2]));
      const x = i % w;
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w]) {
        if (j >= 0 && j < n && !bg[j] && !marke[j]) { marke[j] = nr; stapel.push(j); }
      }
    }
    if (teil.length < 150 && summe / teil.length < 70) for (const i of teil) bg[i] = 1;
  }
  // MELDEN=1: eingeschlossene Papierflächen nummerieren (Kandidaten für INSELN).
  let inselBild = null;
  if (opt.melden) {
    inselBild = Buffer.alloc(n * 3);
    for (let i = 0; i < n; i++) {
      if (bg[i]) { inselBild[i * 3] = 31; inselBild[i * 3 + 1] = 111; inselBild[i * 3 + 2] = 120; }
      else { inselBild[i * 3] = data[i * 3]; inselBild[i * 3 + 1] = data[i * 3 + 1]; inselBild[i * 3 + 2] = data[i * 3 + 2]; }
    }
    const gesehen = new Uint8Array(n);
    for (let i0 = 0; i0 < n; i0++) {
      if (bg[i0] || !pap[i0] || gesehen[i0]) continue;
      const stapel = [i0], teil = [];
      gesehen[i0] = 1;
      while (stapel.length) {
        const i = stapel.pop();
        teil.push(i);
        const x = i % w;
        for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w]) {
          if (j >= 0 && j < n && !bg[j] && pap[j] && !gesehen[j]) { gesehen[j] = 1; stapel.push(j); }
        }
      }
      if (teil.length < 120) continue;
      // Saatpunkt: Pixel der Fläche mit dem größten Randabstand (grob: mittleres Pixel der längsten Zeile).
      teil.sort((p, q) => p - q);
      let bestS = teil[0], bestL = 0, s0 = teil[0], vor = teil[0];
      for (let k = 1; k <= teil.length; k++) {
        if (k === teil.length || teil[k] !== vor + 1 || teil[k] % w === 0) {
          if (vor - s0 + 1 > bestL) { bestL = vor - s0 + 1; bestS = (s0 + vor) >> 1; }
          if (k < teil.length) s0 = teil[k];
        }
        if (k < teil.length) vor = teil[k];
      }
      const nrK = kandidaten.length + 1;
      const farbe = [[255, 0, 255], [255, 220, 0], [0, 230, 255], [120, 255, 0]][nrK % 4];
      for (const i of teil) { inselBild[i * 3] = farbe[0]; inselBild[i * 3 + 1] = farbe[1]; inselBild[i * 3 + 2] = farbe[2]; }
      kandidaten.push({ nr: nrK, x: bestS % w, y: (bestS / w) | 0, fl: teil.length });
    }
    console.log('  eingeschlossene Papierflächen nr:x,y(Fläche): ' + kandidaten.map((k) => `${k.nr}:${k.x},${k.y}(${k.fl})`).join(' '));
  }

  // Abstand zum Hintergrund (1, 2) für die weiche Kante.
  const nah1 = morph(bg, w, h, 1, false);
  const nah2 = morph(bg, w, h, 2, false);
  const out = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    let a = 1, fr = r, fg = g, fb = b;
    if (bg[i]) {
      a = 0;
    } else if (nah2[i]) {
      // Farbe zu Alpha gegen Papier, nur Abdunklung zählt (heller als Papier bleibt deckend).
      let c = Math.max((papier[0] - r) / papier[0], (papier[1] - g) / papier[1], (papier[2] - b) / papier[2], 0);
      c = Math.min(1, c * 1.15);
      a = nah1[i] ? c : 1 - (1 - c) * 0.5;
      if (a < 0.05) a = 0;
      if (a > 0 && a < 1) {
        fr = (r - (1 - a) * papier[0]) / a;
        fg = (g - (1 - a) * papier[1]) / a;
        fb = (b - (1 - a) * papier[2]) / a;
      }
    }
    if (a === 0) { fr = papier[0]; fg = papier[1]; fb = papier[2]; }
    out[i * 4] = clamp255(fr); out[i * 4 + 1] = clamp255(fg); out[i * 4 + 2] = clamp255(fb); out[i * 4 + 3] = clamp255(a * 255);
  }
  return { rgba: out, papier, tol, fehlSaat, kandidaten, inselBild };
}

function rahmen(rgba, w, h, x0 = 0, x1 = w) {
  let minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = x0; x < x1; x++) {
      if (rgba[(y * w + x) * 4 + 3] > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { minX, minY, maxX, maxY };
}

/** Kontrollbild: links #EDE1CB, Mitte Weiß, rechts kräftiges Petrol (zeigt Inseln und Säume). */
async function kontrolle(datei, name) {
  const meta = await sharp(datei).metadata();
  const png = await sharp(datei).png().toBuffer();
  const w = meta.width + 32, h = meta.height + 32;
  const fl = (farbe) => sharp({ create: { width: w, height: h, channels: 4, background: farbe } })
    .composite([{ input: png, left: 16, top: 16 }]).png().toBuffer();
  await sharp({ create: { width: 3 * w, height: h, channels: 4, background: '#000' } })
    .composite([{ input: await fl('#EDE1CB'), left: 0, top: 0 }, { input: await fl('#FFFFFF'), left: w, top: 0 }, { input: await fl('#1F6F78'), left: 2 * w, top: 0 }])
    .png().toFile(vorschau(name));
}

/** MELDEN=1: Rohbild mit eingefärbten, nummerierten eingeschlossenen Papierflächen. */
async function inselKontrolle(f, w, h, name) {
  const text = f.kandidaten.map((k) => `<text x="${k.x}" y="${k.y + 5}" font-size="15" font-family="Helvetica" font-weight="bold" text-anchor="middle" fill="#000" stroke="#fff" stroke-width="3" paint-order="stroke">${k.nr}</text>`).join('');
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${text}</svg>`);
  await sharp(f.inselBild, { raw: { width: w, height: h, channels: 3 } }).composite([{ input: svg, left: 0, top: 0 }]).png().toFile(vorschau(`${name}_inseln`));
}

async function figur(name) {
  const { data, info } = await sharp(roh(name)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const f = freistellen(data, w, h, einstellung(name));
  const b = rahmen(f.rgba, w, h);
  const rand = 4;
  const ex = { left: Math.max(0, b.minX - rand), top: Math.max(0, b.minY - rand) };
  ex.width = Math.min(w - 1, b.maxX + rand) - ex.left + 1;
  ex.height = Math.min(h - 1, b.maxY + rand) - ex.top + 1;
  if (f.inselBild) await inselKontrolle(f, w, h, name);
  const datei = path.join(ziel, 'figuren', `${name}.webp`);
  const out = await sharp(f.rgba, { raw: { width: w, height: h, channels: 4 } })
    .extract(ex)
    .resize({ width: FIGUR_KANTE, height: FIGUR_KANTE, fit: 'inside', withoutEnlargement: true, kernel: 'lanczos3' })
    .webp(WEBP_ALPHA).toFile(datei);
  await kontrolle(datei, name);
  console.log(`${name.padEnd(11)} ${out.width}×${out.height} ${(out.size / 1024).toFixed(0)} KB  transparent  Papier ${hex(...f.papier)} tol ${f.tol}${f.fehlSaat.length ? '  SAAT NICHT AUF PAPIER: ' + f.fehlSaat.join(' ') : ''}`);
}

async function guertel() {
  const { data, info } = await sharp(roh('guertel')).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const f = freistellen(data, w, h, einstellung('guertel'));
  // Spaltenprofil: zusammenhängende Spaltenbereiche mit deckenden Pixeln = Gürtel.
  const belegt = new Uint8Array(w);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (f.rgba[(y * w + x) * 4 + 3] > 10) belegt[x] = 1;
  const bereiche = [];
  for (let x = 0; x < w; x++) {
    if (!belegt[x]) continue;
    let e = x;
    while (e + 1 < w && belegt[e + 1]) e++;
    if (e - x > 40) bereiche.push([x, e]);
    x = e;
  }
  if (bereiche.length !== 5) throw new Error(`guertel: ${bereiche.length} statt 5 Bereiche gefunden: ${JSON.stringify(bereiche)}`);
  const boxen = bereiche.map(([x0, x1]) => rahmen(f.rgba, w, h, x0, x1 + 1));
  const kante = Math.max(...boxen.map((b) => Math.max(b.maxX - b.minX + 1, b.maxY - b.minY + 1))) + 16;
  const bild = sharp(f.rgba, { raw: { width: w, height: h, channels: 4 } });
  const png = await bild.png().toBuffer();
  for (let k = 0; k < 5; k++) {
    const b = boxen[k];
    const cx = Math.round((b.minX + b.maxX) / 2), cy = Math.round((b.minY + b.maxY) / 2);
    const left = cx - (kante >> 1), top = cy - (kante >> 1);
    // Nur die Spalten dieses Gürtels übernehmen (Nachbarn ragen sonst hinein).
    const [x0, x1] = bereiche[k];
    const teil = await sharp(png).extract({ left: x0, top: b.minY, width: x1 - x0 + 1, height: b.maxY - b.minY + 1 }).png().toBuffer();
    const name = `guertel_${k + 1}`;
    const datei = path.join(ziel, 'guertel', `${name}.webp`);
    const flaeche = await sharp({ create: { width: kante, height: kante, channels: 4, background: { r: f.papier[0], g: f.papier[1], b: f.papier[2], alpha: 0 } } })
      .composite([{ input: teil, left: x0 - left, top: b.minY - top }]).png().toBuffer();
    const out = await sharp(flaeche).resize(384, 384, { kernel: 'lanczos3' }).webp(WEBP_ALPHA).toFile(datei);
    await kontrolle(datei, name);
    console.log(`${name.padEnd(11)} ${out.width}×${out.height} ${(out.size / 1024).toFixed(0)} KB  transparent  (Ausschnitt ${kante}×${kante} um ${cx},${cy})`);
  }
  if (f.fehlSaat.length) console.log('guertel: SAAT NICHT AUF PAPIER: ' + f.fehlSaat.join(' '));
}

/** Deckendes Bild: Papierton global (Kanal-Verstärkung, keine Maske) auf ZIELTON ziehen. */
async function tonAngleichen(quelle, schreiben) {
  const start = await randfarbe(await quelle().png().toBuffer());
  const fehler = (ist) => ist.reduce((s, v, c) => s + Math.abs(v - ZIELTON[c]), 0);
  let gain = ZIELTON.map((z, c) => z / start[c]);
  let best = null;
  // Verlustbehaftetes WebP verschiebt den Ton um ±1–2; nachregeln und den besten Lauf behalten.
  for (let lauf = 0; lauf < 8; lauf++) {
    const r = await schreiben(quelle().linear(gain, [0, 0, 0]));
    const ist = await randfarbe(r.datei);
    if (!best || fehler(ist) < fehler(best.ist)) best = { gain: [...gain], ist, info: r.info };
    if (fehler(ist) === 0) break;
    gain = gain.map((g, c) => g * (1 + (ZIELTON[c] - ist[c]) / ZIELTON[c] * (lauf < 4 ? 1 : 0.5)));
  }
  const r = await schreiben(quelle().linear(best.gain, [0, 0, 0]));
  return { info: r.info, ist: await randfarbe(r.datei), start };
}

async function szene(name) {
  const meta = await sharp(roh(name)).metadata();
  let z = SZENEN[name];
  if (z === 'mitte2zu1') {
    const hh = Math.round(meta.width / 2);
    z = { left: 0, top: Math.round((meta.height - hh) / 2), width: meta.width, height: hh };
  }
  const override = EINSTELLUNG[name]?.zuschnitt;
  if (override) z = override;
  const datei = path.join(ziel, 'szenen', `${name}.webp`);
  const quelle = () => {
    let p = sharp(roh(name)).removeAlpha();
    if (z) p = p.extract(z);
    return p.resize({ width: 1536, height: 1536, fit: 'inside', withoutEnlargement: true, kernel: 'lanczos3' });
  };
  const r = await tonAngleichen(quelle, async (p) => ({ info: await p.webp(WEBP).toFile(datei), datei }));
  console.log(`${name.padEnd(11)} ${r.info.width}×${r.info.height} ${(r.info.size / 1024).toFixed(0)} KB  deckend  Rand vorher ${hex(...r.start)} → ${hex(...r.ist)}`);
}

async function icon() {
  const quelle = () => sharp(roh('icon')).removeAlpha().resize(1024, 1024, { fit: 'cover', kernel: 'lanczos3' });
  const webp = path.join(ziel, 'icon.webp');
  const png = path.join(ziel, 'icon.png');
  const fav = path.join(ziel, 'favicon.png');
  const a = await tonAngleichen(quelle, async (p) => ({ info: await p.webp({ quality: 95, effort: 6, smartSubsample: true }).toFile(webp), datei: webp }));
  const b = await tonAngleichen(quelle, async (p) => ({ info: await p.png({ compressionLevel: 9 }).toFile(png), datei: png }));
  const klein = () => sharp(roh('icon')).removeAlpha().resize(48, 48, { fit: 'cover', kernel: 'lanczos3' });
  const f = (await tonAngleichen(klein, async (p) => ({ info: await p.png({ compressionLevel: 9 }).toFile(fav), datei: fav }))).info;
  console.log(`icon.webp   ${a.info.width}×${a.info.height} ${(a.info.size / 1024).toFixed(0)} KB  deckend  Rand vorher ${hex(...a.start)} → ${hex(...a.ist)}`);
  console.log(`icon.png    ${b.info.width}×${b.info.height} ${(b.info.size / 1024).toFixed(0)} KB  deckend  Rand ${hex(...b.ist)}  Alpha: ${(await sharp(png).metadata()).hasAlpha}`);
  console.log(`favicon.png ${f.width}×${f.height} ${(f.size / 1024).toFixed(1)} KB  deckend  Rand ${hex(...await randfarbe(fav))}  Alpha: ${(await sharp(fav).metadata()).hasAlpha}`);
}

const wunsch = process.argv.slice(2);
const will = (n) => (wunsch.length === 0 ? existsSync(roh(n.startsWith('guertel') ? 'guertel' : n)) : wunsch.includes(n));
for (const n of FIGUREN) if (will(n)) await figur(n);
if (will('guertel')) await guertel();
for (const n of Object.keys(SZENEN)) if (will(n)) await szene(n);
if (will('icon')) await icon();
