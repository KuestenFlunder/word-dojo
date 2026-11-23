/** Große Schlagzeile in der Titelschrift („WORD DOJO“, „GESCHAFFT!“). */
import type { StyleProp, TextStyle } from 'react-native';

import { TitelText } from './Schrift';

export function Schlagzeile({ text, groesse, style }: { text: string; groesse: number; style?: StyleProp<TextStyle> }) {
  return (
    <TitelText groesse={groesse} accessibilityRole="header" style={style}>
      {text}
    </TitelText>
  );
}
