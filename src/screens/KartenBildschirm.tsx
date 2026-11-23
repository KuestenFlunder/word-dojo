/**
 * Karten-Modi: Die Karte selbst ist die Schaltfläche. Vor dem Umdrehen ist NUR die Frage-Seite
 * zu sehen – nie beide Wörter. Ein Tipp (oder Enter/Leertaste) dreht die Karte mit einer kurzen
 * Animation um; erst danach erscheinen „Noch nicht“ und „Gewusst!“.
 */
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, View } from 'react-native';

import { Flaeche, FlaechenTeil } from '@/components/Flaeche';
import { Guertel } from '@/components/Guertel';
import { Knopf } from '@/components/Knopf';
import type { KopfProps } from '@/components/Kopfzeile';
import { Lernwort } from '@/components/Lernwort';
import { RundenRahmen } from '@/components/RundenRahmen';
import { LeseText, TitelText } from '@/components/Schrift';
import type { Vocab } from '@/data';
import type { LeitnerBox } from '@/learning';
import { GUERTEL_NAME, MODUS_TEXT, SPRACHE_NAME } from '@/runde/texte';
import { ecken, groesse, laufweite, rand, useLayout } from '@/theme';

/** Dauer der halben Drehung in ms (hin zur Kante, dann von der Kante zurück). */
const HALBE_DREHUNG = 160;
/** Mindesthöhe der Karte im Entwurfsmaß – Vorder- und Rückseite sind gleich groß. */
const KARTEN_HOEHE = 300;

interface KartenBildschirmProps {
  kopf: KopfProps;
  mode: 'de-en' | 'en-de';
  wort: Vocab;
  /** Fach des Wortes in diesem Modus (für den Gürtel). */
  fach: LeitnerBox;
  aufgedeckt: boolean;
  onAufdecken: () => void;
  onBewerten: (gewusst: boolean) => void;
}

