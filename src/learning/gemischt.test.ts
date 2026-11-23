import type { Vocab } from '../data/types';
import { createMixedSession, GEMISCHT_MODI, mixedDueWords, selectMixedTasks } from './gemischt';
import { emptyProgress, getItemProgress, recordOutcome, type Mode, type Progress } from './progress';
import { answerCard, applyResult, currentWord, isFinished, modeOfWord, submitWriting, summarizeSession, type Session } from './session';

const NOW = Date.UTC(2026, 10, 23, 12);
const wort = (i: number): Vocab => ({ id: `t:w${i}`, en: `word${i}`, de: `Wort${i}`, accept: [`word${i}`], group: 1 });
const WOERTER = Array.from({ length: 12 }, (_, i) => wort(i));

/** Deterministische Zufallsquelle. */
function zufall(seed = 1): () => number {
  let x = seed;
  return () => {
    x = (x * 1103515245 + 12345) % 2147483648;
    return x / 2147483648;
  };
}

function alleGewusst(progress: Progress, mode: Mode, words: readonly Vocab[]): Progress {
  return words.reduce((p, w) => recordOutcome(p, mode, w.id, 'gewusst', NOW), progress);
}

describe('GEMISCHT_MODI', () => {
  it('mischt als Vorgabe alle drei Modi', () => {
    expect(GEMISCHT_MODI).toEqual(['de-en', 'en-de', 'schreiben']);
  });
});

describe('selectMixedTasks', () => {
  it('nimmt jedes Wort höchstens einmal und verteilt ausgewogen über die Modi', () => {
    const aufgaben = selectMixedTasks(WOERTER, emptyProgress(), NOW, { art: 'faellig' }, zufall(), 12);
    expect(aufgaben).toHaveLength(12);
    expect(new Set(aufgaben.map((a) => a.word.id)).size).toBe(12);
    for (const mode of GEMISCHT_MODI) expect(aufgaben.filter((a) => a.mode === mode)).toHaveLength(4);
  });

  it('hält die Rundengröße ein und bleibt ausgewogen, wenn sie nicht aufgeht', () => {
    const aufgaben = selectMixedTasks(WOERTER, emptyProgress(), NOW, { art: 'faellig' }, zufall(7), 7);
    expect(aufgaben).toHaveLength(7);
    const jeModus = GEMISCHT_MODI.map((mode) => aufgaben.filter((a) => a.mode === mode).length).sort();
    expect(jeModus).toEqual([2, 2, 3]);
  });

  it('nimmt nur fällige Paare; ein Wort wandert in einen Modus, in dem es fällig ist', () => {
    // Alles in de-en und en-de gerade gewusst (Fach 2, nicht fällig) – nur Schreiben ist dran.
    let progress = alleGewusst(emptyProgress(), 'de-en', WOERTER);
    progress = alleGewusst(progress, 'en-de', WOERTER);
    const aufgaben = selectMixedTasks(WOERTER, progress, NOW, { art: 'faellig' }, zufall(), 12);
    expect(aufgaben).toHaveLength(12);
    expect(aufgaben.every((a) => a.mode === 'schreiben')).toBe(true);
  });

  it('füllt mit anderen Modi auf, wenn einer wenig Fälliges hat', () => {
    // In Schreiben sind nur zwei Wörter fällig.
    const progress = alleGewusst(emptyProgress(), 'schreiben', WOERTER.slice(2));
    const aufgaben = selectMixedTasks(WOERTER, progress, NOW, { art: 'faellig' }, zufall(3), 12);
    expect(aufgaben).toHaveLength(12);
    expect(aufgaben.filter((a) => a.mode === 'schreiben')).toHaveLength(2);
    expect(aufgaben.filter((a) => a.mode === 'de-en')).toHaveLength(5);
    expect(aufgaben.filter((a) => a.mode === 'en-de')).toHaveLength(5);
  });

  it('zieht je Modus niedrige Fächer vor', () => {
    // w0–w5 liegen in de-en in Fach 2 und sind wieder fällig; w6–w11 sind neu (Fach 1).
    const frueher = NOW - 5 * 24 * 60 * 60 * 1000;
    const progress = WOERTER.slice(0, 6).reduce((p, w) => recordOutcome(p, 'de-en', w.id, 'gewusst', frueher), emptyProgress());
    const aufgaben = selectMixedTasks(WOERTER, progress, NOW, { art: 'faellig' }, zufall(), 6, ['de-en']);
    expect(aufgaben.map((a) => a.word.id).sort()).toEqual(WOERTER.slice(6).map((w) => w.id).sort());
  });

  it('ist leer, wenn nichts fällig ist – freies Üben geht trotzdem', () => {
    const progress = GEMISCHT_MODI.reduce((p, mode) => alleGewusst(p, mode, WOERTER), emptyProgress());
    expect(selectMixedTasks(WOERTER, progress, NOW)).toEqual([]);
    const frei = selectMixedTasks(WOERTER, progress, NOW, { art: 'frei' }, zufall(), 12);
    expect(frei).toHaveLength(12);
    expect(new Set(frei.map((a) => a.word.id)).size).toBe(12);
    for (const mode of GEMISCHT_MODI) expect(frei.filter((a) => a.mode === mode)).toHaveLength(4);
  });

  it('mischt nur die übergebenen Modi', () => {
    const aufgaben = selectMixedTasks(WOERTER, emptyProgress(), NOW, { art: 'faellig' }, zufall(), 12, ['de-en', 'en-de']);
    expect(aufgaben.filter((a) => a.mode === 'schreiben')).toHaveLength(0);
    expect(aufgaben.filter((a) => a.mode === 'de-en')).toHaveLength(6);
  });
});

