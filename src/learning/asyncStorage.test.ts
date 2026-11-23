import AsyncStorage from '@react-native-async-storage/async-storage';

import { createAsyncStorageProgressStorage } from './asyncStorage';
import { emptyProgress, recordOutcome } from './progress';
import { addStars, recordPracticeDay } from './rewards';
import { PROGRESS_KEY } from './storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('AsyncStorage-Ablage', () => {
  beforeEach(() => AsyncStorage.clear());

  it('speichert und lädt Fächer, Sterne und Serie über AsyncStorage', async () => {
    const storage = createAsyncStorageProgressStorage();
    const recorded = recordOutcome(emptyProgress(), 'schreiben', 'u2p1:hero', 'gewusst', 1000);
    const progress = { ...recorded, rewards: recordPracticeDay(addStars(recorded.rewards, 2), 1000) };
    await storage.save(progress);
    expect(await AsyncStorage.getItem(PROGRESS_KEY)).toContain('"version":1');
    expect(await storage.load()).toEqual(progress);
  });

  it('kaputte Daten in AsyncStorage → Neustart', async () => {
    await AsyncStorage.setItem(PROGRESS_KEY, 'nicht json');
    expect(await createAsyncStorageProgressStorage().load()).toEqual(emptyProgress());
  });
});
