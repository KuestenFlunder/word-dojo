/**
 * Eine Übungssitzung für einen Modus über eine Wortliste – als unveränderlicher Zustand
 * mit reinen Übergangsfunktionen (passt zu `useReducer`/`useState`).
 *
 * Ablauf je Wort:
 * 1. Karten-Modi (`en-de`, `de-en`): Das Kind deckt auf und bewertet selbst → {@link answerCard}.
 *    Schreib-Modus: {@link submitWriting} (oder {@link revealWriting} für „weiß ich nicht“).
 *    Richtig → nächstes Wort. Falsch → das Wort bleibt dran, `session.schreib.phase` ist
 *    `abschreiben`; weitere {@link submitWriting}, bis es stimmt.
 * 2. Nicht Gewusstes kommt in derselben Sitzung noch einmal dran (höchstens
 *    {@link MAX_REPEATS}-mal je Wort): nach {@link REQUEUE_GAP} NEUEN Wörtern, sonst ganz
 *    hinten. Gezählt werden nur neue Wörter, damit Wiederholungen die neuen nie aufhalten.
 * 3. Nur der ERSTE Versuch eines Wortes in der Sitzung zählt für den Karteikasten: Die
 *    Übergänge liefern dann `record`. Sterne (`stars`) gibt es bei jedem geschafften Wort,
 *    auch in der Wiederholung und nach dem Abschreiben. {@link applyResult} trägt beides ein.
 *
 * Gemischte Sitzungen ({@link createSessionFromTasks}, Auswahl in `gemischt.ts`) mischen Aufgaben
 * mehrerer Modi: Jedes Wort hat dann seinen eigenen Modus (`wordModes`), und `mode` ist immer
 * der Modus der AKTUELLEN Aufgabe. Verbucht wird in den Kasten genau dieses Modus.
 */
import type { Vocab, WordId } from '../data/types';
import type { LeitnerBox, Outcome } from './leitner';
import { getItemProgress, isWordDue, recordOutcome, type Mode, type Progress } from './progress';
import { addStars, recordPracticeDay, STARS_PER_WORD } from './rewards';
import { schreibFertig, schreibOutcome, schreibReducer, startSchreiben, type SchreibAction, type SchreibState } from './schreiben';

/** Zufallsquelle wie `Math.random` (Wert in [0, 1)); für Tests injizierbar. */
export type RandomSource = () => number;

/**
 * Wie viele neue (noch nie gestellte) Wörter zwischen einem nicht gewussten Wort und seiner
 * Wiederholung liegen. Gibt es nicht mehr so viele neue, kommt die Wiederholung hinter alle
 * neuen, aber mit so viel Abstand wie möglich (höchstens REQUEUE_GAP).
 */
export const REQUEUE_GAP = 3;
/** Höchstzahl der Wiederholungen eines Wortes in einer Sitzung. */
export const MAX_REPEATS = 3;

/**
 * Welche Wörter in die Sitzung kommen.
 * - `faellig`: nur, was nach dem Karteikasten jetzt dran ist (niedrige Fächer zuerst).
 * - `frei`: freies Üben ohne Rücksicht auf Fälligkeit – alle Wörter oder nur die eines Fachs.
 */
export type Auswahl = { art: 'faellig' } | { art: 'frei'; fach?: LeitnerBox };