describe('mixedDueWords', () => {
  it('zählt Wörter, die in mindestens einem gemischten Modus fällig sind', () => {
    expect(mixedDueWords(emptyProgress(), WOERTER, NOW)).toBe(12);
    // In einem Modus erledigt: die Wörter sind in den anderen noch dran.
    const einModus = alleGewusst(emptyProgress(), 'schreiben', WOERTER);
    expect(mixedDueWords(einModus, WOERTER, NOW)).toBe(12);
    expect(mixedDueWords(einModus, WOERTER, NOW, ['schreiben'])).toBe(0);
    // Vier Wörter in allen Modi erledigt: acht bleiben.
    const vierFertig = GEMISCHT_MODI.reduce((p, mode) => alleGewusst(p, mode, WOERTER.slice(0, 4)), emptyProgress());
    expect(mixedDueWords(vierFertig, WOERTER, NOW)).toBe(8);
  });
});

describe('gemischte Sitzung', () => {
  /** Beantwortet die aktuelle Aufgabe und trägt sie in den Kasten ihres Modus ein. */
  function antworten(session: Session, progress: Progress, gewusst: boolean): { session: Session; progress: Progress } {
    const mode = session.mode;
    const word = currentWord(session)!;
    expect(mode).toBe(modeOfWord(session, word.id));
    const t = mode === 'schreiben' ? submitWriting(session, gewusst ? word.accept[0] : 'xx') : answerCard(session, gewusst);
    let next = t.session;
    let p = applyResult(progress, mode, t, NOW);
    if (mode === 'schreiben' && !gewusst) {
      const kopie = submitWriting(next, word.accept[0]);
      next = kopie.session;
      p = applyResult(p, mode, kopie, NOW);
    }
    return { session: next, progress: p };
  }

  it('führt den Modus der aktuellen Aufgabe mit und stellt Schreib-Aufgaben bereit', () => {
    let session = createMixedSession({ words: WOERTER, progress: emptyProgress(), now: NOW, limit: 12, random: zufall(5) });
    let progress = emptyProgress();
    const gesehen = new Set<Mode>();
    while (!isFinished(session)) {
      const word = currentWord(session)!;
      expect(session.mode).toBe(session.wordModes![word.id]);
      expect(session.schreib === null).toBe(session.mode !== 'schreiben');
      gesehen.add(session.mode);
      ({ session, progress } = antworten(session, progress, true));
    }
    expect([...gesehen].sort()).toEqual([...GEMISCHT_MODI].sort());
    expect(session.schreib).toBeNull();
    expect(summarizeSession(session)).toMatchObject({ total: 12, known: 12, stars: 12 });
  });

  it('verbucht jede Aufgabe genau im Kasten ihres Modus', () => {
    let session = createMixedSession({ words: WOERTER, progress: emptyProgress(), now: NOW, limit: 12, random: zufall(9) });
    const modi = { ...session.wordModes! };
    let progress = emptyProgress();
    while (!isFinished(session)) ({ session, progress } = antworten(session, progress, true));
    for (const w of WOERTER) {
      for (const mode of GEMISCHT_MODI) {
        expect(getItemProgress(progress, mode, w.id).box).toBe(mode === modi[w.id] ? 2 : 1);
      }
    }
  });

  it('wiederholt nicht Gewusstes in der Runde im selben Modus', () => {
    let session = createMixedSession({ words: WOERTER.slice(0, 4), progress: emptyProgress(), now: NOW, random: zufall(2) });
    let progress = emptyProgress();
    const erstes = currentWord(session)!;
    const modus = session.mode;
    ({ session, progress } = antworten(session, progress, false));
    expect(session.queue.filter((id) => id === erstes.id)).toHaveLength(1);
    while (currentWord(session)!.id !== erstes.id) ({ session, progress } = antworten(session, progress, true));
    expect(session.mode).toBe(modus);
    expect(getItemProgress(progress, modus, erstes.id)).toMatchObject({ box: 1, wrong: 1 });
  });

  it('ist ohne passende Aufgaben sofort beendet', () => {
    const progress = GEMISCHT_MODI.reduce((p, mode) => alleGewusst(p, mode, WOERTER), emptyProgress());
    const session = createMixedSession({ words: WOERTER, progress, now: NOW });
    expect(isFinished(session)).toBe(true);
    expect(session.schreib).toBeNull();
  });
});
