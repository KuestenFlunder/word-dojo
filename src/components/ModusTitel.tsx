/** Titel eines Modus in der Titelschrift; zwischen zwei Sprachen steht ein gezeichneter Pfeil. */
import { Fragment } from 'react';
import { View } from 'react-native';

import { titelText, type RundenModus } from '@/runde/texte';
import { useLayout, type Farbe } from '@/theme';

import { TitelText } from './Schrift';
import { PfeilRechts } from './Symbol';

export function ModusTitel({ mode, groesse, farbe = 'tusche' }: { mode: RundenModus; groesse: number; farbe?: Farbe }) {
  const { s } = useLayout();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: s(groesse * 0.25) }}>
      {titelText(mode).titel.map((teil, i) => (
        <Fragment key={teil}>
          {i > 0 ? <PfeilRechts groesse={s(groesse * 0.7)} farbe={farbe} /> : null}
          <TitelText groesse={groesse} farbe={farbe} style={{ userSelect: 'none' }}>
            {teil}
          </TitelText>
        </Fragment>
      ))}
    </View>
  );
}
