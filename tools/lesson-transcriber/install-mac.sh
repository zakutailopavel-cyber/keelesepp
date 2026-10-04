#!/bin/bash
# One-time (and repeatable) setup of the KeeleSepp lesson transcriber on the school Mac.
# After this the transcriber starts by itself whenever the Mac user logs in, restarts if it stops, and waits
# quietly until a lesson recording is uploaded. Re-run after `git pull` to restart it with the new code.
# The service account key is never downloaded or printed here: the owner saves it himself (README step 1).
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="$(git -C "$HERE" rev-parse --show-toplevel)"
DATA="$HOME/KeeleSeppTranscriber"
MODELS="$DATA/models"
KEY="$DATA/service-account.json"
PLIST="$HOME/Library/LaunchAgents/ee.keelesepp.transcriber.plist"

say() { printf '\n== %s\n' "$*"; }

[ "$(uname)" = "Darwin" ] || { echo "See skript on Maci jaoks."; exit 1; }
command -v brew >/dev/null || { echo "Paigalda kõigepealt Homebrew: https://brew.sh"; exit 1; }

say "Programmid (whisper-cpp, ffmpeg, node)"
command -v whisper-cli >/dev/null || brew install whisper-cpp
command -v ffmpeg >/dev/null || brew install ffmpeg
command -v node >/dev/null || brew install node
WHISPER="$(command -v whisper-cli)"; FFMPEG="$(command -v ffmpeg)"; NODE="$(command -v node)"

say "Mudelid ($MODELS)"
mkdir -p "$MODELS"
get() { [ -s "$MODELS/$1" ] && { echo "olemas: $1"; return; }; curl -fL -C - -o "$MODELS/$1.part" "$2" && mv "$MODELS/$1.part" "$MODELS/$1"; }
get ggml-large-v3-turbo.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo.bin
get ggml-silero-v5.1.2.bin https://huggingface.co/ggml-org/whisper-vad/resolve/main/ggml-silero-v5.1.2.bin
get ggml-taltech-et-verbatim-2604.bin https://huggingface.co/TalTechNLP/whisper-large-v3-turbo-et-verbatim-2604/resolve/main/ggml/ggml-model.bin

say "Firebase'i võti"
if [ ! -s "$KEY" ]; then
  echo "Puudub $KEY"
  echo "Firebase console → Project settings → Service accounts → Generate new private key,"
  echo "salvesta fail nimega service-account.json kausta $DATA ja käivita see skript uuesti."
  exit 1
fi
chmod 600 "$KEY"
echo "olemas"

say "npm install"
(cd "$HERE" && npm install --omit=dev --no-audit --no-fund)

say "Automaatne käivitus (launchd)"
mkdir -p "$(dirname "$PLIST")"
sed -e "s#__REPO__#$REPO#" -e "s#__HOME__#$HOME#g" -e "s#__NODE__#$NODE#" -e "s#__WHISPER__#$WHISPER#" -e "s#__FFMPEG__#$FFMPEG#" \
  "$HERE/ee.keelesepp.transcriber.plist" > "$PLIST"
launchctl unload "$PLIST" 2>/dev/null || true
launchctl load -w "$PLIST"

sleep 5
say "Logi ($DATA/transcriber.log)"
tail -n 5 "$DATA/transcriber.log" || true
echo
echo "Valmis. Transkribeerija käivitub nüüd iga kord, kui sellesse Maci sisse logid."
echo "Live Classroomis näed salvestamise paneelis „Transkribeerija töötab”."
echo "Mac ei tohi magama jääda: System Settings → Energy → „Prevent automatic sleeping when the display is off”."
