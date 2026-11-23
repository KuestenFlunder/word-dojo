import { isCorrect } from '../learning/spelling';
import { allWords, getSet, getWord, groupsOf, unit2part1, vocabSets, wordsOfGroup } from './index';

const word = (slug: string) => getWord(`u2p1:${slug}`)!;

describe('Unit 2 part 1', () => {
  it('hat 56 Wörter in 7 Gruppen zu je 8', () => {
    expect(unit2part1.words).toHaveLength(56);
    expect(groupsOf(unit2part1)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    for (const group of groupsOf(unit2part1)) expect(wordsOfGroup(unit2part1, group)).toHaveLength(8);
  });

  it('steht in Buch-Reihenfolge', () => {
    expect(unit2part1.words[0].en).toBe('hero, heroes');
    expect(unit2part1.words[8].en).toBe('confident');
    expect(unit2part1.words[55].en).toBe('chemical');
    expect(wordsOfGroup(unit2part1, 4).map((w) => w.en)).toEqual([
      'underwater',
      'hurt, hurt (past)',
      'leave, left (past)',
      'to marry',
      'to grow up, grew up',
      'who',
      'finish',
      'off',
    ]);
  });

  it('hat eindeutige, stabile IDs und vollständige Einträge', () => {
    const ids = allWords().map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids[0]).toBe('u2p1:hero');
    for (const w of allWords()) {
      expect(w.id).toMatch(/^u2p1:[a-z-]+$/);
      expect(w.en.trim()).not.toBe('');
      expect(w.de.trim()).not.toBe('');
      expect(w.accept.length).toBeGreaterThan(0);
    }
  });

  it('ist über die Set-Liste erreichbar', () => {
    expect(vocabSets).toContain(unit2part1);
    expect(getSet('unit2part1')).toBe(unit2part1);
    expect(getSet('gibt-es-nicht')).toBeUndefined();
    expect(getWord('u2p1:moon')?.de).toBe('Mond');
  });

  it('akzeptiert bei jedem Wort die angezeigte englische Form', () => {
    for (const w of allWords()) expect([w.en, isCorrect(w.en, w.accept)]).toEqual([w.en, true]);
  });
});

describe('gültige Schreibweisen', () => {
  it.each([
    ['hero', ['hero', 'hero, heroes', 'hero heroes', 'Hero']],
    ['no-one', ['no one', 'nobody', 'no one/nobody', 'no one / nobody']],
    ['make-sb-do-sth', ['to make sb do sth', 'make sb do sth', 'to make somebody do something', 'make somebody do something', 'to make sb. do sth.']],
    ['hurt', ['hurt', 'hurt, hurt', 'hurt, hurt (past)']],
    ['leave', ['leave', 'leave, left']],
    ['think-of', ['think of', 'think of sb/sth', 'think of somebody/something', 'think of sb./sth.']],
    ['life', ['life', 'life, lives']],
    ['grow-up', ['grow up', 'to grow up', 'to grow up, grew up', 'grow up, grew up']],
    ['spend-time', ['spend time', 'spend time, spent']],
    ['become', ['become', 'become, became']],
    ['get', ['get', 'get, got']],
    ['save', ['save', 'to save']],
    ['laugh-at', ['laugh at', 'to laugh at']],
  ])('%s', (slug, inputs) => {
    for (const input of inputs) expect([input, isCorrect(input, word(slug).accept)]).toEqual([input, true]);
  });

  it.each([
    ['hero', ['heroes', 'heros', 'her']],
    ['no-one', ['no', 'noone', 'no body']],
    ['leave', ['left', 'leaf']],
    ['think-of', ['think', 'think off']],
    ['laugh-at', ['laugh', 'to']],
    ['hard-working', ['hardworking', 'hard working']],
  ])('%s: nicht gültig', (slug, inputs) => {
    for (const input of inputs) expect([input, isCorrect(input, word(slug).accept)]).toEqual([input, false]);
  });
});
