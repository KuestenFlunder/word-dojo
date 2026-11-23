import { unit2part1, type Vocab } from '../data';
import { emptyProgress, getItemProgress, recordOutcome, type Mode, type Progress } from './progress';
import { dayKey } from './rewards';
import {
  answerCard,
  applyResult,
  createSession,
  currentWord,
  isFinished,
  MAX_REPEATS,
  REQUEUE_GAP,
  revealWriting,
  selectWords,
  sessionProgress,
  submitWriting,
  summarizeSession,
  type Session,
} from './session';

const T0 = Date.UTC(2026, 10, 23, 16, 0);
const DAY = 24 * 60 * 60 * 1000;
const words = unit2part1.words;
const gruppe1 = words.filter((w) => w.group === 1);

/** Deterministische Zufallsquelle (LCG). */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function start(mode: Mode, list: readonly Vocab[] = gruppe1, progress: Progress = emptyProgress()): Session {
  return createSession({ mode, words: list, progress, now: T0, random: seeded(7) });
}

/** Beantwortet das aktuelle Wort komplett (im Schreib-Modus bei „falsch“ inklusive Abschreiben). */
function answer(session: Session, right: boolean): Session {
  if (session.mode !== 'schreiben') return answerCard(session, right).session;
  const word = currentWord(session)!;
  if (right) return submitWriting(session, word.accept[0]).session;
  return submitWriting(submitWriting(session, 'xyzxyz').session, word.accept[0]).session;
}

describe('Auswahl der Wörter', () => {
  it('fällig: am Anfang alle Wörter, deterministisch bei gleicher Zufallsquelle', () => {
    const a = createSession({ mode: 'en-de', words, progress: emptyProgress(), now: T0, random: seeded(1) });
    const b = createSession({ mode: 'en-de', words, progress: emptyProgress(), now: T0, random: seeded(1) });
    expect(a.wordIds).toEqual(b.wordIds);
    expect([...a.wordIds].sort()).toEqual(words.map((w) => w.id).sort());
    expect(a.wordIds).not.toEqual(words.map((w) => w.id));
    expect(a.auswahl).toEqual({ art: 'faellig' });
  });

  it('fällig: nur was dran ist, niedrige Fächer zuerst', () => {
    let p = emptyProgress();
    // hair: Fach 2, eben geübt → nicht fällig. braces: Fach 2, vor 2 Tagen → fällig. glasses: Fach 3, vor 3 Tagen → fällig.
    p = recordOutcome(p, 'en-de', 'u2p1:hair', 'gewusst', T0);
    p = recordOutcome(p, 'en-de', 'u2p1:braces', 'gewusst', T0 - 2 * DAY);
    p = recordOutcome(p, 'en-de', 'u2p1:glasses', 'gewusst', T0 - 3 * DAY);
    p = recordOutcome(p, 'en-de', 'u2p1:glasses', 'gewusst', T0 - 3 * DAY);
    const ids = selectWords(gruppe1, 'en-de', p, T0, { art: 'faellig' }, seeded(3)).map((w) => w.id);
    expect(ids).toHaveLength(7);
    expect(ids).not.toContain('u2p1:hair');
    expect(ids.slice(-2)).toEqual(['u2p1:braces', 'u2p1:glasses']);
  });

  it('fällig: richtet sich nach dem Fach des jeweiligen Modus', () => {
    const p = recordOutcome(emptyProgress(), 'en-de', 'u2p1:hair', 'gewusst', T0);
    expect(start('en-de', gruppe1, p).wordIds).toHaveLength(7);
    expect(start('de-en', gruppe1, p).wordIds).toHaveLength(8);
    expect(start('schreiben', gruppe1, p).wordIds).toHaveLength(8);
  });

  it('nichts fällig → Sitzung sofort beendet', () => {
    let p = emptyProgress();
    for (const w of gruppe1) p = recordOutcome(p, 'en-de', w.id, 'gewusst', T0);
    const session = start('en-de', gruppe1, p);
    expect(isFinished(session)).toBe(true);
    expect(currentWord(session)).toBeUndefined();
    expect(session.schreib).toBeNull();
    expect(() => answerCard(session, true)).toThrow();
  });

  it('frei: alle Wörter, auch nicht fällige', () => {
    let p = emptyProgress();
    for (const w of gruppe1) p = recordOutcome(p, 'en-de', w.id, 'gewusst', T0);
    const session = createSession({ mode: 'en-de', words: gruppe1, progress: p, now: T0, auswahl: { art: 'frei' }, random: seeded(2) });
    expect([...session.wordIds].sort()).toEqual(gruppe1.map((w) => w.id).sort());
  });

  it('frei mit Fach: nur die Wörter dieses Fachs, Fälligkeit egal; nie geübte liegen in Fach 1', () => {
    let p = recordOutcome(emptyProgress(), 'en-de', 'u2p1:hair', 'gewusst', T0);
    p = recordOutcome(p, 'en-de', 'u2p1:curly', 'gewusst', T0);
    const frei = (fach: 1 | 2 | 3) =>
      createSession({ mode: 'en-de', words: gruppe1, progress: p, now: T0, auswahl: { art: 'frei', fach }, random: seeded(2) }).wordIds;
    expect([...frei(2)].sort()).toEqual(['u2p1:curly', 'u2p1:hair']);
    expect(frei(1)).toHaveLength(6);
    expect(frei(3)).toEqual([]);
  });

  it('beachtet limit', () => {
    expect(createSession({ mode: 'en-de', words, progress: emptyProgress(), now: T0, limit: 5 }).wordIds).toHaveLength(5);
    expect(isFinished(createSession({ mode: 'en-de', words, progress: emptyProgress(), now: T0, limit: 0 }))).toBe(true);
  });
});

