/**
 * Start (Stil „Dojo“): links Banner, Titel, die vier Einstiege mit fälligen Aufgaben und die
 * Gürtel-Leiste; rechts groß die Figur. Auf iPad quer passt alles ohne Scrollen: Das Banner
 * nimmt nur die Höhe, die übrig bleibt.
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bildschirm } from '@/components/Bildschirm';
import { Chip, Marke } from '@/components/Chip';
import { Figur } from '@/components/Figur';
import { GuertelLeiste } from '@/components/GuertelLeiste';
import { Hinweis } from '@/components/Hinweis';
import { Knopf } from '@/components/Knopf';
import { ModusTitel } from '@/components/ModusTitel';
import { Schlagzeile } from '@/components/Schlagzeile';
import { LeseText } from '@/components/Schrift';
import { Stern } from '@/components/Symbol';
import { Szenenbild } from '@/components/Szenenbild';
import { Senkrecht, Stempel } from '@/components/Zierzeichen';
import { vocabSets } from '@/data';
import { allModeStats, currentStreak, mixedDueWords, type Mode } from '@/learning';
import { useProgress } from '@/progress/ProgressProvider';
import { anzahl, LEISTEN_REIHENFOLGE, START_REIHENFOLGE, titelText, type RundenModus } from '@/runde/texte';
import type { Uebungsart } from '@/runde/useRunde';
import { ecken, figuren, groesse, szenen, szenenAnker, textAuf, useLayout, type Flaechenfarbe } from '@/theme';

const APP_NAME = 'Word Dojo';
/** Zierzeichen: Stempel „Englisch“ und senkrecht „Englisch-Vokabel-Dojo“. Nur Schmuck. */
const ZIER = { stempel: '英', senkrecht: '英単語道場' } as const;

/** Der erste Einstieg ist die Hauptaktion (Zinnoberrot), die anderen liegen auf Papier. */
const HAUPT: RundenModus = START_REIHENFOLGE[0];

/** Maße des Quer-Layouts im Entwurfsmaß. */
const QUER = {
  links: 32,
  oben: 22,
  unten: 16,
  spalte: 640,
  abstand: 12,
  abstandNiedrig: 9,
  knopfHoehe: 70,
  knopfHoeheNiedrig: 62,
  banner: { min: 80, max: 214 },
  /** Abstand der senkrechten Zierzeichen und der Figur zur Spalte. */
  zierLuecke: 24,
  figurUeberstand: 10,
  chips: { rechts: 30, unten: 28 },
} as const;

function starten(modus: RundenModus, art: Uebungsart) {
  router.push({ pathname: '/runde', params: { modus, auswahl: art } });
}

