/** Kleine Etiketten mit handgezogenen Ecken, z. B. „128 Sterne“ – keine Pillen. */
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { ecken, farben, groesse, rand, useLayout } from '@/theme';

import { LeseText } from './Schrift';

/** `art="tusche"`: gefüllt (Sterne); `art="rand"`: nur umrandet (Tage in Folge). */
export function Chip({ symbol, text, art = 'rand' }: { symbol?: ReactNode; text: string; art?: 'tusche' | 'rand' }) {
  const { s } = useLayout();
  const gefuellt = art === 'tusche';
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          paddingVertical: s(gefuellt ? 6 : 4),
          paddingHorizontal: s(14),
          backgroundColor: gefuellt ? farben.tusche : farben.washi,
          borderWidth: gefuellt ? 0 : rand.duenn,
          borderColor: farben.tusche,
        },
        gefuellt ? ecken.klein : ecken.kleinGegen,
      ]}>
      {symbol}
      <LeseText groesse={groesse.chip} fett farbe={gefuellt ? 'washi' : 'tusche'}>
        {text}
      </LeseText>
    </View>
  );
}

/** Tusche-Etikett in einem Button, z. B. „14 dran“. */
export function Marke({ text }: { text: string }) {
  const { s } = useLayout();
  return (
    <View style={{ backgroundColor: farben.tusche, paddingVertical: s(3), paddingHorizontal: s(12) }}>
      <LeseText groesse={groesse.marke} fett farbe="washi" numberOfLines={1} style={{ userSelect: 'none' }}>
        {text}
      </LeseText>
    </View>
  );
}
