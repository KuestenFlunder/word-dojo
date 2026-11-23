import AsyncStorage from '@react-native-async-storage/async-storage';

import { createProgressStorage, PROGRESS_KEY, type ProgressStorage } from './storage';

/**
 * Fortschritts-Ablage auf dem Gerät über AsyncStorage (im Web: `localStorage` des Browsers).
 * Erst nach dem ersten Rendern benutzen (in einem Effekt): Beim statischen Web-Export
 * läuft der Code auch ohne Browser.
 */
export function createAsyncStorageProgressStorage(key: string = PROGRESS_KEY): ProgressStorage {
  return createProgressStorage(AsyncStorage, key);
}