describe('Karten-Modi', () => {
  it.each(['en-de', 'de-en'] as const)('%s: gewusst → Stern, Eintrag, nächstes Wort', (mode) => {
    const session = start(mode);
    const first = currentWord(session)!;
    const t = answerCard(session, true);
    expect(t.record).toEqual({ wordId: first.id, outcome: 'gewusst' });
    expect(t.stars).toBe(1);
    expect(t.session.queue).toEqual(session.queue.slice(1));
    expect(t.session.schreib).toBeNull();
  });

  it('nicht gewusst → kein Stern, kein Abzug, Eintrag „nicht gewusst“', () => {
    const session = start('en-de');
    const t = answerCard(session, false);
    expect(t.record).toEqual({ wordId: session.queue[0], outcome: 'nicht-gewusst' });
    expect(t.stars).toBe(0);
    expect(t.session.stars).toBe(0);
  });

  it('kennt kein Tippen', () => {
    expect(() => submitWriting(start('en-de'), 'hero')).toThrow();
    expect(() => revealWriting(start('de-en'))).toThrow();
  });

  it('alles gewusst → nach 8 Antworten fertig', () => {
    let session = start('de-en');
    for (let i = 0; i < 8; i++) session = answer(session, true);
    expect(isFinished(session)).toBe(true);
    expect(summarizeSession(session)).toEqual({ total: 8, known: 8, unknown: [], stars: 8 });
  });
});

describe('Wiederholung in derselben Sitzung', () => {
  it(`nicht Gewusstes kommt nach ${REQUEUE_GAP} neuen Wörtern wieder`, () => {
    const session = start('en-de');
    const missed = session.queue[0];
    const after = answerCard(session, false).session;
    expect(after.queue.indexOf(missed)).toBe(REQUEUE_GAP);
    expect(after.queue).toHaveLength(8);
  });

  it('die Wiederholung zählt nicht mehr für den Karteikasten, gibt aber einen Stern', () => {
    let session = start('en-de');
    const missed = session.queue[0];
    session = answerCard(session, false).session;
    for (let i = 0; i < REQUEUE_GAP; i++) session = answerCard(session, true).session;
    expect(session.queue[0]).toBe(missed);
    expect(sessionProgress(session).isRepeat).toBe(true);
    const t = answerCard(session, true);
    expect(t.record).toBeNull();
    expect(t.stars).toBe(1);
    expect(t.session.queue).not.toContain(missed);
  });

  it('am Ende der Sitzung kommt es hinter alle neuen Wörter', () => {
    let session = start('en-de');
    for (let i = 0; i < 7; i++) session = answerCard(session, true).session;
    const last = session.queue[0];
    session = answerCard(session, false).session;
    expect(session.queue).toEqual([last]);
    expect(isFinished(session)).toBe(false);
  });

  it(`höchstens ${MAX_REPEATS} Wiederholungen je Wort – die Sitzung endet immer`, () => {
    let session = start('en-de', gruppe1.slice(0, 1));
    let answers = 0;
    while (!isFinished(session)) {
      session = answerCard(session, false).session;
      answers++;
      expect(answers).toBeLessThanOrEqual(1 + MAX_REPEATS);
    }
    expect(answers).toBe(1 + MAX_REPEATS);
  });

  it('endet auch, wenn alles immer falsch ist', () => {
    for (const mode of ['en-de', 'schreiben'] as const) {
      let session = start(mode);
      let steps = 0;
      while (!isFinished(session)) {
        session = answer(session, false);
        expect(++steps).toBeLessThanOrEqual(8 * (1 + MAX_REPEATS));
      }
      expect(steps).toBe(8 * (1 + MAX_REPEATS));
      expect(summarizeSession(session).known).toBe(0);
    }
  });

  it('Wiederholungen halten neue Wörter nicht auf', () => {
    let session = start('en-de');
    for (let i = 0; i < 4; i++) session = answerCard(session, false).session;
    // Nach vier Fehlern in Folge kreisen nicht nur diese vier: Jede Wiederholung wechselt sich mit einem neuen Wort ab.
    const isNew = session.queue.map((id) => session.firstOutcomes[id] === undefined);
    expect(isNew).toEqual([false, true, false, true, false, true, false, true]);
  });
});

