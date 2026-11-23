/** Sprechblase der Figur: weiß, Tuscherand, weiche ungleiche Ecken. */
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { ecken, farben, groesse, rand, useLayout } from '@/theme';

import { LeseText } from './Schrift';

export function Sprechblase({ text, style }: { text: string; style?: StyleProp<ViewStyle> }) {
  const { s } = useLayout();
  return (
    <View
      style={[
        { backgroundColor: farben.weiss, borderWidth: rand.mittel, borderColor: farben.tusche, paddingVertical: s(16), paddingHorizontal: s(22) },
        ecken.sprechblase,
        style,
      ]}>
      <LeseText groesse={groesse.sprechblase} fett>
        {text}
      </LeseText>
    </View>
  );
}
