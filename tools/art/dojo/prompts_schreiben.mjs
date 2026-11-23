#!/usr/bin/env node
// Schreibt die Prompts des Dojo-Bildsatzes nach dojo/prompts/<name>.txt
// (ein .txt je Bild). Stiltext und Figurenbeschreibung stehen hier genau einmal.
// Aufruf: node tools/art/dojo/prompts_schreiben.mjs

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const hier = path.dirname(fileURLToPath(import.meta.url));
mkdirSync(path.join(hier, 'prompts'), { recursive: true });

const STIL = 'Stil: Japanische Tuschemalerei (Sumi-e) trifft Manga: lebendige, trockene Pinselstriche mit sichtbarer Borstenstruktur, Tuschespritzer, große leere Flächen, dazu flache Holzschnitt-Farbflächen. Palette: Tuscheschwarz #1A1A1A, Washi-Papier #EFE6D2, Zinnoberrot #D9381E, gedämpftes Moosgrün #6B8F71. Kein Blau, keine Verläufe, kein 3D. Kein Text, keine Schriftzeichen, kein Stempel mit Zeichen.';

const FIGUR = 'Figur: GENAU derselbe Junge wie im beigefügten Referenzbild – gleiches Gesicht, gleiche Frisur, gleiche Kleidung, gleicher Zeichenstrich, gleiche Farben. Etwa 12 Jahre alt, zerzauste dunkle Haare, zinnoberrotes Stirnband mit zwei wehenden Enden, weißer Trainings-Gi mit kurzen weiten Ärmeln, moosgrüner Gürtel mit Knoten, weiter schwarzer Hakama, weiße Tabi-Socken mit Sandalen, dazu sein großer Kalligrafie-Pinsel mit dunklem Stiel und schwarz-weißem Borstenkopf. Normale Proportionen eines 12-Jährigen (kein Chibi, kein Riesenkopf, keine Kulleraugen), cool und freundlich, nicht niedlich. Gesicht klar und sauber gezeichnet wie im Manga, Hände anatomisch korrekt mit fünf Fingern.';

const KEIN_TEXT = 'Kein Text, keine Buchstaben, keine Zahlen, keine Schriftzeichen (auch keine japanischen), keine Soundwörter, keine Sprechblasen, kein Logo, keine Signatur, kein Stempel.';

const HG_FIGUR = `Ganze Figur samt Pinsel von Kopf bis Fuß vollständig im Bild, mittig, mit deutlichem Abstand zu allen Bildrändern. Hintergrund: einfarbige, gleichmäßige Fläche in Washi-Papier #EFE6D2 ohne Motiv, ohne Landschaft, ohne Sonne, ohne Rahmen, ohne Bodenlinie, ohne Schlagschatten, ohne Papierstruktur-Flecken. ${KEIN_TEXT}`;

const figur = (pose) => `Figuren-Illustration für eine Vokabel-Lern-App für einen 11-jährigen Jungen. Hochformat 2:3 (1024x1536).

${STIL}

${FIGUR}

Pose: ${pose}

${HG_FIGUR}
`;

