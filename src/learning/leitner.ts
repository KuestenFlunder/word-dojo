/**
 * Karteikasten (Leitner-Fächer) über Sitzungen hinweg.
 *
 * Fach 1–5. Gewusst → ein Fach weiter (höchstens 5), nicht gewusst → zurück in Fach 1.
 * Ein Wort ist fällig, wenn seit dem letzten Üben mindestens {@link BOX_INTERVAL_DAYS}
 * Tage seines Fachs vergangen sind (abzüglich 8 Stunden Toleranz); nie geübte Wörter
 * und Wörter in Fach 1 sind immer fällig.
 */

/** Leitner-Fach. */
export type LeitnerBox = 1 | 2 | 3 | 4 | 5;

/** Alle Fächer in Reihenfolge. */
export const BOXES: readonly LeitnerBox[] = [1, 2, 3, 4, 5];

/** Ergebnis eines Wortes: gewusst oder nicht (auch: falsch getippt und nur per Abschreiben gelöst). */
export type Outcome = 'gewusst' | 'nicht-gewusst';

/** Wartezeit in Tagen je Fach, bis das Wort wieder fällig ist. Hier ändern, um den Rhythmus anzupassen. */
export const BOX_INTERVAL_DAYS: Readonly<Record<LeitnerBox, number>> = { 1: 0, 2: 1, 3: 2, 4: 4, 5: 7 };

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
/** Toleranz, damit „gestern Abend geübt, heute Morgen wieder dran“ als ein Tag zählt. */
const DUE_SLACK_MS = 8 * HOUR_MS;

/** Neues Fach nach einem Ergebnis. */
export function nextBox(box: LeitnerBox, outcome: Outcome): LeitnerBox {
  if (outcome === 'nicht-gewusst') return 1;
  return Math.min(5, box + 1) as LeitnerBox;
}

/** Fällig, wenn nie geübt oder die Wartezeit des Fachs abgelaufen ist (`now` in ms). */
export function isDue(box: LeitnerBox, lastPracticed: number | null, now: number): boolean {
  if (lastPracticed === null) return true;
  const days = BOX_INTERVAL_DAYS[box];
  if (days === 0) return true;
  return now - lastPracticed >= days * DAY_MS - DUE_SLACK_MS;
}
