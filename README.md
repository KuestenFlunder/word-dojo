# Word Dojo

Englisch-Vokabeltrainer für ein Kind (5./6. Klasse) mit Legasthenie. Expo / React Native, läuft als
statische Web-App und auf dem iPad. Aktueller Inhalt: Unit 2 · Part 1, 56 Wörter.

Diese Datei ist zugleich die **Übergabe an einen Agenten, der das Projekt ohne Vorwissen übernimmt**.
Die verbindlichen Arbeitsregeln fürs Repo stehen in [`AGENTS.md`](AGENTS.md) – zuerst lesen.

## Stand (23.11.2026)

Spielbar und im Browser durchgeklickt. Noch nicht veröffentlicht, noch nie auf einem echten iPad geprüft.

- `npm test` (14 Suites, 213 Tests), `npm run typecheck`, `npm run build:web`: grün.
- Sichtprüfung nur in fensterlosem Chrome bei 1194×834, 1180×760, 834×1194 und 390×844: Start, Karte
  vorn/hinten, Schreiben, „Richtig!“, Abschreiben, eine ganze Schreib-Runde bis „Geschafft!“, Start der
  gemischten Runde. Keine Laufzeitfehler, kein horizontales Scrollen.
- Termine: Das Kind soll ab Freitag, 27.11.2026 damit üben, spätestens Montag, 30.11.2026.

## Befehle

```bash
npm install
npm run web          # Dev-Server im Browser
npm test             # Jest
npm run typecheck    # tsc --noEmit
npm run build:web    # statischer Export nach dist/
python3 -m http.server 8765 --directory dist   # Export lokal ansehen (auch vom iPad im selben WLAN)
```

Pakete nur mit `npx expo install <paket>` hinzufügen.

## Was die App tut

- **Vier Einstiege:** Schreiben (Deutsch lesen, Englisch tippen), Karte Deutsch → Englisch, Karte
  Englisch → Deutsch, Gemischt (alle drei durcheinander).
- **Karte:** Zuerst ist nur die Frage-Seite sichtbar. Ein Tipp auf die Karte dreht sie um; erst dann
  erscheinen Antwort und „Noch nicht“ / „Gewusst!“.
- **Schreiben:** Bei falscher Eingabe wird das richtige Wort gezeigt und muss einmal richtig
  abgeschrieben werden, erst dann geht es weiter.
- **Karteikasten:** 5 Fächer, dargestellt als Gürtel (Weiß, Gelb, Grün, Rot, Schwarz). Richtig = ein
  Fach weiter, falsch oder nicht gewusst = zurück in Fach 1. Wartezeiten 0/1/2/4/7 Tage. Der Stand wird
  pro Wort **und** pro Modus getrennt geführt.
- **Belohnung:** Sterne und Tage-Serie. Alles liegt lokal auf dem Gerät, kein Konto, kein Netz.

## Regeln, die nicht aufgeweicht werden dürfen

Sie kommen vom Vater des Kindes und sind der Grund, warum es die App gibt.

- Nie bestrafen: Sterne werden nur mehr. Ein Schreibfehler kostet nichts außer dem Abschreiben.
- Kein Zeitdruck, kein Timer, keine Fehlertöne, keine Fehlerzähler.
- Rot ist Farbe für Aktionen, nie für Fehler. Fehlerstellen bekommen einen weißen Kasten mit Tuscherand.
- Bei Karten dürfen Deutsch und Englisch nie gleichzeitig sichtbar sein, bevor umgedreht wurde.
- Lernwörter stehen groß in der Leseschrift Andika mit Buchstabenabstand.
- Der Look darf nicht nach Kleinkind-App und nicht nach generischem KI-Design aussehen. Zwei frühere
  Lern-Apps derselben Familie sind Comic bzw. Manga in Schwarz/Rot/Gelb; ein erster Entwurf hier in
  Nachtblau/Gelb/Rot wurde als „zu ähnlich“ abgelehnt. Gewählt wurde der Tusche-Stil „Dojo“.

## Entscheidungen, die noch kippen können

Vom vorherigen Agenten gesetzt und dem Nutzer genannt, aber von ihm nicht ausdrücklich bestätigt.
Jede ist an genau einer Stelle änderbar.

| Entscheidung | Stelle |
|---|---|
| Gemischt enthält alle drei Modi, auch Schreiben | `GEMISCHT_MODI` in `src/learning/gemischt.ts` |
| Eine Runde hat höchstens 12 Wörter | `RUNDEN_GROESSE` in `src/runde/regeln.ts` |
| Freies Üben: richtig gibt Sterne, aber kein höheres Fach; falsch geht in Fach 1 | `verbuchungNachUebungsart()` in `src/runde/regeln.ts` |
| Wartezeiten der Fächer | `BOX_INTERVAL_DAYS` in `src/learning/leitner.ts` |
| „hard-working“ verlangt den Bindestrich; bei „hero, heroes“ reicht „hero“ | `accept`-Listen in `src/data/unit2part1.ts` |
| Fehlerstellen werden nur markiert, wenn höchstens die Hälfte der Buchstaben betroffen ist | `MARKIERUNG_BIS_ANTEIL` in `src/runde/abschrift.ts` |

## Aufbau