const P = {
  jubel: figur('Jubel nach einem Erfolg: ganze Figur im hohen Freudensprung, beide Füße in der Luft, Knie angezogen. Eine Hand als geballte Faust nach oben gereckt, die andere Hand reißt den großen Kalligrafie-Pinsel triumphierend in die Höhe. Er lacht offen und strahlend mit offenem Mund, Blick zum Betrachter. Hakama und Stirnbandenden fliegen. Ein paar schwarze Tuschespritzer um den Pinselkopf.'),
  denken: figur('Nachdenken: ganze Figur steht ruhig und aufrecht, Gewicht auf einem Bein. Der große Kalligrafie-Pinsel steht senkrecht neben ihm wie ein Wanderstab, Borstenkopf unten am Boden, eine Hand hält den Stiel locker. Die andere Hand liegt am Kinn, Blick schräg nach oben, eine Augenbraue leicht gehoben, neugierig und konzentriert überlegend, entspannt, mit leichtem Lächeln. Stirnbandenden hängen ruhig mit leichtem Schwung.'),
  nochmal: figur('Aufmunterung („Das schaffst du, gleich nochmal!“): ganze Figur steht locker und zugewandt. Eine Hand zeigt deutlich einen Daumen nach oben in Richtung Betrachter, er zwinkert mit einem Auge und lächelt breit, warm und freundlich. Die andere Hand hält den großen Kalligrafie-Pinsel entspannt geschultert oder seitlich aufgestellt. Die Stimmung ist ausschließlich positiv, ermutigend und kumpelhaft – auf keinen Fall enttäuscht, streng, traurig, besorgt oder wütend; keine zusammengezogenen Augenbrauen. Stirnbandenden wehen leicht.'),
  schreiben: figur('Schreiben: ganze Figur kniet tief auf einem Knie (oder steht in sehr tiefer Hocke) und zieht konzentriert mit beiden Händen den großen Kalligrafie-Pinsel über den Boden. Vom Pinselkopf geht ein einzelner kräftiger, breiter, trockener schwarzer Tuschestrich als geschwungene abstrakte Linie über den Boden (nur ein Strich, kein Schriftzeichen, kein Buchstabe). Blick konzentriert nach unten auf die Pinselspitze, Zungenspitze nicht sichtbar, ruhig und fokussiert mit leichtem Lächeln. Einige Tuschespritzer am Strich.'),
  gruss: figur('Gruß (Begrüßung und Abschied): ganze Figur steht aufrecht mit geschlossenen Füßen und macht eine kleine, respektvolle Verbeugung – Oberkörper nur leicht nach vorn geneigt, Kopf leicht gesenkt, das Gesicht bleibt gut sichtbar, er schaut freundlich zum Betrachter und lächelt. Eine Hand liegt flach an der Seite, die andere hält den großen Kalligrafie-Pinsel senkrecht an der Seite, Borstenkopf unten. Ruhige, höfliche, freundliche Haltung. Stirnbandenden hängen mit leichtem Schwung.'),

  fertig: `Erfolgsbild („Runde geschafft“) für eine Vokabel-Lern-App für einen 11-jährigen Jungen. Querformat 3:2 (1536x1024).

${STIL}

${FIGUR}

Motiv: Der Junge springt jubelnd in der Bildmitte hoch in die Luft, eine Faust nach oben gereckt, in der anderen Hand den großen Kalligrafie-Pinsel hochgerissen, lachend mit offenem Mund. Hinter ihm eine große, flache zinnoberrote Sonnenscheibe mit trockenem Pinselrand. Vom Pinsel geht ein schwungvoller, breiter schwarzer Tuschebogen aus, dazu schwarze Tuschespritzer. Am unteren Bildrand eine niedrige Bergsilhouette in trockenen grauschwarzen Pinselstrichen, vielleicht eine kleine Kiefer mit moosgrünen Nadelflächen. Sehr viel leere Fläche. Ganze Figur vollständig im Bild.

Hintergrund durchgehend einfarbig Washi-Papier #EFE6D2 bis an alle Bildränder; die Bildränder selbst bleiben reine Papierfläche (das Motiv läuft zum Rand hin aus), kein Rahmen. ${KEIN_TEXT}
`,

  dojo: `Hintergrundbild für eine Vokabel-Lern-App für einen 11-jährigen Jungen: Innenraum eines Dojo. Bildformat Querformat 1536x1024; das Bild wird später auf einen mittleren Streifen im Seitenverhältnis 2:1 beschnitten – alle Bildelemente liegen deshalb im mittleren Streifen, das obere und das untere Achtel des Bildes sind nur leere Washi-Papier-Fläche #EFE6D2.

${STIL}

Motiv: ruhiger, menschenleerer Innenraum eines traditionellen japanischen Dojo, frontal von vorn gesehen, symmetrisch. Unten ein Holzdielenboden in wenigen trockenen Tuschestrichen. Links und rechts außen Papierschiebewände (Shoji) mit schwarzem Holzgitter und hellem Papier. An der Rückwand, seitlich versetzt, eine hängende Schriftrolle (Kakemono), die vollständig LEER ist – nur helles Papier mit schmalem moosgrünem und zinnoberrotem Stoffrand, ohne jedes Zeichen. Am Rand auf dem Boden ein kleiner Pinselständer aus dunklem Holz mit einigen Kalligrafie-Pinseln. Die gesamte Bildmitte (etwa die mittleren 60 % der Breite) ist eine große, leere, helle Fläche in Washi-Papier-Ton, dort liegen später Lernkarten. Sparsame, leichte Linien, alles sehr luftig und ruhig, wenig Schwarz, keine Figuren.

Hintergrund durchgehend einfarbig Washi-Papier #EFE6D2 bis an alle Bildränder; die Bildränder selbst bleiben reine Papierfläche (das Motiv läuft zum Rand hin in trockenen Pinselstrichen aus), kein Rahmen. ${KEIN_TEXT}
`,

  icon: `App-Symbol für eine Vokabel-Lern-App. Quadratisch 1:1 (1024x1024).

${STIL}

Motiv: eine große, flache zinnoberrote Sonnenscheibe (#D9381E) mit leicht trockenem Pinselrand in der Bildmitte, sie füllt etwa 60 % der Bildbreite. Davor ein einzelner kräftiger, schwungvoller schwarzer Tuschepinsel-Schwung (ein breiter, dynamischer Bogenstrich mit trockenem, ausgefranstem Ende und sichtbarer Borstenstruktur), der diagonal über die Sonnenscheibe läuft; wenige kleine Tuschespritzer. Abstrakter Strich – ausdrücklich KEIN Schriftzeichen, kein Buchstabe, kein Enso-Kreis mit Zeichen. Sehr einfach, plakativ, auch in kleiner Größe klar erkennbar. Motiv mittig mit Abstand zu allen Rändern.

Hintergrund: einfarbige, gleichmäßige Fläche in Washi-Papier #EFE6D2 bis an alle vier Bildränder, keine abgerundeten Ecken, kein Rahmen, keine App-Kachel-Form, kein Schlagschatten. ${KEIN_TEXT}
`,
};

for (const [name, text] of Object.entries(P)) {
  writeFileSync(path.join(hier, 'prompts', `${name}.txt`), text);
  console.log('geschrieben', name);
}
