/**
 * Steuerung einer Runde: welche Ansicht gerade zu sehen ist und wie es weitergeht – als
 * unveränderlicher Zustand mit reinen Übergängen über der Sitzung des Lernkerns.
 * (Importiert den Lernkern dateiweise statt über `@/learning`, damit Tests ohne Gerätespeicher laufen.)
 *
 *   Karten:    karte-frage ──aufdecken──▶ karte-aufgedeckt ──bewerten──▶ nächstes Wort / fertig
 *   Schreiben: schreiben ──prüfen, richtig──▶ richtig ──weiter──▶ nächstes Wort / fertig
 *                  └──prüfen, falsch / weiß nicht──▶ abschreiben ──stimmt──▶ nächstes Wort / fertig
 *                                                        └──stimmt nicht──▶ bleibt
 *
 * Unpassende Aufrufe (z. B. doppeltes Tippen) ändern nichts.
 *
 * Gemischte Runden (`mode: 'gemischt'`) mischen Karten- und Schreib-Aufgaben; `session.mode`
 * ist dann immer der Modus der aktuellen Aufgabe und bestimmt die Ansicht.
 */
import type { Vocab, WordId } from '@/data';
import type { LeitnerBox } from '@/learning/leitner';
import { getItemProgress, type Mode, type Progress } from '@/learning/progress';
import {
  answerCard,
  createSession,
  currentWord,
  isFinished,
  revealWriting,
  submitWriting,
  modeOfWord,
  sessionProgress,
  type Auswahl,
  type RandomSource,
  type Session,
} from '@/learning/session';
import { createMixedSession } from '@/learning/gemischt';
import type { SpellingDiff } from '@/learning/spelling';

import { RUNDEN_GROESSE, verbuchungNachUebungsart, type Verbuchung } from './regeln';
import type { RundenModus } from './texte';

export type Ansicht = 'karte-frage' | 'karte-aufgedeckt' | 'schreiben' | 'richtig' | 'abschreiben' | 'fertig';

export interface Runde {
  /** Womit die Runde gestartet wurde. Der Modus der aktuellen Aufgabe steht in `session.mode`. */
  readonly rundenModus: RundenModus;
  readonly session: Session;
  readonly ansicht: Ansicht;
  /** Das gezeigte Wort. In `richtig` das gerade geschaffte (die Sitzung ist schon weiter). */
  readonly wort: Vocab | null;
  /** Nur in `abschreiben`: Fehlerstellen der letzten Eingabe; `null` nach „Weiß ich nicht“. */
  readonly diff: SpellingDiff | null;
  /** Nur in `abschreiben`: wie oft die Abschrift noch nicht gestimmt hat. */
  readonly abschriftDaneben: number;
  /** Fach jedes Wortes zu Beginn der Runde – für „Aufgestiegen“ auf der Abschlussseite. */
  readonly startFaecher: Readonly<Record<WordId, LeitnerBox>>;
}

/**
 * Ergebnis eines Übergangs. `verbuchung` mit `applyResult` eintragen und speichern – und zwar
 * im Modus der beantworteten Aufgabe, also `session.mode` der Runde VOR dem Schritt.
 */
export interface Schritt {
  runde: Runde;
  verbuchung: Verbuchung | null;
}

export interface RundenOptionen {
  mode: RundenModus;
  auswahl: Auswahl;
  words: readonly Vocab[];
  progress: Progress;
  now: number;
  limit?: number;
  random?: RandomSource;
}

function naechsteAnsicht(session: Session): Pick<Runde, 'ansicht' | 'wort' | 'diff' | 'abschriftDaneben'> {
  const wort = currentWord(session) ?? null;
  const ansicht: Ansicht = isFinished(session) ? 'fertig' : session.mode === 'schreiben' ? 'schreiben' : 'karte-frage';
  return { ansicht, wort, diff: null, abschriftDaneben: 0 };
}

/** Startet eine Runde. Passt kein Wort, ist sie sofort `fertig` (mit 0 Wörtern). */
export function starteRunde(optionen: RundenOptionen): Runde {
  const { mode, progress, limit = RUNDEN_GROESSE } = optionen;
  const session = mode === 'gemischt' ? createMixedSession({ ...optionen, limit }) : createSession({ ...optionen, mode, limit });
  const startFaecher = Object.fromEntries(
    session.wordIds.map((id) => [id, getItemProgress(progress, modeOfWord(session, id), id).box]),
  );
  return { rundenModus: mode, session, startFaecher, ...naechsteAnsicht(session) };
}

const unveraendert = (runde: Runde): Schritt => ({ runde, verbuchung: null });

