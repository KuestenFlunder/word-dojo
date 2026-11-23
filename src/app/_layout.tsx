/**
 * Wurzel: lädt die Schriften, stellt den Fortschritt bereit und zeigt die Bildschirme.
 * Bis die Schriften da sind und die App im Gerät bzw. Browser läuft, ist nur der Papier-
 * Hintergrund zu sehen – nichts Halbfertiges, und der statische Web-Export (rendert ohne
 * Fenstergröße) passt zum ersten Bild im Browser.
 */
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { ProgressProvider } from '@/progress/ProgressProvider';
import { farben, schriftDateien } from '@/theme';

export default function RootLayout() {
  const [geladen, fehler] = useFonts(schriftDateien);
  const [gestartet, setGestartet] = useState(false);
  useEffect(() => setGestartet(true), []);

  // Schlägt das Laden der Schriften fehl, läuft die App mit der Geräteschrift weiter.
  const bereit = gestartet && (geladen || fehler !== null);
  return (
    <View style={{ flex: 1, backgroundColor: farben.washi }}>
      <StatusBar style="dark" />
      {bereit ? (
        <ProgressProvider>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: farben.washi } }} />
        </ProgressProvider>
      ) : null}
    </View>
  );
}
