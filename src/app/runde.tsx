/**
 * Eine Runde: `/runde?modus=de-en|en-de|schreiben|gemischt&auswahl=faellig|frei`.
 * Zeigt je nach Stand Karte, Schreiben, Abschreiben oder die Abschlussseite. In gemischten
 * Runden bestimmt der Modus der aktuellen Aufgabe (`session.mode`) Ansicht und Kopfzeile.
 */
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import type { Metadata } from 'expo-router/server';

import { Bildschirm } from '@/components/Bildschirm';
import type { KopfProps } from '@/components/Kopfzeile';
import { vocabSets } from '@/data';
import { getItemProgress, sessionProgress, summarizeSession } from '@/learning';
import { useProgress } from '@/progress/ProgressProvider';
import { aufgabenNummer, aufstiege } from '@/runde/runde';
import { istRundenModus } from '@/runde/texte';
import { useRunde } from '@/runde/useRunde';
import { AbschreibBildschirm } from '@/screens/AbschreibBildschirm';
import { FertigBildschirm } from '@/screens/FertigBildschirm';
import { KartenBildschirm } from '@/screens/KartenBildschirm';
import { SchreibBildschirm } from '@/screens/SchreibBildschirm';

export function generateMetadata(): Metadata {
  return { title: 'Word Dojo' };
}

function zumStart() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export default function RundeRoute() {
  const params = useLocalSearchParams<{ modus?: string; auswahl?: string }>();
  const modus = istRundenModus(params.modus) ? params.modus : null;
  const art = params.auswahl === 'frei' ? 'frei' : 'faellig';
  const { progress } = useProgress();
  const { runde, aktionen } = useRunde(modus, art, vocabSets[0].words);

  if (!modus) return <Redirect href="/" />;
  if (!runde) return <Bildschirm />;

  const { session, ansicht, wort } = runde;
  if (ansicht === 'fertig' || !wort) {
    // Nichts zu üben (z. B. direkt aufgerufen, aber nichts fällig).
    if (session.wordIds.length === 0) return <Redirect href="/" />;
    return (
      <FertigBildschirm
        mode={runde.rundenModus}
        frei={session.auswahl.art === 'frei'}
        auswertung={summarizeSession(session)}
        sterneGesamt={progress.rewards.stars}
        aufstiege={aufstiege(runde, progress)}
        onNochEineRunde={aktionen.nochEineRunde}
        onZumStart={zumStart}
      />
    );
  }

  const stand = sessionProgress(session);
  const kopf: Omit<KopfProps, 'mode'> = {
    ...aufgabenNummer(runde),
    anteil: stand.total > 0 ? stand.done / stand.total : 0,
    onZurueck: zumStart,
  };
  const schreibKopf: KopfProps = { ...kopf, mode: 'schreiben' };
  switch (ansicht) {
    case 'karte-frage':
    case 'karte-aufgedeckt': {
      // In diesen Ansichten ist die aktuelle Aufgabe immer eine Karten-Aufgabe.
      const mode = session.mode === 'en-de' ? 'en-de' : 'de-en';
      return (
        <KartenBildschirm
          kopf={{ ...kopf, mode }}
          mode={mode}
          wort={wort}
          fach={getItemProgress(progress, mode, wort.id).box}
          aufgedeckt={ansicht === 'karte-aufgedeckt'}
          onAufdecken={aktionen.aufdecken}
          onBewerten={aktionen.bewerten}
        />
      );
    }
    case 'schreiben':
    case 'richtig':
      return (
        <SchreibBildschirm
          kopf={schreibKopf}
          wort={wort}
          richtig={ansicht === 'richtig'}
          onPruefen={aktionen.pruefen}
          onWeissNicht={aktionen.weissNicht}
          onWeiter={aktionen.weiter}
        />
      );
    case 'abschreiben':
      return <AbschreibBildschirm kopf={schreibKopf} wort={wort} diff={runde.diff} daneben={runde.abschriftDaneben} onPruefen={aktionen.pruefen} />;
  }
}
