/**
 * Schreiben: deutsches Wort lesen, englisches tippen. Nach einer richtigen Eingabe bleibt die
 * Ansicht stehen (die Figur jubelt, die Fläche wird moosgrün und zeigt „Richtig!“ und das Wort),
 * bis das Kind WEITER wählt. Das Eingabefeld bleibt dabei stehen, damit die Tastatur nicht
 * auf- und zuklappt.
 */
import { useRef, useState } from 'react';
import { View } from 'react-native';

import { Eingabefeld, type EingabefeldRef } from '@/components/Eingabefeld';
import { Flaeche } from '@/components/Flaeche';
import { Knopf, LeiserKnopf } from '@/components/Knopf';
import type { KopfProps } from '@/components/Kopfzeile';
import { Lernwort } from '@/components/Lernwort';
import { Pop } from '@/components/Pop';
import { RundenRahmen } from '@/components/RundenRahmen';
import { LeseText, TitelText } from '@/components/Schrift';
import { Stern } from '@/components/Symbol';
import type { Vocab } from '@/data';
import { groesse, laufweite, rand, useLayout } from '@/theme';

interface SchreibBildschirmProps {
  kopf: KopfProps;
  wort: Vocab;
  /** True nach einer richtigen Eingabe, bis es weitergeht. */
  richtig: boolean;
  onPruefen: (eingabe: string) => void;
  onWeissNicht: () => void;
  onWeiter: () => void;
}

export function SchreibBildschirm({ kopf, wort, richtig, onPruefen, onWeissNicht, onWeiter }: SchreibBildschirmProps) {
  const { s } = useLayout();
  const [eingabe, setEingabe] = useState('');
  const feld = useRef<EingabefeldRef>(null);

  const absenden = () => {
    if (richtig) {
      setEingabe('');
      onWeiter();
    } else if (eingabe.trim() !== '') {
      onPruefen(eingabe);
    }
    feld.current?.focus();
  };

  const innen = s(36);
  return (
    <RundenRahmen
      kopf={kopf}
      figur={{ pose: richtig ? 'jubel' : 'schreiben', platzWie: 'schreiben', seite: 'rechts', hoehe: 600, rand: 24 }}
      spaltenBreite={700}>
      {(breite) => {
        const wortBreite = breite - 2 * innen - 2 * rand.mittel;
        const flaeche = (
          <Flaeche farbe={richtig ? 'gruen' : 'papier'} style={{ paddingHorizontal: innen, paddingTop: s(22), paddingBottom: s(26), gap: 4 }}>
            {richtig ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', columnGap: s(16) }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: s(10) }}>
                  <Stern groesse={s(28)} farbe="weiss" kontur />
                  <TitelText groesse={groesse.kartenLabel}>Richtig!</TitelText>
                </View>
                <LeseText groesse={groesse.hinweis} fett style={{ flexShrink: 1 }}>
                  {wort.de}
                </LeseText>
              </View>
            ) : (
              <TitelText groesse={groesse.kartenLabel}>Deutsch</TitelText>
            )}
            <Lernwort
              text={richtig ? wort.en : wort.de}
              groesse={groesse.wortFrage}
              weite={richtig ? laufweite.wortAntwort : laufweite.wortFrage}
              breite={wortBreite}
            />
          </Flaeche>
        );
        return (
          <View style={{ gap: s(28) }}>
            {richtig ? <Pop>{flaeche}</Pop> : flaeche}
            <View style={{ gap: s(10) }}>
              <Eingabefeld
                ref={feld}
                label="Schreib es auf Englisch"
                value={eingabe}
                onChangeText={(text) => {
                  if (!richtig) setEingabe(text);
                }}
                onSubmit={absenden}
                breite={breite}
              />
              <LeseText groesse={groesse.hinweis} style={{ marginTop: 4 }}>
                {richtig ? 'Ein Stern für dich!' : 'Lass dir Zeit. Hier läuft keine Uhr.'}
              </LeseText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: s(24) }}>
              <Knopf titel={richtig ? 'Weiter' : 'Prüfen'} onPress={absenden} style={{ minWidth: Math.min(s(300), breite) }} />
              {richtig ? null : (
                <LeiserKnopf
                  titel="Weiß ich nicht"
                  onPress={() => {
                    setEingabe('');
                    onWeissNicht();
                  }}
                />
              )}
            </View>
          </View>
        );
      }}
    </RundenRahmen>
  );
}
