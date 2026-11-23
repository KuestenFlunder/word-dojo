import type { Vocab } from '@/data';
import { emptyProgress, getItemProgress, recordOutcome, type Mode, type Progress } from '@/learning/progress';
import { applyResult } from '@/learning/session';

import { aufdecken, aufgabenNummer, aufstiege, bewerten, pruefen, starteRunde, weissNicht, weiter, type Runde, type Schritt } from './runde';

const NOW = Date.UTC(2026, 10, 23, 12);
const wort = (slug: string, de: string): Vocab => ({ id: `t:${slug}`, en: slug, de, accept: [slug], group: 1 });
const WOERTER: Vocab[] = [wort('moon', 'Mond'), wort('hair', 'Haar'), wort('shy', 'schüchtern')];
/** Hält die Reihenfolge der Wortliste (kein Mischen). */
const fest = () => 0.999;

function start(mode: Mode, progress: Progress = emptyProgress(), art: 'faellig' | 'frei' = 'faellig', words = WOERTER): Runde {
  return starteRunde({ mode, auswahl: { art }, words, progress, now: NOW, random: fest });
}

/** Trägt die Verbuchung eines Schritts ein, wie es die App tut. */
function eintragen(progress: Progress, mode: Mode, schritt: Schritt): Progress {
  return schritt.verbuchung ? applyResult(progress, mode, schritt.verbuchung, NOW) : progress;
}

describe('starteRunde', () => {
  it('beginnt Karten-Modi mit der Frage-Seite und Schreiben mit der Eingabe', () => {
    expect(start('de-en').ansicht).toBe('karte-frage');
    expect(start('en-de').ansicht).toBe('karte-frage');
    expect(start('schreiben').ansicht).toBe('schreiben');
    expect(start('schreiben').wort).toEqual(WOERTER[0]);
  });

  it('nimmt höchstens 12 Wörter', () => {
    const viele = Array.from({ length: 30 }, (_, i) => wort(`w${i}`, `d${i}`));
    expect(start('de-en', emptyProgress(), 'faellig', viele).session.wordIds).toHaveLength(12);
    expect(start('de-en', emptyProgress(), 'frei', viele).session.wordIds).toHaveLength(12);
  });

  it('ist sofort fertig, wenn nichts fällig ist', () => {
    let progress = emptyProgress();
    for (const w of WOERTER) progress = recordOutcome(progress, 'de-en', w.id, 'gewusst', NOW);
    const runde = start('de-en', progress);
    expect(runde.ansicht).toBe('fertig');
    expect(runde.session.wordIds).toHaveLength(0);
    // Freies Üben geht trotzdem.
    expect(start('de-en', progress, 'frei').ansicht).toBe('karte-frage');
  });
});

describe('Karten', () => {
  it('deckt auf, bewertet und geht zum nächsten Wort', () => {
    let runde = start('de-en');
    expect(bewerten(runde, true).runde).toBe(runde); // vor dem Aufdecken keine Bewertung
    runde = aufdecken(runde).runde;
    expect(runde.ansicht).toBe('karte-aufgedeckt');
    expect(aufdecken(runde).runde).toBe(runde);
    const schritt = bewerten(runde, true);
    expect(schritt.verbuchung).toEqual({ record: { wordId: 't:moon', outcome: 'gewusst' }, stars: 1 });
    expect(schritt.runde.ansicht).toBe('karte-frage');
    expect(schritt.runde.wort).toEqual(WOERTER[1]);
    // Doppeltes Tippen bewertet das nächste Wort nicht mit.
    expect(bewerten(schritt.runde, true).runde).toBe(schritt.runde);
  });

  it('endet auf der Abschlussseite, nicht Gewusstes kommt vorher noch einmal', () => {
    let runde = start('en-de', emptyProgress(), 'faellig', WOERTER.slice(0, 1));
    let schritt = bewerten(aufdecken(runde).runde, false);
    expect(schritt.verbuchung).toEqual({ record: { wordId: 't:moon', outcome: 'nicht-gewusst' }, stars: 0 });
    runde = schritt.runde;
    expect(runde.ansicht).toBe('karte-frage');
    expect(runde.wort).toEqual(WOERTER[0]);
    schritt = bewerten(aufdecken(runde).runde, true);
    expect(schritt.verbuchung).toEqual({ record: null, stars: 1 });
    expect(schritt.runde.ansicht).toBe('fertig');
    expect(schritt.runde.wort).toBeNull();
  });
});

