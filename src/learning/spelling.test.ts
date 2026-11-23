import { checkAnswer, diffSpelling, isCorrect, normalizeAnswer, type DiffChar } from './spelling';

/** Kurzschrift für Diffs: `h e [r] o` – ok ohne Zeichen, falsch `x`, fehlt `-`, zuviel `+`, vertauscht `~`. */
function show(chars: DiffChar[]): string {
  const mark = { ok: '', falsch: 'x', fehlt: '-', zuviel: '+', vertauscht: '~' } as const;
  return chars.map((c) => `${mark[c.status]}${c.char}`).join(' ');
}

describe('normalizeAnswer', () => {
  it.each([
    ['  Hero  ', 'hero'],
    ['no   one    else', 'no one else'],
    ['hero.', 'hero'],
    ['"hero"!', 'hero'],
    ['hero, heroes', 'hero heroes'],
    ['to make sb. do sth.', 'to make sb do sth'],
    ['no one / nobody', 'no one/nobody'],
    ['hurt, hurt (past)', 'hurt hurt'],
    ['don’t', "don't"],
    ['don`t', "don't"],
    ['Hard-Working', 'hard-working'],
    ['   ', ''],
  ])('%j → %j', (input, expected) => {
    expect(normalizeAnswer(input)).toBe(expected);
  });
});

describe('isCorrect', () => {
  it('Groß/Klein, Leerzeichen und Satzzeichen am Rand sind egal', () => {
    expect(isCorrect('MOON', ['moon'])).toBe(true);
    expect(isCorrect('  head   student ', ['head student'])).toBe(true);
    expect(isCorrect('moon.', ['moon'])).toBe(true);
    expect(isCorrect('moon!', ['moon'])).toBe(true);
  });

  it('führendes „to “ ist optional – in beide Richtungen', () => {
    expect(isCorrect('save', ['to save'])).toBe(true);
    expect(isCorrect('to save', ['to save'])).toBe(true);
    expect(isCorrect('to finish', ['finish'])).toBe(true);
    expect(isCorrect('To  Marry', ['to marry'])).toBe(true);
  });

  it('„to“ wird nur als eigenes Wort am Anfang weggelassen', () => {
    expect(isCorrect('morrow', ['tomorrow'])).toBe(false);
    expect(isCorrect('to', ['to save'])).toBe(false);
    expect(isCorrect('go save', ['go to save'])).toBe(false);
  });

  it('typografische und gerade Apostrophe sind gleich', () => {
    expect(isCorrect('don’t', ["don't"])).toBe(true);
    expect(isCorrect("don't", ['don’t'])).toBe(true);
  });

  it('jede Schreibweise aus accept gilt', () => {
    const accept = ['no one', 'nobody', 'no one/nobody'];
    expect(isCorrect('nobody', accept)).toBe(true);
    expect(isCorrect('No one', accept)).toBe(true);
    expect(isCorrect('no one/nobody', accept)).toBe(true);
  });

  it('Tippfehler sind falsch – es gibt kein „fast richtig“', () => {
    expect(isCorrect('mon', ['moon'])).toBe(false);
    expect(isCorrect('freind', ['friend'])).toBe(false);
    expect(isCorrect('hard working', ['hard-working'])).toBe(false);
  });

  it('leere Eingabe ist nie richtig', () => {
    expect(isCorrect('', ['moon'])).toBe(false);
    expect(isCorrect('  . ', ['moon'])).toBe(false);
    expect(isCorrect('moon', [])).toBe(false);
  });

  it('kennt keine deutschen Sonderregeln mehr', () => {
    expect(isCorrect('strasse', ['straße'])).toBe(false);
    expect(isCorrect('ueber', ['über'])).toBe(false);
  });
});

