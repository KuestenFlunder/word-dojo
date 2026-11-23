/**
 * Was die Abschreib-Ansicht zeigt: die Vorlage (das richtige Wort) und die eigene Eingabe,
 * jeweils Buchstabe für Buchstabe mit oder ohne Markierung. Reine Funktionen.
 */
import type { Vocab } from '@/data';
import { normalizeAnswer, type DiffChar, type SpellingDiff } from '@/learning/spelling';

/**
 * Markiert wird nur, wenn höchstens dieser Anteil der Buchstaben der Vorlage betroffen ist.
 * Liegt die Eingabe ganz daneben, wäre fast alles markiert – das ist unruhig und hilft nicht.
 */
export const MARKIERUNG_BIS_ANTEIL = 0.5;

export interface Abschrift {
  /** Das richtige Wort in seiner echten Schreibweise (Groß/Klein, Bindestriche, Satzzeichen). */
  vorlage: DiffChar[];
  /** Die eigene Eingabe; leer nach „Weiß ich nicht“. */
  eigenes: DiffChar[];
  /** True, wenn Fehlerstellen markiert sind (Kästen in der Vorlage, Striche in der Eingabe). */
  markiert: boolean;
}

const ohneMarkierung = (zeichen: readonly DiffChar[]): DiffChar[] => zeichen.map(({ char }) => ({ char, status: 'ok' }));
const alsZeichen = (text: string): DiffChar[] => [...text].map((char) => ({ char, status: 'ok' }));

/** True, wenn die Fehlerstellen der Vorlage gezeigt werden sollen (siehe {@link MARKIERUNG_BIS_ANTEIL}). */
export function markierungSinnvoll(expected: readonly DiffChar[]): boolean {
  const buchstaben = expected.filter((z) => z.char !== ' ');
  const betroffen = buchstaben.filter((z) => z.status !== 'ok').length;
  return betroffen > 0 && betroffen <= buchstaben.length * MARKIERUNG_BIS_ANTEIL;
}

/**
 * Überträgt die Markierungen des vereinheitlichten Vergleichs (`expected`, klein geschrieben,
 * ohne Punkte und Kommas) auf die echte Schreibweise `form`. Zeichen, die der Vergleich nicht
 * kennt (Punkt, Komma, doppelte Leerzeichen), bleiben unmarkiert. Geht es nicht auf, kommt
 * `null` zurück.
 */
export function aufSchreibweise(form: string, expected: readonly DiffChar[]): DiffChar[] | null {
  const ergebnis: DiffChar[] = [];
  let j = 0;
  for (const char of form) {
    const gleich = j < expected.length && normalizeAnswer(`a${char}a`).slice(1, -1) === expected[j].char;
    ergebnis.push({ char, status: gleich ? expected[j].status : 'ok' });
    if (gleich) j++;
  }
  return j === expected.length ? ergebnis : null;
}

/**
 * Stellt Vorlage und eigene Eingabe für die Anzeige zusammen.
 * - Vorlage: die Schreibweise, mit der verglichen wurde, so wie sie in den Daten steht
 *   (z. B. „hard-working“); nach „Weiß ich nicht“ (`diff` ist `null`) die Grundform.
 * - Markierungen nur, wenn {@link markierungSinnvoll}; sonst beide Zeilen ohne.
 */
export function abschrift(wort: Vocab, diff: SpellingDiff | null): Abschrift {
  if (!diff) return { vorlage: alsZeichen(wort.accept[0]), eigenes: [], markiert: false };
  const form = wort.accept.find((f) => normalizeAnswer(f) === diff.target);
  const echte = form === undefined ? null : aufSchreibweise(form, diff.expected);
  const vorlage = echte ?? diff.expected;
  if (!markierungSinnvoll(diff.expected)) {
    return { vorlage: ohneMarkierung(vorlage), eigenes: ohneMarkierung(diff.typed), markiert: false };
  }
  return { vorlage, eigenes: diff.typed, markiert: true };
}
