# Prompts der Illustrationen (WORD HERO)

Erzeugt mit der Codex-CLI 0.165.0 (Feature image_generation) über tools/art/erzeugen.sh. Je Bild steht der wörtliche Prompt in prompts/<name>.txt; erzeugen.sh hängt die unten stehende Arbeitsanweisung an. Alle Bilder außer nova_neutral und den Abzeichen (rang_1 bis rang_5) wurden mit roh/figuren/nova_neutral.png als Referenz (-i) erzeugt.

Aufruf (Prompt VOR -i, sonst schluckt -i den Prompt):

    codex exec --skip-git-repo-check --enable image_generation -s workspace-write -C tools/art/roh/<gruppe> "<Prompt + Arbeitsanweisung>" -i tools/art/roh/figuren/nova_neutral.png

Angehängte Arbeitsanweisung (<name> = Dateiname):

> Arbeitsanweisung: Erzeuge genau EIN Bild mit deinem eingebauten Bildgenerierungs-Werkzeug (image_generation), nicht mit Code, SVG oder Skripten. Übernimm die Stilbeschreibung wörtlich in den Bild-Prompt. Speichere bzw. kopiere das fertige Bild danach als PNG unter dem Namen <name>.png in das aktuelle Arbeitsverzeichnis. Verändere das Bild nicht nachträglich. Antworte am Ende nur mit dem Dateipfad.

Aufbereitung: aus einem Ordner mit sharp, z. B. cd ../GrosseFahrt && node ../Vokabeltrainer/tools/art/aufbereiten.mjs

## nova_neutral

```text
Illustration einer Comic-Figur für eine Vokabel-Lern-App für einen 11-jährigen Jungen. Hochformat 2:3 (1024x1536).

Stil: Tusche-Comic zwischen Shōnen-Manga und Retro-Superheldenheft: kräftige schwarze Tuschekonturen mit wechselnder Strichstärke, flache Farbflächen, Rasterpunkte (Halftone) für Schatten, dynamische Posen, keine Verläufe, kein 3D, kein Text im Bild. Strenge Palette: Nachtblau #14213D, Signalgelb #FFC300, Korallrot #E63946, Papierweiß #F6F0E1, Tusche #111111.

Figur „Nova“: ein etwa 12-jähriger Nachwuchs-Held, cool statt niedlich – zerzauste Haare, kurzer gelber Umhang-Schal, nachtblauer Anzug mit einem schlichten Stern-Emblem auf der Brust, rote Stiefel, Helm mit hochgeklapptem Visier. Normale Proportionen eines 12-Jährigen (kein Chibi, kein Riesenkopf, keine Kulleraugen). Haut in Papierweiß, Haare in Tusche-Schwarz.

Pose: Nova steht selbstbewusst und breitbeinig, eine Hand in die Hüfte gestemmt, den Helm unter dem anderen Arm, leichtes selbstsicheres Grinsen, Blick direkt zum Betrachter.

Ganze Figur von Kopf bis Fuß vollständig im Bild, mittig, mit Abstand zu allen Bildrändern. Hintergrund: eine einzige vollkommen gleichmäßige, flache Fläche in reinem Magenta #FF00FF – kein Boden, kein Schlagschatten, keine Rasterpunkte, keine Speedlines und keine Effekte außerhalb der Figur. Magenta kommt in der Figur selbst nirgends vor. Kein Text, keine Buchstaben, keine Zahlen, kein Logo, keine Signatur.
```

## titel

