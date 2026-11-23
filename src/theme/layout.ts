/** Fenstergröße → Layout-Art und Skalierung. Alle Bildschirme fragen hier nach. */
import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

import { BREIT_AB, FIGUR_AB_HOEHE, KOMPAKT_BIS, NIEDRIG_BIS, TIPPZIEL } from './masse';

export interface Layout {
  breite: number;
  hoehe: number;
  /** Quer-Layout wie im Entwurf (iPad quer, Desktop). */
  breit: boolean;
  /** Schmales Fenster (Handybreite). */
  kompakt: boolean;
  /** Wenig Höhe (z. B. iPad quer mit Browser-Leiste): der Start rückt enger zusammen. */
  niedrig: boolean;
  /** Genug Platz für die große Figur neben dem Inhalt. */
  figurPasst: boolean;
  /** Seitenrand des Inhalts. */
  seitenrand: number;
  /** Skaliert ein Entwurfsmaß auf das Fenster. */
  s: (wert: number) => number;
  /** Wie `s`, aber nie kleiner als ein Tipp-Ziel. */
  tipp: (wert: number) => number;
}

/** Skalierungsfaktor je Fensterbreite. */
export function skalierung(breite: number): number {
  if (breite >= BREIT_AB) return 1;
  if (breite >= KOMPAKT_BIS) return 0.85;
  if (breite >= 480) return 0.7;
  return 0.6;
}

export function layoutFuer(breite: number, hoehe: number): Layout {
  const faktor = skalierung(breite);
  const s = (wert: number) => Math.round(wert * faktor);
  const breit = breite >= BREIT_AB;
  const kompakt = breite < KOMPAKT_BIS;
  return {
    breite,
    hoehe,
    breit,
    kompakt,
    niedrig: hoehe < NIEDRIG_BIS,
    figurPasst: breit && hoehe >= FIGUR_AB_HOEHE,
    seitenrand: kompakt ? 16 : 32,
    s,
    tipp: (wert) => Math.max(TIPPZIEL, s(wert)),
  };
}

export function useLayout(): Layout {
  const { width, height } = useWindowDimensions();
  return useMemo(() => layoutFuer(width, height), [width, height]);
}
