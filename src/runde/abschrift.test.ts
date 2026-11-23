import type { Vocab } from '@/data';
import { checkAnswer, type DiffChar } from '@/learning/spelling';

import { abschrift, aufSchreibweise, markierungSinnvoll } from './abschrift';

const wort = (en: string, ...accept: string[]): Vocab => ({ id: 't:x', en, de: 'x', accept: accept.length ? accept : [en], group: 1 });
const text = (zeichen: readonly DiffChar[]) => zeichen.map((z) => z.char).join('');
const marken = (zeichen: readonly DiffChar[]) => zeichen.filter((z) => z.status !== 'ok').map((z) => z.char).join('');
const diff = (eingabe: string, w: Vocab) => checkAnswer(eingabe, w.accept).diff;

describe('markierungSinnvoll', () => {
  const z = (s: string, falsch: string): DiffChar[] => [...s].map((char) => ({ char, status: falsch.includes(char) ? 'falsch' : 'ok' }));

  it('markiert bis zur Hälfte der Buchstaben, darüber nicht', () => {
    expect(markierungSinnvoll(z('abcd', 'a'))).toBe(true);
    expect(markierungSinnvoll(z('abcd', 'ab'))).toBe(true);
    expect(markierungSinnvoll(z('abcd', 'abc'))).toBe(false);
  });

  it('zählt Leerzeichen nicht mit und markiert nichts, wenn nichts falsch ist', () => {
    expect(markierungSinnvoll(z('ab cd', 'abc'))).toBe(false);
    expect(markierungSinnvoll(z('abcd', ''))).toBe(false);
  });
});

describe('abschrift', () => {
  it('markiert einen einzelnen Fehler in Vorlage und Eingabe', () => {
    const w = wort('confident');
    const a = abschrift(w, diff('confidant', w));
    expect(a.markiert).toBe(true);
    expect(text(a.vorlage)).toBe('confident');
    expect(marken(a.vorlage)).toBe('e');
    expect(marken(a.eigenes)).toBe('a');
  });

  it('zeigt bei einer Eingabe ganz daneben beide Zeilen ohne Markierung', () => {
    const w = wort('positive');
    const a = abschrift(w, diff('xqz', w));
    expect(a.markiert).toBe(false);
    expect(text(a.vorlage)).toBe('positive');
    expect(marken(a.vorlage)).toBe('');
    expect(text(a.eigenes)).toBe('xqz');
    expect(marken(a.eigenes)).toBe('');
  });

  it('zeigt die Vorlage in der echten Schreibweise: Bindestrich, Großbuchstaben, Punkte', () => {
    const bindestrich = wort('hard-working');
    expect(text(abschrift(bindestrich, diff('hardworking', bindestrich)).vorlage)).toBe('hard-working');
    expect(marken(abschrift(bindestrich, diff('hardworking', bindestrich)).vorlage)).toBe('-');

    const gross = wort('Monday');
    const a = abschrift(gross, diff('munday', gross));
    expect(text(a.vorlage)).toBe('Monday');
    expect(marken(a.vorlage)).toBe('o');

    const punkte = wort('think of sb./sth.', 'think of', 'think of sb./sth.');
    const b = abschrift(punkte, diff('think of sb/stz', punkte));
    expect(text(b.vorlage)).toBe('think of sb./sth.');
    expect(marken(b.vorlage)).toBe('h');
  });

  it('nimmt die Schreibweise, mit der verglichen wurde', () => {
    const w = wort('hero, heroes', 'hero', 'hero, heroes');
    expect(text(abschrift(w, diff('herro', w)).vorlage)).toBe('hero');
    expect(text(abschrift(w, diff('hero, heros', w)).vorlage)).toBe('hero, heroes');
  });

  it('zeigt nach „Weiß ich nicht“ die Grundform ohne Markierung und ohne eigene Zeile', () => {
    const w = wort('to save');
    expect(abschrift(w, null)).toEqual({ vorlage: [...'to save'].map((char) => ({ char, status: 'ok' })), eigenes: [], markiert: false });
  });
});

describe('aufSchreibweise', () => {
  it('liefert null, wenn die Schreibweise nicht zum Vergleich passt', () => {
    expect(aufSchreibweise('moon', [{ char: 's', status: 'ok' }])).toBeNull();
  });
});