```text
Titelbild einer Vokabel-Lern-App für einen 11-jährigen Jungen. Querformat, breit (1536x1024); die wichtigen Bildinhalte liegen in einem mittleren 16:9-Streifen, oben und unten nur ruhige Fläche, weil das Bild später auf 16:9 beschnitten wird. Das angehängte Bild ist die verbindliche Referenz für die Figur „Nova“: Zeichne exakt dieselbe Figur (gleiches Gesicht, gleiche zerzauste schwarze Frisur, gleicher Anzug, gleicher Schal, gleicher Helm, gleiche Stiefel, gleicher Zeichenstil).

Stil: Tusche-Comic zwischen Shōnen-Manga und Retro-Superheldenheft: kräftige schwarze Tuschekonturen mit wechselnder Strichstärke, flache Farbflächen, Rasterpunkte (Halftone) für Schatten, dynamische Posen, keine Verläufe, kein 3D, kein Text im Bild. Strenge Palette: Nachtblau #14213D, Signalgelb #FFC300, Korallrot #E63946, Papierweiß #F6F0E1, Tusche #111111.

Figur „Nova“: ein etwa 12-jähriger Nachwuchs-Held, cool statt niedlich – zerzauste Haare, kurzer gelber Umhang-Schal, nachtblauer Anzug mit gelben Seitenstreifen und einem schlichten gelben Stern-Emblem auf der Brust, roter Gürtel, rote Stulpen, rote Stiefel, rot-gelber Helm mit hochgeklapptem Visier. Normale Proportionen eines 12-Jährigen (kein Chibi, kein Riesenkopf, keine Kulleraugen). Haut in Papierweiß, Haare in Tusche-Schwarz.

Szene: Nova steht im rechten Bilddrittel auf der Kante eines Hausdachs, ganze Figur, ein Fuß auf der Dachkante, Helm unter dem Arm, der gelbe Schal weht im Wind, er blickt selbstbewusst in die Ferne. Hinter ihm rechts oben ein sehr großer papierweißer Vollmond mit Kratern aus Rasterpunkten, daneben kleiner ein Planet mit Ring in Signalgelb und Korallrot. Unten eine flache Tusche-Silhouette von Dächern und Antennen einer Stadt. Der Himmel ist eine flache nachtblaue Fläche mit wenigen kleinen Sternen. Die linke Bildhälfte bleibt bewusst ruhig und fast leer (nur flacher nachtblauer Himmel, höchstens zwei, drei winzige Sterne) – dort wird später ein Titel-Schriftzug gesetzt.

Kein Text, keine Buchstaben, keine Zahlen, keine Schilder, kein Logo, keine Signatur, kein Rahmen, keine Sprechblasen.
```

## nova_jubel

```text
Illustration einer Comic-Figur für eine Vokabel-Lern-App für einen 11-jährigen Jungen. Hochformat 2:3 (1024x1536). Das angehängte Bild ist die verbindliche Referenz für die Figur „Nova“: Zeichne exakt dieselbe Figur (gleiches Gesicht, gleiche zerzauste schwarze Frisur, gleicher Anzug, gleicher Schal, gleicher Helm, gleiche Stiefel, gleicher Zeichenstil) in einer neuen Pose.

Stil: Tusche-Comic zwischen Shōnen-Manga und Retro-Superheldenheft: kräftige schwarze Tuschekonturen mit wechselnder Strichstärke, flache Farbflächen, Rasterpunkte (Halftone) für Schatten, dynamische Posen, keine Verläufe, kein 3D, kein Text im Bild. Strenge Palette: Nachtblau #14213D, Signalgelb #FFC300, Korallrot #E63946, Papierweiß #F6F0E1, Tusche #111111.

Figur „Nova“: ein etwa 12-jähriger Nachwuchs-Held, cool statt niedlich – zerzauste Haare, kurzer gelber Umhang-Schal, nachtblauer Anzug mit gelben Seitenstreifen und einem schlichten gelben Stern-Emblem auf der Brust, roter Gürtel, rote Stulpen, rote Stiefel, rot-gelber Helm mit hochgeklapptem Visier. Normale Proportionen eines 12-Jährigen (kein Chibi, kein Riesenkopf, keine Kulleraugen). Haut in Papierweiß, Haare in Tusche-Schwarz.

Pose: Nova springt jubelnd in die Luft, eine Faust triumphierend hoch über den Kopf gereckt, Beine angewinkelt, breites offenes Siegerlachen, der Schal flattert. Den Helm trägt er auf dem Kopf, Visier hochgeklappt, das Gesicht ist frei sichtbar.

Ganze Figur von Kopf bis Fuß vollständig im Bild, mittig, mit Abstand zu allen Bildrändern. Hintergrund: eine einzige vollkommen gleichmäßige, flache Fläche in reinem Magenta #FF00FF – kein Boden, kein Schlagschatten, keine Rasterpunkte, keine Speedlines und keine Effekte außerhalb der Figur. Magenta kommt in der Figur selbst nirgends vor. Kein Text, keine Buchstaben, keine Zahlen, kein Logo, keine Signatur.
```

