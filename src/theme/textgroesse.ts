/** Reine Rechenhilfen für Schriftgrößen und Bildausschnitte (ohne React, testbar). */

/** Grobe mittlere Zeichenbreite der fetten Andika im Verhältnis zur Schriftgröße. */
export const ZEICHENBREITE = 0.62;
/** Kleiner wird ein Lernwort nie. */
export const KLEINSTE_WORTGROESSE = 20;

/**
 * Größte Schriftgröße bis `max`, bei der das längste Wort von `text` in `breite` passt
 * (umbrochen wird nur an Leerzeichen). Lange Wortgruppen werden zusätzlich etwas kleiner,
 * damit sie nicht über viele Zeilen laufen.
 */
export function passendeSchriftgroesse(text: string, max: number, breite: number, laufweite = 0): number {
  const laengstes = text.split(/\s+/).reduce((laenge, wort) => Math.max(laenge, [...wort].length), 1);
  const jeZeichen = breite / laengstes - laufweite;
  let groesse = Math.min(max, jeZeichen / ZEICHENBREITE);
  const zeichen = [...text].length;
  if (zeichen > 28) groesse = Math.min(groesse, max * 0.6);
  else if (zeichen > 18) groesse = Math.min(groesse, max * 0.78);
  return Math.max(KLEINSTE_WORTGROESSE, Math.floor(groesse));
}

/** Wie {@link passendeSchriftgroesse}, aber für eine einzige Zeile ohne Umbruch (Eingabefeld). */
export function einzeiligeSchriftgroesse(zeichen: number, max: number, breite: number, laufweite = 0): number {
  const jeZeichen = breite / Math.max(1, zeichen) - laufweite;
  return Math.max(KLEINSTE_WORTGROESSE, Math.floor(Math.min(max, jeZeichen / ZEICHENBREITE)));
}

export interface Rechteck {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Lage eines Bildes, das einen Rahmen ganz füllt (wie CSS `object-fit: cover`).
 * `ankerX`/`ankerY` wählen den Ausschnitt: 0 = links/oben, 0.5 = Mitte, 1 = rechts/unten.
 */
export function deckendesRechteck(
  rahmenBreite: number,
  rahmenHoehe: number,
  verhaeltnis: number,
  ankerX = 0.5,
  ankerY = 0.5,
): Rechteck {
  const faktor = Math.max(rahmenBreite / verhaeltnis, rahmenHoehe);
  const width = faktor * verhaeltnis;
  const height = faktor;
  return { left: (rahmenBreite - width) * ankerX, top: (rahmenHoehe - height) * ankerY, width, height };
}