describe('Schreiben', () => {
  it('zeigt bei richtiger Eingabe „richtig“ für das geschaffte Wort und geht erst mit weiter() weiter', () => {
    const runde = start('schreiben');
    const schritt = pruefen(runde, ' Moon ');
    expect(schritt.runde.ansicht).toBe('richtig');
    expect(schritt.runde.wort).toEqual(WOERTER[0]);
    expect(schritt.verbuchung).toEqual({ record: { wordId: 't:moon', outcome: 'gewusst' }, stars: 1 });
    expect(pruefen(schritt.runde, 'hair').runde).toBe(schritt.runde);
    const danach = weiter(schritt.runde);
    expect(danach.verbuchung).toBeNull();
    expect(danach.runde.ansicht).toBe('schreiben');
    expect(danach.runde.wort).toEqual(WOERTER[1]);
    expect(weiter(danach.runde).runde).toBe(danach.runde);
  });

  it('führt bei falscher Eingabe zum Abschreiben und bleibt dort, bis die Abschrift stimmt', () => {
    let schritt = pruefen(start('schreiben'), 'mon');
    expect(schritt.runde.ansicht).toBe('abschreiben');
    expect(schritt.runde.wort).toEqual(WOERTER[0]);
    expect(schritt.runde.diff?.errors).toBe(1);
    expect(schritt.runde.abschriftDaneben).toBe(0);
    expect(schritt.verbuchung).toEqual({ record: { wordId: 't:moon', outcome: 'nicht-gewusst' }, stars: 0 });

    schritt = pruefen(schritt.runde, 'moom');
    expect(schritt.runde.ansicht).toBe('abschreiben');
    expect(schritt.runde.abschriftDaneben).toBe(1);
    expect(schritt.runde.diff?.input).toBe('moom');
    expect(schritt.verbuchung).toBeNull();

    schritt = pruefen(schritt.runde, 'moon');
    expect(schritt.verbuchung).toEqual({ record: null, stars: 1 });
    expect(schritt.runde.ansicht).toBe('schreiben');
    expect(schritt.runde.wort).toEqual(WOERTER[1]);
    expect(schritt.runde.diff).toBeNull();
  });

  it('„Weiß ich nicht“ zeigt das Wort ohne Vergleich', () => {
    const schritt = weissNicht(start('schreiben'));
    expect(schritt.runde.ansicht).toBe('abschreiben');
    expect(schritt.runde.diff).toBeNull();
    expect(schritt.verbuchung).toEqual({ record: { wordId: 't:moon', outcome: 'nicht-gewusst' }, stars: 0 });
    expect(weissNicht(schritt.runde).runde).toBe(schritt.runde);
  });

  it('ignoriert leere Eingaben', () => {
    const runde = start('schreiben');
    expect(pruefen(runde, '   ')).toEqual({ runde, verbuchung: null });
    const kopie = weissNicht(runde).runde;
    expect(pruefen(kopie, '')).toEqual({ runde: kopie, verbuchung: null });
  });

  it('endet nach dem letzten Wort auf der Abschlussseite', () => {
    const runde = start('schreiben', emptyProgress(), 'faellig', WOERTER.slice(0, 1));
    const fertig = weiter(pruefen(runde, 'moon').runde).runde;
    expect(fertig.ansicht).toBe('fertig');
  });
});

describe('freies Üben', () => {
  it('lässt Gewusstes nicht aufsteigen, gibt aber den Stern', () => {
    const runde = start('de-en', emptyProgress(), 'frei');
    const schritt = bewerten(aufdecken(runde).runde, true);
    expect(schritt.verbuchung).toEqual({ record: null, stars: 1 });
    const progress = eintragen(emptyProgress(), 'de-en', schritt);
    expect(getItemProgress(progress, 'de-en', 't:moon').box).toBe(1);
    expect(progress.rewards.stars).toBe(1);
  });

  it('schickt nicht Gewusstes in Fach 1', () => {
    const vorher = recordOutcome(recordOutcome(emptyProgress(), 'schreiben', 't:moon', 'gewusst', NOW), 'schreiben', 't:moon', 'gewusst', NOW);
    expect(getItemProgress(vorher, 'schreiben', 't:moon').box).toBe(3);
    const schritt = pruefen(start('schreiben', vorher, 'frei'), 'mooon');
    expect(getItemProgress(eintragen(vorher, 'schreiben', schritt), 'schreiben', 't:moon').box).toBe(1);
  });
});