## nova_nochmal

```text
Illustration einer Comic-Figur für eine Vokabel-Lern-App für einen 11-jährigen Jungen. Hochformat 2:3 (1024x1536). Das angehängte Bild ist die verbindliche Referenz für die Figur „Nova“: Zeichne exakt dieselbe Figur (gleiches Gesicht, gleiche zerzauste schwarze Frisur, gleicher Anzug, gleicher Schal, gleicher Helm, gleiche Stiefel, gleicher Zeichenstil) in einer neuen Pose.

Stil: Tusche-Comic zwischen Shōnen-Manga und Retro-Superheldenheft: kräftige schwarze Tuschekonturen mit wechselnder Strichstärke, flache Farbflächen, Rasterpunkte (Halftone) für Schatten, dynamische Posen, keine Verläufe, kein 3D, kein Text im Bild. Strenge Palette: Nachtblau #14213D, Signalgelb #FFC300, Korallrot #E63946, Papierweiß #F6F0E1, Tusche #111111.

Figur „Nova“: ein etwa 12-jähriger Nachwuchs-Held, cool statt niedlich – zerzauste Haare, kurzer gelber Umhang-Schal, nachtblauer Anzug mit gelben Seitenstreifen und einem schlichten gelben Stern-Emblem auf der Brust, roter Gürtel, rote Stulpen, rote Stiefel, rot-gelber Helm mit hochgeklapptem Visier. Normale Proportionen eines 12-Jährigen (kein Chibi, kein Riesenkopf, keine Kulleraugen). Haut in Papierweiß, Haare in Tusche-Schwarz.

Pose: Nova macht Mut für einen neuen Versuch: Er streckt dem Betrachter einen Arm mit deutlich erhobenem Daumen entgegen, zwinkert und lächelt freundlich und zuversichtlich, Oberkörper leicht vorgebeugt, als würde er sagen „Komm, gleich nochmal, das schaffst du!“. Den Helm hält er locker unter dem anderen Arm. Der Ausdruck ist warm, aufmunternd und kumpelhaft – keinesfalls enttäuscht, traurig, mitleidig oder spöttisch.

Ganze Figur von Kopf bis Fuß vollständig im Bild, mittig, mit Abstand zu allen Bildrändern. Hintergrund: eine einzige vollkommen gleichmäßige, flache Fläche in reinem Magenta #FF00FF – kein Boden, kein Schlagschatten, keine Rasterpunkte, keine Speedlines und keine Effekte außerhalb der Figur. Magenta kommt in der Figur selbst nirgends vor. Kein Text, keine Buchstaben, keine Zahlen, kein Logo, keine Signatur.
```

## nova_denken

```text
Illustration einer Comic-Figur für eine Vokabel-Lern-App für einen 11-jährigen Jungen. Hochformat 2:3 (1024x1536). Das angehängte Bild ist die verbindliche Referenz für die Figur „Nova“: Zeichne exakt dieselbe Figur (gleiches Gesicht, gleiche zerzauste schwarze Frisur, gleicher Anzug, gleicher Schal, gleicher Helm, gleiche Stiefel, gleicher Zeichenstil) in einer neuen Pose.

Stil: Tusche-Comic zwischen Shōnen-Manga und Retro-Superheldenheft: kräftige schwarze Tuschekonturen mit wechselnder Strichstärke, flache Farbflächen, Rasterpunkte (Halftone) für Schatten, dynamische Posen, keine Verläufe, kein 3D, kein Text im Bild. Strenge Palette: Nachtblau #14213D, Signalgelb #FFC300, Korallrot #E63946, Papierweiß #F6F0E1, Tusche #111111.

Figur „Nova“: ein etwa 12-jähriger Nachwuchs-Held, cool statt niedlich – zerzauste Haare, kurzer gelber Umhang-Schal, nachtblauer Anzug mit gelben Seitenstreifen und einem schlichten gelben Stern-Emblem auf der Brust, roter Gürtel, rote Stulpen, rote Stiefel, rot-gelber Helm mit hochgeklapptem Visier. Normale Proportionen eines 12-Jährigen (kein Chibi, kein Riesenkopf, keine Kulleraugen). Haut in Papierweiß, Haare in Tusche-Schwarz.

Pose: Nova überlegt konzentriert: eine Hand am Kinn, der andere Arm stützt den Ellbogen, Blick schräg nach oben, eine Augenbraue hochgezogen, Gewicht lässig auf einem Bein. Den Helm trägt er auf dem Kopf, Visier hochgeklappt, das Gesicht ist frei sichtbar. Keine Fragezeichen, keine Denkblasen, keine Symbole.

Ganze Figur von Kopf bis Fuß vollständig im Bild, mittig, mit Abstand zu allen Bildrändern. Hintergrund: eine einzige vollkommen gleichmäßige, flache Fläche in reinem Magenta #FF00FF – kein Boden, kein Schlagschatten, keine Rasterpunkte, keine Speedlines und keine Effekte außerhalb der Figur. Magenta kommt in der Figur selbst nirgends vor. Kein Text, keine Buchstaben, keine Zahlen, kein Logo, keine Signatur.
```

