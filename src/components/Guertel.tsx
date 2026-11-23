/** Gürtel-Bild eines Fachs (quadratisch). */
import { Image } from 'react-native';

import type { LeitnerBox } from '@/learning/leitner';
import { guertel } from '@/theme';

export function Guertel({ fach, groesse }: { fach: LeitnerBox; groesse: number }) {
  return <Image source={guertel[fach]} accessible={false} style={{ width: groesse, height: groesse }} resizeMode="contain" />;
}
