/** Alle Farben der App (Stil „Dojo“). Bildschirme und Bausteine nehmen Farben nur von hier. */
export const farben = {
  /** Washi-Papier: Grund aller Bildschirme. */
  washi: '#EDE1CB',
  /** Helles Papier: Karten und Buttons zweiter Ordnung. */
  papier: '#F7F0E0',
  /** Tafel: ruhige Flächen wie die Gürtel-Leiste. */
  tafel: '#EEDEC2',
  /** Tusche: Text und Ränder. */
  tusche: '#1A1A1A',
  /** Zinnoberrot: Hauptaktion. Markenfarbe – NIE Fehlerfarbe. */
  rot: '#D9381E',
  /** Moosgrün: positive Rückmeldung und Fortschritt. */
  gruen: '#6B8F71',
  /** Nur für Eingabefelder, Sprechblase, markierte Buchstaben und Text auf Rot. */
  weiss: '#FFFFFF',
} as const;

export type Farbe = keyof typeof farben;

/** Farben, die Buttons und Flächen annehmen können. */
export type Flaechenfarbe = Farbe;

/** Gut lesbare Textfarbe auf jeder Fläche. */
export const textAuf: Record<Flaechenfarbe, Farbe> = {
  washi: 'tusche',
  papier: 'tusche',
  tafel: 'tusche',
  tusche: 'washi',
  rot: 'weiss',
  gruen: 'tusche',
  weiss: 'tusche',
};