## nova_schreiben

```text
Illustration einer Comic-Figur für eine Vokabel-Lern-App für einen 11-jährigen Jungen. Hochformat 2:3 (1024x1536). Das angehängte Bild ist die verbindliche Referenz für die Figur „Nova“: Zeichne exakt dieselbe Figur (gleiches Gesicht, gleiche zerzauste schwarze Frisur, gleicher Anzug, gleicher Schal, gleicher Helm, gleiche Stiefel, gleicher Zeichenstil) in einer neuen Pose.

Stil: Tusche-Comic zwischen Shōnen-Manga und Retro-Superheldenheft: kräftige schwarze Tuschekonturen mit wechselnder Strichstärke, flache Farbflächen, Rasterpunkte (Halftone) für Schatten, dynamische Posen, keine Verläufe, kein 3D, kein Text im Bild. Strenge Palette: Nachtblau #14213D, Signalgelb #FFC300, Korallrot #E63946, Papierweiß #F6F0E1, Tusche #111111.

Figur „Nova“: ein etwa 12-jähriger Nachwuchs-Held, cool statt niedlich – zerzauste Haare, kurzer gelber Umhang-Schal, nachtblauer Anzug mit gelben Seitenstreifen und einem schlichten gelben Stern-Emblem auf der Brust, roter Gürtel, rote Stulpen, rote Stiefel, rot-gelber Helm mit hochgeklapptem Visier. Normale Proportionen eines 12-Jährigen (kein Chibi, kein Riesenkopf, keine Kulleraugen). Haut in Papierweiß, Haare in Tusche-Schwarz.

Pose: Nova hält mit beiden Händen einen übergroßen Bleistift (fast so lang wie er selbst, gelber Schaft, schwarze Spitze, rotes Radiergummi-Ende) wie ein Schwert kampfbereit schräg vor dem Körper, fester breitbeiniger Stand, entschlossener Blick zum Betrachter, kämpferisches Grinsen. Den Helm trägt er auf dem Kopf, Visier hochgeklappt, das Gesicht ist frei sichtbar. Der Stift ist unbeschriftet.

Ganze Figur samt Stift vollständig im Bild, mittig, mit Abstand zu allen Bildrändern. Hintergrund: eine einzige vollkommen gleichmäßige, flache Fläche in reinem Magenta #FF00FF – kein Boden, kein Schlagschatten, keine Rasterpunkte, keine Speedlines und keine Effekte außerhalb der Figur. Magenta kommt in der Figur selbst nirgends vor. Kein Text, keine Buchstaben, keine Zahlen, kein Logo, keine Signatur.
```

## rang_1

