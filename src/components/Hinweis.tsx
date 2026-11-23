/** Ruhiger Hinweis mit der sich verbeugenden Figur, z. B. wenn der Spielstand nicht gelesen werden konnte. */
import { View } from 'react-native';

import { ecken, groesse, useLayout } from '@/theme';

import { Figur } from './Figur';
import { Flaeche } from './Flaeche';
import { Knopf } from './Knopf';
import { LeseText } from './Schrift';

export function Hinweis({ text, aktion, onAktion }: { text: string; aktion?: string; onAktion?: () => void }) {
  const { s } = useLayout();
  return (
    <Flaeche farbe="papier" form={ecken.flaecheGegen} style={{ flexDirection: 'row', alignItems: 'center', padding: s(12), gap: s(12) }}>
      <Figur pose="gruss" hoehe={s(96)} />
      <View style={{ flex: 1, gap: s(8) }}>
        <LeseText groesse={groesse.hinweis} fett>
          {text}
        </LeseText>
        {aktion && onAktion ? (
          <View style={{ alignItems: 'flex-start' }}>
            <Knopf titel={aktion} onPress={onAktion} groesse="mini" farbe="washi" form={ecken.klein} />
          </View>
        ) : null}
      </View>
    </Flaeche>
  );
}
