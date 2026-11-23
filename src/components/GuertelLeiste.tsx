/** „Deine Gürtel“: die fünf Gürtel mit der Zahl der Wörter je Fach. Tippen wechselt den Modus. */
import { Pressable, View } from 'react-native';

import { BOXES, type LeitnerBox } from '@/learning/leitner';
import type { Mode } from '@/learning/progress';
import { GUERTEL_NAME, LEISTEN_REIHENFOLGE, MODUS_TEXT } from '@/runde/texte';
import { ecken, farben, gedrueckt, groesse, rand, useLayout } from '@/theme';

import { Guertel } from './Guertel';
import { ModusTitel } from './ModusTitel';
import { LeseText, TitelText } from './Schrift';

/** Kantenlänge der Merker, die zeigen, welcher Modus gerade zu sehen ist. */
const MERKER = 11;
/** Größe der Gürtel-Bilder im Entwurfsmaß: normal und bei niedrigem Fenster. */
const BILD = { normal: 72, niedrig: 58 } as const;

interface GuertelLeisteProps {
  mode: Mode;
  /** Wörter je Fach; `null`, solange der Fortschritt lädt. */
  faecher: Record<LeitnerBox, number> | null;
  /** Wechselt zum nächsten Modus. Ohne Angabe ist die Leiste nicht tippbar. */
  onWechseln?: () => void;
}

export function GuertelLeiste({ mode, faecher, onWechseln }: GuertelLeisteProps) {
  const { s, kompakt, niedrig, breit } = useLayout();
  const bild = breit && niedrig ? BILD.niedrig : BILD.normal;
  return (
    <Pressable
      disabled={!onWechseln}
      onPress={onWechseln}
      accessibilityRole={onWechseln ? 'button' : undefined}
      accessibilityLabel={`Deine Gürtel im Modus ${MODUS_TEXT[mode].gesprochen}. Tippen zeigt den nächsten Modus.`}
      style={({ pressed }) => [
        {
          backgroundColor: farben.tafel,
          borderWidth: rand.mittel,
          borderColor: farben.tusche,
          paddingTop: s(6),
          paddingBottom: s(8),
          paddingHorizontal: s(12),
          gap: 2,
          opacity: pressed ? gedrueckt.opacity : 1,
        },
        ecken.flaeche,
      ]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', columnGap: s(12), paddingHorizontal: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: s(10) }}>
          <TitelText groesse={groesse.abschnitt}>Deine Gürtel</TitelText>
          <View style={{ backgroundColor: farben.tusche, paddingHorizontal: s(8) }}>
            <ModusTitel mode={mode} groesse={kompakt ? 20 : 14} farbe="washi" />
          </View>
          {onWechseln ? (
            <View style={{ flexDirection: 'row', gap: 5 }}>
              {LEISTEN_REIHENFOLGE.map((m) => (
                <View
                  key={m}
                  style={{
                    width: MERKER,
                    height: MERKER,
                    borderWidth: 2,
                    borderColor: farben.tusche,
                    backgroundColor: m === mode ? farben.tusche : farben.tafel,
                  }}
                />
              ))}
            </View>
          ) : null}
        </View>
        <LeseText groesse={kompakt ? 22 : groesse.klein}>Richtig = ein Gürtel höher</LeseText>
      </View>
      <View style={{ flexDirection: 'row' }}>
        {BOXES.map((fach) => (
          <View key={fach} style={{ flex: 1, alignItems: 'center' }}>
            <Guertel fach={fach} groesse={s(kompakt ? 84 : bild)} />
            <TitelText groesse={groesse.rangZahl} weite={0} style={{ lineHeight: Math.round(s(groesse.rangZahl) * 1.1) }}>
              {faecher ? faecher[fach] : ' '}
            </TitelText>
            <LeseText groesse={kompakt ? 20 : groesse.rangName} fett numberOfLines={1}>
              {GUERTEL_NAME[fach]}
            </LeseText>
          </View>
        ))}
      </View>
    </Pressable>
  );
}
