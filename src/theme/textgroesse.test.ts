import { deckendesRechteck, einzeiligeSchriftgroesse, KLEINSTE_WORTGROESSE, passendeSchriftgroesse } from './textgroesse';

describe('passendeSchriftgroesse', () => {
  it('lässt kurze Wörter in voller Größe', () => {
    expect(passendeSchriftgroesse('braces', 76, 680, 3)).toBe(76);
  });

  it('verkleinert, bis das längste Wort in die Breite passt', () => {
    const groesse = passendeSchriftgroesse('Vertrauensschüler', 60, 318, 1);
    expect(groesse).toBeLessThan(60);
    expect(17 * (groesse * 0.62 + 1)).toBeLessThanOrEqual(318);
  });

  it('macht lange Wortgruppen kleiner und unterschreitet die Mindestgröße nie', () => {
    expect(passendeSchriftgroesse('verlassen, lassen, zurücklassen', 60, 680, 1)).toBe(36);
    expect(passendeSchriftgroesse('Donaudampfschifffahrtsgesellschaft', 60, 100)).toBe(KLEINSTE_WORTGROESSE);
  });
});

describe('einzeiligeSchriftgroesse', () => {
  it('schrumpft mit der Zeichenzahl', () => {
    expect(einzeiligeSchriftgroesse(6, 60, 640, 6)).toBe(60);
    expect(einzeiligeSchriftgroesse(27, 60, 640, 6)).toBeLessThan(40);
  });
});

describe('deckendesRechteck', () => {
  it('füllt einen breiteren Rahmen über die Breite und richtet rechts aus', () => {
    expect(deckendesRechteck(1000, 400, 2, 1, 0.5)).toEqual({ left: 0, top: -50, width: 1000, height: 500 });
  });

  it('füllt einen höheren Rahmen über die Höhe und richtet rechts aus', () => {
    expect(deckendesRechteck(400, 800, 2, 1, 0.5)).toEqual({ left: -1200, top: 0, width: 1600, height: 800 });
  });
});
