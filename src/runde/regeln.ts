/**
 * Fachregeln der Runden, die NICHT im Lernkern stehen, weil sie vom Start-Bildschirm
 * abhängen (fällige Runde oder freies Üben). Hier ändern, nicht in den Bildschirmen.
 */
import type { Auswahl, Transition } from '@/learning/session';

/** Höchstzahl Wörter je Runde. */
export const RUNDEN_GROESSE = 12;

/** Was von einem Schritt in den Fortschritt eingetragen wird. */
export type Verbuchung = Pick<Transition, 'record' | 'stars'>;

/**
 * REGEL FÜRS FREIE ÜBEN: Im freien Üben (Auswahl `frei`) steigt ein richtig beantwortetes
 * Wort NICHT im Fach auf – der Eintrag für den Karteikasten entfällt, die Sterne bleiben.
 * Ein nicht gewusstes Wort wandert wie immer in Fach 1. In fälligen Runden gilt die normale
 * Regel (alles wird verbucht).
 */
export function verbuchungNachUebungsart(auswahl: Auswahl, ergebnis: Verbuchung): Verbuchung {
  const { record, stars } = ergebnis;
  if (auswahl.art === 'frei' && record?.outcome === 'gewusst') return { record: null, stars };
  return { record, stars };
}