export function StartBildschirm() {
  const { status, progress, speicherfehler, neuLaden } = useProgress();
  const { s, tipp, breit, niedrig, breite, hoehe, seitenrand } = useLayout();
  const insets = useSafeAreaInsets();
  const [leistenModus, setLeistenModus] = useState<Mode>(LEISTEN_REIHENFOLGE[0]);

  const set = vocabSets[0];
  const jetzt = Date.now();
  const geladen = status !== 'laedt';
  const stats = geladen ? allModeStats(progress, set.words, jetzt) : null;
  const dran = (modus: RundenModus): number | null =>
    !stats ? null : modus === 'gemischt' ? mixedDueWords(progress, set.words, jetzt) : stats[modus].due;
  const eng = breit && niedrig;
  const abstand = breit ? (eng ? QUER.abstandNiedrig : QUER.abstand) : s(12);
  const spalte = breit ? QUER.spalte : Math.min(QUER.spalte, breite - insets.left - insets.right - 2 * seitenrand);
  const freiBreite = Math.max(76, s(92));
  const knopfHoehe = tipp(eng ? QUER.knopfHoeheNiedrig : QUER.knopfHoehe);

  const chips = (
    <>
      <Chip art="tusche" symbol={<Stern groesse={s(22)} farbe="washi" />} text={anzahl(progress.rewards.stars, 'Stern', 'Sterne')} />
      <Chip text={`${anzahl(currentStreak(progress.rewards, jetzt), 'Tag', 'Tage')} in Folge`} />
    </>
  );

  const titel = (
    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: s(18), rowGap: 4 }}>
      <Schlagzeile text={APP_NAME} groesse={eng ? groesse.logoNiedrig : groesse.logo} style={{ lineHeight: Math.round(s(eng ? groesse.logoNiedrig : groesse.logo) * 1.08) }} />
      <Stempel zeichen={ZIER.stempel} kante={eng ? 50 : 56} />
      <LeseText groesse={groesse.hinweis} fett>
        {set.title}
        {'\n'}
        {anzahl(set.words.length, 'Wort', 'Wörter')}
      </LeseText>
    </View>
  );

  const hinweis =
    status === 'lesefehler' ? (
      <Hinweis
        text="Dein Spielstand konnte gerade nicht gelesen werden. Du kannst trotzdem üben – nur wird jetzt nichts gespeichert."
        aktion="Nochmal laden"
        onAktion={neuLaden}
      />
    ) : speicherfehler ? (
      <Hinweis text="Das Speichern hat gerade nicht geklappt. Beim nächsten Wort versuche ich es wieder." />
    ) : null;

  const modi = (
    <View style={{ gap: abstand }}>
      {START_REIHENFOLGE.map((modus, i) => {
        const text = titelText(modus);
        const farbe: Flaechenfarbe = modus === HAUPT ? 'rot' : 'papier';
        const n = dran(modus);
        const art: Uebungsart = n === 0 ? 'frei' : 'faellig';
        const marke = n === null ? null : n === 0 ? 'Frei üben' : `${n} dran`;
        const form = i % 2 === 0 ? ecken.knopfA : ecken.knopfB;
        return (
          <View key={modus} style={{ flexDirection: 'row', alignItems: 'stretch', gap: s(8) }}>
            <Knopf
              groesse="modus"
              farbe={farbe}
              form={form}
              disabled={!geladen}
              ansage={`${text.gesprochen}${marke ? `, ${marke}` : ''}`}
              onPress={() => starten(modus, art)}
              style={{ flex: 1, alignItems: 'stretch', minHeight: knopfHoehe, paddingVertical: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: s(12) }}>
                <View style={{ flexShrink: 1, flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', columnGap: s(14) }}>
                  <ModusTitel mode={modus} groesse={modus === HAUPT ? groesse.modusHaupt : groesse.modus} farbe={textAuf[farbe]} />
                  <LeseText groesse={groesse.klein} fett={modus === HAUPT} farbe={textAuf[farbe]} style={{ userSelect: 'none' }}>
                    {text.untertitel}
                  </LeseText>
                </View>
                {marke ? <Marke text={marke} /> : null}
              </View>
            </Knopf>
            {art === 'faellig' && geladen ? (
              <Knopf
                groesse="mini"
                farbe="papier"
                form={i % 2 === 0 ? ecken.kleinGegen : ecken.klein}
                ansage={`Frei üben: ${text.gesprochen}`}
                onPress={() => starten(modus, 'frei')}
                style={{ width: freiBreite, paddingHorizontal: 4, minHeight: knopfHoehe }}>
                <LeseText fest fett groesse={Math.max(14, s(15))} style={{ textAlign: 'center', userSelect: 'none', lineHeight: Math.round(Math.max(14, s(15)) * 1.2) }}>
                  {'Frei\nüben'}
                </LeseText>
              </Knopf>
            ) : null}
          </View>
        );
      })}
    </View>
  );

  const leiste = (
    <GuertelLeiste
      mode={leistenModus}
      faecher={stats ? stats[leistenModus].boxes : null}
      onWechseln={() => setLeistenModus((m) => LEISTEN_REIHENFOLGE[(LEISTEN_REIHENFOLGE.indexOf(m) + 1) % LEISTEN_REIHENFOLGE.length])}
    />
  );

  if (breit) {
    const nutzbar = breite - insets.left - insets.right;
    const rechtsFrei = nutzbar - QUER.links - QUER.spalte - QUER.zierLuecke + QUER.figurUeberstand;
    const figurHoehe = Math.min(hoehe - insets.top, rechtsFrei / figuren.bereit.verhaeltnis);
    return (
      <Bildschirm>
        <View style={{ position: 'absolute', right: -QUER.figurUeberstand, bottom: 0, pointerEvents: 'none' }}>
          <Figur pose="bereit" hoehe={figurHoehe} />
        </View>
        <Senkrecht text={ZIER.senkrecht} style={{ position: 'absolute', left: QUER.links + QUER.spalte + QUER.zierLuecke, top: 30 }} />
        <View style={{ position: 'absolute', right: QUER.chips.rechts, bottom: QUER.chips.unten + insets.bottom, alignItems: 'flex-end', gap: 8 }}>
          {chips}
        </View>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingLeft: QUER.links, paddingTop: QUER.oben, paddingBottom: QUER.unten + insets.bottom }}>
          <View style={{ width: spalte, flexGrow: 1, gap: abstand }}>
            {/* Das Banner füllt nur, was an Höhe übrig bleibt – so muss der Start nicht scrollen. */}
            <Szenenbild
              bild={szenen.banner}
              anker={szenenAnker.banner}
              style={{ flexGrow: 1, flexShrink: 0, flexBasis: QUER.banner.min, maxHeight: QUER.banner.max }}
            />
            {titel}
            {hinweis}
            {modi}
            {leiste}
          </View>
        </ScrollView>
      </Bildschirm>
    );
  }

  return (
    <Bildschirm>
      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingTop: s(16), paddingBottom: s(28) + insets.bottom }}>
        <View style={{ width: spalte, gap: abstand }}>
          <Szenenbild
            bild={szenen.banner}
            anker={szenenAnker.banner}
            style={{ height: Math.min(spalte / szenen.banner.verhaeltnis, hoehe * 0.22) }}
          />
          {titel}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: s(12) }}>{chips}</View>
          {hinweis}
          {modi}
          {leiste}
        </View>
      </ScrollView>
    </Bildschirm>
  );
}
