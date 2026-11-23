import { BOX_INTERVAL_DAYS, BOXES, isDue, nextBox } from './leitner';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const T0 = Date.UTC(2026, 10, 23, 16, 0);

describe('nextBox', () => {
  it('gewusst → ein Fach weiter, höchstens Fach 5', () => {
    expect(nextBox(1, 'gewusst')).toBe(2);
    expect(nextBox(4, 'gewusst')).toBe(5);
    expect(nextBox(5, 'gewusst')).toBe(5);
  });

  it('nicht gewusst → immer zurück in Fach 1', () => {
    for (const box of BOXES) expect(nextBox(box, 'nicht-gewusst')).toBe(1);
  });
});

describe('isDue', () => {
  it('hat fünf Fächer mit Wartezeiten 0/1/2/4/7 Tage', () => {
    expect(BOXES).toEqual([1, 2, 3, 4, 5]);
    expect(BOX_INTERVAL_DAYS).toEqual({ 1: 0, 2: 1, 3: 2, 4: 4, 5: 7 });
  });

  it('nie geübt → fällig, in jedem Fach', () => {
    for (const box of BOXES) expect(isDue(box, null, T0)).toBe(true);
  });

  it('Fach 1 ist immer fällig', () => {
    expect(isDue(1, T0, T0)).toBe(true);
  });

  it('höhere Fächer erst nach ihrer Wartezeit', () => {
    for (const box of [2, 3, 4, 5] as const) {
      const wait = BOX_INTERVAL_DAYS[box] * DAY;
      expect(isDue(box, T0, T0)).toBe(false);
      expect(isDue(box, T0, T0 + wait - 9 * HOUR)).toBe(false);
      expect(isDue(box, T0, T0 + wait)).toBe(true);
    }
  });

  it('gestern Abend geübt, heute Morgen wieder dran (8 Stunden Toleranz)', () => {
    expect(isDue(2, T0, T0 + 16 * HOUR)).toBe(true);
    expect(isDue(2, T0, T0 + 15 * HOUR)).toBe(false);
  });
});
