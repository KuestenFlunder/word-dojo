/**
 * Abschreiben nach einer falschen Eingabe oder „Weiß ich nicht“: Das richtige Wort bleibt
 * groß sichtbar, Fehlerstellen sind sanft markiert (nie rot). Weiter geht es erst, wenn die
 * Abschrift stimmt – ohne Abzug, ohne Zähler, ohne Zeitdruck.
 */
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { Buchstaben } from '@/components/Buchstaben';
import { Eingabefeld, type EingabefeldRef } from '@/components/Eingabefeld';
import { Flaeche, FlaechenTeil } from '@/components/Flaeche';
import { Knopf } from '@/components/Knopf';
import type { KopfProps } from '@/components/Kopfzeile';
import { RundenRahmen } from '@/components/RundenRahmen';
import { LeseText, TitelText } from '@/components/Schrift';
import { Stern } from '@/components/Symbol';
import type { Vocab } from '@/data';
import type { SpellingDiff } from '@/learning';
import { abschrift } from '@/runde/abschrift';
import { ecken, groesse, laufweite, rand, useLayout } from '@/theme';

interface AbschreibBildschirmProps {
  kopf: KopfProps;
  wort: Vocab;
  /** Vergleich der letzten Eingabe; `null` nach „Weiß ich nicht“. */
  diff: SpellingDiff | null;
  /** Wie oft die Abschrift noch nicht gestimmt hat (nur für den freundlichen Satz). */
  daneben: number;
  onPruefen: (eingabe: string) => void;
}

/** Bis zu so vielen Fehlerstellen sagt die Figur „Fast!“. */
const FAST_BIS = 2;

export function AbschreibBildschirm({ kopf, wort, diff, daneben, onPruefen }: AbschreibBildschirmProps) {
  const { s } = useLayout();
  const [eingabe, setEingabe] = useState('');
  const feld = useRef<EingabefeldRef>(null);

  // Stimmt die Abschrift noch nicht: Feld leeren und ruhig noch einmal.
  useEffect(() => {
    if (daneben === 0) return;
    setEingabe('');
    feld.current?.focus();
  }, [daneben]);

  const absenden = () => {
    if (eingabe.trim() !== '') onPruefen(eingabe);
    feld.current?.focus();
  };

  const { vorlage, eigenes, markiert } = abschrift(wort, diff);
  const fast = diff !== null && diff.errors <= FAST_BIS;
  const sprechblase = fast
    ? 'Fast! Schreib es einmal ab, dann geht es weiter.'
    : 'So wird es geschrieben. Schreib es einmal ab, dann geht es weiter.';
  const innen = s(32);
  return (
    <RundenRahmen
      kopf={kopf}
      figur={{ pose: 'nochmal', seite: 'links', hoehe: 560, rand: 36 }}
      sprechblase={sprechblase}
      spaltenBreite={700}>
      {(breite) => {
        const wortBreite = breite - 2 * innen - 2 * rand.mittel;
        return (
          <View style={{ gap: s(26) }}>
            <Flaeche form={ecken.flaecheGegen}>
              <FlaechenTeil
                ersterTeil
                style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', columnGap: s(16), paddingHorizontal: innen, paddingVertical: s(16) }}>
                <TitelText groesse={groesse.klein}>Deutsch</TitelText>
                <LeseText groesse={groesse.wortKlein} fett style={{ flexShrink: 1 }}>
                  {wort.de}
                </LeseText>
              </FlaechenTeil>
              <FlaechenTeil farbe="tafel" style={{ paddingHorizontal: innen, paddingTop: s(16), paddingBottom: s(22), gap: 2 }}>
                <TitelText groesse={groesse.kartenLabel}>So wird es geschrieben</TitelText>
                <Buchstaben zeichen={vorlage} art="vorlage" groesse={groesse.wortVorlage} weite={laufweite.wortVorlage} breite={wortBreite} />
              </FlaechenTeil>
              {eigenes.length > 0 ? (
                <FlaechenTeil
                  style={{
                    flexDirection: 'row',
                    alignItems: 'baseline',
                    flexWrap: 'wrap',
                    columnGap: s(14),
                    paddingHorizontal: innen,
                    paddingTop: s(12),
                    paddingBottom: s(14),
                  }}>
                  <LeseText groesse={groesse.hinweis}>Deins:</LeseText>
                  <Buchstaben zeichen={eigenes} art="eigenes" groesse={groesse.wortKlein} weite={laufweite.wortKlein} breite={wortBreite - s(80)} />
                  {markiert && diff?.errors === 1 ? <LeseText groesse={groesse.hinweis}>Nur ein Buchstabe!</LeseText> : null}
                </FlaechenTeil>
              ) : null}
            </Flaeche>

            <View style={{ gap: s(10) }}>
              <Eingabefeld ref={feld} label="Schreib es ab" value={eingabe} onChangeText={setEingabe} onSubmit={absenden} breite={breite} />
              {daneben > 0 ? (
                <LeseText groesse={groesse.hinweis} fett style={{ marginTop: 6 }}>
                  Noch nicht ganz. Schau dir das Wort oben genau an und schreib es noch einmal.
                </LeseText>
              ) : null}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: s(24) }}>
              <Knopf titel="Weiter" onPress={absenden} style={{ minWidth: Math.min(s(280), breite) }} />
              <View style={{ flex: 1, flexBasis: s(220), flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Stern groesse={24} />
                <LeseText groesse={groesse.hinweis} style={{ flex: 1 }}>
                  Kein Stern geht verloren. Fürs Abschreiben gibt es einen dazu.
                </LeseText>
              </View>
            </View>
          </View>
        );
      }}
    </RundenRahmen>
  );
}
