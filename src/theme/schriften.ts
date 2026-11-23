/**
 * Schriften: Reggae One für Überschriften und Buttons (immer Großbuchstaben), Andika für alles,
 * was das Kind liest oder schreibt. Jeder Schnitt ist eine eigene Familie – so sehen Web und
 * iOS gleich aus, ohne dass ein Gerät „fett“ künstlich nachzeichnet. Deshalb nie `fontWeight`
 * setzen, sondern {@link schrift}.lesenFett nehmen.
 */
import { Andika_400Regular, Andika_700Bold } from '@expo-google-fonts/andika';
import { ReggaeOne_400Regular } from '@expo-google-fonts/reggae-one';

/** Für `useFonts` im Wurzel-Layout. Die Schlüssel sind die Familiennamen in {@link schrift}. */
export const schriftDateien = { ReggaeOne_400Regular, Andika_400Regular, Andika_700Bold };

export const schrift = {
  titel: 'ReggaeOne_400Regular',
  lesen: 'Andika_400Regular',
  lesenFett: 'Andika_700Bold',
} as const;

/** Schriftgrößen im Entwurfsmaß (iPad quer). Bildschirme skalieren über `useLayout().s`. */
export const groesse = {
  /** „WORD DOJO“ muss mit Stempel und Set-Zeile in die 640 px breite Spalte passen. */
  logo: 60,
  /** Logo bei niedrigem Fenster. */
  logoNiedrig: 56,
  jubel: 60,
  sterneZahl: 42,
  buttonGross: 34,
  buttonMittel: 30,
  buttonKlein: 26,
  buttonMini: 16,
  /** Modus-Buttons auf dem Start; der erste (Hauptaktion) ist größer. */
  modus: 26,
  modusHaupt: 32,
  ueberschrift: 28,
  kopfTitel: 26,
  feldLabel: 24,
  rangZahl: 24,
  abschnitt: 20,
  kartenLabel: 20,
  stempel: 40,
  zierzeichen: 34,
  /** Lernwort auf der Frage-Seite. */
  wortFrage: 60,
  /** Lernwort auf der Antwort-Seite. */
  wortAntwort: 76,
  /** Richtiges Wort beim Abschreiben. */
  wortVorlage: 80,
  /** Eigene Eingabe („Deins:“), deutsches Wort beim Abschreiben, Frage auf der Kartenrückseite. */
  wortKlein: 30,
  eingabe: 60,
  sprechblase: 24,
  textGross: 26,
  text: 22,
  hinweis: 18,
  marke: 17,
  klein: 15,
  rangName: 14,
  chip: 20,
} as const;

/** Buchstabenabstände im Entwurfsmaß. */
export const laufweite = {
  titel: 1,
  wortFrage: 1,
  wortAntwort: 3,
  wortVorlage: 7,
  wortKlein: 4,
  eingabe: 6,
  zierzeichen: 6,
} as const;
