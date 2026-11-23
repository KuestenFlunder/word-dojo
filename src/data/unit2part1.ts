/** Unit 2, part 1 – 56 Wörter in 7 Gruppen zu je 8, in Buch-Reihenfolge. */
import type { Vocab, VocabSet } from './types';

/** Kurzform: [id-Endung, Englisch, Deutsch, weitere gültige Schreibweisen …]. Ohne Angabe gilt nur `en`. */
type Row = readonly [slug: string, en: string, de: string, ...accept: string[]];

const GROUPS: readonly (readonly Row[])[] = [
  [
    ['hero', 'hero, heroes', 'Held', 'hero', 'hero, heroes', 'hero heroes'],
    ['head-student', 'head student', 'Vertrauensschüler'],
    ['hair', 'hair', 'Haar/e'],
    ['braces', 'braces', 'Zahnspange'],
    ['glasses', 'glasses', 'Brille'],
    ['curly', 'curly', 'lockig'],
    ['straight', 'straight', 'glatt (Haare)'],
    ['hard-working', 'hard-working', 'fleißig'],
  ],
  [
    ['confident', 'confident', 'selbstbewusst'],
    [
      'make-sb-do-sth',
      'to make sb. do sth.',
      'jmd. dazu bringen, etw. zu tun',
      'to make sb do sth',
      'make sb do sth',
      'to make somebody do something',
      'make somebody do something',
    ],
    ['laugh-at', 'to laugh at', 'lachen (über)'],
    ['strong', 'strong', 'stark'],
    ['tall', 'tall', 'groß (Körper)'],
    ['reliable', 'reliable', 'verlässlich'],
    ['patient', 'patient', 'geduldig'],
    ['shy', 'shy', 'schüchtern'],
  ],
  [
    ['personality', 'personality', 'Persönlichkeit'],
    ['yourself', 'yourself', 'du/dich/dir selbst'],
    ['no-one', 'no one/nobody', 'niemand', 'no one', 'nobody', 'no one/nobody'],
    ['no-one-else', 'no one else', 'niemand anders'],
    ['think-of', 'think of sb./sth.', 'an jmd./etw. denken', 'think of', 'think of sb/sth', 'think of somebody/something'],
    ['moon', 'moon', 'Mond'],
    ['save', 'to save', 'sparen, retten, speichern'],
    ['life', 'life, lives', 'das Leben, die Leben', 'life', 'life, lives'],
  ],
  [
    ['underwater', 'underwater', 'unter Wasser'],
    ['hurt', 'hurt, hurt (past)', 'verletzen, wehtun', 'hurt', 'hurt, hurt'],
    ['leave', 'leave, left (past)', 'verlassen, lassen, zurücklassen', 'leave', 'leave, left'],
    ['marry', 'to marry', 'heiraten'],
    ['grow-up', 'to grow up, grew up', 'aufwachsen', 'to grow up', 'to grow up, grew up'],
    ['who', 'who', 'wen, wem'],
    ['finish', 'finish', 'beenden, enden'],
    ['off', 'off', 'weg von, hinunter von'],
  ],
  [
    ['come-off', 'come off', 'abgehen, sich lösen'],
    ['fall-off', 'fall off', 'herunterfallen'],
    ['get-off', 'get off', 'absteigen, aussteigen'],
    ['activist', 'activist', 'der Aktivist'],
    ['artist', 'artist', 'Künstler'],
    ['opposite', 'opposite', 'Gegenteil'],
    ['lazy', 'lazy', 'faul'],
    ['spend-time', 'spend time, spent', 'Zeit verbringen', 'spend time', 'spend time, spent'],
  ],
  [
    ['positive', 'positive', 'positiv'],
    ['take-notes', 'take notes', 'Notizen machen'],
    ['he-was-born', 'he was born', 'er wurde geboren'],
    ['earth', 'earth', 'Erde'],
    ['become', 'become, became', 'werden, wurde/n', 'become', 'become, became'],
    ['get', 'get, got', 'bekommen', 'get', 'get, got'],
    ['power', 'power', 'Kraft, Macht, Energie'],
    ['planet', 'planet', 'Planet'],
  ],
  [
    ['far', 'far', 'weit'],
    ['any', 'any', 'jeder/jeglicher'],
    ['metal', 'metal', 'Metall'],
    ['body', 'body', 'Körper'],
    ['boot', 'boot', 'Stiefel'],
    ['helmet', 'helmet', 'Helm'],
    ['dare', 'dare', 'trauen, Mutprobe'],
    ['chemical', 'chemical', 'die Chemikalie, chemisch'],
  ],
];

const words: Vocab[] = GROUPS.flatMap((rows, g) =>
  rows.map(([slug, en, de, ...accept]) => ({
    id: `u2p1:${slug}`,
    en,
    de,
    accept: accept.length > 0 ? accept : [en],
    group: g + 1,
  })),
);

export const unit2part1: VocabSet = {
  id: 'unit2part1',
  title: 'Unit 2 · Part 1',
  words,
};
