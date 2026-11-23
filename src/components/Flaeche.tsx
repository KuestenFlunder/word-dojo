/** Panel: ruhige Fläche mit Tuscherand und handgezogenen Ecken. */
import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { ecken, farben, rand, type Ecken, type Flaechenfarbe } from '@/theme';

interface FlaecheProps {
  farbe?: Flaechenfarbe;
  form?: Ecken;
  randBreite?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

export function Flaeche({ farbe = 'papier', form = ecken.flaeche, randBreite = rand.mittel, style, children }: FlaecheProps) {
  return (
    <View style={[{ backgroundColor: farben[farbe], borderWidth: randBreite, borderColor: farben.tusche, overflow: 'hidden' }, form, style]}>
      {children}
    </View>
  );
}

/** Abschnitt innerhalb einer Fläche, vom vorigen durch einen Tuschestrich getrennt. */
export function FlaechenTeil({
  farbe,
  ersterTeil,
  style,
  children,
}: {
  farbe?: Flaechenfarbe;
  ersterTeil?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}) {
  return (
    <View
      style={[
        farbe ? { backgroundColor: farben[farbe] } : null,
        ersterTeil ? null : { borderTopWidth: rand.mittel, borderTopColor: farben.tusche },
        style,
      ]}>
      {children}
    </View>
  );
}