export function KartenBildschirm({ kopf, mode, wort, fach, aufgedeckt, onAufdecken, onBewerten }: KartenBildschirmProps) {
  const { s } = useLayout();
  const { frage, antwort } = MODUS_TEXT[mode];
  /** 0 = Vorderseite, 0,5 = Kante, 1 = Rückseite. */
  const dreh = useRef(new Animated.Value(0)).current;
  const [umgedreht, setUmgedreht] = useState(false);
  // Die Antwort ist nur zu sehen, wenn aufgedeckt UND die Karte schon über die Kante gedreht ist.
  // So zeigt auch das erste Bild eines neuen Wortes sicher nur die Frage.
  const zeigtAntwort = aufgedeckt && umgedreht;

  useEffect(() => {
    dreh.stopAnimation();
    if (!aufgedeckt) {
      dreh.setValue(0);
      setUmgedreht(false);
      return;
    }
    const nativ = Platform.OS !== 'web';
    const wenden = () => {
      setUmgedreht(true);
      Animated.timing(dreh, { toValue: 1, duration: HALBE_DREHUNG, easing: Easing.out(Easing.quad), useNativeDriver: nativ }).start();
    };
    let gewendet = false;
    const einmalWenden = () => {
      if (gewendet) return;
      gewendet = true;
      wenden();
    };
    Animated.timing(dreh, { toValue: 0.5, duration: HALBE_DREHUNG, easing: Easing.in(Easing.quad), useNativeDriver: nativ }).start(({ finished }) => {
      if (finished) einmalWenden();
    });
    // Sicherheitsnetz: Bleibt die Animation aus, erscheint die Antwort trotzdem.
    const netz = setTimeout(einmalWenden, HALBE_DREHUNG * 3);
    return () => {
      gewendet = true;
      clearTimeout(netz);
    };
  }, [aufgedeckt, wort.id, dreh]);

  // Web: Enter oder Leertaste dreht um.
  useEffect(() => {
    if (Platform.OS !== 'web' || aufgedeckt) return;
    const taste = (e: KeyboardEvent) => {
      if (e.repeat || (e.key !== 'Enter' && e.key !== ' ')) return;
      e.preventDefault();
      onAufdecken();
    };
    window.addEventListener('keydown', taste);
    return () => window.removeEventListener('keydown', taste);
  }, [aufgedeckt, onAufdecken]);

  const winkel = dreh.interpolate({ inputRange: [0, 0.5, 0.5001, 1], outputRange: ['0deg', '90deg', '-90deg', '0deg'] });
  const innen = s(40);
  return (
    <RundenRahmen kopf={kopf} figur={{ pose: 'denken', seite: 'links', hoehe: 620, rand: 56 }} spaltenBreite={760}>
      {(breite) => {
        const wortBreite = breite - 2 * innen - 2 * rand.mittel;
        const guertelZeile = (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Guertel fach={fach} groesse={s(40)} />
            <LeseText groesse={groesse.hinweis} fett>
              Gürtel: {GUERTEL_NAME[fach]}
            </LeseText>
          </View>
        );
        const vorderseite = (
          <FlaechenTeil ersterTeil style={{ flex: 1, paddingHorizontal: innen, paddingTop: s(22), paddingBottom: s(18), gap: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: s(12) }}>
              <TitelText groesse={groesse.kartenLabel}>{SPRACHE_NAME[frage]}</TitelText>
              {guertelZeile}
            </View>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Lernwort text={wort[frage]} groesse={groesse.wortFrage} weite={laufweite.wortFrage} breite={wortBreite} />
            </View>
            <LeseText groesse={groesse.hinweis} style={{ textAlign: 'center', userSelect: 'none' }}>
              Tippen zum Umdrehen
            </LeseText>
          </FlaechenTeil>
        );
        const rueckseite = (
          <>
            <FlaechenTeil
              ersterTeil
              farbe="tafel"
              style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', columnGap: s(14), paddingHorizontal: innen, paddingVertical: s(12) }}>
              <TitelText groesse={groesse.klein}>{SPRACHE_NAME[frage]}</TitelText>
              <LeseText groesse={groesse.text} fett style={{ flexShrink: 1 }}>
                {wort[frage]}
              </LeseText>
            </FlaechenTeil>
            <FlaechenTeil style={{ flex: 1, paddingHorizontal: innen, paddingTop: s(18), paddingBottom: s(24), gap: 4 }}>
              <TitelText groesse={groesse.kartenLabel}>{SPRACHE_NAME[antwort]}</TitelText>
              <View style={{ flex: 1, justifyContent: 'center' }}>
                <Lernwort text={wort[antwort]} groesse={groesse.wortAntwort} weite={laufweite.wortAntwort} breite={wortBreite} />
              </View>
            </FlaechenTeil>
          </>
        );
        return (
          <View style={{ gap: s(28) }}>
            <Animated.View style={{ transform: [{ perspective: 1200 }, { rotateY: winkel }] }}>
              <Pressable
                disabled={aufgedeckt}
                onPress={onAufdecken}
                accessibilityRole="button"
                accessibilityLabel={zeigtAntwort ? `${wort[frage]}: ${wort[antwort]}` : `${wort[frage]}. Tippen zum Umdrehen`}>
                <Flaeche form={ecken.flaeche} style={{ minHeight: s(KARTEN_HOEHE) }}>
                  {zeigtAntwort ? rueckseite : vorderseite}
                </Flaeche>
              </Pressable>
            </Animated.View>

            {zeigtAntwort ? (
              <View style={{ gap: s(14) }}>
                <TitelText groesse={groesse.ueberschrift} style={{ textAlign: 'center' }}>
                  Hast du es gewusst?
                </TitelText>
                <View style={{ flexDirection: 'row', gap: s(24) }}>
                  <Knopf
                    titel="Noch nicht"
                    farbe="papier"
                    groesse="mittel"
                    form={ecken.knopfB}
                    onPress={() => onBewerten(false)}
                    style={{ flex: 1, paddingHorizontal: s(8) }}
                  />
                  <Knopf titel="Gewusst!" groesse="mittel" onPress={() => onBewerten(true)} style={{ flex: 1, paddingHorizontal: s(8) }} />
                </View>
                <LeseText groesse={groesse.hinweis} style={{ textAlign: 'center', marginTop: 4 }}>
                  „Noch nicht“ kostet nichts. Das Wort kommt gleich noch einmal.
                </LeseText>
              </View>
            ) : null}
          </View>
        );
      }}
    </RundenRahmen>
  );
}
