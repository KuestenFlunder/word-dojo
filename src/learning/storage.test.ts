import { emptyProgress, recordOutcome, serializeProgress } from './progress';
import {
  createMemoryKeyValueStore,
  createMemoryProgressStorage,
  createProgressStorage,
  PROGRESS_BACKUP_KEY,
  PROGRESS_KEY,
  ProgressReadError,
  type KeyValueStore,
} from './storage';

const T0 = Date.UTC(2026, 10, 23, 16, 0);
const sample = () => recordOutcome(emptyProgress(), 'schreiben', 'u2p1:hero', 'gewusst', T0);

describe('Fortschritts-Ablage', () => {
  it('erster Start → leerer Fortschritt', async () => {
    expect(await createMemoryProgressStorage().load()).toEqual(emptyProgress());
  });

  it('speichert, lädt und setzt zurück', async () => {
    const store = createMemoryKeyValueStore();
    const storage = createProgressStorage(store);
    await storage.save(sample());
    expect(store.data.get(PROGRESS_KEY)).toBe(serializeProgress(sample()));
    expect(await storage.load()).toEqual(sample());
    await storage.reset();
    expect(store.data.has(PROGRESS_KEY)).toBe(false);
    expect(await storage.load()).toEqual(emptyProgress());
  });

  it('lädt einen vorbelegten Stand', async () => {
    expect(await createMemoryProgressStorage(serializeProgress(sample())).load()).toEqual(sample());
  });

  it('unbrauchbarer Inhalt → Rohinhalt sichern, dann Neustart', async () => {
    const store = createMemoryKeyValueStore({ [PROGRESS_KEY]: 'nicht json' });
    expect(await createProgressStorage(store).load()).toEqual(emptyProgress());
    expect(store.data.get(PROGRESS_BACKUP_KEY)).toBe('nicht json');
    expect(store.data.get(PROGRESS_KEY)).toBe('nicht json');
  });

  it('eigener Schlüssel bekommt einen eigenen Sicherungs-Schlüssel', async () => {
    const store = createMemoryKeyValueStore({ kind2: '{"version":99}' });
    await createProgressStorage(store, 'kind2').load();
    expect(store.data.get('kind2-backup')).toBe('{"version":99}');
    expect(store.data.has(PROGRESS_BACKUP_KEY)).toBe(false);
  });

  it('Lesefehler → ProgressReadError statt leerem Fortschritt', async () => {
    const store: KeyValueStore = {
      getItem: async () => {
        throw new Error('Speicher weg');
      },
      setItem: async () => {},
      removeItem: async () => {},
    };
    await expect(createProgressStorage(store).load()).rejects.toBeInstanceOf(ProgressReadError);
  });

  it('Sicherung schlägt fehl → ProgressReadError, nichts wird überschrieben', async () => {
    const inner = createMemoryKeyValueStore({ [PROGRESS_KEY]: 'kaputt' });
    const store: KeyValueStore = {
      ...inner,
      setItem: async () => {
        throw new Error('voll');
      },
    };
    await expect(createProgressStorage(store).load()).rejects.toBeInstanceOf(ProgressReadError);
    expect(inner.data.get(PROGRESS_KEY)).toBe('kaputt');
  });
});
