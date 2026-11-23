import { schreibFertig, schreibOutcome, schreibReducer, startSchreiben, type SchreibState } from './schreiben';

const ACCEPT = ['hero', 'hero, heroes', 'hero heroes'];
const pruefen = (state: SchreibState, input: string) => schreibReducer(state, { type: 'pruefen', input });

describe('Schreib-Reducer', () => {
  it('startet in der Eingabe, ohne Ergebnis', () => {
    const state = startSchreiben(ACCEPT);
    expect(state).toEqual({ phase: 'eingabe', accept: ACCEPT, diff: null, copyMisses: 0 });
    expect(schreibFertig(state)).toBe(false);
    expect(schreibOutcome(state)).toBeNull();
  });

  it('eingabe → richtig: sofort gewusst, fertig', () => {
    const state = pruefen(startSchreiben(ACCEPT), ' Hero ');
    expect(state.phase).toBe('richtig');
    expect(state.diff?.errors).toBe(0);
    expect(schreibFertig(state)).toBe(true);
    expect(schreibOutcome(state)).toBe('gewusst');
  });

  it('eingabe → abschreiben: falsch getippt, Fehlerstellen liegen vor, noch nicht fertig', () => {
    const state = pruefen(startSchreiben(ACCEPT), 'hiro');
    expect(state.phase).toBe('abschreiben');
    expect(state.diff).toMatchObject({ target: 'hero', errors: 1 });
    expect(state.diff?.expected[1]).toEqual({ char: 'e', status: 'falsch' });
    expect(schreibFertig(state)).toBe(false);
    expect(schreibOutcome(state)).toBe('nicht-gewusst');
  });

  it('abschreiben → weiter: richtig abgeschrieben, fertig, bleibt „nicht gewusst“', () => {
    const state = pruefen(pruefen(startSchreiben(ACCEPT), 'hiro'), 'hero');
    expect(state.phase).toBe('weiter');
    expect(state.copyMisses).toBe(0);
    expect(schreibFertig(state)).toBe(true);
    expect(schreibOutcome(state)).toBe('nicht-gewusst');
  });

  it('abschreiben bleibt, bis es stimmt – so oft wie nötig', () => {
    let state = pruefen(startSchreiben(ACCEPT), 'xxx');
    for (const [i, versuch] of ['hreo', 'heero', 'her'].entries()) {
      state = pruefen(state, versuch);
      expect(state.phase).toBe('abschreiben');
      expect(state.copyMisses).toBe(i + 1);
      expect(state.diff?.input).toBe(versuch);
      expect(schreibFertig(state)).toBe(false);
    }
    state = pruefen(state, 'hero');
    expect(state.phase).toBe('weiter');
    expect(state.copyMisses).toBe(3);
  });

  it('beim Abschreiben gilt jede gültige Schreibweise', () => {
    const copying = pruefen(startSchreiben(ACCEPT), 'x');
    expect(pruefen(copying, 'hero, heroes').phase).toBe('weiter');
    expect(pruefen(copying, 'HERO').phase).toBe('weiter');
  });

  it('„weiß ich nicht“ führt ohne Fehlermarkierung zum Abschreiben', () => {
    const state = schreibReducer(startSchreiben(ACCEPT), { type: 'aufdecken' });
    expect(state).toMatchObject({ phase: 'abschreiben', diff: null, copyMisses: 0 });
    expect(schreibOutcome(state)).toBe('nicht-gewusst');
    expect(pruefen(state, 'hero').phase).toBe('weiter');
  });

  it('leere Eingabe: beim Antworten wie „weiß ich nicht“, beim Abschreiben kein Versuch', () => {
    const copying = pruefen(startSchreiben(ACCEPT), '   ');
    expect(copying).toMatchObject({ phase: 'abschreiben', diff: null });
    expect(pruefen(copying, '')).toBe(copying);
  });

  it('Endzustände und unpassende Aktionen ändern nichts', () => {
    const richtig = pruefen(startSchreiben(ACCEPT), 'hero');
    expect(pruefen(richtig, 'quatsch')).toBe(richtig);
    expect(schreibReducer(richtig, { type: 'aufdecken' })).toBe(richtig);

    const copying = pruefen(startSchreiben(ACCEPT), 'hiro');
    expect(schreibReducer(copying, { type: 'aufdecken' })).toBe(copying);

    const weiter = pruefen(copying, 'hero');
    expect(pruefen(weiter, 'quatsch')).toBe(weiter);
  });

  it('verändert den alten Zustand nicht', () => {
    const start = startSchreiben(ACCEPT);
    pruefen(start, 'hiro');
    expect(start).toEqual({ phase: 'eingabe', accept: ACCEPT, diff: null, copyMisses: 0 });
  });
});
