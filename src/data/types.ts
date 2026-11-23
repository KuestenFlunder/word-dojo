/** Datentypen der Vokabel-Sets. */

/** Stabile Kennung eines Wortes, z. B. `"u2p1:hero"`. Steht im gespeicherten Fortschritt – nie umbenennen. */
export type WordId = string;

/** Eine Vokabel. */
export interface Vocab {
  readonly id: WordId;
  /** Englisch, so wie es angezeigt wird (z. B. `"hero, heroes"`). */
  readonly en: string;
  /** Deutsch, so wie es angezeigt wird. */
  readonly de: string;
  /**
   * Alle Schreibweisen, die beim Tippen als richtig gelten. Die erste ist die Grundform.
   * Groß/Klein, Leerzeichen, Punkte, Kommas und ein führendes „to “ gleicht die
   * Schreibprüfung selbst aus (siehe `learning/spelling.ts`) – hier stehen nur echte Varianten.
   */
  readonly accept: readonly string[];
  /** Lerngruppe innerhalb des Sets (ab 1), für kleine Portionen. */
  readonly group: number;
}

/** Ein Vokabel-Set, z. B. ein Teil einer Unit. */
export interface VocabSet {
  /** Stabile Kennung, z. B. `"unit2part1"`. */
  readonly id: string;
  /** Anzeigename. */
  readonly title: string;
  /** Wörter in Buch-Reihenfolge. */
  readonly words: readonly Vocab[];
}
