/** Kurzes „Pop“ beim Erscheinen (einmal aufspringen). Rein dekorativ. */
import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Platform, type StyleProp, type ViewStyle } from 'react-native';

export function Pop({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const wert = useRef(new Animated.Value(0.86)).current;
  useEffect(() => {
    Animated.spring(wert, { toValue: 1, friction: 4, tension: 160, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [wert]);
  return <Animated.View style={[style, { transform: [{ scale: wert }] }]}>{children}</Animated.View>;
}
