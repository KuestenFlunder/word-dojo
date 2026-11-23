/**
 * Ablauf einer Schreib-Aufgabe (Deutsch sehen, Englisch tippen) als reiner Reducer.
 *
 *   eingabe ──richtig──▶ richtig                      (gewusst)
 *      │
 *      └──falsch / „weiß ich nicht“──▶ abschreiben ──richtig abgetippt──▶ weiter   (nicht gewusst)
 *                                          ▲    │
 *                                          └────┘ noch nicht richtig: bleibt, bis es stimmt
 *
 * Es gibt nie einen Abzug: Wer falsch tippt, bekommt das richtige Wort gezeigt und
 * schreibt es ab. `richtig` und `weiter` sind Endzustände.
 */
import type { Outcome } from './leitner';
import { checkAnswer, normalizeAnswer, type SpellingDiff } from './spelling';

/** Wo die Aufgabe steht. */
export type SchreibPhase = 'eingabe' | 'richtig' | 'abschreiben' | 'weiter';

/** Zustand einer Schreib-Aufgabe. */
export interface SchreibState {
  readonly phase: SchreibPhase;
  /** Gültige Schreibweisen des Wortes. */
  readonly accept: readonly string[];
  /**
   * Vergleich der letzten geprüften Eingabe mit dem richtigen Wort – zum sanften Markieren
   * der Fehlerstellen. `null` vor der ersten Prüfung und nach „weiß ich nicht“.
   */
  readonly diff: SpellingDiff | null;
  /** Wie oft im Abschreib-Schritt schon daneben getippt wurde. */
  readonly copyMisses: number;
}

/** Was das Kind tut. */
export type SchreibAction =
  /** Eingabe prüfen – im Schritt `eingabe` die Antwort, im Schritt `abschreiben` das Abgeschriebene. */
  | { type: 'pruefen'; input: string }
  /** „Weiß ich nicht“: richtiges Wort zeigen und abschreiben lassen. Nur im Schritt `eingabe`. */
  | { type: 'aufdecken' };

/** Startzustand für ein Wort. */
export function startSchreiben(accept: readonly string[]): SchreibState {
  return { phase: 'eingabe', accept, diff: null, copyMisses: 0 };
}

/** Übergang. In den Endzuständen und bei unpassender Aktion bleibt der Zustand unverändert. */
export function schreibReducer(state: SchreibState, action: SchreibAction): SchreibState {
  // Leere Eingabe: beim Antworten wie „weiß ich nicht“, beim Abschreiben kein Versuch.
  const empty = action.type === 'pruefen' && normalizeAnswer(action.input) === '';
  if (state.phase === 'eingabe') {
    if (action.type === 'aufdecken' || empty) return { ...state, phase: 'abschreiben', diff: null };
    const { correct, diff } = checkAnswer(action.input, state.accept);
    return { ...state, phase: correct ? 'richtig' : 'abschreiben', diff };
  }
  if (state.phase === 'abschreiben' && action.type === 'pruefen' && !empty) {
    const { correct, diff } = checkAnswer(action.input, state.accept);
    if (correct) return { ...state, phase: 'weiter', diff };
    return { ...state, diff, copyMisses: state.copyMisses + 1 };
  }
  return state;
}

/** True in den Endzuständen `richtig` und `weiter`: Es geht zum nächsten Wort. */
export function schreibFertig(state: SchreibState): boolean {
  return state.phase === 'richtig' || state.phase === 'weiter';
}

/**
 * Ergebnis für den Karteikasten: `gewusst` nur bei sofort richtiger Eingabe, sonst
 * `nicht-gewusst` (steht schon fest, sobald abgeschrieben werden muss). `null`, solange offen.
 */
export function schreibOutcome(state: SchreibState): Outcome | null {
  if (state.phase === 'eingabe') return null;
  return state.phase === 'richtig' ? 'gewusst' : 'nicht-gewusst';
}
