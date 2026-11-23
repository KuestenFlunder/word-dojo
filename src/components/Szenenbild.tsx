/** Füllt seinen Rahmen ganz mit einer Szene (wie `object-fit: cover`) und wählt den Ausschnitt per Anker. */
import { useState } from 'react';
import { Image, View, type StyleProp, type ViewStyle } from 'react-native';

import { deckendesRechteck, farben, type Bild } from '@/theme';

interface SzenenbildProps {
  bild: Bild;
  /** Welcher Teil sichtbar bleibt: 0 = links/oben, 1 = rechts/unten. */
  anker?: { x: number; y: number };
  style?: StyleProp<ViewStyle>;
}

export function Szenenbild({ bild, anker = { x: 0.5, y: 0.5 }, style }: SzenenbildProps) {
  const [rahmen, setRahmen] = useState<{ width: number; height: number } | null>(null);
  return (
    <View
      style={[{ overflow: 'hidden', backgroundColor: farben.washi }, style]}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setRahmen((alt) => (alt && alt.width === width && alt.height === height ? alt : { width, height }));
      }}>
      {rahmen ? (
        <Image
          source={bild.quelle}
          accessibilityLabel={bild.alt}
          style={{ position: 'absolute', ...deckendesRechteck(rahmen.width, rahmen.height, bild.verhaeltnis, anker.x, anker.y) }}
        />
      ) : null}
    </View>
  );
}
