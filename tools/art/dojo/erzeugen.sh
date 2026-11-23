#!/bin/zsh
# Dojo-Bildsatz: erzeugt Rohbilder parallel mit der Codex-CLI (wie ../stile/erzeugen.sh).
# Aufruf: zsh tools/art/dojo/erzeugen.sh <name> [<name> ...]
# Prompt: dojo/prompts/<name>.txt  ->  Ergebnis: dojo/roh/<name>.png
# Bilder mit dem Jungen bekommen roh/bereit.png (= stile/roh/c_held.png) als
# Referenz mit. Wichtig bei codex exec: der Prompt steht VOR -i <bild>.
# Ein vorhandenes roh/<name>.png wird vorher nach roh/verworfen/ verschoben.
set -u
hier="${0:A:h}"
mkdir -p "$hier/roh/verworfen" "$hier/log"
for name in "$@"; do
  (
    arbeit="$hier/roh/.lauf_$name"
    rm -rf "$arbeit"; mkdir -p "$arbeit"
    ref=()
    zusatz=""
    case "$name" in
      icon|dojo) ;;
      guertel_*)
        ref=(-i "$hier/roh/guertel.png")
        zusatz=" Das beigefügte Bild ist die Stil-Referenz: Form, Strich und Farben der Gürtel genau so übernehmen." ;;
      *)
        ref=(-i "$hier/roh/bereit.png")
        zusatz=" Das beigefügte Bild ist die verbindliche Figuren-Referenz: Gib es dem Bildgenerierungs-Werkzeug als Referenzbild mit, damit Gesicht, Frisur, Stirnband, Kleidung und Zeichenstrich des Jungen identisch bleiben; nur die Pose ist neu." ;;
    esac
    auftrag="$(cat "$hier/prompts/$name.txt")

Arbeitsanweisung: Erzeuge genau EIN Bild mit deinem eingebauten Bildgenerierungs-Werkzeug (image_generation), nicht mit Code, SVG oder Skripten. Übernimm die Stilbeschreibung wörtlich in den Bild-Prompt.$zusatz Speichere bzw. kopiere das fertige Bild danach als PNG unter dem Namen $name.png in das aktuelle Arbeitsverzeichnis. Verändere das Bild nicht nachträglich. Antworte am Ende nur mit dem Dateipfad."
    codex exec --skip-git-repo-check --enable image_generation -s workspace-write -C "$arbeit" "$auftrag" "${ref[@]}" > "$hier/log/$name.log" 2>&1 < /dev/null
    if [[ -f "$arbeit/$name.png" ]]; then
      if [[ -f "$hier/roh/$name.png" ]]; then
        mv -f "$hier/roh/$name.png" "$hier/roh/verworfen/${name}_$(date +%H%M%S).png"
      fi
      mv -f "$arbeit/$name.png" "$hier/roh/$name.png"; echo "OK   $name"
    else
      echo "FEHLT $name (siehe log/$name.log)"
    fi
    rm -rf "$arbeit"
  ) &
done
wait
