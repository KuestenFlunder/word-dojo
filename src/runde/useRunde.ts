/** Verbindet die reine Runden-Steuerung mit React und dem gespeicherten Fortschritt. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { Vocab } from '@/data';
import { applyResult, mixedDueWords, modeStats } from '@/learning';
import { useProgress } from '@/progress/ProgressProvider';

import { aufdecken, bewerten, pruefen, starteRunde, weissNicht, weiter, type Runde, type Schritt } from './runde';
import type { RundenModus } from './texte';

export type Uebungsart = 'faellig' | 'frei';

export interface RundenAktionen {
  aufdecken: () => void;
  bewerten: (gewusst: boolean) => void;
  pruefen: (eingabe: string) => void;
  weissNicht: () => void;
  weiter: () => void;
  /** Noch eine Runde im selben Modus: Fälliges, wenn es welches gibt, sonst freies Üben. */
  nochEineRunde: () => void;
}

/**
 * Führt eine Runde. Sie beginnt, sobald der Fortschritt geladen ist. Jede Antwort wird
 * sofort eingetragen und gespeichert – ein Abbruch mitten in der Runde verliert nichts.
 */
export function useRunde(mode: RundenModus | null, art: Uebungsart, words: readonly Vocab[]): { runde: Runde | null; aktionen: RundenAktionen } {
  const { status, progress, anwenden } = useProgress();
  const [runde, setRunde] = useState<Runde | null>(null);
  const stand = useRef<Runde | null>(null);
  const fortschritt = useRef(progress);
  fortschritt.current = progress;

  const starten = useCallback(
    (m: RundenModus, a: Uebungsart) => {
      const neu = starteRunde({ mode: m, auswahl: { art: a }, words, progress: fortschritt.current, now: Date.now() });
      stand.current = neu;
      setRunde(neu);
    },
    [words],
  );

  useEffect(() => {
    if (status === 'laedt' || !mode || stand.current) return;
    starten(mode, art);
  }, [status, mode, art, starten]);

  const ausfuehren = useCallback(
    (uebergang: (runde: Runde) => Schritt) => {
      const vorher = stand.current;
      if (!vorher) return;
      const { runde: neu, verbuchung } = uebergang(vorher);
      if (neu === vorher) return;
      stand.current = neu;
      setRunde(neu);
      // Verbucht wird im Modus der beantworteten Aufgabe (in gemischten Runden wechselt er).
      if (verbuchung) anwenden((p) => applyResult(p, vorher.session.mode, verbuchung, Date.now()));
    },
    [anwenden],
  );

  const aktionen = useMemo<RundenAktionen>(
    () => ({
      aufdecken: () => ausfuehren(aufdecken),
      bewerten: (gewusst) => ausfuehren((r) => bewerten(r, gewusst)),
      pruefen: (eingabe) => ausfuehren((r) => pruefen(r, eingabe)),
      weissNicht: () => ausfuehren(weissNicht),
      weiter: () => ausfuehren(weiter),
      nochEineRunde: () => {
        if (!mode) return;
        const jetzt = Date.now();
        const dran = mode === 'gemischt' ? mixedDueWords(fortschritt.current, words, jetzt) : modeStats(fortschritt.current, mode, words, jetzt).due;
        const faellig = art === 'faellig' && dran > 0;
        starten(mode, faellig ? 'faellig' : 'frei');
      },
    }),
    [ausfuehren, starten, mode, art, words],
  );

  return { runde, aktionen };
}
