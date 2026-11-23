/**
 * Hält den Fortschritt des Kindes für die ganze App und speichert jede Änderung sofort.
 *
 * - Geladen wird erst in einem Effekt: Der statische Web-Export rendert ohne Browser.
 * - Schlägt das Lesen fehl (`lesefehler`), ist der gespeicherte Stand unbekannt. Dann wird
 *   NIE gespeichert – sonst ginge er verloren. Üben geht trotzdem, nur ohne Speichern.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { createAsyncStorageProgressStorage, emptyProgress, type Progress, type ProgressStorage } from '@/learning';

export type LadeStatus = 'laedt' | 'bereit' | 'lesefehler';

export interface ProgressWert {
  status: LadeStatus;
  /** Aktueller Fortschritt; leer, solange geladen wird oder das Lesen fehlschlug. */
  progress: Progress;
  /** Ändert den Fortschritt und speichert ihn (außer nach einem Lesefehler). */
  anwenden: (aendern: (progress: Progress) => Progress) => void;
  /** Versucht nach einem Lesefehler noch einmal zu laden. */
  neuLaden: () => void;
  /** True, wenn das letzte Speichern nicht geklappt hat. */
  speicherfehler: boolean;
}

const ProgressContext = createContext<ProgressWert | null>(null);

interface ProviderProps {
  /** Ablage; Standard ist der Gerätespeicher. Für Tests austauschbar. */
  storage?: ProgressStorage;
  children: ReactNode;
}

export function ProgressProvider({ storage, children }: ProviderProps) {
  const [status, setStatus] = useState<LadeStatus>('laedt');
  const [progress, setProgress] = useState<Progress>(emptyProgress);
  const [speicherfehler, setSpeicherfehler] = useState(false);
  const [versuch, setVersuch] = useState(0);
  const ablage = useRef<ProgressStorage | null>(storage ?? null);
  const aktuell = useRef(progress);
  const statusRef = useRef<LadeStatus>('laedt');
  /** Speichervorgänge laufen nacheinander, damit nie ein älterer Stand einen neueren überschreibt. */
  const kette = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let aktiv = true;
    ablage.current ??= createAsyncStorageProgressStorage();
    ablage.current.load().then(
      (geladen) => {
        if (!aktiv) return;
        aktuell.current = geladen;
        statusRef.current = 'bereit';
        setProgress(geladen);
        setStatus('bereit');
      },
      () => {
        // ProgressReadError oder Unerwartetes: Stand unbekannt, also nicht überschreiben.
        if (!aktiv) return;
        statusRef.current = 'lesefehler';
        setStatus('lesefehler');
      },
    );
    return () => {
      aktiv = false;
    };
  }, [versuch]);

  const anwenden = useCallback((aendern: (progress: Progress) => Progress) => {
    const neu = aendern(aktuell.current);
    if (neu === aktuell.current) return;
    aktuell.current = neu;
    setProgress(neu);
    if (statusRef.current !== 'bereit' || !ablage.current) return;
    const speicher = ablage.current;
    kette.current = kette.current
      .then(() => speicher.save(neu))
      .then(
        () => setSpeicherfehler(false),
        () => setSpeicherfehler(true),
      );
  }, []);

  const neuLaden = useCallback(() => {
    if (statusRef.current !== 'lesefehler') return;
    const leer = emptyProgress();
    aktuell.current = leer;
    statusRef.current = 'laedt';
    setProgress(leer);
    setStatus('laedt');
    setVersuch((n) => n + 1);
  }, []);

  const wert = useMemo(
    () => ({ status, progress, anwenden, neuLaden, speicherfehler }),
    [status, progress, anwenden, neuLaden, speicherfehler],
  );
  return <ProgressContext.Provider value={wert}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressWert {
  const wert = useContext(ProgressContext);
  if (!wert) throw new Error('useProgress braucht einen ProgressProvider.');
  return wert;
}
