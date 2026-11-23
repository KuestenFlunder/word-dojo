import { RUNDEN_GROESSE, verbuchungNachUebungsart } from './regeln';

const gewusst = { record: { wordId: 'u2p1:hero', outcome: 'gewusst' as const }, stars: 1 };
const nichtGewusst = { record: { wordId: 'u2p1:hero', outcome: 'nicht-gewusst' as const }, stars: 0 };

describe('verbuchungNachUebungsart', () => {
  it('verbucht in fälligen Runden alles unverändert', () => {
    expect(verbuchungNachUebungsart({ art: 'faellig' }, gewusst)).toEqual(gewusst);
    expect(verbuchungNachUebungsart({ art: 'faellig' }, nichtGewusst)).toEqual(nichtGewusst);
  });

  it('lässt im freien Üben ein gewusstes Wort nicht aufsteigen, die Sterne bleiben', () => {
    expect(verbuchungNachUebungsart({ art: 'frei' }, gewusst)).toEqual({ record: null, stars: 1 });
    expect(verbuchungNachUebungsart({ art: 'frei', fach: 3 }, gewusst)).toEqual({ record: null, stars: 1 });
  });

  it('schickt im freien Üben ein nicht gewusstes Wort wie immer in Fach 1', () => {
    expect(verbuchungNachUebungsart({ art: 'frei' }, nichtGewusst)).toEqual(nichtGewusst);
  });

  it('lässt Schritte ohne Eintrag (Wiederholung, Abschrift) unverändert', () => {
    expect(verbuchungNachUebungsart({ art: 'frei' }, { record: null, stars: 1 })).toEqual({ record: null, stars: 1 });
  });

  it('begrenzt die Runde auf 12 Wörter', () => {
    expect(RUNDEN_GROESSE).toBe(12);
  });
});
