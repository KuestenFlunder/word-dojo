import { unit2part1 } from '../data';
import {
  allModeStats,
  emptyProgress,
  getItemProgress,
  isWordDue,
  itemKey,
  modeStats,
  MODES,
  NEW_ITEM_PROGRESS,
  parseProgress,
  recordOutcome,
  serializeProgress,
  tryParseProgress,
} from './progress';
import { addStars, emptyRewards, recordPracticeDay } from './rewards';

const T0 = Date.UTC(2026, 10, 23, 16, 0);
const DAY = 24 * 60 * 60 * 1000;
const HERO = 'u2p1:hero';
const MOON = 'u2p1:moon';
const words = unit2part1.words;

describe('Lernstand je Wort und Modus', () => {
  it('kennt die drei Modi', () => {
    expect(MODES).toEqual(['en-de', 'de-en', 'schreiben']);
    expect(itemKey('schreiben', HERO)).toBe('schreiben:u2p1:hero');
  });

  it('nie geübt → Fach 1, fällig', () => {
    expect(getItemProgress(emptyProgress(), 'en-de', HERO)).toEqual(NEW_ITEM_PROGRESS);
    expect(isWordDue(emptyProgress(), 'en-de', HERO, T0)).toBe(true);
  });

  it('gewusst → ein Fach weiter, mit Zähler und Zeitpunkt', () => {
    let p = recordOutcome(emptyProgress(), 'en-de', HERO, 'gewusst', T0);
    expect(getItemProgress(p, 'en-de', HERO)).toEqual({ box: 2, correct: 1, wrong: 0, lastPracticed: T0 });
    p = recordOutcome(p, 'en-de', HERO, 'gewusst', T0 + DAY);
    expect(getItemProgress(p, 'en-de', HERO)).toEqual({ box: 3, correct: 2, wrong: 0, lastPracticed: T0 + DAY });
  });

  it('nicht gewusst → zurück in Fach 1', () => {
    let p = emptyProgress();
    for (let i = 0; i < 3; i++) p = recordOutcome(p, 'schreiben', HERO, 'gewusst', T0);
    expect(getItemProgress(p, 'schreiben', HERO).box).toBe(4);
    p = recordOutcome(p, 'schreiben', HERO, 'nicht-gewusst', T0);
    expect(getItemProgress(p, 'schreiben', HERO)).toEqual({ box: 1, correct: 3, wrong: 1, lastPracticed: T0 });
  });

  it('bleibt in Fach 5', () => {
    let p = emptyProgress();
    for (let i = 0; i < 8; i++) p = recordOutcome(p, 'de-en', HERO, 'gewusst', T0);
    expect(getItemProgress(p, 'de-en', HERO).box).toBe(5);
  });

  it('führt jeden Modus getrennt', () => {
    let p = recordOutcome(emptyProgress(), 'en-de', HERO, 'gewusst', T0);
    p = recordOutcome(p, 'en-de', HERO, 'gewusst', T0);
    p = recordOutcome(p, 'schreiben', HERO, 'nicht-gewusst', T0);
    expect(getItemProgress(p, 'en-de', HERO).box).toBe(3);
    expect(getItemProgress(p, 'de-en', HERO)).toEqual(NEW_ITEM_PROGRESS);
    expect(getItemProgress(p, 'schreiben', HERO)).toMatchObject({ box: 1, wrong: 1 });
    expect(getItemProgress(p, 'en-de', MOON)).toEqual(NEW_ITEM_PROGRESS);
  });

  it('Fälligkeit folgt dem Fach', () => {
    const p = recordOutcome(emptyProgress(), 'en-de', HERO, 'gewusst', T0);
    expect(isWordDue(p, 'en-de', HERO, T0)).toBe(false);
    expect(isWordDue(p, 'en-de', HERO, T0 + DAY)).toBe(true);
    expect(isWordDue(p, 'de-en', HERO, T0)).toBe(true);
  });

  it('verändert den alten Fortschritt nicht', () => {
    const before = emptyProgress();
    recordOutcome(before, 'en-de', HERO, 'gewusst', T0);
    expect(before).toEqual(emptyProgress());
  });
});