| Ordner | Inhalt |
|---|---|
| `src/app/` | Routen (expo-router): `index` (Start), `runde` (alle Runden-Ansichten), `+html`, `_layout` |
| `src/screens/` | Start, Karte, Schreiben, Abschreiben, Fertig |
| `src/components/` | Bausteine (Knopf, Flaeche, Kopfzeile, GuertelLeiste, Figur, Eingabefeld …) |
| `src/theme/` | Farben, Schriften, Maße, Bildregister (`bilder.ts`). Farb- und Schriftwerte stehen nur hier |
| `src/learning/` | Lernlogik ohne React, vollständig getestet: Karteikasten, Sitzung, Gemischt, Schreibprüfung mit Diff, Sterne/Serie, Ablage |
| `src/runde/` | Runden-Steuerung zwischen Lernlogik und Bildschirmen, Texte, Regeln fürs freie Üben |
| `src/progress/` | `ProgressProvider`: lädt den Stand erst in einem Effekt, speichert nach jeder Antwort |
| `src/data/` | Vokabel-Sets. Ein neues Set = neue Datei + Eintrag in `src/data/index.ts` |
| `assets/art/dojo/` | Fertige Bilder: 6 Posen der Figur, 3 Szenen, 5 Gürtel, Icon |
| `tools/art/` | Bild-Werkzeuge und Prompts (siehe unten) |

Die Wort-IDs (`u2p1:hero` …) stehen im gespeicherten Fortschritt. Nie umbenennen oder wiederverwenden.

## Bilder

Alle Illustrationen wurden mit der Codex-CLI erzeugt (`codex exec`, Feature `image_generation`), nicht
von Hand gebaut – der Nutzer will das ausdrücklich so. Der Prompt muss **vor** `-i <bild>` stehen,
sonst schluckt `-i` den Prompt.

- `tools/art/dojo/prompts/` – ein Prompt je Bild; Stiltext und Figurenbeschreibung stehen in
  `tools/art/dojo/prompts_schreiben.mjs` an einer Stelle.
- `tools/art/dojo/erzeugen.sh` – Codex-Aufruf, Referenzbild für die Figur ist `tools/art/dojo/roh/bereit.png`.
- `tools/art/dojo/aufbereiten.mjs` + `freistellen.json` – Freistellen, Zuschnitt, WebP. Braucht `sharp`,
  das in diesem Projekt nicht installiert ist (bisher aus einem Nachbarprojekt aufgerufen).
- Die Figur ist cremefarben wie das Papier und nur durch die Tuschekontur abgegrenzt: nur auf dem
  Washi-Grund `#EDE1CB` oder hellem Papier zeigen.
- `assets/art/dojo/szenen/dojo.webp` und `figuren/gruss.webp` sind vorhanden, `dojo.webp` ist ungenutzt.

Rohbilder der verworfenen Stile, Protokolle und Kontrollbilder sind nicht eingecheckt (`.gitignore`).

## Offen

1. **Veröffentlichen.** Die Seite soll öffentlich ins Web. Hosting ist nicht entschieden (Vorschlag:
   GitHub Pages). Die Asset-Pfade im Export sind absolut (`/assets/…`); liegt die Seite in einem
   Unterpfad, braucht sie eine Basis-URL (`experiments.baseUrl` in `app.json` – in der Expo-Doku zur
   SDK-Version prüfen). Der Fortschritt hängt an der Web-Adresse: ein späterer Umzug setzt ihn zurück.
2. **Echtes iPad prüfen.** Ungeprüft sind: ob die Bildschirmtastatur beim Schreiben „Prüfen“ verdeckt
   (Enter prüft ebenfalls), die Dreh-Animation der Karte, die ungleichmäßigen Eckradien, die
   japanischen Zierzeichen auf dem Start.
3. **Schrift lädt nicht immer.** In 2 von etwa 6 Testläufen im fensterlosen Chrome meldete eine der
   drei Schriften den Status `error` (einmal Andika Regular, einmal Reggae One), dann erscheint eine
   Ersatzschrift. Ursache unbekannt; drei Wiederholungen direkt danach waren fehlerfrei. Die Schriften
   werden per `useFonts` geladen (`src/theme/schriften.ts`, `src/app/_layout.tsx`); Reggae One ist 2,1 MB groß.
4. **Offline im Web.** Es gibt keinen Service Worker; ohne Netz läuft die Seite nur aus dem Browser-Cache.
5. **Native iPad-App.** Bisher nur Web. `react-native-svg` ist ein natives Modul; ob Expo Go es
   mitbringt, ist ungeprüft.
6. **Weitere Vokabel-Sets** sind vorgesehen, aber es gibt nur eines und keine Set-Auswahl auf dem Start.
7. Der Nutzer wollte ursprünglich auch den Stoff einer Deutsch-Arbeit zu Fabeln (07.12.2026) üben
   lassen; das wurde nicht weiterverfolgt und ist nicht geklärt.

## Zusammenarbeit mit dem Nutzer

- Deutsch für Kommunikation und Commit-Messages; Code-Bezeichner bleiben, wie sie sind.
- Bei Unsicherheit fragen statt raten; alles, was nicht von der Frage abhängt, trotzdem liefern.
- Gestaltung als sichtbaren Entwurf zeigen und bei offener Stilfrage zwei bis drei Varianten des
  Startbildschirms anbieten, bevor ein Stil ausgebaut wird.
- Immer Feature-Branches, nie direkt auf `main`.
