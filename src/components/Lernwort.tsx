/** Ein Lernwort: groß, fett, mit Buchstabenabstand; passt seine Größe an die verfügbare Breite an. */
import { passendeSchriftgroesse, useLayout, type Farbe } from '@/theme';

import { LeseText } from './Schrift';

interface LernwortProps {
  text: string;
  /** Größte Schriftgröße im Entwurfsmaß. */
  groesse: number;
  /** Buchstabenabstand im Entwurfsmaß. */
  weite: number;
  /** Verfügbare Breite in Bildschirm-px. */
  breite: number;
  farbe?: Farbe;
}

export function Lernwort({ text, groesse, weite, breite, farbe }: LernwortProps) {
  const { s } = useLayout();
  const px = passendeSchriftgroesse(text, s(groesse), breite, weite);
  return (
    <LeseText fest fett groesse={px} weite={weite} farbe={farbe} style={{ lineHeight: Math.round(px * 1.25) }}>
      {text}
    </LeseText>
  );
}
