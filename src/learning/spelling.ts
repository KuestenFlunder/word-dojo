/**
 * Schreibprüfung für englische Vokabeln: vergleicht die Eingabe des Kindes mit allen
 * gültigen Schreibweisen (`accept`) eines Wortes und liefert bei Fehlern, welche
 * Buchstaben falsch, fehlend, zu viel oder vertauscht sind.
 *
 * Egal sind: Groß/Klein, Leerzeichen am Rand und mehrfache Leerzeichen, Satzzeichen am
 * Rand, Punkte (Abkürzungen wie „sb.“), Kommas, Klammerzusätze wie „(past)“, Leerzeichen
 * um „/“, die Art des Apostrophs und ein führendes „to “.
 * Alles andere zählt – es gibt kein „fast richtig“: Ein Tippfehler heißt abschreiben.
 */

/** Vereinheitlicht eine Schreibweise für den Vergleich (siehe Regeln oben; „to “ bleibt stehen). */
export function normalizeAnswer(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’‚‛′´`]/g, "'")
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\./g, '')
    .replace(/[,;]/g, ' ')
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
}

const TO = 'to ';

function stripTo(normalized: string): string {
  return normalized.startsWith(TO) ? normalized.slice(TO.length) : normalized;
}

/** True, wenn die Eingabe einer der gültigen Schreibweisen entspricht. */
export function isCorrect(input: string, accept: readonly string[]): boolean {
  const typed = stripTo(normalizeAnswer(input));
  return typed.length > 0 && accept.some((form) => stripTo(normalizeAnswer(form)) === typed);
}

/**
 * Zustand eines Buchstabens im Vergleich.
 * - `ok`: stimmt.
 * - `falsch`: an dieser Stelle steht ein anderer Buchstabe.
 * - `fehlt`: steht im richtigen Wort, fehlt in der Eingabe (nur in `expected`).
 * - `zuviel`: steht in der Eingabe, gehört nicht ins Wort (nur in `typed`).
 * - `vertauscht`: zwei Nachbarn in falscher Reihenfolge (beide sind markiert).
 */
export type DiffStatus = 'ok' | 'falsch' | 'fehlt' | 'zuviel' | 'vertauscht';

/** Ein Buchstabe mit seinem Zustand. */
export interface DiffChar {
  char: string;
  status: DiffStatus;
}

/** Buchstabengenauer Vergleich zwischen Eingabe und der ähnlichsten gültigen Schreibweise. */
export interface SpellingDiff {
  /** Die gültige Schreibweise, mit der verglichen wurde (vereinheitlicht, klein geschrieben). */
  target: string;
  /** Die Eingabe, vereinheitlicht. */
  input: string;
  /** `target` Buchstabe für Buchstabe – zum Markieren im richtigen Wort (`ok`/`falsch`/`fehlt`/`vertauscht`). */
  expected: DiffChar[];
  /** `input` Buchstabe für Buchstabe – zum Markieren im Getippten (`ok`/`falsch`/`zuviel`/`vertauscht`). */
  typed: DiffChar[];
  /** Anzahl der Fehlerstellen (ein vertauschtes Paar zählt als eine). 0 = richtig. */
  errors: number;
}

/** Ergebnis von {@link checkAnswer}. */
export interface AnswerCheck {
  correct: boolean;
  /** Vergleich mit der ähnlichsten gültigen Schreibweise; bei `correct` sind alle Buchstaben `ok`. */
  diff: SpellingDiff;
}

/** Richtet zwei Zeichenfolgen aneinander aus (Editierdistanz mit Nachbar-Vertauschung). */
function align(expected: string, typed: string): { expected: DiffChar[]; typed: DiffChar[]; errors: number } {
  const e = [...expected];
  const a = [...typed];
  const n = e.length;
  const m = a.length;
  const d: number[][] = Array.from({ length: n + 1 }, (_, i) => {
    const row = new Array<number>(m + 1).fill(0);
    row[0] = i;
    return row;
  });
  for (let j = 0; j <= m; j++) d[0][j] = j;
  const swapped = (i: number, j: number) => i > 1 && j > 1 && e[i - 1] === a[j - 2] && e[i - 2] === a[j - 1] && e[i - 1] !== e[i - 2];

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      let best = Math.min(d[i - 1][j - 1] + (e[i - 1] === a[j - 1] ? 0 : 1), d[i - 1][j] + 1, d[i][j - 1] + 1);
      if (swapped(i, j)) best = Math.min(best, d[i - 2][j - 2] + 1);
      d[i][j] = best;
    }
  }

  const exp: DiffChar[] = [];
  const typ: DiffChar[] = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && e[i - 1] === a[j - 1] && d[i][j] === d[i - 1][j - 1]) {
      exp.push({ char: e[i - 1], status: 'ok' });
      typ.push({ char: a[j - 1], status: 'ok' });
      i--;
      j--;
    } else if (swapped(i, j) && d[i][j] === d[i - 2][j - 2] + 1) {
      exp.push({ char: e[i - 1], status: 'vertauscht' }, { char: e[i - 2], status: 'vertauscht' });
      typ.push({ char: a[j - 1], status: 'vertauscht' }, { char: a[j - 2], status: 'vertauscht' });
      i -= 2;
      j -= 2;
    } else if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + 1) {
      exp.push({ char: e[i - 1], status: 'falsch' });
      typ.push({ char: a[j - 1], status: 'falsch' });
      i--;
      j--;
    } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) {
      exp.push({ char: e[i - 1], status: 'fehlt' });
      i--;
    } else {
      typ.push({ char: a[j - 1], status: 'zuviel' });
      j--;
    }
  }
  return { expected: exp.reverse(), typed: typ.reverse(), errors: d[n][m] };
}

const okChars = (text: string): DiffChar[] => [...text].map((char) => ({ char, status: 'ok' as const }));

/**
 * Vergleicht die Eingabe mit der ähnlichsten gültigen Schreibweise (bei Gleichstand der
 * früheren in `accept`). Ein führendes „to “ wird nie als Fehler gewertet: Hat die
 * Schreibweise eins, steht es in `expected` als `ok`, auch wenn das Kind es weglässt.
 */
export function diffSpelling(input: string, accept: readonly string[]): SpellingDiff {
  const full = normalizeAnswer(input);
  const typed = stripTo(full);
  let best: { target: string; core: ReturnType<typeof align> } | undefined;
  for (const form of accept) {
    const target = normalizeAnswer(form);
    const core = align(stripTo(target), typed);
    if (!best || core.errors < best.core.errors) best = { target, core };
  }
  if (!best) return { target: '', input: full, expected: [], typed: okChars(full), errors: 0 };
  const { target, core } = best;
  return {
    target,
    input: full,
    expected: [...okChars(target.slice(0, target.length - stripTo(target).length)), ...core.expected],
    typed: [...okChars(full.slice(0, full.length - typed.length)), ...core.typed],
    errors: core.errors,
  };
}

/**
 * Prüft eine getippte Antwort.
 *
 * @example checkAnswer('Hero', ['hero', 'hero, heroes']).correct // true
 * @example checkAnswer('save', ['to save']).correct // true
 * @example checkAnswer('freind', ['friend']).diff.expected // …, i und e als 'vertauscht'
 */
export function checkAnswer(input: string, accept: readonly string[]): AnswerCheck {
  return { correct: isCorrect(input, accept), diff: diffSpelling(input, accept) };
}
