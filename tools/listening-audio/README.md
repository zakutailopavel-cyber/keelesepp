# Listening audio (kuulamisülesannete heli)

Every listening block of the course sheets (`crm-v2/src/features/worksheet-generator/admin/course/registry.js`)
gets a recorded MP3, so the teacher does not have to read the transcript aloud.

- TTS: the free public Estonian TTS of TartuNLP (Neurokõne), `https://api.tartunlp.ai/text-to-speech/v2`.
- Output: `crm-v2/public/audio/<lessonId>/<blockId>.mp3` (mono, 22.05 kHz, 32 kbps, loudness −16 LUFS) and the
  manifest `crm-v2/src/features/worksheet-generator/admin/course/listeningAudio.json`
  (`"<lessonId>:<blockId>": { src, seconds, hash }`, hash = sha1 of the transcript).
- `buildCourseSheet` attaches `data.audio = { src, name, seconds }` and turns „Õpetaja loeb X kaks korda” into
  „Kuula X kaks korda” (`admin/course/listeningAudio.js`). The module files are not changed.

## Run

```sh
node tools/listening-audio/plan.mjs            # dry run: blocks, requests, voices (no network)
node tools/listening-audio/plan.mjs a2-093     # segments and voices of matching blocks
node tools/listening-audio/build.mjs           # only blocks whose transcript changed
node tools/listening-audio/build.mjs --only a2-093:093_d_listen
node tools/listening-audio/build.mjs --force   # everything again (~1 h)
```

Needs Node ≥ 22 and ffmpeg with libmp3lame (`FFMPEG` / `FFPROBE` env, default `/opt/homebrew/opt/ffmpeg-full/bin/…`).
After editing a transcript, run `build.mjs`: `listeningAudio.test.js` fails until the hash matches again.

## How a transcript is read (`plan.mjs`)

- A line „Name: text” (one or two words before the colon) is a speaker turn; the label is not spoken. A transcript
  with only one such line is plain narration („Müüja ütles: …”). „Kordame:”, „Kokkuvõtteks:”, … are narration.
- „Linnavolinik” / „Volinik”, „Kolleeg Anne” / „Anne” are one person.
- Female names / roles → mari, liivika, külli, vesta; male → albert, kalev, tambet, indrek, meelis, peeter; unknown
  roles alternate. Each speaker of a transcript has a different voice; narration gets one more voice. The choice is
  stable per transcript (seeded with its hash) and varies across the course.
- Speed 0.9 for A2 levels, 1.0 from B1. Long lines are split at sentence boundaries (< 280 characters per request).
- Pauses: 0.45 s between lines / turns, 0.25 s between parts of one line.

Politeness: one request at a time, ≥ 1.1 s apart, retries with backoff. Synthesised pieces are cached in
`tools/listening-audio/.cache/` (git-ignored), so a rerun after a failure does not ask again.

Limits: synthetic voices; numbers, abbreviations and foreign names are read as the TTS guesses. If a block sounds
wrong, fix the transcript text (e.g. write the number in words) and run `build.mjs` again.