describe('Fach-Statistik', () => {
  it('ohne Übung liegt alles in Fach 1 und ist fällig', () => {
    expect(modeStats(emptyProgress(), 'en-de', words, T0)).toEqual({
      total: 56,
      boxes: { 1: 56, 2: 0, 3: 0, 4: 0, 5: 0 },
      due: 56,
      unseen: 56,
      mastered: 0,
    });
  });

  it('zählt je Fach, fällig, neu und gemeistert – pro Modus', () => {
    let p = recordOutcome(emptyProgress(), 'en-de', HERO, 'gewusst', T0);
    p = recordOutcome(p, 'en-de', MOON, 'nicht-gewusst', T0);
    for (let i = 0; i < 4; i++) p = recordOutcome(p, 'en-de', 'u2p1:shy', 'gewusst', T0);

    expect(modeStats(p, 'en-de', words, T0)).toEqual({
      total: 56,
      boxes: { 1: 54, 2: 1, 3: 0, 4: 0, 5: 1 },
      due: 54,
      unseen: 53,
      mastered: 1,
    });
    expect(modeStats(p, 'en-de', words, T0 + DAY).due).toBe(55);
    expect(modeStats(p, 'en-de', words, T0 + 7 * DAY).due).toBe(56);

    const all = allModeStats(p, words, T0);
    expect(all['en-de'].boxes[2]).toBe(1);
    expect(all['de-en'].unseen).toBe(56);
    expect(all.schreiben.boxes[1]).toBe(56);
  });

  it('zählt nur die übergebenen Wörter', () => {
    const p = recordOutcome(emptyProgress(), 'en-de', HERO, 'gewusst', T0);
    const gruppe2 = words.filter((w) => w.group === 2);
    expect(modeStats(p, 'en-de', gruppe2, T0)).toMatchObject({ total: 8, boxes: { 1: 8, 2: 0 }, due: 8 });
    expect(modeStats(p, 'en-de', [], T0)).toMatchObject({ total: 0, due: 0 });
  });
});

describe('Speichern und Lesen', () => {
  it('Hin und zurück bleibt gleich', () => {
    let p = recordOutcome(emptyProgress(), 'en-de', HERO, 'gewusst', T0);
    p = recordOutcome(p, 'schreiben', MOON, 'nicht-gewusst', T0);
    p = { ...p, rewards: recordPracticeDay(addStars(p.rewards, 4), T0) };
    expect(parseProgress(serializeProgress(p))).toEqual(p);
    expect(tryParseProgress(serializeProgress(p))).toEqual(p);
  });

  it('nichts gespeichert → leer', () => {
    expect(parseProgress(null)).toEqual(emptyProgress());
    expect(parseProgress(undefined)).toEqual(emptyProgress());
    expect(parseProgress('')).toEqual(emptyProgress());
  });

  it.each(['kein json', '[]', '5', 'null', '{}', '{"version":2,"items":{}}', '{"version":1,"items":[]}', '{"version":1}'])(
    'unbrauchbar: %s',
    (raw) => {
      expect(tryParseProgress(raw)).toBeUndefined();
      expect(parseProgress(raw)).toEqual(emptyProgress());
    },
  );

  it('verwirft einzelne kaputte Einträge, behält den Rest', () => {
    const raw = JSON.stringify({
      version: 1,
      items: {
        'en-de:u2p1:hero': { box: 3, correct: 2, wrong: 0, lastPracticed: T0 },
        'en-de:u2p1:moon': { box: 9, correct: 0, wrong: 0, lastPracticed: null },
        'schreiben:u2p1:shy': { box: 2, correct: -1, wrong: 0, lastPracticed: null },
        'de-en:u2p1:far': 'quatsch',
        'tanzen:u2p1:far': { box: 2, correct: 1, wrong: 0, lastPracticed: T0 },
        'en-de:': { box: 2, correct: 1, wrong: 0, lastPracticed: T0 },
      },
      rewards: { stars: 3, streak: 1, longestStreak: 1, lastDay: '2026-11-23' },
    });
    expect(tryParseProgress(raw)).toEqual({
      version: 1,
      items: { 'en-de:u2p1:hero': { box: 3, correct: 2, wrong: 0, lastPracticed: T0 } },
      rewards: { stars: 3, streak: 1, longestStreak: 1, lastDay: '2026-11-23' },
    });
  });

  it('behält Einträge zu Wörtern, die es im Datenbestand (noch) nicht gibt', () => {
    const p = recordOutcome(emptyProgress(), 'en-de', 'u3p1:spaeter', 'gewusst', T0);
    expect(parseProgress(serializeProgress(p))).toEqual(p);
  });

  it('fehlende oder kaputte Belohnungen → leere Belohnungen, Fächer bleiben', () => {
    const raw = JSON.stringify({ version: 1, items: { 'en-de:u2p1:hero': { box: 2, correct: 1, wrong: 0, lastPracticed: T0 } }, rewards: 'x' });
    const p = tryParseProgress(raw)!;
    expect(p.rewards).toEqual(emptyRewards());
    expect(getItemProgress(p, 'en-de', HERO).box).toBe(2);
  });
});
