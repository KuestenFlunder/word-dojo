/** Kopfzeile einer Runde: Zurück, Modus der aktuellen Aufgabe, Fortschrittsbalken und Zähler „3 von 12“. */
import { Pressable, View } from 'react-native';

import type { Mode } from '@/learning/progress';
import { ecken, farben, gedrueckt, groesse, rand, TIPPZIEL, useLayout } from '@/theme';

import { ModusTitel } from './ModusTitel';
import { LeseText } from './Schrift';
import { PfeilZurueck } from './Symbol';

export interface KopfProps {
  /** Modus der aktuellen Aufgabe (in gemischten Runden wechselt er). */
  mode: Mode;
  /** Nummer der aktuellen Aufgabe, ab 1. */
  nummer: number;
  gesamt: number;
  /** Erledigter Anteil, 0 bis 1. */
  anteil: number;
  onZurueck: () => void;
}

export function Fortschrittsbalken({ anteil }: { anteil: number }) {
  const prozent = Math.max(0, Math.min(1, anteil)) * 100;
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(prozent) }}
      style={[
        {
          flexGrow: 1,
          flexBasis: 80,
          height: 22,
          flexDirection: 'row',
          overflow: 'hidden',
          backgroundColor: farben.papier,
          borderWidth: rand.mittel,
          borderColor: farben.tusche,
        },
        ecken.klein,
      ]}>
      {prozent > 0 ? <View style={{ width: `${prozent}%`, backgroundColor: farben.gruen }} /> : null}
    </View>
  );
}

export function Kopfzeile({ mode, nummer, gesamt, anteil, onZurueck }: KopfProps) {
  const { s, kompakt, seitenrand } = useLayout();
  const zurueck = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Zurück zum Start"
      onPress={onZurueck}
      style={({ pressed }) => [
        {
          width: TIPPZIEL,
          height: TIPPZIEL,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: farben.papier,
          borderWidth: rand.mittel,
          borderColor: farben.tusche,
          opacity: pressed ? gedrueckt.opacity : 1,
        },
        ecken.flaecheGegen,
      ]}>
      <PfeilZurueck groesse={26} />
    </Pressable>
  );
  const titel = <ModusTitel mode={mode} groesse={groesse.kopfTitel} />;
  const balken = <Fortschrittsbalken anteil={anteil} />;
  const zaehler = (
    <LeseText groesse={groesse.text} fett>
      {nummer} von {gesamt}
    </LeseText>
  );
  if (kompakt) {
    return (
      <View style={{ paddingHorizontal: seitenrand, paddingTop: s(20), gap: s(14) }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(20) }}>
          {zurueck}
          <View style={{ flexShrink: 1 }}>{titel}</View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(20) }}>
          {balken}
          {zaehler}
        </View>
      </View>
    );
  }
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, paddingHorizontal: seitenrand, paddingTop: 24 }}>
      {zurueck}
      {titel}
      {balken}
      {zaehler}
    </View>
  );
}
