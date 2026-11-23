/** Die Figur in einer ihrer Posen. Die Breite ergibt sich aus der Höhe. */
import { Image, type ImageStyle, type StyleProp } from 'react-native';

import { figuren, type Pose } from '@/theme';

export function Figur({ pose, hoehe, style }: { pose: Pose; hoehe: number; style?: StyleProp<ImageStyle> }) {
  const bild = figuren[pose];
  return (
    <Image
      source={bild.quelle}
      accessibilityLabel={bild.alt}
      resizeMode="contain"
      style={[{ height: hoehe, width: hoehe * bild.verhaeltnis }, style]}
    />
  );
}
