/** Der Button der App: Tuscherand, handgezogene Ecken, Titelschrift; gibt beim Drücken leicht nach. */
import type { ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { ecken, farben, gedrueckt, groesse, rand, textAuf, useLayout, type Ecken, type Flaechenfarbe } from '@/theme';

import { TitelText } from './Schrift';

export type KnopfGroesse = 'gross' | 'mittel' | 'klein' | 'modus' | 'mini';

/** Maße je Größe im Entwurfsmaß. */
const MASSE: Record<KnopfGroesse, { hoehe: number; schrift: number; innen: number }> = {
  gross: { hoehe: 88, schrift: groesse.buttonGross, innen: 36 },
  mittel: { hoehe: 80, schrift: groesse.buttonMittel, innen: 24 },
  klein: { hoehe: 66, schrift: groesse.buttonKlein, innen: 22 },
  modus: { hoehe: 70, schrift: groesse.modus, innen: 26 },
  mini: { hoehe: 56, schrift: groesse.buttonMini, innen: 10 },
};

interface KnopfProps {
  /** Beschriftung (wird groß geschrieben). Alternativ eigener Inhalt über `children`. */
  titel?: string;
  onPress: () => void;
  /** Zinnoberrot ist die Hauptaktion; alles andere nimmt Papier. */
  farbe?: Flaechenfarbe;
  groesse?: KnopfGroesse;
  form?: Ecken;
  disabled?: boolean;
  /** Text für Vorlese-Hilfen, wenn er von `titel` abweicht. */
  ansage?: string;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

export function Knopf({ titel, onPress, farbe = 'rot', groesse: art = 'gross', form = ecken.knopfA, disabled, ansage, style, children }: KnopfProps) {
  const { s, tipp } = useLayout();
  const m = MASSE[art];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={ansage ?? titel}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: tipp(m.hoehe),
          paddingHorizontal: s(m.innen),
          paddingVertical: s(6),
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: farben[farbe],
          borderWidth: rand.mittel,
          borderColor: farben.tusche,
          opacity: pressed ? gedrueckt.opacity : 1,
          transform: [{ scale: pressed ? gedrueckt.scale : 1 }],
        },
        form,
        style,
      ]}>
      {children ?? (
        <TitelText groesse={m.schrift} farbe={textAuf[farbe]} style={{ textAlign: 'center', userSelect: 'none' }}>
          {titel}
        </TitelText>
      )}
    </Pressable>
  );
}

/** Unaufdringlicher Zweit-Button: nur dünner Rand und Leseschrift auf dem Grund. */
export function LeiserKnopf({ titel, onPress, style }: { titel: string; onPress: () => void; style?: StyleProp<ViewStyle> }) {
  const { s, tipp } = useLayout();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titel}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: tipp(56),
          paddingHorizontal: s(20),
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: rand.duenn,
          borderColor: farben.tusche,
          opacity: pressed ? gedrueckt.opacity : 1,
        },
        ecken.kleinGegen,
        style,
      ]}>
      <TitelText groesse={groesse.buttonMini} style={{ userSelect: 'none' }}>
        {titel}
      </TitelText>
    </Pressable>
  );
}
