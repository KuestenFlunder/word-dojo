/** Die zwei Schriften der App als Text-Bausteine. Größen sind Entwurfsmaße und werden skaliert. */
import { Text, type TextProps } from 'react-native';

import { farben, laufweite, schrift, useLayout, type Farbe } from '@/theme';

interface SchriftProps extends TextProps {
  /** Schriftgröße im Entwurfsmaß (siehe `groesse` im Theme). */
  groesse: number;
  farbe?: Farbe;
  /** Buchstabenabstand im Entwurfsmaß. */
  weite?: number;
  /** `true`: `groesse` ist schon in Bildschirm-px und wird nicht skaliert. */
  fest?: boolean;
}

/** Titelschrift, immer Großbuchstaben: Überschriften, Buttons, Etiketten. */
export function TitelText({ groesse, farbe = 'tusche', weite = laufweite.titel, fest, style, ...rest }: SchriftProps) {
  const { s } = useLayout();
  const px = fest ? groesse : s(groesse);
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: schrift.titel,
          fontSize: px,
          lineHeight: Math.round(px * 1.22),
          letterSpacing: weite,
          color: farben[farbe],
          textTransform: 'uppercase',
        },
        style,
      ]}
    />
  );
}

interface LeseProps extends SchriftProps {
  fett?: boolean;
}

/** Andika: alles, was das Kind liest. */
export function LeseText({ groesse, farbe = 'tusche', weite = 0, fest, fett, style, ...rest }: LeseProps) {
  const { s } = useLayout();
  const px = fest ? groesse : s(groesse);
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: fett ? schrift.lesenFett : schrift.lesen,
          fontSize: px,
          lineHeight: Math.round(px * 1.35),
          letterSpacing: weite,
          color: farben[farbe],
        },
        style,
      ]}
    />
  );
}
