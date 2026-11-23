/** Ränder, handgezogene Ecken, Abstände und Layout-Schwellen (Stil „Dojo“: keine Schatten, nichts schräg). */
import type { ViewStyle } from 'react-native';

/** Tuscheränder in px. */
export const rand = { duenn: 3, mittel: 4 } as const;

export type Ecken = Pick<ViewStyle, 'borderTopLeftRadius' | 'borderTopRightRadius' | 'borderBottomRightRadius' | 'borderBottomLeftRadius'>;

/** Radien im Uhrzeigersinn ab oben links. */
function e(obenLinks: number, obenRechts: number, untenRechts: number, untenLinks: number): Ecken {
  return {
    borderTopLeftRadius: obenLinks,
    borderTopRightRadius: obenRechts,
    borderBottomRightRadius: untenRechts,
    borderBottomLeftRadius: untenLinks,
  };
}

/**
 * Ungleichmäßige Eckradien, wie mit dem Pinsel von Hand gezogen. Die „Gegen“-Formen sind
 * gespiegelt, damit benachbarte Flächen nicht gleich aussehen.
 */
export const ecken = {
  flaeche: e(6, 16, 8, 14),
  flaecheGegen: e(14, 6, 16, 8),
  knopfA: e(26, 10, 30, 8),
  knopfB: e(8, 30, 10, 26),
  klein: e(3, 14, 4, 12),
  kleinGegen: e(12, 3, 14, 4),
  feld: e(4, 12, 6, 10),
  stempel: e(6, 10, 5, 12),
  sprechblase: e(26, 30, 24, 8),
  buchstabe: e(3, 6, 4, 7),
} as const;

/** Wie stark ein Button beim Drücken nachgibt. */
export const gedrueckt = { opacity: 0.8, scale: 0.985 } as const;

/** Der rote Stempel auf dem Start sitzt leicht schief (einzige Schrägstellung der App). */
export const STEMPEL_NEIGUNG = -6;

/** Mindesthöhe aller Tipp-Ziele. */
export const TIPPZIEL = 56;

/** Entwurfsbreite (iPad quer); Bezug für die Skalierung. */
export const ENTWURF_BREITE = 1194;
/** Ab dieser Fensterbreite gilt das Quer-Layout mit Figur daneben. */
export const BREIT_AB = 1000;
/** Darunter gilt das schmale Layout (Handy). */
export const KOMPAKT_BIS = 700;
/** Mindesthöhe, damit die große Figur gezeigt wird. */
export const FIGUR_AB_HOEHE = 620;
/** Unter dieser Höhe rückt der Start enger zusammen (iPad quer mit Browser-Leiste). */
export const NIEDRIG_BIS = 800;
