/** Namen und Texte zu Modi und Gürteln – Inhalt, keine Gestaltung. */
import type { LeitnerBox } from '@/learning/leitner';
import type { Mode } from '@/learning/progress';

export type Sprache = 'de' | 'en';

export const SPRACHE_NAME: Record<Sprache, string> = { de: 'DEUTSCH', en: 'ENGLISCH' };

export interface ModusText {
  /** Teile des Titels; zwischen zwei Teilen steht ein Pfeil. */
  titel: readonly string[];
  /** Zum Vorlesen. */
  gesprochen: string;
  untertitel: string;
  /** Sprache der Frage-Seite. */
  frage: Sprache;
  antwort: Sprache;
}

export const MODUS_TEXT: Record<Mode, ModusText> = {
  'de-en': { titel: ['DEUTSCH', 'ENGLISCH'], gesprochen: 'Deutsch nach Englisch', untertitel: 'Karte umdrehen', frage: 'de', antwort: 'en' },
  'en-de': { titel: ['ENGLISCH', 'DEUTSCH'], gesprochen: 'Englisch nach Deutsch', untertitel: 'Karte umdrehen', frage: 'en', antwort: 'de' },
  schreiben: { titel: ['SCHREIBEN'], gesprochen: 'Schreiben', untertitel: 'Englisch tippen', frage: 'de', antwort: 'en' },
};

/** Was auf dem Start gewählt wird: ein einzelner Modus oder alle gemischt. */
export type RundenModus = Mode | 'gemischt';

export type EintragText = Pick<ModusText, 'titel' | 'gesprochen' | 'untertitel'>;

export const GEMISCHT_TEXT: EintragText = {
  titel: ['GEMISCHT'],
  gesprochen: 'Gemischt',
  untertitel: 'Karten und Schreiben durcheinander',
};

/** Titel und Unterzeile zu einem Start-Eintrag. */
export function titelText(modus: RundenModus): EintragText {
  return modus === 'gemischt' ? GEMISCHT_TEXT : MODUS_TEXT[modus];
}

/** Reihenfolge der Einträge auf dem Start-Bildschirm. */
export const START_REIHENFOLGE: readonly RundenModus[] = ['schreiben', 'de-en', 'en-de', 'gemischt'];

/** Reihenfolge der Modi in der Gürtel-Leiste (Gemischt hat keinen eigenen Kasten). */
export const LEISTEN_REIHENFOLGE: readonly Mode[] = ['schreiben', 'de-en', 'en-de'];

/** True, wenn der Text ein gültiger Start-Eintrag ist (z. B. aus der Adresse). */
export function istRundenModus(text: unknown): text is RundenModus {
  return typeof text === 'string' && (START_REIHENFOLGE as readonly string[]).includes(text);
}

/** Gürtel der fünf Fächer. */
export const GUERTEL_NAME: Record<LeitnerBox, string> = { 1: 'Weiß', 2: 'Gelb', 3: 'Grün', 4: 'Rot', 5: 'Schwarz' };

/** „1 Wort“ / „3 Wörter“. */
export function anzahl(n: number, einzahl: string, mehrzahl: string): string {
  return `${n} ${n === 1 ? einzahl : mehrzahl}`;
}