/** Zustand einer Sitzung. Nicht direkt verändern, nur über die Funktionen dieses Moduls. */
export interface Session {
  /**
   * Modus der Sitzung. In gemischten Sitzungen (`wordModes` gesetzt) der Modus der AKTUELLEN
   * Aufgabe – er wechselt mit dem Wort; nach dem Ende bleibt der der letzten Aufgabe stehen.
   */
  readonly mode: Mode;
  /** Nur in gemischten Sitzungen: der Modus jedes Wortes (jedes Wort kommt in genau einem vor). */
  readonly wordModes?: Readonly<Record<WordId, Mode>>;
  readonly auswahl: Auswahl;
  /** Alle Wörter der Sitzung in Startreihenfolge. */
  readonly wordIds: readonly WordId[];
  /** Noch offene Wörter; `queue[0]` ist das aktuelle. */
  readonly queue: readonly WordId[];
  /** Die Wörter der Sitzung zum Nachschlagen. */
  readonly words: Readonly<Record<WordId, Vocab>>;
  /**
   * Nur im Modus `schreiben`: Stand der Schreib-Aufgabe des aktuellen Wortes – `phase` ist
   * `eingabe` oder `abschreiben`, `diff` trägt die Fehlerstellen der letzten Eingabe.
   * `null` in den Karten-Modi und wenn die Sitzung beendet ist.
   */
  readonly schreib: SchreibState | null;
  /** Ergebnis des ersten Versuchs je Wort. */
  readonly firstOutcomes: Readonly<Record<WordId, Outcome>>;
  /** Bisherige Wiederholungen je Wort. */
  readonly repeats: Readonly<Record<WordId, number>>;
  /** In dieser Sitzung verdiente Sterne. */
  readonly stars: number;
}

/** Eintrag für den Karteikasten: nur beim ersten Versuch eines Wortes gesetzt. */
export interface OutcomeRecord {
  wordId: WordId;
  outcome: Outcome;
}

/** Ergebnis eines Übergangs. Mit {@link applyResult} in den Fortschritt eintragen. */
export interface Transition {
  /** Neuer Sitzungszustand. */
  session: Session;
  /** Für den Karteikasten, wenn gesetzt (erster Versuch des Wortes in dieser Sitzung). */
  record: OutcomeRecord | null;
  /** Durch diesen Schritt verdiente Sterne (0 oder mehr, nie negativ). */
  stars: number;
}

/** Ergebnis eines Schreib-Schritts. */
export interface WritingTransition extends Transition {
  /**
   * Stand der gerade bearbeiteten Schreib-Aufgabe NACH dem Schritt – für die Rückmeldung:
   * `richtig` (sofort gewusst), `abschreiben` (richtiges Wort zeigen, `diff` markiert die
   * Fehlerstellen), `weiter` (richtig abgeschrieben). `session.schreib` gehört dagegen
   * bei `richtig`/`weiter` schon zum nächsten Wort.
   */
  schreib: SchreibState;
}

/** Optionen für {@link createSession}. */
export interface SessionOptions {
  mode: Mode;
  /** Wörter, aus denen gewählt wird – ein ganzes Set, eine Gruppe oder mehrere Sets. */
  words: readonly Vocab[];
  progress: Progress;
  /** Jetzt, in ms seit Epoch. */
  now: number;
  /** Standard: `{ art: 'faellig' }`. */
  auswahl?: Auswahl;
  /** Höchstzahl Wörter; ohne Angabe alle passenden. */
  limit?: number;
  /** Zufallsquelle für die Reihenfolge, Standard `Math.random`. */
  random?: RandomSource;
}