describe('Schreib-Modus', () => {
  it('startet mit der Eingabe für das erste Wort', () => {
    const session = start('schreiben');
    expect(session.schreib).toMatchObject({ phase: 'eingabe', accept: currentWord(session)!.accept, diff: null });
    expect(() => answerCard(session, true)).toThrow();
  });

  it('sofort richtig → Stern, gewusst, nächstes Wort mit frischer Eingabe', () => {
    const session = start('schreiben');
    const word = currentWord(session)!;
    const t = submitWriting(session, `  ${word.accept[0].toUpperCase()} `);
    expect(t.schreib.phase).toBe('richtig');
    expect(t.record).toEqual({ wordId: word.id, outcome: 'gewusst' });
    expect(t.stars).toBe(1);
    expect(currentWord(t.session)!.id).toBe(session.queue[1]);
    expect(t.session.schreib).toMatchObject({ phase: 'eingabe', accept: currentWord(t.session)!.accept });
  });

  it('falsch → kein Abzug, richtiges Wort zeigen, abschreiben; sofort Fach 1', () => {
    const session = start('schreiben');
    const word = currentWord(session)!;
    const t = submitWriting(session, 'xyzxyz');
    expect(t.schreib.phase).toBe('abschreiben');
    expect(t.schreib.diff?.errors).toBeGreaterThan(0);
    expect(t.record).toEqual({ wordId: word.id, outcome: 'nicht-gewusst' });
    expect(t.stars).toBe(0);
    expect(t.session.stars).toBe(0);
    expect(currentWord(t.session)!.id).toBe(word.id);
    expect(t.session.schreib).toBe(t.schreib);
  });

  it('falsch abgeschrieben → bleibt beim Wort, so oft wie nötig, ohne weiteren Eintrag', () => {
    let session = submitWriting(start('schreiben'), 'xyzxyz').session;
    const word = currentWord(session)!;
    for (let i = 1; i <= 4; i++) {
      const t = submitWriting(session, 'immer noch falsch');
      expect(t.schreib).toMatchObject({ phase: 'abschreiben', copyMisses: i });
      expect(t.record).toBeNull();
      expect(t.stars).toBe(0);
      expect(currentWord(t.session)!.id).toBe(word.id);
      expect(t.session.queue).toEqual(session.queue);
      session = t.session;
    }
  });

  it('richtig abgeschrieben → Stern fürs Durchhalten, weiter, Wort kommt später wieder', () => {
    const session = start('schreiben');
    const word = currentWord(session)!;
    const copying = submitWriting(session, 'xyzxyz').session;
    const t = submitWriting(copying, word.accept[0]);
    expect(t.schreib.phase).toBe('weiter');
    expect(t.record).toBeNull();
    expect(t.stars).toBe(1);
    expect(t.session.stars).toBe(1);
    expect(currentWord(t.session)!.id).not.toBe(word.id);
    expect(t.session.queue.indexOf(word.id)).toBe(REQUEUE_GAP);
    expect(t.session.schreib?.phase).toBe('eingabe');
  });

  it('„weiß ich nicht“ → abschreiben ohne Fehlermarkierung, zählt als nicht gewusst', () => {
    const session = start('schreiben');
    const t = revealWriting(session);
    expect(t.schreib).toMatchObject({ phase: 'abschreiben', diff: null });
    expect(t.record).toEqual({ wordId: session.queue[0], outcome: 'nicht-gewusst' });
    expect(t.stars).toBe(0);
  });

  it('Wiederholung richtig getippt → kein neuer Eintrag, aber ein Stern', () => {
    let session = start('schreiben');
    const word = currentWord(session)!;
    session = answer(session, false);
    for (let i = 0; i < REQUEUE_GAP; i++) session = answer(session, true);
    expect(currentWord(session)!.id).toBe(word.id);
    const t = submitWriting(session, word.accept[0]);
    expect(t.schreib.phase).toBe('richtig');
    expect(t.record).toBeNull();
    expect(t.stars).toBe(1);
  });

  it('letztes Wort geschafft → Sitzung beendet, keine Schreib-Aufgabe mehr', () => {
    let session = start('schreiben', gruppe1.slice(0, 2));
    session = answer(session, true);
    session = answer(session, true);
    expect(isFinished(session)).toBe(true);
    expect(session.schreib).toBeNull();
    expect(() => submitWriting(session, 'x')).toThrow();
  });
});

