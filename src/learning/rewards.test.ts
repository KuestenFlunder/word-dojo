import { addStars, currentStreak, dayKey, emptyRewards, parseRewards, practicedToday, recordPracticeDay, STARS_PER_WORD, type Rewards } from './rewards';

/** Zeitpunkt in Gerätezeit. */
const at = (year: number, month: number, day: number, hour = 12) => new Date(year, month - 1, day, hour).getTime();

describe('Sterne', () => {
  it('ein Stern je geschafftem Wort', () => {
    expect(STARS_PER_WORD).toBe(1);
  });

  it('werden dazugezählt', () => {
    expect(addStars(addStars(emptyRewards(), 1), 3).stars).toBe(4);
  });

  it('werden nie weniger', () => {
    const rewards = addStars(emptyRewards(), 5);
    expect(addStars(rewards, -2)).toBe(rewards);
    expect(addStars(rewards, 0)).toBe(rewards);
    expect(addStars(rewards, 0.5)).toBe(rewards);
    expect(addStars(rewards, NaN)).toBe(rewards);
  });
});

describe('dayKey', () => {
  it('ist der Kalendertag in Gerätezeit', () => {
    expect(dayKey(at(2026, 11, 23, 0))).toBe('2026-11-23');
    expect(dayKey(at(2026, 11, 23, 23))).toBe('2026-11-23');
    expect(dayKey(at(2026, 1, 5))).toBe('2026-01-05');
  });
});

describe('Tages-Serie', () => {
  it('erster Übungstag → Serie 1', () => {
    const rewards = recordPracticeDay(emptyRewards(), at(2026, 11, 23));
    expect(rewards).toMatchObject({ streak: 1, longestStreak: 1, lastDay: '2026-11-23' });
  });

  it('mehrmals am selben Tag zählt einmal', () => {
    const once = recordPracticeDay(emptyRewards(), at(2026, 11, 23, 8));
    expect(recordPracticeDay(once, at(2026, 11, 23, 20))).toBe(once);
  });

  it('am Folgetag wächst die Serie – auch spät abends → früh morgens', () => {
    let rewards = recordPracticeDay(emptyRewards(), at(2026, 11, 23, 23));
    rewards = recordPracticeDay(rewards, at(2026, 11, 24, 6));
    rewards = recordPracticeDay(rewards, at(2026, 11, 25, 18));
    expect(rewards).toMatchObject({ streak: 3, longestStreak: 3, lastDay: '2026-11-25' });
  });

  it('ein ausgelassener Tag beginnt neu, die längste Serie bleibt', () => {
    let rewards = recordPracticeDay(emptyRewards(), at(2026, 11, 23));
    rewards = recordPracticeDay(rewards, at(2026, 11, 24));
    rewards = recordPracticeDay(rewards, at(2026, 11, 26));
    expect(rewards).toMatchObject({ streak: 1, longestStreak: 2, lastDay: '2026-11-26' });
  });

  it('läuft über Monats- und Jahreswechsel', () => {
    let rewards = recordPracticeDay(emptyRewards(), at(2026, 11, 30));
    rewards = recordPracticeDay(rewards, at(2026, 12, 1));
    expect(rewards.streak).toBe(2);
    rewards = recordPracticeDay({ ...rewards, lastDay: '2026-12-31' }, at(2027, 1, 1));
    expect(rewards.streak).toBe(3);
  });

  it('läuft über die Zeitumstellung', () => {
    // Deutschland: 29.03.2026 hat 23 Stunden, 25.10.2026 hat 25.
    let rewards = recordPracticeDay(emptyRewards(), at(2026, 3, 28, 23));
    rewards = recordPracticeDay(rewards, at(2026, 3, 29, 23));
    rewards = recordPracticeDay(rewards, at(2026, 3, 30, 0));
    expect(rewards.streak).toBe(3);
    rewards = recordPracticeDay(emptyRewards(), at(2026, 10, 24, 23));
    rewards = recordPracticeDay(rewards, at(2026, 10, 25, 23));
    rewards = recordPracticeDay(rewards, at(2026, 10, 26, 0));
    expect(rewards.streak).toBe(3);
  });

  it('currentStreak: gilt heute und noch am Tag danach, dann 0', () => {
    let rewards = recordPracticeDay(emptyRewards(), at(2026, 11, 22));
    rewards = recordPracticeDay(rewards, at(2026, 11, 23));
    expect(currentStreak(rewards, at(2026, 11, 23, 22))).toBe(2);
    expect(currentStreak(rewards, at(2026, 11, 24, 7))).toBe(2);
    expect(currentStreak(rewards, at(2026, 11, 25, 7))).toBe(0);
    expect(currentStreak(emptyRewards(), at(2026, 11, 23))).toBe(0);
  });

  it('practicedToday', () => {
    const rewards = recordPracticeDay(emptyRewards(), at(2026, 11, 23));
    expect(practicedToday(rewards, at(2026, 11, 23, 23))).toBe(true);
    expect(practicedToday(rewards, at(2026, 11, 24, 0))).toBe(false);
    expect(practicedToday(emptyRewards(), at(2026, 11, 23))).toBe(false);
  });

  it('Sterne und Serie beeinflussen sich nicht', () => {
    const rewards = recordPracticeDay(addStars(emptyRewards(), 7), at(2026, 11, 23));
    expect(rewards).toEqual<Rewards>({ stars: 7, streak: 1, longestStreak: 1, lastDay: '2026-11-23' });
  });
});

describe('parseRewards', () => {
  it('liest einen gültigen Stand', () => {
    const rewards: Rewards = { stars: 12, streak: 3, longestStreak: 5, lastDay: '2026-11-23' };
    expect(parseRewards(JSON.parse(JSON.stringify(rewards)))).toEqual(rewards);
    expect(parseRewards(emptyRewards())).toEqual(emptyRewards());
  });

  it.each([undefined, null, 'x', 5, [], {}, { stars: -1, streak: 0, longestStreak: 0, lastDay: null }, { stars: 1, streak: 1, longestStreak: 1, lastDay: 'gestern' }, { stars: 1.5, streak: 1, longestStreak: 1, lastDay: null }])(
    'Unbrauchbares (%j) → leerer Stand',
    (value) => {
      expect(parseRewards(value)).toEqual(emptyRewards());
    },
  );
});
