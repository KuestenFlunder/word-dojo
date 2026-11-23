/** Grundfläche jedes Bildschirms: ruhiges Washi-Papier, Ränder für Notch und Home-Leiste. */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { farben } from '@/theme';

export function Bildschirm({ randlos, children }: { randlos?: boolean; children?: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flex: 1,
        // Nichts darf über den Bildschirmrand hinausragen (z. B. die Figur auf dem Start): kein seitliches Scrollen.
        overflow: 'hidden',
        backgroundColor: farben.washi,
        paddingTop: randlos ? 0 : insets.top,
        paddingLeft: randlos ? 0 : insets.left,
        paddingRight: randlos ? 0 : insets.right,
      }}>
      {children}
    </View>
  );
}
