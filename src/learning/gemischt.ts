/**
 * Gemischter Modus: eine Runde mit Aufgaben aus mehreren Modi durcheinander.
 *
 * Eine Aufgabe ist ein Paar (Wort, Modus) und wird in den Kasten GENAU dieses Modus verbucht –
 * der Fortschritt bleibt je Wort und Modus getrennt; „Gemischt“ hat keinen eigenen Kasten.
 * In einer Runde kommt jedes Wort höchstens in EINEM Modus vor (sonst verriete die Karte die
 * Schreib-Antwort). Alle Funktionen sind rein.
 */
import type { Vocab } from '../data/types';
import { getItemProgress, isWordDue, type Mode, type Progress } from './progress';
import { createSessionFromTasks, type Aufgabe, type Auswahl, type RandomSource, type Session } from './session';

/**
 * Welche Modi der gemischte Modus mischt. Soll z. B. Schreiben nicht dabei sein, genügt es,
 * den Eintrag hier zu streichen.
 */
export const GEMISCHT_MODI: readonly Mode[] = ['de-en', 'en-de', 'schreiben'];

function shuffle<T>(list: readonly T[], random: RandomSource): T[] {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Wählt die Aufgaben einer gemischten Runde.
 * - `faellig`: nur fällige (Wort, Modus)-Paare, je Modus niedrige Fächer zuerst.
 * - `frei`: alle Wörter (oder nur die, die im jeweiligen Modus im angegebenen Fach liegen).
 *
 * Die Modi kommen reihum zum Zug (Startreihenfolge zufällig) und nehmen jeweils ihr nächstes
 * Wort, das noch kein anderer Modus hat – so bleibt die Runde möglichst ausgewogen, und kein
 * Wort kommt doppelt vor. Am Ende wird die Reihenfolge der Aufgaben gemischt.
 */
export function selectMixedTasks(
  words: readonly Vocab[],
  progress: Progress,
  now: number,
  auswahl: Auswahl = { art: 'faellig' },
  random: RandomSource = Math.random,
  limit?: number,
  modes: readonly Mode[] = GEMISCHT_MODI,
): Aufgabe[] {
  const max = limit === undefined ? Infinity : Math.max(0, limit);
  const kandidaten = shuffle(modes, random).map((mode) => {
    const box = (word: Vocab) => getItemProgress(progress, mode, word.id).box;
    let liste = shuffle(words, random);
    if (auswahl.art === 'faellig') {
      // Array.prototype.sort ist stabil: die zufällige Reihenfolge bleibt bei Gleichstand erhalten.
      liste = liste.filter((word) => isWordDue(progress, mode, word.id, now)).sort((a, b) => box(a) - box(b));
    } else if (auswahl.fach !== undefined) {
      liste = liste.filter((word) => box(word) === auswahl.fach);
    }
    return { mode, liste };
  });

  const vergeben = new Set<string>();
  const aufgaben: Aufgabe[] = [];
  let gefunden = true;
  while (gefunden && aufgaben.length < max) {
    gefunden = false;
    for (const { mode, liste } of kandidaten) {
      if (aufgaben.length >= max) break;
      const index = liste.findIndex((word) => !vergeben.has(word.id));
      if (index < 0) continue;
      const [word] = liste.splice(index, 1);
      vergeben.add(word.id);
      aufgaben.push({ word, mode });
      gefunden = true;
    }
  }
  return shuffle(aufgaben, random);
}

/** Optionen für {@link createMixedSession}. */
export interface MixedSessionOptions {
  words: readonly Vocab[];
  progress: Progress;
  /** Jetzt, in ms seit Epoch. */
  now: number;
  /** Standard: `{ art: 'faellig' }`. */
  auswahl?: Auswahl;
  /** Höchstzahl Aufgaben; ohne Angabe alle passenden. */
  limit?: number;
  random?: RandomSource;
  /** Standard: {@link GEMISCHT_MODI}. */
  modes?: readonly Mode[];
}

/** Startet eine gemischte Sitzung. Passt keine Aufgabe (z. B. nichts fällig), ist sie sofort beendet. */
export function createMixedSession(options: MixedSessionOptions): Session {
  const { words, progress, now, auswahl = { art: 'faellig' }, random = Math.random, limit, modes = GEMISCHT_MODI } = options;
  return createSessionFromTasks(selectMixedTasks(words, progress, now, auswahl, random, limit, modes), auswahl);
}

/**
 * Zahl der Wörter, die jetzt in mindestens einem der gemischten Modi fällig sind – für „N dran“.
 * (Gezählt werden Wörter, nicht Paare: Für das Kind sind es 56 Wörter, nicht 168 Aufgaben.)
 */
export function mixedDueWords(progress: Progress, words: readonly Vocab[], now: number, modes: readonly Mode[] = GEMISCHT_MODI): number {
  return words.filter((word) => modes.some((mode) => isWordDue(progress, mode, word.id, now))).length;
}
