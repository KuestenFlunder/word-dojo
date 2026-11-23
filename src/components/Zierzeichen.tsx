/**
 * Japanische Zierzeichen – nur Schmuck auf dem Start, nie Inhalt. Für Vorlese-Hilfen
 * unsichtbar. Die Titelschrift enthält diese Zeichen; sie werden mit ihr lokal geladen.
 */
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { ecken, farben, groesse, laufweite, STEMPEL_NEIGUNG, useLayout } from '@/theme';

import { TitelText } from './Schrift';

const VERSTECKT = {
  accessible: false,
  'aria-hidden': true,
  accessibilityElementsHidden: true,
  importantForAccessibility: 'no-hide-descendants',
} as const;

/** Roter Stempel mit einem Zeichen, leicht schief aufgedrückt. */
export function Stempel({ zeichen, kante = 62 }: { zeichen: string; kante?: number }) {
  const { s } = useLayout();
  const px = s(kante);
  return (
    <View
      {...VERSTECKT}
      style={[
        { width: px, height: px, alignItems: 'center', justifyContent: 'center', backgroundColor: farben.rot, transform: [{ rotate: `${STEMPEL_NEIGUNG}deg` }] },
        ecken.stempel,
      ]}>
      <TitelText {...VERSTECKT} fest groesse={Math.round((px * groesse.stempel) / 62)} farbe="washi" weite={0} style={{ userSelect: 'none' }}>
        {zeichen}
      </TitelText>
    </View>
  );
}

/** Zeichen senkrecht untereinander. */
export function Senkrecht({ text, style }: { text: string; style?: StyleProp<ViewStyle> }) {
  const { s } = useLayout();
  return (
    <View {...VERSTECKT} style={[{ alignItems: 'center', gap: laufweite.zierzeichen, pointerEvents: 'none' }, style]}>
      {[...text].map((zeichen, i) => (
        <TitelText key={i} {...VERSTECKT} groesse={groesse.zierzeichen} weite={0} style={{ lineHeight: s(groesse.zierzeichen), userSelect: 'none' }}>
          {zeichen}
        </TitelText>
      ))}
    </View>
  );
}