function verbuchung(runde: Runde, ergebnis: Verbuchung): Verbuchung | null {
  const v = verbuchungNachUebungsart(runde.session.auswahl, ergebnis);
  return v.record || v.stars > 0 ? v : null;
}

/** Karte: Antwort-Seite zeigen. */
export function aufdecken(runde: Runde): Schritt {
  if (runde.ansicht !== 'karte-frage') return unveraendert(runde);
  return { runde: { ...runde, ansicht: 'karte-aufgedeckt' }, verbuchung: null };
}

/** Karte: „Gewusst!“ (`true`) oder „Noch nicht“ (`false`). Nur nach dem Aufdecken. */
export function bewerten(runde: Runde, gewusst: boolean): Schritt {
  if (runde.ansicht !== 'karte-aufgedeckt') return unveraendert(runde);
  const t = answerCard(runde.session, gewusst);
  return { runde: { ...runde, session: t.session, ...naechsteAnsicht(t.session) }, verbuchung: verbuchung(runde, t) };
}

/**
 * Schreiben: Eingabe prüfen – in `schreiben` die Antwort, in `abschreiben` die Abschrift.
 * Eine leere Eingabe ändert nichts (für „Weiß ich nicht“ gibt es {@link weissNicht}).
 */
export function pruefen(runde: Runde, eingabe: string): Schritt {
  if (runde.ansicht !== 'schreiben' && runde.ansicht !== 'abschreiben') return unveraendert(runde);
  if (eingabe.trim() === '') return unveraendert(runde);
  const t = submitWriting(runde.session, eingabe);
  const v = verbuchung(runde, t);
  switch (t.schreib.phase) {
    case 'richtig':
      return { runde: { ...runde, session: t.session, ansicht: 'richtig', diff: null, abschriftDaneben: 0 }, verbuchung: v };
    case 'weiter':
      return { runde: { ...runde, session: t.session, ...naechsteAnsicht(t.session) }, verbuchung: v };
    case 'abschreiben':
      return {
        runde: { ...runde, session: t.session, ansicht: 'abschreiben', diff: t.schreib.diff, abschriftDaneben: t.schreib.copyMisses },
        verbuchung: v,
      };
    default:
      return unveraendert(runde);
  }
}

/** Schreiben: „Weiß ich nicht“ – richtiges Wort zeigen und abschreiben lassen. */
export function weissNicht(runde: Runde): Schritt {
  if (runde.ansicht !== 'schreiben') return unveraendert(runde);
  const t = revealWriting(runde.session);
  return {
    runde: { ...runde, session: t.session, ansicht: 'abschreiben', diff: null, abschriftDaneben: 0 },
    verbuchung: verbuchung(runde, t),
  };
}

/** Schreiben: nach „Richtig!“ zum nächsten Wort (oder zur Abschlussseite). */
export function weiter(runde: Runde): Schritt {
  if (runde.ansicht !== 'richtig') return unveraendert(runde);
  return { runde: { ...runde, ...naechsteAnsicht(runde.session) }, verbuchung: null };
}

/**
 * Nummer der gezeigten Aufgabe für den Zähler „3 von 12“: die erste Aufgabe ist 1.
 * Wiederholungen und schon beantwortete Aufgaben (Abschreiben, „Richtig!“) zählen nicht weiter.
 */
export function aufgabenNummer(runde: Runde): { nummer: number; gesamt: number } {
  const { done, total } = sessionProgress(runde.session);
  const aktuell = runde.session.queue[0];
  const neu = runde.ansicht !== 'richtig' && aktuell !== undefined && runde.session.firstOutcomes[aktuell] === undefined;
  return { nummer: Math.min(total, neu ? done + 1 : done), gesamt: total };
}

/** Ein Fach, das Wörter in dieser Runde erreicht haben. */
export interface Aufstieg {
  fach: LeitnerBox;
  anzahl: number;
}

/**
 * Wie viele Wörter der Runde jetzt in einem höheren Fach liegen als zu Beginn, je erreichtem
 * Fach, höchstes zuerst. Im freien Üben steigt nichts auf – die Liste ist dann leer.
 */
export function aufstiege(runde: Runde, progress: Progress): Aufstieg[] {
  const zahl = new Map<LeitnerBox, number>();
  for (const id of runde.session.wordIds) {
    const jetzt = getItemProgress(progress, modeOfWord(runde.session, id), id).box;
    if (jetzt > runde.startFaecher[id]) zahl.set(jetzt, (zahl.get(jetzt) ?? 0) + 1);
  }
  return [...zahl.entries()].map(([fach, anzahl]) => ({ fach, anzahl })).sort((a, b) => b.fach - a.fach);
}