describe('aufstiege', () => {
  it('zählt je erreichtem Fach, höchstes zuerst', () => {
    let progress = recordOutcome(emptyProgress(), 'de-en', 't:hair', 'gewusst', NOW - 3 * 24 * 60 * 60 * 1000);
    let runde = start('de-en', progress);
    // Fällige Runde: niedrige Fächer zuerst – moon (1), shy (1), dann hair (2).
    for (const gewusst of [true, false, true]) {
      const schritt = bewerten(aufdecken(runde).runde, gewusst);
      progress = eintragen(progress, 'de-en', schritt);
      runde = schritt.runde;
    }
    expect(aufstiege(runde, progress)).toEqual([
      { fach: 3, anzahl: 1 },
      { fach: 2, anzahl: 1 },
    ]);
  });

  it('ist im freien Üben leer', () => {
    let progress = emptyProgress();
    let runde = start('de-en', progress, 'frei');
    const schritt = bewerten(aufdecken(runde).runde, true);
    progress = eintragen(progress, 'de-en', schritt);
    runde = schritt.runde;
    expect(aufstiege(runde, progress)).toEqual([]);
  });
});

describe('aufgabenNummer', () => {
  it('zählt die aktuelle Aufgabe ab 1 und Wiederholungen nicht weiter', () => {
    let runde = start('de-en');
    expect(aufgabenNummer(runde)).toEqual({ nummer: 1, gesamt: 3 });
    runde = bewerten(aufdecken(runde).runde, false).runde;
    expect(aufgabenNummer(runde)).toEqual({ nummer: 2, gesamt: 3 });
    runde = bewerten(aufdecken(runde).runde, true).runde;
    expect(aufgabenNummer(runde)).toEqual({ nummer: 3, gesamt: 3 });
    runde = bewerten(aufdecken(runde).runde, true).runde;
    // Jetzt kommt die Wiederholung des ersten Wortes.
    expect(runde.ansicht).toBe('karte-frage');
    expect(aufgabenNummer(runde)).toEqual({ nummer: 3, gesamt: 3 });
  });

  it('bleibt beim Abschreiben und bei „Richtig!“ auf der Nummer der Aufgabe', () => {
    const runde = start('schreiben');
    expect(aufgabenNummer(runde)).toEqual({ nummer: 1, gesamt: 3 });
    expect(aufgabenNummer(pruefen(runde, 'mon').runde)).toEqual({ nummer: 1, gesamt: 3 });
    const richtig = pruefen(runde, 'moon').runde;
    expect(aufgabenNummer(richtig)).toEqual({ nummer: 1, gesamt: 3 });
    expect(aufgabenNummer(weiter(richtig).runde)).toEqual({ nummer: 2, gesamt: 3 });
  });
});

describe('gemischte Runde', () => {
  const viele = Array.from({ length: 30 }, (_, i) => wort(`w${i}`, `d${i}`));
  const gemischt = (progress: Progress, art: 'faellig' | 'frei' = 'faellig') =>
    starteRunde({ mode: 'gemischt', auswahl: { art }, words: viele, progress, now: NOW, random: Math.random });

  it('hält die Rundengröße ein und zeigt je Aufgabe die passende Ansicht', () => {
    let progress = emptyProgress();
    let runde = gemischt(progress);
    expect(runde.rundenModus).toBe('gemischt');
    expect(runde.session.wordIds).toHaveLength(12);
    const modi = { ...runde.session.wordModes! };
    const ansichten = new Set<string>();
    while (runde.ansicht !== 'fertig') {
      const mode = runde.session.mode;
      ansichten.add(runde.ansicht);
      expect(runde.ansicht).toBe(mode === 'schreiben' ? 'schreiben' : 'karte-frage');
      let schritt = mode === 'schreiben' ? pruefen(runde, runde.wort!.accept[0]) : bewerten(aufdecken(runde).runde, true);
      progress = eintragen(progress, mode, schritt);
      if (schritt.runde.ansicht === 'richtig') schritt = weiter(schritt.runde);
      runde = schritt.runde;
    }
    expect([...ansichten].sort()).toEqual(['karte-frage', 'schreiben']);
    // Jedes Wort ist genau in seinem Modus ein Fach gestiegen.
    for (const [id, mode] of Object.entries(modi)) {
      for (const m of ['de-en', 'en-de', 'schreiben'] as const) expect(getItemProgress(progress, m, id).box).toBe(m === mode ? 2 : 1);
    }
    expect(aufstiege(runde, progress)).toEqual([{ fach: 2, anzahl: 12 }]);
  });

  it('lässt im freien Üben auch gemischt nichts aufsteigen', () => {
    let progress = emptyProgress();
    const runde = gemischt(progress, 'frei');
    const mode = runde.session.mode;
    const schritt = mode === 'schreiben' ? pruefen(runde, runde.wort!.accept[0]) : bewerten(aufdecken(runde).runde, true);
    expect(schritt.verbuchung).toEqual({ record: null, stars: 1 });
    progress = eintragen(progress, mode, schritt);
    expect(getItemProgress(progress, mode, runde.wort!.id).box).toBe(1);
  });
});
