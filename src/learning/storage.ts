/**
 * Ablage des Fortschritts hinter einer kleinen Schnittstelle.
 * In der App: `createAsyncStorageProgressStorage` (siehe `asyncStorage.ts`; im Web
 * landet das in `localStorage`), in Tests: {@link createMemoryProgressStorage}.
 */
import { emptyProgress, serializeProgress, tryParseProgress, type Progress } from './progress';

/** Minimaler Schlüssel-Wert-Speicher; AsyncStorage erfüllt ihn direkt. */
export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/** Laden, Speichern und Zurücksetzen des Fortschritts (Fächer, Sterne, Serie). */
export interface ProgressStorage {
  /**
   * Lädt den Fortschritt.
   * - Kein Eintrag vorhanden → leerer Fortschritt (erster Start).
   * - Inhalt unbrauchbar (kein JSON, falsche Version, falscher Aufbau) → Rohinhalt wird unter
   *   {@link PROGRESS_BACKUP_KEY} gesichert, dann leerer Fortschritt (sauberer Neustart).
   * - Lesen fehlgeschlagen (oder Sicherung fehlgeschlagen) → wirft {@link ProgressReadError}.
   *   Der gespeicherte Stand ist dann unbekannt und darf NICHT überschrieben werden.
   */
  load(): Promise<Progress>;
  /** Speichert den kompletten Fortschritt. */
  save(progress: Progress): Promise<void>;
  /** Löscht den gespeicherten Fortschritt. */
  reset(): Promise<void>;
}

/** Schlüssel, unter dem der Fortschritt liegt. */
export const PROGRESS_KEY = 'vokabeltrainer/progress';

/** Schlüssel, unter dem ein unlesbarer Rohinhalt vor dem Neustart gesichert wird. */
export const PROGRESS_BACKUP_KEY = 'vokabeltrainer/progress-backup';

/** Der Speicher konnte nicht gelesen werden; der gespeicherte Stand ist unbekannt. */
export class ProgressReadError extends Error {
  constructor(readonly reason: unknown) {
    super('Fortschritt konnte nicht gelesen werden');
    this.name = 'ProgressReadError';
  }
}

/**
 * Liest einen gespeicherten JSON-Stand robust:
 * - kein Eintrag → `null` (erster Start),
 * - unbrauchbarer Inhalt (`tryParse` liefert `undefined`) → Rohinhalt unter `backupKey`
 *   sichern, dann `null` (sauberer Neustart),
 * - Lesen oder Sichern fehlgeschlagen → {@link ProgressReadError}; der gespeicherte
 *   Stand ist dann unbekannt und darf nicht überschrieben werden.
 */
export async function ladeMitSicherung<T>(
  store: KeyValueStore,
  key: string,
  backupKey: string,
  tryParse: (raw: string) => T | undefined,
): Promise<T | null> {
  let raw: string | null;
  try {
    raw = await store.getItem(key);
  } catch (e) {
    throw new ProgressReadError(e);
  }
  if (!raw) return null;
  const parsed = tryParse(raw);
  if (parsed !== undefined) return parsed;
  try {
    await store.setItem(backupKey, raw);
  } catch (e) {
    // Ohne Sicherung kein Neustart: lieber als Lesefehler behandeln, damit nichts überschrieben wird.
    throw new ProgressReadError(e);
  }
  return null;
}

/** Baut eine {@link ProgressStorage} auf einem beliebigen {@link KeyValueStore}. */
export function createProgressStorage(
  store: KeyValueStore,
  key: string = PROGRESS_KEY,
  backupKey: string = key === PROGRESS_KEY ? PROGRESS_BACKUP_KEY : `${key}-backup`,
): ProgressStorage {
  return {
    load: async () => (await ladeMitSicherung(store, key, backupKey, tryParseProgress)) ?? emptyProgress(),
    save: (progress) => store.setItem(key, serializeProgress(progress)),
    reset: () => store.removeItem(key),
  };
}

/** Schlüssel-Wert-Speicher im Arbeitsspeicher (für Tests). `initial` belegt Schlüssel vor. */
export function createMemoryKeyValueStore(initial: Record<string, string> = {}): KeyValueStore & {
  /** Direkter Blick in den Inhalt, für Tests. */
  readonly data: Map<string, string>;
} {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: async (key) => data.get(key) ?? null,
    setItem: async (key, value) => {
      data.set(key, value);
    },
    removeItem: async (key) => {
      data.delete(key);
    },
  };
}

/** Fortschritts-Ablage im Arbeitsspeicher; `raw` ist optional der vorbelegte gespeicherte Text. */
export function createMemoryProgressStorage(raw?: string): ProgressStorage {
  return createProgressStorage(createMemoryKeyValueStore(raw === undefined ? {} : { [PROGRESS_KEY]: raw }));
}
