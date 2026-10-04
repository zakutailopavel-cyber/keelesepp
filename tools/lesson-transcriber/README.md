# KeeleSepp lesson transcriber (free, runs on the school Mac)

Live Classroom records a lesson as two audio tracks (teacher, student) in 5-minute files in Firebase Storage
`lessonRecordings/{recordingId}/`. This worker turns them into a dialogue with timestamps, for free, with
whisper.cpp on the Mac. No audio goes to any other service. Audio is deleted after 60 days; the text stays on
`lessonRecordings/{recordingId}.transcript = [{ speaker: teacher|student, startMs, endMs, text }]`.

## Quick setup (recommended)

1. Save the service account key as `~/KeeleSeppTranscriber/service-account.json` (step 1 below; it is a secret, never commit it or paste it into a chat).
2. On the Mac, in the repository: `tools/lesson-transcriber/install-mac.sh`

The script installs whisper-cpp/ffmpeg/node (Homebrew) if missing, downloads the models, runs `npm install` and
registers the launchd agent. From then on the transcriber **starts by itself when the Mac user logs in**, restarts if it
stops, and waits quietly; there is nothing to start before a lesson. It writes a heartbeat to
`transcriberStatus/{host}` every minute, and the teacher sees in the Live Classroom recording panel
„Transkribeerija töötab” (or „Mac ei transkribeeri” next to „Salvestan” when it is not running). While a lesson is being
transcribed it keeps the Mac awake (`caffeinate`). Re-run the script after `git pull` to restart with new code.

## One-time setup (manual, same steps as the script)

1. **Service account key** (owner, Firebase console → Project settings → Service accounts → Generate new private key).
   Save it as `~/KeeleSeppTranscriber/service-account.json`. It is a secret: never commit it.
2. **Whisper model** (≈1.6 GB) and the **voice activity model** (≈0.9 MB, gives exact phrase times and stops
   invented text on silence), once:
   ```bash
   mkdir -p ~/KeeleSeppTranscriber/models
   curl -L -o ~/KeeleSeppTranscriber/models/ggml-large-v3-turbo.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo.bin
   curl -L -o ~/KeeleSeppTranscriber/models/ggml-silero-v5.1.2.bin https://huggingface.co/ggml-org/whisper-vad/resolve/main/ggml-silero-v5.1.2.bin
   # Estonian lessons: TalTech's Estonian verbatim model (MIT, TalTechNLP/whisper-large-v3-turbo-et-verbatim-2604).
   # On the Etteütlus 2024 sample it made 1 error where large-v3-turbo made ~20. Used automatically when present.
   curl -L -o ~/KeeleSeppTranscriber/models/ggml-taltech-et-verbatim-2604.bin https://huggingface.co/TalTechNLP/whisper-large-v3-turbo-et-verbatim-2604/resolve/main/ggml/ggml-model.bin
   ```
3. **Dependencies:** `npm install` in this folder. `whisper-cli` (Homebrew `whisper-cpp`) and `ffmpeg` must be installed.
4. **Try once:** `GOOGLE_APPLICATION_CREDENTIALS=~/KeeleSeppTranscriber/service-account.json npm run once`
5. **Start at login** (launchd):
   ```bash
   sed -e "s#__REPO__#$(git rev-parse --show-toplevel)#" -e "s#__HOME__#$HOME#g" -e "s#__NODE__#$(which node)#" \
     -e "s#__WHISPER__#$(which whisper-cli)#" -e "s#__FFMPEG__#$(which ffmpeg)#" \
     ee.keelesepp.transcriber.plist > ~/Library/LaunchAgents/ee.keelesepp.transcriber.plist
   launchctl load ~/Library/LaunchAgents/ee.keelesepp.transcriber.plist
   ```
   Log: `~/KeeleSeppTranscriber/transcriber.log`.

## What it does every minute

- A recording left in `recording` for more than 3 hours (teacher closed the tab) is handed over as `uploaded`.
- `uploaded` recordings are claimed (`transcribing`), each segment is converted to 16 kHz WAV and transcribed in the
  lesson language (`et`, or `en` for English learners); both tracks are merged into one dialogue → `done`.
  Errors → `failed` with the message.
- About once an hour: audio of `done`/`failed` recordings older than 60 days is deleted (`audioDeletedAt`).

If the Mac is off, recordings wait and are processed when it is back. On an M-series Mac one hour of lesson takes a
few minutes (a 15-second two-track test took about 2 seconds). Tests: `npm test`.