describe('Fortschritt der Sitzung', () => {
  it('zählt Erledigtes, Gewusstes, Wiederholungen und Sterne', () => {
    let session = start('en-de');
    expect(sessionProgress(session)).toEqual({ done: 0, total: 8, known: 0, repeatsLeft: 0, isRepeat: false, stars: 0 });
    session = answerCard(session, true).session;
    session = answerCard(session, false).session;
    expect(sessionProgress(session)).toEqual({ done: 2, total: 8, known: 1, repeatsLeft: 1, isRepeat: false, stars: 1 });
  });

  it('Abschreiben beim ersten Versuch ist noch keine Wiederholung', () => {
    const copying = submitWriting(start('schreiben'), 'xyzxyz').session;
    expect(sessionProgress(copying)).toMatchObject({ done: 1, known: 0, isRepeat: false });
  });

  it('Auswertung nennt die Wörter zum Nochmal-Üben; Wiederholungen ändern das Ergebnis nicht', () => {
    let session = start('schreiben');
    const missed = currentWord(session)!;
    session = answer(session, false);
    while (!isFinished(session)) session = answer(session, true);
    // 7 sofort richtig + 1 abgeschrieben + 1 in der Wiederholung richtig
    expect(summarizeSession(session)).toEqual({ total: 8, known: 7, unknown: [missed], stars: 9 });
  });
});

describe('applyResult', () => {
  it('trägt Fach, Sterne und Übungstag ein', () => {
    const session = start('schreiben');
    const word = currentWord(session)!;
    const p = applyResult(emptyProgress(), 'schreiben', submitWriting(session, word.accept[0]), T0);
    expect(getItemProgress(p, 'schreiben', word.id)).toEqual({ box: 2, correct: 1, wrong: 0, lastPracticed: T0 });
    expect(p.rewards).toEqual({ stars: 1, streak: 1, longestStreak: 1, lastDay: dayKey(T0) });
    expect(getItemProgress(p, 'en-de', word.id).box).toBe(1);
  });

  it('falsch getippt: Fach 1, kein Stern, kein Abzug – der Tag zählt trotzdem als geübt', () => {
    let p = emptyProgress();
    const session = start('schreiben');
    const word = currentWord(session)!;
    for (let i = 0; i < 3; i++) p = recordOutcome(p, 'schreiben', word.id, 'gewusst', T0 - DAY);
    p = { ...p, rewards: { ...p.rewards, stars: 10 } };

    const wrong = submitWriting(session, 'xyzxyz');
    p = applyResult(p, 'schreiben', wrong, T0);
    expect(getItemProgress(p, 'schreiben', word.id)).toMatchObject({ box: 1, wrong: 1 });
    expect(p.rewards.stars).toBe(10);
    expect(p.rewards.lastDay).toBe(dayKey(T0));

    const copied = submitWriting(wrong.session, word.accept[0]);
    p = applyResult(p, 'schreiben', copied, T0);
    expect(getItemProgress(p, 'schreiben', word.id)).toMatchObject({ box: 1, wrong: 1 });
    expect(p.rewards.stars).toBe(11);
  });

  it('Schritt ohne Ergebnis (falsch abgeschrieben) ändert nichts', () => {
    const copying = submitWriting(start('schreiben'), 'xyzxyz').session;
    const p = emptyProgress();
    expect(applyResult(p, 'schreiben', submitWriting(copying, 'falsch'), T0)).toBe(p);
  });

  it('eine ganze Sitzung: jedes Wort einmal im Karteikasten, Sterne nie weniger', () => {
    let p = emptyProgress();
    let session = start('de-en');
    let i = 0;
    let lastStars = 0;
    while (!isFinished(session)) {
      const t = answerCard(session, i++ % 3 !== 0);
      p = applyResult(p, 'de-en', t, T0);
      expect(p.rewards.stars).toBeGreaterThanOrEqual(lastStars);
      lastStars = p.rewards.stars;
      session = t.session;
    }
    const summary = summarizeSession(session);
    for (const w of gruppe1) {
      const item = getItemProgress(p, 'de-en', w.id);
      expect(item.correct + item.wrong).toBe(1);
      expect(item.box).toBe(summary.unknown.includes(w) ? 1 : 2);
    }
    expect(p.rewards.stars).toBe(summary.stars);
    expect(p.rewards.streak).toBe(1);
  });
});