describe('diffSpelling', () => {
  it('richtig: alle Buchstaben ok, keine Fehler', () => {
    const diff = diffSpelling('Moon', ['moon']);
    expect(diff.errors).toBe(0);
    expect(show(diff.expected)).toBe('m o o n');
    expect(show(diff.typed)).toBe('m o o n');
  });

  it('falscher Buchstabe', () => {
    const diff = diffSpelling('lasy', ['lazy']);
    expect(diff.errors).toBe(1);
    expect(show(diff.expected)).toBe('l a xz y');
    expect(show(diff.typed)).toBe('l a xs y');
  });

  it('fehlender Buchstabe steht nur im richtigen Wort', () => {
    const diff = diffSpelling('strait', ['straight']);
    expect(diff.errors).toBe(2);
    expect(show(diff.expected)).toBe('s t r a i -g -h t');
    expect(show(diff.typed)).toBe('s t r a i t');
  });

  it('Buchstabe zu viel steht nur im Getippten', () => {
    const diff = diffSpelling('planett', ['planet']);
    expect(diff.errors).toBe(1);
    expect(show(diff.expected)).toBe('p l a n e t');
    expect(diff.typed.filter((c) => c.status === 'zuviel')).toEqual([{ char: 't', status: 'zuviel' }]);
  });

  it('vertauschte Nachbarn zählen als EIN Fehler und sind beide markiert', () => {
    const diff = diffSpelling('eatrh', ['earth']);
    expect(diff.errors).toBe(1);
    expect(show(diff.expected)).toBe('e a ~r ~t h');
    expect(show(diff.typed)).toBe('e a ~t ~r h');
  });

  it('vergleicht mit der ähnlichsten gültigen Schreibweise', () => {
    const accept = ['no one', 'nobody', 'no one/nobody'];
    expect(diffSpelling('nobdy', accept).target).toBe('nobody');
    expect(diffSpelling('no on', accept).target).toBe('no one');
    expect(diffSpelling('hero, heros', ['hero', 'hero, heroes']).target).toBe('hero heroes');
  });

  it('bei Gleichstand gewinnt die frühere Schreibweise (Grundform)', () => {
    expect(diffSpelling('', ['hero', 'hero, heroes']).target).toBe('hero');
    expect(diffSpelling('xyz', ['abc', 'def']).target).toBe('abc');
  });

  it('fehlendes „to “ ist kein Fehler, bleibt im richtigen Wort aber sichtbar', () => {
    const diff = diffSpelling('mary', ['to marry']);
    expect(diff.target).toBe('to marry');
    expect(diff.errors).toBe(1);
    // Welches der beiden r als fehlend gilt, ist beliebig.
    expect(show(diff.expected).replace('-r r', 'r -r')).toBe('t o   m a r -r y');
    expect(show(diff.typed)).toBe('m a r y');
  });

  it('getipptes „to “ ist kein Fehler, auch wenn die Schreibweise keins hat', () => {
    const diff = diffSpelling('to finsh', ['finish']);
    expect(diff.errors).toBe(1);
    expect(show(diff.expected)).toBe('f i n -i s h');
    expect(show(diff.typed)).toBe('t o   f i n s h');
  });

  it('leere Eingabe: alles fehlt', () => {
    const diff = diffSpelling('  ', ['shy']);
    expect(diff.errors).toBe(3);
    expect(show(diff.expected)).toBe('-s -h -y');
    expect(diff.typed).toEqual([]);
  });

  it('expected ergibt zusammengesetzt target, typed die vereinheitlichte Eingabe', () => {
    for (const [input, accept] of [
      ['to mak sombody do somthing', ['to make sb do sth', 'to make somebody do something']],
      ['persnoality', ['personality']],
      ['Think  of', ['think of sb/sth']],
    ] as const) {
      const diff = diffSpelling(input, accept);
      expect(diff.expected.map((c) => c.char).join('')).toBe(diff.target);
      expect(diff.typed.map((c) => c.char).join('')).toBe(diff.input);
      expect(diff.input).toBe(normalizeAnswer(input));
    }
  });
});

describe('checkAnswer', () => {
  it('liefert Urteil und Diff zusammen', () => {
    expect(checkAnswer('Hero', ['hero', 'hero, heroes'])).toMatchObject({ correct: true, diff: { errors: 0, target: 'hero' } });
    expect(checkAnswer('hiro', ['hero', 'hero, heroes'])).toMatchObject({ correct: false, diff: { errors: 1, target: 'hero' } });
  });

  it('correct und errors === 0 stimmen überein', () => {
    const accept = ['to grow up', 'to grow up, grew up'];
    for (const input of ['grow up', 'to grow up', 'grow up, grew up', 'grow', 'grew up', 'to gro up', '']) {
      const { correct, diff } = checkAnswer(input, accept);
      expect([input, diff.errors === 0]).toEqual([input, correct]);
    }
  });
});
