/**
 * Ein Wort Buchstabe für Buchstabe mit sanft markierten Fehlerstellen – nie in Rot
 * (Zinnoberrot ist die Farbe der Aktionen, keine Fehlerfarbe).
 * `vorlage`: das richtige Wort, Fehlerstellen im weißen Kasten mit Tuscherand.
 * `eigenes`: die eigene Eingabe, Fehlerstellen unterstrichen.
 */
import { View } from 'react-native';

import type { DiffChar } from '@/learning/spelling';
import { ecken, farben, passendeSchriftgroesse, rand, useLayout } from '@/theme';

import { LeseText } from './Schrift';

interface BuchstabenProps {
  zeichen: readonly DiffChar[];
  art: 'vorlage' | 'eigenes';
  /** Größte Schriftgröße im Entwurfsmaß. */
  groesse: number;
  /** Buchstabenabstand im Entwurfsmaß. */
  weite: number;
  /** Verfügbare Breite in Bildschirm-px. */
  breite: number;
}

/** Platz, den ein markierter Buchstabe zusätzlich braucht (Kasten und Abstand). */
const KASTEN_ZUGABE = 20;

/** Teilt an Leerzeichen, damit nur zwischen Wörtern umbrochen wird. */
function inWoerter(zeichen: readonly DiffChar[]): DiffChar[][] {
  const woerter: DiffChar[][] = [[]];
  for (const z of zeichen) {
    if (z.char === ' ') woerter.push([]);
    else woerter[woerter.length - 1].push(z);
  }
  return woerter.filter((wort) => wort.length > 0);
}

export function Buchstaben({ zeichen, art, groesse, weite, breite }: BuchstabenProps) {
  const { s } = useLayout();
  const woerter = inWoerter(zeichen);
  const text = woerter.map((wort) => wort.map((z) => z.char).join('')).join(' ');
  const markiert = art === 'vorlage' ? Math.max(0, ...woerter.map((wort) => wort.filter((z) => z.status !== 'ok').length)) : 0;
  const px = passendeSchriftgroesse(text, s(groesse), breite - markiert * KASTEN_ZUGABE, weite);
  const zeile = Math.round(px * 1.25);
  return (
    <View accessible accessibilityLabel={text} style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: px * 0.45, rowGap: 6 }}>
      {woerter.map((wort, w) => (
        <View key={w} style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
          {wort.map((z, i) => {
            const fehler = z.status !== 'ok';
            const buchstabe = (
              <LeseText fest fett={art === 'vorlage'} groesse={px} style={{ lineHeight: zeile }}>
                {z.char}
              </LeseText>
            );
            if (!fehler) {
              return (
                <View key={i} style={{ paddingRight: weite }}>
                  {buchstabe}
                </View>
              );
            }
            return art === 'vorlage' ? (
              <View
                key={i}
                style={[
                  {
                    backgroundColor: farben.weiss,
                    borderWidth: rand.mittel,
                    borderColor: farben.tusche,
                    paddingHorizontal: 5,
                    marginLeft: 2,
                    marginRight: 2 + weite,
                  },
                  ecken.buchstabe,
                ]}>
                {buchstabe}
              </View>
            ) : (
              <View key={i} style={{ borderBottomWidth: rand.mittel, borderBottomColor: farben.tusche, marginRight: weite }}>
                {buchstabe}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}
