/**
 * Alle Illustrationen an EINER Stelle (Bildsatz „Dojo“ aus `assets/art/dojo/`), mit
 * Seitenverhältnis (Breite / Höhe) fürs Layout. Wird ein Bild getauscht: hier `quelle` und
 * `verhaeltnis` (Pixelbreite / Pixelhöhe der Datei) anpassen – das Layout richtet sich danach.
 *
 * Die Figur trägt einen cremefarbenen Gi, der nur durch die Tuschekontur vom Papier abgegrenzt
 * ist: Figuren nur auf Washi oder hellem Papier zeigen, nie auf Zinnoberrot oder Tusche.
 */
import type { ImageSourcePropType } from 'react-native';

import type { LeitnerBox } from '@/learning/leitner';

export interface Bild {
  quelle: ImageSourcePropType;
  /** Breite geteilt durch Höhe. */
  verhaeltnis: number;
  /** Bildbeschreibung für Vorlese-Hilfen. */
  alt: string;
}

export type Pose = 'bereit' | 'denken' | 'schreiben' | 'jubel' | 'nochmal' | 'gruss';

/** Figur, freigestellt im Hochformat. */
export const figuren: Record<Pose, Bild> = {
  /** Start, groß rechts. */
  bereit: { quelle: require('../../assets/art/dojo/figuren/bereit.webp'), verhaeltnis: 925 / 1200, alt: 'Junge im Trainingsanzug mit großem Pinsel' },
  /** Karten. */
  denken: { quelle: require('../../assets/art/dojo/figuren/denken.webp'), verhaeltnis: 604 / 1200, alt: 'Der Junge überlegt' },
  /** Schreiben (Eingabe). */
  schreiben: { quelle: require('../../assets/art/dojo/figuren/schreiben.webp'), verhaeltnis: 834 / 1200, alt: 'Der Junge schreibt mit dem Pinsel' },
  /** „Richtig!“ beim Schreiben. */
  jubel: { quelle: require('../../assets/art/dojo/figuren/jubel.webp'), verhaeltnis: 741 / 1200, alt: 'Der Junge jubelt' },
  /** Abschreiben, neben der Sprechblase. */
  nochmal: { quelle: require('../../assets/art/dojo/figuren/nochmal.webp'), verhaeltnis: 791 / 1200, alt: 'Der Junge macht Mut' },
  /** Kleine Verbeugung: Hinweise (z. B. Spielstand nicht lesbar). */
  gruss: { quelle: require('../../assets/art/dojo/figuren/gruss.webp'), verhaeltnis: 564 / 1200, alt: 'Der Junge verbeugt sich' },
};

/** Szenen mit Washi-Hintergrund – sie liegen nahtlos auf dem Grund. */
export const szenen = {
  /** Banner oben links auf dem Start. */
  banner: {
    quelle: require('../../assets/art/dojo/szenen/landschaft.webp'),
    verhaeltnis: 1536 / 768,
    alt: 'Tuschelandschaft mit Bergen, Kiefern, Torii und roter Sonne',
  },
  /** Bild der Abschlussseite. */
  fertig: { quelle: require('../../assets/art/dojo/szenen/fertig.webp'), verhaeltnis: 1536 / 1024, alt: 'Der Junge freut sich: geschafft' },
} satisfies Record<string, Bild>;

/** Welcher Bildausschnitt bleibt, wenn eine Szene beschnitten wird (0 = links/oben, 1 = rechts/unten). */
export const szenenAnker = {
  banner: { x: 0.5, y: 0.25 },
  fertig: { x: 0.5, y: 0.5 },
} as const;

/** Gürtel der fünf Fächer, quadratisch und freigestellt: 1 Weiß, 2 Gelb, 3 Grün, 4 Rot, 5 Schwarz. */
export const guertel: Record<LeitnerBox, ImageSourcePropType> = {
  1: require('../../assets/art/dojo/guertel/guertel_1.webp'),
  2: require('../../assets/art/dojo/guertel/guertel_2.webp'),
  3: require('../../assets/art/dojo/guertel/guertel_3.webp'),
  4: require('../../assets/art/dojo/guertel/guertel_4.webp'),
  5: require('../../assets/art/dojo/guertel/guertel_5.webp'),
};
