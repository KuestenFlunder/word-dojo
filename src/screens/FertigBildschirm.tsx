/** Abschluss einer Runde: Sterne, neue Gürtel, Wörter zum Noch-einmal-Üben, nächste Schritte. */
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bildschirm } from '@/components/Bildschirm';
import { Flaeche } from '@/components/Flaeche';
import { Guertel } from '@/components/Guertel';
import { Knopf } from '@/components/Knopf';
import { ModusTitel } from '@/components/ModusTitel';
import { Schlagzeile } from '@/components/Schlagzeile';
import { LeseText, TitelText } from '@/components/Schrift';
import { Stern } from '@/components/Symbol';
import { Szenenbild } from '@/components/Szenenbild';
import type { SessionSummary } from '@/learning';
import type { Aufstieg } from '@/runde/runde';
import { anzahl, GUERTEL_NAME, type RundenModus } from '@/runde/texte';
import { ecken, farben, groesse, rand, szenen, szenenAnker, useLayout } from '@/theme';

interface FertigBildschirmProps {
  mode: RundenModus;
  /** True nach freiem Üben. */
  frei: boolean;
  auswertung: SessionSummary;
  /** Sterne insgesamt nach dieser Runde. */
  sterneGesamt: number;
  aufstiege: readonly Aufstieg[];
  onNochEineRunde: () => void;
  onZumStart: () => void;
}

/** Anteil der Bildseite an der Breite im Quer-Layout. */
const BILD_ANTEIL = 0.5;

export function FertigBildschirm({ mode, frei, auswertung, sterneGesamt, aufstiege, onNochEineRunde, onZumStart }: FertigBildschirmProps) {
  const { s, breit, breite, hoehe, kompakt } = useLayout();
  const insets = useSafeAreaInsets();
  const innen = kompakt ? 16 : 36;

  const bild = (
    <View
      style={
        breit
          ? { width: Math.round(breite * BILD_ANTEIL), borderRightWidth: rand.mittel, borderRightColor: farben.tusche }
          : { height: Math.min(hoehe * 0.3, breite / szenen.fertig.verhaeltnis), borderBottomWidth: rand.mittel, borderBottomColor: farben.tusche }
      }>
      <Szenenbild bild={szenen.fertig} anker={szenenAnker.fertig} style={{ flex: 1 }} />
    </View>
  );

  const inhalt = (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingLeft: innen,
        paddingRight: innen + insets.right,
        paddingTop: s(28) + (breit ? insets.top : 0),
        paddingBottom: s(28) + insets.bottom,
        gap: s(20),
      }}>
      <View style={{ gap: 2 }}>
        <Schlagzeile text="Geschafft!" groesse={groesse.jubel} />
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: s(8) }}>
          <TitelText groesse={groesse.abschnitt}>{frei ? 'Frei geübt:' : 'Runde'}</TitelText>
          <ModusTitel mode={mode} groesse={groesse.abschnitt} />
        </View>
        <LeseText groesse={groesse.textGross} fett>
          {anzahl(auswertung.total, 'Wort', 'Wörter')} geübt. Stark!
        </LeseText>
      </View>

      <Flaeche farbe="tafel" style={{ flexDirection: 'row', alignItems: 'center', gap: s(16), paddingVertical: s(10), paddingHorizontal: s(20) }}>
        <Stern groesse={s(56)} farbe="weiss" kontur />
        <View style={{ flexShrink: 1 }}>
          <TitelText groesse={groesse.sterneZahl}>
            {auswertung.stars > 0 ? `+${anzahl(auswertung.stars, 'Stern', 'Sterne')}` : 'Gut geübt!'}
          </TitelText>
          <LeseText groesse={groesse.hinweis} fett>
            Jetzt hast du {sterneGesamt}
          </LeseText>
        </View>
      </Flaeche>

      {aufstiege.length > 0 ? (
        <View style={{ gap: s(8) }}>
          <TitelText groesse={groesse.abschnitt}>Neue Gürtel</TitelText>
          {aufstiege.map(({ fach, anzahl: n }) => (
            <View key={fach} style={{ flexDirection: 'row', alignItems: 'center', gap: s(14) }}>
              <Guertel fach={fach} groesse={s(56)} />
              <LeseText groesse={groesse.text} style={{ flex: 1 }}>
                <LeseText groesse={groesse.text} fett>
                  {anzahl(n, 'Wort', 'Wörter')}
                </LeseText>{' '}
                {n === 1 ? 'trägt' : 'tragen'} jetzt {GUERTEL_NAME[fach]}
              </LeseText>
            </View>
          ))}
        </View>
      ) : null}

      {auswertung.unknown.length > 0 ? (
        <View style={{ gap: s(6) }}>
          <LeseText groesse={groesse.text} fett>
            Die üben wir noch einmal:
          </LeseText>
          {auswertung.unknown.map((wort) => (
            <LeseText key={wort.id} groesse={groesse.text}>
              <LeseText groesse={groesse.text} fett weite={1}>
                {wort.en}
              </LeseText>
              {' – '}
              {wort.de}
            </LeseText>
          ))}
        </View>
      ) : null}

      <View style={{ marginTop: 'auto', paddingTop: s(8), gap: s(14) }}>
        <Knopf titel="Noch eine Runde" groesse="mittel" onPress={onNochEineRunde} />
        <Knopf titel="Zum Start" farbe="papier" groesse="klein" form={ecken.knopfB} onPress={onZumStart} />
      </View>
    </ScrollView>
  );

  return (
    <Bildschirm randlos>
      <View style={{ flex: 1, flexDirection: breit ? 'row' : 'column' }}>
        {bild}
        {inhalt}
      </View>
    </Bildschirm>
  );
}
