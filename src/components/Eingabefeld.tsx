/**
 * Eingabefeld zum Schreiben: weiß mit Tuscherand. Ohne Autokorrektur,
 * Großschreib-Hilfe, Rechtschreibprüfung oder Vorschläge – das Kind schreibt selbst.
 */
import type { ComponentRef, Ref } from 'react';
import { TextInput, View } from 'react-native';

import { ecken, einzeiligeSchriftgroesse, farben, groesse, laufweite, rand, schrift, useLayout } from '@/theme';

import { TitelText } from './Schrift';

/** Das Feld selbst, z. B. für `focus()`. */
export type EingabefeldRef = ComponentRef<typeof TextInput>;

interface EingabefeldProps {
  ref?: Ref<EingabefeldRef>;
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  /** Enter bzw. „Fertig“ auf der Tastatur. */
  onSubmit: () => void;
  /** Breite des Feldes in Bildschirm-px. */
  breite: number;
}

export function Eingabefeld({ ref, label, value, onChangeText, onSubmit, breite }: EingabefeldProps) {
  const { s, tipp } = useLayout();
  const innen = s(28);
  // Lange Eingaben werden kleiner, damit das ganze Wort sichtbar bleibt.
  const px = einzeiligeSchriftgroesse([...value].length + 1, s(groesse.eingabe), breite - 2 * innen - 2 * rand.mittel, laufweite.eingabe);
  return (
    <View style={{ gap: s(10) }}>
      <TitelText groesse={groesse.feldLabel} nativeID="eingabe-label">
        {label}
      </TitelText>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        submitBehavior="submit"
        // react-native-web kennt `submitBehavior` nicht und nimmt dem Feld sonst nach Enter den Fokus.
        blurOnSubmit={false}
        autoFocus
        autoCorrect={false}
        autoCapitalize="none"
        spellCheck={false}
        autoComplete="off"
        keyboardType="default"
        returnKeyType="done"
        enterKeyHint="done"
        accessibilityLabel={label}
        accessibilityLabelledBy="eingabe-label"
        selectionColor={farben.tusche}
        style={[
          {
            width: breite,
            height: tipp(104),
            paddingHorizontal: innen,
            paddingVertical: 0,
            backgroundColor: farben.weiss,
            color: farben.tusche,
            borderWidth: rand.mittel,
            borderColor: farben.tusche,
            outlineWidth: 0,
            fontFamily: schrift.lesenFett,
            fontSize: px,
            letterSpacing: laufweite.eingabe,
          },
          ecken.feld,
        ]}
      />
    </View>
  );
}
