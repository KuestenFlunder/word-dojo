/** Alle Vokabel-Sets. Ein neues Set: Datei anlegen und hier in {@link vocabSets} eintragen. */
import type { Vocab, VocabSet, WordId } from './types';
import { unit2part1 } from './unit2part1';

export type { Vocab, VocabSet, WordId } from './types';
export { unit2part1 };

/** Alle Sets in Anzeige-Reihenfolge. */
export const vocabSets: readonly VocabSet[] = [unit2part1];

/** Set zu einer Kennung oder `undefined`. */
export function getSet(id: string): VocabSet | undefined {
  return vocabSets.find((set) => set.id === id);
}

/** Alle Wörter aller Sets. */
export function allWords(): Vocab[] {
  return vocabSets.flatMap((set) => set.words);
}

const byId = new Map<WordId, Vocab>(allWords().map((word) => [word.id, word]));

/** Wort zu einer Kennung oder `undefined`. */
export function getWord(id: WordId): Vocab | undefined {
  return byId.get(id);
}

/** Gruppennummern eines Sets, aufsteigend. */
export function groupsOf(set: VocabSet): number[] {
  return [...new Set(set.words.map((word) => word.group))].sort((a, b) => a - b);
}

/** Wörter einer Gruppe in Buch-Reihenfolge. */
export function wordsOfGroup(set: VocabSet, group: number): Vocab[] {
  return set.words.filter((word) => word.group === group);
}
