#!/bin/zsh
# Erzeugt ein Rohbild mit der Codex-CLI (Feature image_generation).
#
# Aufruf:
#   zsh tools/art/erzeugen.sh <gruppe> <name> [referenzbild.png]
#     gruppe: figuren | szenen | abzeichen
#     name:   Dateiname ohne Endung; der Prompt liegt in tools/art/prompts/<name>.txt
#
# Ergebnis: tools/art/roh/<gruppe>/<name>.png
#
# Wichtig: Der Prompt steht VOR -i, sonst schluckt -i (variadisch) den Prompt.
set -u
hier="${0:A:h}"
gruppe="$1"
name="$2"
ref="${3:-}"
zielordner="$hier/roh/$gruppe"
mkdir -p "$zielordner"
auftrag="$(cat "$hier/prompts/$name.txt")

Arbeitsanweisung: Erzeuge genau EIN Bild mit deinem eingebauten Bildgenerierungs-Werkzeug (image_generation), nicht mit Code, SVG oder Skripten. Übernimm die Stilbeschreibung wörtlich in den Bild-Prompt. Speichere bzw. kopiere das fertige Bild danach als PNG unter dem Namen $name.png in das aktuelle Arbeitsverzeichnis. Verändere das Bild nicht nachträglich. Antworte am Ende nur mit dem Dateipfad."
if [[ -n "$ref" ]]; then
  codex exec --skip-git-repo-check --enable image_generation -s workspace-write -C "$zielordner" "$auftrag" -i "$ref"
else
  codex exec --skip-git-repo-check --enable image_generation -s workspace-write -C "$zielordner" "$auftrag"
fi