```text
Rang-Abzeichen (Emblem, Aufnäher-Charakter) für eine Vokabel-Lern-App für einen 11-jährigen Jungen. Quadratisch (1024x1024). Teil einer Serie von fünf Rang-Abzeichen mit steigender Wertigkeit, die klar unterscheidbar sein und zusammenpassen müssen.

Stil: Tusche-Comic zwischen Shōnen-Manga und Retro-Superheldenheft: kräftige schwarze Tuschekonturen mit wechselnder Strichstärke, flache Farbflächen, Rasterpunkte (Halftone) für Schatten, dynamische Posen, keine Verläufe, kein 3D, kein Text im Bild. Strenge Palette: Nachtblau #14213D, Signalgelb #FFC300, Korallrot #E63946, Papierweiß #F6F0E1, Tusche #111111.

Motiv: Rang 1 von 5 (niedrigster Rang, bewusst schlicht): eine einfache Helden-Augenmaske (Domino-Maske) in Korallrot mit zwei Augenschlitzen und kurzen flatternden Bändern. Die Plakette ist ein schlichter runder nachtblauer Schild mit einfachem papierweißem Rand – keine Sterne, keine Strahlen, kein Schmuck.

Das Motiv sitzt groß und klar lesbar in der Mitte der Plakette, auch in 64 Pixel Größe noch erkennbar. Flach und grafisch wie ein gedruckter Comic-Sticker, kein Metallglanz, keine Prägung, kein 3D-Effekt. Das Abzeichen hat rundum eine dicke geschlossene schwarze Tuschekontur, steht mittig und füllt etwa 80 Prozent des Bildes, mit Abstand zu allen Bildrändern. Hintergrund: eine einzige vollkommen gleichmäßige, flache Fläche in reinem Magenta #FF00FF – kein Schlagschatten, keine Rasterpunkte, keine Strahlen und keine Effekte außerhalb des Abzeichens. Magenta kommt im Abzeichen selbst nirgends vor. Kein Text, keine Buchstaben, keine Zahlen, keine römischen Ziffern, kein Banner mit Schrift, kein Logo, keine Signatur.
```

## rang_2

```text
Rang-Abzeichen (Emblem, Aufnäher-Charakter) für eine Vokabel-Lern-App für einen 11-jährigen Jungen. Quadratisch (1024x1024). Teil einer Serie von fünf Rang-Abzeichen mit steigender Wertigkeit, die klar unterscheidbar sein und zusammenpassen müssen.

Stil: Tusche-Comic zwischen Shōnen-Manga und Retro-Superheldenheft: kräftige schwarze Tuschekonturen mit wechselnder Strichstärke, flache Farbflächen, Rasterpunkte (Halftone) für Schatten, dynamische Posen, keine Verläufe, kein 3D, kein Text im Bild. Strenge Palette: Nachtblau #14213D, Signalgelb #FFC300, Korallrot #E63946, Papierweiß #F6F0E1, Tusche #111111.

Motiv: Rang 2 von 5 (noch eher schlicht): ein korallroter Heldenstiefel in Seitenansicht mit einem kleinen signalgelben Flügel an der Ferse. Die Plakette ist ein runder nachtblauer Schild mit doppeltem Rand (papierweiß und signalgelb) und einem einzelnen kleinen Stern unten am Rand.

Das Motiv sitzt groß und klar lesbar in der Mitte der Plakette, auch in 64 Pixel Größe noch erkennbar. Flach und grafisch wie ein gedruckter Comic-Sticker, kein Metallglanz, keine Prägung, kein 3D-Effekt. Das Abzeichen hat rundum eine dicke geschlossene schwarze Tuschekontur, steht mittig und füllt etwa 80 Prozent des Bildes, mit Abstand zu allen Bildrändern. Hintergrund: eine einzige vollkommen gleichmäßige, flache Fläche in reinem Magenta #FF00FF – kein Schlagschatten, keine Rasterpunkte, keine Strahlen und keine Effekte außerhalb des Abzeichens. Magenta kommt im Abzeichen selbst nirgends vor. Kein Text, keine Buchstaben, keine Zahlen, keine römischen Ziffern, kein Banner mit Schrift, kein Logo, keine Signatur.
```

## rang_3

