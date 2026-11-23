/**
 * Rahmen aller Runden-Ansichten: Kopfzeile, die Figur daneben (wenn Platz ist) und eine
 * scrollbare Inhaltsspalte. Im Quer-Layout steht die Figur wie im Entwurf am unteren Rand;
 * bei wenig Platz entfällt sie oder steht klein neben der Sprechblase.
 */
import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { figuren, useLayout, type Pose } from '@/theme';

import { Bildschirm } from './Bildschirm';
import { Figur } from './Figur';
import { Kopfzeile, type KopfProps } from './Kopfzeile';
import { Sprechblase } from './Sprechblase';

/** Maße des Quer-Layouts im Entwurfsmaß. */
const QUER = {
  kopfHoehe: 80,
  inhaltOben: 44,
  inhaltUnten: 40,
  /** Abstand zwischen Figur und Inhaltsspalte. */
  luecke: 44,
  lueckeRechts: 8,
  /** Linker Rand der Spalte, wenn die Figur rechts steht. */
  spalteLinks: 72,
  randRechts: 40,
  blase: { links: 60, oben: 32, breite: 330, hoehe: 150 },
  /** Linker Rand der Spalte neben der Sprechblase. */
  spalteNebenBlase: 430,
} as const;

export interface FigurPlatz {
  pose: Pose;
  seite: 'links' | 'rechts';
  /** Höhe im Entwurfsmaß; wird bei niedrigem Fenster kleiner. */
  hoehe: number;
  /** Abstand zum Bildschirmrand. */
  rand: number;
  /** Pose, nach deren Breite sich die Spalte richtet (damit ein Posenwechsel nichts verschiebt). */
  platzWie?: Pose;
}

interface RundenRahmenProps {
  kopf: KopfProps;
  figur: FigurPlatz;
  /** Was die Figur sagt (nur wo vorgesehen). */
  sprechblase?: string;
  /** Größte Spaltenbreite im Entwurfsmaß. */
  spaltenBreite: number;
  /** Inhalt; bekommt die tatsächliche Spaltenbreite in px. */
  children: (breite: number) => ReactNode;
}

export function RundenRahmen({ kopf: kopfProps, figur, sprechblase, spaltenBreite, children }: RundenRahmenProps) {
  const { breite, hoehe, figurPasst, seitenrand, s } = useLayout();
  const insets = useSafeAreaInsets();
  const nutzbar = breite - insets.left - insets.right;
  const kopf = <Kopfzeile {...kopfProps} />;

  if (figurPasst) {
    const platzOben = QUER.kopfHoehe + (sprechblase ? QUER.blase.hoehe : QUER.inhaltOben);
    const figurHoehe = Math.min(figur.hoehe, hoehe - insets.top - platzOben);
    const figurBreite = figurHoehe * figuren[figur.platzWie ?? figur.pose].verhaeltnis;
    const links =
      figur.seite === 'links'
        ? Math.max(figur.rand + figurBreite + QUER.luecke, sprechblase ? QUER.spalteNebenBlase : 0)
        : QUER.spalteLinks;
    const frei =
      figur.seite === 'links' ? nutzbar - links - QUER.randRechts : nutzbar - links - figurBreite - figur.rand - QUER.lueckeRechts;
    const spalte = Math.min(spaltenBreite, frei);
    return (
      <Bildschirm>
        <View style={{ position: 'absolute', pointerEvents: 'none', bottom: 0, [figur.seite === 'links' ? 'left' : 'right']: figur.rand }}>
          <Figur pose={figur.pose} hoehe={figurHoehe} />
        </View>
        {kopf}
        {sprechblase ? (
          <Sprechblase
            text={sprechblase}
            style={{ position: 'absolute', left: QUER.blase.links, top: QUER.kopfHoehe + QUER.blase.oben, width: QUER.blase.breite }}
          />
        ) : null}
        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={{ paddingLeft: links, paddingTop: QUER.inhaltOben, paddingBottom: QUER.inhaltUnten + insets.bottom }}>
          <View style={{ width: spalte }}>{children(spalte)}</View>
        </ScrollView>
      </Bildschirm>
    );
  }

  const spalte = Math.min(spaltenBreite, nutzbar - 2 * seitenrand);
  return (
    <Bildschirm>
      {kopf}
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        contentContainerStyle={{ alignItems: 'center', paddingTop: s(28), paddingBottom: s(40) + insets.bottom }}>
        <View style={{ width: spalte, gap: s(24) }}>
          {sprechblase ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(16) }}>
              <Figur pose={figur.pose} hoehe={s(190)} />
              <Sprechblase text={sprechblase} style={{ flex: 1 }} />
            </View>
          ) : null}
          {children(spalte)}
        </View>
      </ScrollView>
    </Bildschirm>
  );
}
