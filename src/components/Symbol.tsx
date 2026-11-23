/** Kleine Tusche-Zeichen (Stern, Pfeile) als Vektorgrafik – keine Emojis. */
import Svg, { Path } from 'react-native-svg';

import { farben, type Farbe } from '@/theme';

interface SymbolProps {
  groesse: number;
  farbe?: Farbe;
}

const STERN = 'M12 2l3 6.6 7 .8-5.2 4.8 1.5 7L12 17.6 5.7 21.2l1.5-7L2 9.4l7-.8z';

/** Stern; mit `kontur` bekommt er einen Tuscherand. */
export function Stern({ groesse, farbe = 'tusche', kontur }: SymbolProps & { kontur?: boolean }) {
  return (
    <Svg width={groesse} height={groesse} viewBox="0 0 24 24">
      <Path d={STERN} fill={farben[farbe]} stroke={kontur ? farben.tusche : undefined} strokeWidth={kontur ? 2 : 0} strokeLinejoin="round" />
    </Svg>
  );
}

export function PfeilZurueck({ groesse, farbe = 'tusche' }: SymbolProps) {
  return (
    <Svg width={groesse} height={groesse} viewBox="0 0 24 24" fill="none">
      <Path d="M15 4l-8 8 8 8" stroke={farben[farbe]} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Pfeil zwischen zwei Sprachen („Deutsch → Englisch“). */
export function PfeilRechts({ groesse, farbe = 'tusche' }: SymbolProps) {
  return (
    <Svg width={groesse} height={groesse} viewBox="0 0 24 24" fill="none">
      <Path d="M3 12h17M13 5l7 7-7 7" stroke={farben[farbe]} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