```text
Rang-Abzeichen (Emblem, Aufnäher-Charakter) für eine Vokabel-Lern-App für einen 11-jährigen Jungen. Quadratisch (1024x1024). Teil einer Serie von fünf Rang-Abzeichen mit steigender Wertigkeit, die klar unterscheidbar sein und zusammenpassen müssen.

Stil: Tusche-Comic zwischen Shōnen-Manga und Retro-Superheldenheft: kräftige schwarze Tuschekonturen mit wechselnder Strichstärke, flache Farbflächen, Rasterpunkte (Halftone) für Schatten, dynamische Posen, keine Verläufe, kein 3D, kein Text im Bild. Strenge Palette: Nachtblau #14213D, Signalgelb #FFC300, Korallrot #E63946, Papierweiß #F6F0E1, Tusche #111111.

Motiv: Rang 3 von 5 (mittlerer Rang, deutlich wertiger): ein rot-gelber Heldenhelm mit hochgeklapptem Visier in Dreiviertelansicht. Die Plakette ist ein nachtblauer Wappenschild mit spitzem unterem Ende, kräftigem signalgelbem Rand und drei kleinen Sternen am oberen Rand.

Das Motiv sitzt groß und klar lesbar in der Mitte der Plakette, auch in 64 Pixel Größe noch erkennbar. Flach und grafisch wie ein gedruckter Comic-Sticker, kein Metallglanz, keine Prägung, kein 3D-Effekt. Das Abzeichen hat rundum eine dicke geschlossene schwarze Tuschekontur, steht mittig und füllt etwa 80 Prozent des Bildes, mit Abstand zu allen Bildrändern. Hintergrund: eine einzige vollkommen gleichmäßige, flache Fläche in reinem Magenta #FF00FF – kein Schlagschatten, keine Rasterpunkte, keine Strahlen und keine Effekte außerhalb des Abzeichens. Magenta kommt im Abzeichen selbst nirgends vor. Kein Text, keine Buchstaben, keine Zahlen, keine römischen Ziffern, kein Banner mit Schrift, kein Logo, keine Signatur.
```

## rang_4

```text
Rang-Abzeichen (Emblem, Aufnäher-Charakter) für eine Vokabel-Lern-App für einen 11-jährigen Jungen. Quadratisch (1024x1024). Teil einer Serie von fünf Rang-Abzeichen mit steigender Wertigkeit, die klar unterscheidbar sein und zusammenpassen müssen.

Stil: Tusche-Comic zwischen Shōnen-Manga und Retro-Superheldenheft: kräftige schwarze Tuschekonturen mit wechselnder Strichstärke, flache Farbflächen, Rasterpunkte (Halftone) für Schatten, dynamische Posen, keine Verläufe, kein 3D, kein Text im Bild. Strenge Palette: Nachtblau #14213D, Signalgelb #FFC300, Korallrot #E63946, Papierweiß #F6F0E1, Tusche #111111.

Motiv: Rang 4 von 5 (hoher Rang, prächtig): ein großer signalgelber fünfzackiger Stern, durch den ein korallroter Blitz schlägt. Die Plakette ist ein nachtblauer Wappenschild mit gezacktem signalgelbem Strahlenkranz dahinter, links und rechts kleine Flügel in Papierweiß, vier kleine Sterne am oberen Rand.

Das Motiv sitzt groß und klar lesbar in der Mitte der Plakette, auch in 64 Pixel Größe noch erkennbar. Flach und grafisch wie ein gedruckter Comic-Sticker, kein Metallglanz, keine Prägung, kein 3D-Effekt. Das Abzeichen hat rundum eine dicke geschlossene schwarze Tuschekontur, steht mittig und füllt etwa 80 Prozent des Bildes, mit Abstand zu allen Bildrändern. Hintergrund: eine einzige vollkommen gleichmäßige, flache Fläche in reinem Magenta #FF00FF – kein Schlagschatten, keine Rasterpunkte, keine Strahlen und keine Effekte außerhalb des Abzeichens. Magenta kommt im Abzeichen selbst nirgends vor. Kein Text, keine Buchstaben, keine Zahlen, keine römischen Ziffern, kein Banner mit Schrift, kein Logo, keine Signatur.
```

## rang_5