function shuffle<T>(list: readonly T[], random: RandomSource): T[] {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Wählt und mischt die Wörter einer Sitzung.
 * `faellig`: nur fällige, niedrige Fächer zuerst, bei Gleichstand zufällig.
 * `frei`: alle (oder nur die im angegebenen Fach; nie geübte liegen in Fach 1), zufällig.
 */
export function selectWords(
  words: readonly Vocab[],
  mode: Mode,
  progress: Progress,
  now: number,
  auswahl: Auswahl = { art: 'faellig' },
  random: RandomSource = Math.random,
  limit?: number,
): Vocab[] {
  const box = (word: Vocab) => getItemProgress(progress, mode, word.id).box;
  let selected = shuffle(words, random);
  if (auswahl.art === 'faellig') {
    // Array.prototype.sort ist stabil: die zufällige Reihenfolge bleibt bei Gleichstand erhalten.
    selected = selected.filter((word) => isWordDue(progress, mode, word.id, now)).sort((a, b) => box(a) - box(b));
  } else if (auswahl.fach !== undefined) {
    selected = selected.filter((word) => box(word) === auswahl.fach);
  }
  return limit === undefined ? selected : selected.slice(0, Math.max(0, limit));
}

function schreibFor(session: Pick<Session, 'mode' | 'words'>, wordId: WordId | undefined): SchreibState | null {
  if (session.mode !== 'schreiben' || wordId === undefined) return null;
  return startSchreiben(session.words[wordId].accept);
}

/** Startet eine Sitzung. Passt kein Wort (z. B. nichts fällig), ist sie sofort beendet. */
export function createSession(options: SessionOptions): Session {
  const { mode, progress, now, auswahl = { art: 'faellig' }, random = Math.random } = options;
  const selected = selectWords(options.words, mode, progress, now, auswahl, random, options.limit);
  const wordIds = selected.map((word) => word.id);
  const words = Object.fromEntries(selected.map((word) => [word.id, word]));
  return {
    mode,
    auswahl,
    wordIds,
    queue: wordIds,
    words,
    schreib: schreibFor({ mode, words }, wordIds[0]),
    firstOutcomes: {},
    repeats: {},
    stars: 0,
  };
}

/** Eine Aufgabe einer gemischten Sitzung: ein Wort in einem bestimmten Modus. */
export interface Aufgabe {
  readonly word: Vocab;
  readonly mode: Mode;
}

/**
 * Startet eine gemischte Sitzung aus fertig gewählten Aufgaben (Reihenfolge wie übergeben).
 * Jedes Wort darf nur einmal vorkommen – sonst verriete die Karte die Schreib-Antwort.
 * Ohne Aufgaben ist die Sitzung sofort beendet.
 */
export function createSessionFromTasks(tasks: readonly Aufgabe[], auswahl: Auswahl = { art: 'faellig' }): Session {
  const wordIds = tasks.map((task) => task.word.id);
  if (new Set(wordIds).size !== wordIds.length) throw new Error('Jedes Wort darf in einer Sitzung nur einmal vorkommen.');
  const words = Object.fromEntries(tasks.map((task) => [task.word.id, task.word]));
  const wordModes = Object.fromEntries(tasks.map((task) => [task.word.id, task.mode]));
  const mode = tasks[0]?.mode ?? 'de-en';
  return {
    mode,
    wordModes,
    auswahl,
    wordIds,
    queue: wordIds,
    words,
    schreib: schreibFor({ mode, words }, wordIds[0]),
    firstOutcomes: {},
    repeats: {},
    stars: 0,
  };
}

/** Modus, in dem ein Wort in dieser Sitzung geübt wird. */
export function modeOfWord(session: Pick<Session, 'mode' | 'wordModes'>, wordId: WordId): Mode {
  return session.wordModes?.[wordId] ?? session.mode;
}

/** Aktuelles Wort oder `undefined`, wenn die Sitzung beendet ist. */
export function currentWord(session: Session): Vocab | undefined {
  const id = session.queue[0];
  return id === undefined ? undefined : session.words[id];
}

/** True, wenn keine Wörter mehr offen sind. */
export function isFinished(session: Session): boolean {
  return session.queue.length === 0;
}

function requireCurrent(session: Session): Vocab {
  const word = currentWord(session);
  if (!word) throw new Error('Sitzung ist beendet.');
  return word;
}

/** Merkt das Ergebnis des ersten Versuchs; liefert den Eintrag für den Karteikasten oder `null`. */
function markFirst(session: Session, wordId: WordId, outcome: Outcome): { session: Session; record: OutcomeRecord | null } {
  if (session.firstOutcomes[wordId] !== undefined) return { session, record: null };
  return {
    session: { ...session, firstOutcomes: { ...session.firstOutcomes, [wordId]: outcome } },
    record: { wordId, outcome },
  };
}

/** Einfügestelle der Wiederholung in `rest` (siehe {@link REQUEUE_GAP}). */
function requeuePosition(session: Session, rest: readonly WordId[]): number {
  let fresh = 0;
  let afterLastFresh = 0;
  for (let i = 0; i < rest.length; i++) {
    if (session.firstOutcomes[rest[i]] !== undefined) continue;
    fresh++;
    afterLastFresh = i + 1;
    if (fresh === REQUEUE_GAP) return i + 1;
  }
  return Math.max(afterLastFresh, Math.min(rest.length, REQUEUE_GAP));
}

/** Schließt das aktuelle Wort ab, stellt es bei „nicht gewusst“ ggf. später wieder ein und zählt die Sterne. */
function completeCurrent(session: Session, outcome: Outcome, stars: number): Session {
  const [wordId, ...rest] = session.queue;
  const repeats = session.repeats[wordId] ?? 0;
  let queue: readonly WordId[] = rest;
  let nextRepeats = session.repeats;
  if (outcome === 'nicht-gewusst' && repeats < MAX_REPEATS) {
    const position = requeuePosition(session, rest);
    queue = [...rest.slice(0, position), wordId, ...rest.slice(position)];
    nextRepeats = { ...session.repeats, [wordId]: repeats + 1 };
  }
  // Gemischte Sitzung: Der Modus folgt dem nächsten Wort.
  const mode = queue[0] === undefined ? session.mode : modeOfWord(session, queue[0]);
  return {
    ...session,
    mode,
    queue,
    repeats: nextRepeats,
    stars: session.stars + stars,
    schreib: schreibFor({ mode, words: session.words }, queue[0]),
  };
}

/**
 * Karten-Modi: Das Kind hat aufgedeckt und sagt „gewusst“ (`true`) oder „nicht gewusst“
 * (`false`). Gewusst gibt einen Stern; nicht Gewusstes kommt später in der Sitzung wieder.
 */
export function answerCard(session: Session, gewusst: boolean): Transition {
  const word = requireCurrent(session);
  if (session.mode === 'schreiben') throw new Error('Im Modus „schreiben“ submitWriting benutzen.');
  const outcome: Outcome = gewusst ? 'gewusst' : 'nicht-gewusst';
  const stars = gewusst ? STARS_PER_WORD : 0;
  const marked = markFirst(session, word.id, outcome);
  return { session: completeCurrent(marked.session, outcome, stars), record: marked.record, stars };
}

function writingStep(session: Session, action: SchreibAction): WritingTransition {
  const word = requireCurrent(session);
  if (!session.schreib) throw new Error('In den Karten-Modi answerCard benutzen.');
  const schreib = schreibReducer(session.schreib, action);
  const outcome = schreibOutcome(schreib);
  if (outcome === null) return { session, record: null, stars: 0, schreib };
  // Steht schon fest, sobald abgeschrieben werden muss – zählt also auch, wenn das Kind dann abbricht.
  const marked = markFirst(session, word.id, outcome);
  if (!schreibFertig(schreib)) return { session: { ...marked.session, schreib }, record: marked.record, stars: 0, schreib };
  // Geschafft: sofort richtig ODER richtig abgeschrieben – beides gibt einen Stern.
  return { session: completeCurrent(marked.session, outcome, STARS_PER_WORD), record: marked.record, stars: STARS_PER_WORD, schreib };
}

/**
 * Schreib-Modus: prüft die Eingabe zum aktuellen Wort – im Schritt `eingabe` die Antwort,
 * im Schritt `abschreiben` das Abgeschriebene (siehe `schreiben.ts`).
 * - Sofort richtig → Stern, nächstes Wort, `record` = gewusst.
 * - Falsch → kein Abzug; das Wort bleibt dran (`abschreiben`), `record` = nicht gewusst (Fach 1).
 * - Richtig abgeschrieben → Stern fürs Durchhalten, nächstes Wort; das Wort kommt später wieder.
 * - Falsch abgeschrieben → nichts ändert sich außer den markierten Fehlerstellen.
 */
export function submitWriting(session: Session, input: string): WritingTransition {
  return writingStep(session, { type: 'pruefen', input });
}

/** Schreib-Modus, „weiß ich nicht“: zeigt das richtige Wort und verlangt das Abschreiben (wie eine falsche Eingabe). */
export function revealWriting(session: Session): WritingTransition {
  return writingStep(session, { type: 'aufdecken' });
}

/**
 * Trägt das Ergebnis eines Übergangs in den Fortschritt ein: Fach (wenn `record` gesetzt),
 * Sterne und den Übungstag für die Serie. Danach speichern (`ProgressStorage.save`).
 */
export function applyResult(progress: Progress, mode: Mode, result: Pick<Transition, 'record' | 'stars'>, now: number): Progress {
  if (!result.record && result.stars <= 0) return progress;
  const recorded = result.record ? recordOutcome(progress, mode, result.record.wordId, result.record.outcome, now) : progress;
  return { ...recorded, rewards: recordPracticeDay(addStars(recorded.rewards, result.stars), now) };
}

/** Stand der Sitzung für die Anzeige. */
export interface SessionProgress {
  /** Wörter, deren erster Versuch hinter dem Kind liegt („5 von 8“ = 5 erledigt). */
  done: number;
  /** Feste Zahl der Wörter der Sitzung (ohne Wiederholungen). */
  total: number;
  /** Beim ersten Versuch gewusst. */
  known: number;
  /** Wie viele Wörter noch zum Wiederholen anstehen (das gerade gezeigte eingeschlossen). */
  repeatsLeft: number;
  /** True, wenn das aktuelle Wort in dieser Sitzung schon einmal dran war. */
  isRepeat: boolean;
  /** In dieser Sitzung verdiente Sterne. */
  stars: number;
}

/** Fortschritt einer Sitzung: erledigte und gewusste Wörter, offene Wiederholungen, Sterne. */
export function sessionProgress(session: Session): SessionProgress {
  const done = session.wordIds.filter((id) => session.firstOutcomes[id] !== undefined).length;
  const known = session.wordIds.filter((id) => session.firstOutcomes[id] === 'gewusst').length;
  const current = session.queue[0];
  const copying = session.schreib?.phase === 'abschreiben';
  const repeats = new Set(session.queue.filter((id) => session.firstOutcomes[id] !== undefined));
  // Wird das aktuelle Wort zum ersten Mal abgeschrieben, ist es noch keine Wiederholung.
  const isRepeat = current !== undefined && repeats.has(current) && (!copying || (session.repeats[current] ?? 0) > 0);
  if (current !== undefined && !isRepeat) repeats.delete(current);
  return { done, total: session.wordIds.length, known, repeatsLeft: repeats.size, isRepeat, stars: session.stars };
}

/** Auswertung einer Sitzung für die Abschlussseite. */
export interface SessionSummary {
  total: number;
  /** Beim ersten Versuch gewusst. */
  known: number;
  /** Beim ersten Versuch nicht gewusst – zum Anzeigen „Diese üben wir noch mal“. */
  unknown: Vocab[];
  /** In dieser Sitzung verdiente Sterne. */
  stars: number;
}

/** Wertet die Sitzung aus. */
export function summarizeSession(session: Session): SessionSummary {
  const known = session.wordIds.filter((id) => session.firstOutcomes[id] === 'gewusst').length;
  const unknown = session.wordIds.filter((id) => session.firstOutcomes[id] === 'nicht-gewusst').map((id) => session.words[id]);
  return { total: session.wordIds.length, known, unknown, stars: session.stars };
}