```text
Rang-Abzeichen (Emblem, Aufnäher-Charakter) für eine Vokabel-Lern-App für einen 11-jährigen Jungen. Quadratisch (1024x1024). Teil einer Serie von fünf Rang-Abzeichen mit steigender Wertigkeit, die klar unterscheidbar sein und zusammenpassen müssen.

Stil: Tusche-Comic zwischen Shōnen-Manga und Retro-Superheldenheft: kräftige schwarze Tuschekonturen mit wechselnder Strichstärke, flache Farbflächen, Rasterpunkte (Halftone) für Schatten, dynamische Posen, keine Verläufe, kein 3D, kein Text im Bild. Strenge Palette: Nachtblau #14213D, Signalgelb #FFC300, Korallrot #E63946, Papierweiß #F6F0E1, Tusche #111111.

Motiv: Rang 5 von 5 (höchster Rang, legendär, am aufwendigsten): ein strahlender Planet mit Ring in Signalgelb und Korallrot, von dem kräftige Lichtstrahlen ausgehen. Die Plakette ist ein großer vielzackiger signalgelber Strahlenstern mit nachtblauem Mittelfeld, eingerahmt von einem Lorbeerkranz in Papierweiß, obenauf eine kleine Krone aus fünf Sternen.

Das Motiv sitzt groß und klar lesbar in der Mitte der Plakette, auch in 64 Pixel Größe noch erkennbar. Flach und grafisch wie ein gedruckter Comic-Sticker, kein Metallglanz, keine Prägung, kein 3D-Effekt. Das Abzeichen hat rundum eine dicke geschlossene schwarze Tuschekontur, steht mittig und füllt etwa 80 Prozent des Bildes, mit Abstand zu allen Bildrändern. Hintergrund: eine einzige vollkommen gleichmäßige, flache Fläche in reinem Magenta #FF00FF – kein Schlagschatten, keine Rasterpunkte, keine Strahlen und keine Effekte außerhalb des Abzeichens. Magenta kommt im Abzeichen selbst nirgends vor. Kein Text, keine Buchstaben, keine Zahlen, keine römischen Ziffern, kein Banner mit Schrift, kein Logo, keine Signatur.
```

## fertig

```text
Abschlussbild einer Übungsrunde in einer Vokabel-Lern-App für einen 11-jährigen Jungen. Querformat (1536x1024). Das angehängte Bild ist die verbindliche Referenz für die Figur „Nova“: Zeichne exakt dieselbe Figur (gleiches Gesicht, gleiche zerzauste schwarze Frisur, gleicher Anzug, gleicher Schal, gleicher Helm, gleiche Stiefel, gleicher Zeichenstil).

Stil: Tusche-Comic zwischen Shōnen-Manga und Retro-Superheldenheft: kräftige schwarze Tuschekonturen mit wechselnder Strichstärke, flache Farbflächen, Rasterpunkte (Halftone) für Schatten, dynamische Posen, keine Verläufe, kein 3D, kein Text im Bild. Strenge Palette: Nachtblau #14213D, Signalgelb #FFC300, Korallrot #E63946, Papierweiß #F6F0E1, Tusche #111111.

Figur „Nova“: ein etwa 12-jähriger Nachwuchs-Held, cool statt niedlich – zerzauste Haare, kurzer gelber Umhang-Schal, nachtblauer Anzug mit gelben Seitenstreifen und einem schlichten gelben Stern-Emblem auf der Brust, roter Gürtel, rote Stulpen, rote Stiefel, rot-gelber Helm mit hochgeklapptem Visier. Normale Proportionen eines 12-Jährigen (kein Chibi, kein Riesenkopf, keine Kulleraugen). Haut in Papierweiß, Haare in Tusche-Schwarz.

Szene: Nova fliegt jubelnd diagonal von links unten nach rechts oben durchs Bild, eine Faust weit nach vorn gestreckt, breites Siegerlachen, Helm auf dem Kopf mit hochgeklapptem Visier, der gelbe Schal flattert hinter ihm. Ganze Figur im Bild, perspektivisch leicht verkürzt. Hintergrund: kräftige radiale Speedlines in Tusche und Papierweiß auf Nachtblau, die aus der Flugrichtung kommen, dazu ein großer signalgelber Strahlenkranz hinter der Figur, ein paar Sterne und Rasterpunkt-Flächen in Korallrot. Energiegeladen wie das Schlussbild eines Shōnen-Kapitels.

Kein Text, keine Buchstaben, keine Zahlen, keine Soundwörter, kein Logo, keine Signatur, kein Rahmen, keine Sprechblasen.
```

