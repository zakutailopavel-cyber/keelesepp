# Lesson recording and free transcription

Owner decision 2026-09-29: record Live Classroom lessons and turn them into text for free, so the teacher can see after
the lesson what the student said and where they struggled. Since October 2026 the school Mac also analyses the lesson
with local models (`tools/lesson-transcriber/analysis.js`: TartuNLP GEC for the learner's errors, gemma3 summary).

## Consent and privacy

- Recording is possible only when the student card has `recordingConsent == true`. Staff set it on the card (Õppetöö →
  Tunnisalvestised). Since 2026-10-04 the student or the linked parent also answers a one-time question on first login
  (`RecordingConsentPrompt` on /student and /parent; et + ru): a card with a linked parent account is asked to the
  parent, otherwise to the student. The answer (yes or no) is written with `recordingConsentByUid == uid()`; the rule
  lets the card owner change only `recordingConsent, recordingConsentAt, recordingConsentBy, recordingConsentByUid`.
  Closing the window asks again on the next visit; a decided card (true or false) is never asked again.
- While recording, the student sees "Tundi salvestatakse · Урок записывается" in the room.
- Readers: the recording teacher and admins. Since 2026-10-04 (owner) the student reads a recording only while it is
  running (`status == 'recording'`, for the „Tundi salvestatakse” indicator); the finished recording and its transcript
  are teacher/admin only. Audio is deleted after 60 days; the text stays.
- No audio or text is sent to any service outside our Firebase project and the school Mac.

## Flow

1. **Room (teacher):** since 2026-10-04 recording starts **automatically** with the teacher's call when the student
   card has consent (top bar shows a red „Salvestan” pill; „Ei salvesta” when the card has no consent). It stops and
   closes the files when the call ends or the room is left/closed; „Lõpeta salvestamine” stops it for the rest of that
   call; the next call starts a new recording. The manual "Alusta salvestamist" button stays in Rohkem → Tunni salvestamine. The browser records the teacher's
   microphone and the student's incoming audio as two tracks, each in standalone 5-minute files, uploaded to Storage
   `lessonRecordings/{recordingId}/{teacher|student}_NNN.webm`; `lessonRecordings/{recordingId}` lists the segments.
   "Lõpeta salvestamine" uploads the rest and sets `status: uploaded`. If the student joins later or reconnects, their
   track starts on arrival. A tab closed mid-recording is handed over by the worker after 3 hours.
   File numbers (`NNN`) continue per track across restarts (student reconnect, teacher switches the microphone): before
   2026-10-04 a restarted track began again at `000` and overwrote the uploaded file (Storage allows overwrites while
   the recording is open), so audio of a reconnected lesson could be lost.
2. **Worker (school Mac):** `tools/lesson-transcriber` (whisper.cpp; Estonian lessons: TalTech `whisper-large-v3-turbo-et-verbatim-2604`, MIT; other languages: large-v3-turbo) claims `uploaded`, converts
   each file to 16 kHz WAV, transcribes in the lesson language (`et`, `en` for English learners), merges both tracks by
   time into `transcript = [{ speaker, startMs, endMs, text }]` → `done` (or `failed` with the error).
   It starts by itself at Mac login (launchd, `install-mac.sh`) and writes a heartbeat `transcriberStatus/{host}`
   `{ host, state idle|transcribing, recordingId, startedAt, lastSeenAt }` every minute; the teacher's recording panel
   shows „Transkribeerija töötab (host)” or a warning, and the top bar shows „Mac ei transkribeeri” next to „Salvestan”
   when no heartbeat is fresher than 3 minutes (`transcriberStatus.js`). Recording never depends on it: files upload
   and wait. During transcription the Mac is kept awake (`caffeinate -i`).
3. **Student card (staff) → Õppetöö → „Tunnid”:** one row per recorded lesson (plus board lesson pages of days without a
   recording) with two buttons: „Tunni analüüs” (student's share of speaking time, words and minutes per speaker,
   number of student answers, longest student sentence, student's questions, then the dialogue with search and
   speaker filter; before transcription it says the text is on its way) and „Tahvel” (`/board/:studentId?page=<id>`,
   the lesson page of that day, otherwise the main board). Model: `lessonTimeline.js`.

4. **„Areng tundide kaupa” (since 2026-11-04)** — on the same tab, above „Tunnid” (`LessonTrendCard.jsx`,
   `lessonTrend.js`): per lesson with text, oldest first — learner's share of speaking time %, learner words, average
   learner utterance (words per learner line), errors per 100 learner words in the lesson language (the Mac's
   `analysis.speech.langWords`, else counted from the transcript; „ei analüüsitud” when there is no analysis), the top
   error kinds (sõnajärg, vorm, sõna puudu, liigne sõna, sõnavara) and new distinct words (lesson-language words the
   learner had not said in the earlier lessons of the list; the first lesson shows its distinct words only). Four small
   lines (last 12 lessons) + a table. Counted in the browser from the recordings already loaded for „Tunnid”, nothing
   is written; the same visibility (the teacher's own recordings, an admin all).
5. **„Pole viga” (since 2026-11-04)** — in „Tunni analüüs” → „Õpilase vead” each flagged error has „Pole viga”: the
   recording's teacher or an admin confirms it with an optional reason (≤ 200 chars). The error moves under „Märgitud
   „Pole viga” (N)” with who / when / reason and „Taasta” (undo). A dismissed error is left out of the error count,
   „Pärast tundi” (topic counts, homework, word cards, parent note), „Tee tööleht vigadest”, the trend, „Rääkimine”
   accuracy (`autoSkills.js`) and the personal worksheet — everything reads lessons through `groupRecordings` →
   `withErrorReview` (`errorReview.js`). Topic counts (`focus`) are counted again in the browser with the Mac's own
   rules (`errorTopicKeys`, a copy of `analysis.js`).
   The school Mac learns from it: a correction (said → corrected, compared without capitals / punctuation) dismissed
   in **2 or more different lessons** is not flagged again (`analysis.js` `dismissedPairs` / `isDismissed`, both for
   GEC errors and the teacher's recasts). The worker reads `analyzerFeedback` with one query (`select said, corrected,
   recordingId`) only when it really analyses a lesson, cached 1 h — never on the idle loop. `ANALYSIS_VERSION` is
   unchanged (old lessons are not analysed again; their marks still hide the errors in the CRM).
6. **„Hetk” (since 2026-11-04)** — in the 1:1 room the teacher presses „Hetk” in the top bar (or the key **B** outside
   text fields; M is the board's marker) to mark a moment. It is saved at once without a label; a small box offers an
   optional label (≤ 80, Enter) and „Kustuta hetk”, and closes by itself after 6 s. With a running recording the mark
   keeps `recordingId` + `atMs` (ms from the recorder's start, same clock as `segments[].startMs`); without one only the
   clock time `at`. The student never sees it. In „Tunni analüüs” / the inline lesson text, „Hetked (N)” lists the
   marks (time + label + who) above the AI part; a click plays the lesson's audio (student track by default, „Õpetaja”
   switch) from 3 s before the mark (`LessonMoments.jsx`, `lessonMoments.js` `segmentAt` / `playFrom`). A time line
   shows marks (blue) and the learner's errors (red); a click on an error plays it too. Marks outside the recording
   (or of a lesson that was not recorded) are listed by clock time; a day with marks only gets its own row in „Tunnid”.
   Joined lessons (several parts) now also move `segments[].startMs` by the part's start (`partStarts` on the joined
   lesson), like the transcript. Group rooms have no „Hetk” yet.
7. **„Kõneaeg” (since 2026-11-04)** — in the 1:1 room the teacher (only) sees a pill „Õpilane NN %” with a bar and a
   target line at 60 %: the student's share of the talk time so far, live, also without a recording or consent. It
   is measured in the teacher's browser from the sound level only (`talkMeter.js`: RMS ~10 Hz, adaptive noise floor,
   sounds < 250 ms ignored, pauses ≤ 400 ms inside speech counted; `useTalkMeter.js`: AnalyserNodes on the own
   microphone track and the student's incoming track, never connected to the speakers, paused while the tab is
   hidden, AudioContext closed on leave). It does not know the language. Amber when the student had < 40 % of the
   last 10 minutes' talk (at least 2 min of talk in them); a click shows minutes per side. Nothing is saved — the
   lesson summary (`lessonSummaries`) is readable by the student and its rules allow no extra field; the recorded
   lesson's „Tunni analüüs” keeps its own share from the transcript.

7. **„Soojendus” and „Täna harjutada” (since 2026-11-04)** — in the 1:1 room the teacher's „Rohkem → Soojendus eelmise
   tunni lausetest” picks 3–5 of the learner's own short sentences with errors from the latest analysed lesson before
   this one (`live-classroom/warmup.js` `pickWarmupItems`: learner lines only, 3–12 words, a 1–3 word change, top
   focus topics first, no duplicates, no „Pole viga” corrections). The teacher edits / removes rows and puts them on
   the board as a worksheet assignment with one `errorfix` „Paranda lause.” task per sentence (the board's „Näita
   vastust” reveals one at a time). „Täna harjutada” is a teacher-only box over the board (not synced, hidden during
   screen share): 2–3 topics of the last 1–3 analysed lessons with one example each and „Järgmiseks tunniks”
   (`lessonHints`). Both read `lessonRecordings` once with the existing rule (a teacher his own, an admin all).

## Data and rules

- `lessonRecordings/{invitationId}_{ms}`: `invitationId, teacherUid, teacherName, studentId, studentUid, studentName,
  title, language, status, segments[], startedAt, endedAt, updatedAt`; worker adds `transcript, transcribedAt,
  transcriptModel, audioDeletedAt, error`.
- Firestore: create only by the teacher of an accepted invitation with consent on the student card; browser updates
  only `status, endedAt, segments, updatedAt` while `recording`; transcript is written by the worker (Admin SDK).
- `lessonRecordings/{id}.errorReview.{key}` (on the lesson's first part; `key` = `errorKey(error)`, a hash of
  startMs | said | corrected): `{ said, corrected, kind, source, startMs, reason, byUid, byName, at }`, an undo adds
  `undoneAt, undoneByUid, undoneByName` (the mark is kept for the audit; a new „Pole viga” overwrites it). Kept outside
  `analysis`, so a new analysis does not wipe it. Rule: the recording's teacher or an admin may change only
  `errorReview` (map, ≤ 300 keys), in any status.
- `analyzerFeedback/{recordingId}_{key}`: `{ said, corrected, kind, source, reason, lang, recordingId, byUid, byName,
  at }`, written in the same batch as the mark; created by the recording's teacher or an admin with their own uid;
  read by admins only (and the worker); deleted on undo (author, the recording's teacher or an admin; deleting a
  missing copy is allowed). Rules tests: `functions/lesson-recording-emulator.integration.js` („Pole viga” test).
- `lessonMoments/{auto id}` („Hetk”): `{ invitationId, recordingId ('' without a recording), teacherUid (the
  invitation's teacher), studentId, atMs (int ≥ 0 ≤ 8 h, or null), at, label (≤ 80), byUid, byName, createdAt }`.
  Rules: read / delete by the lesson's teacher or an admin; create by staff with `byUid == uid`, the invitation must
  exist with the same teacherUid and studentId, a teacher only for his own lessons, `recordingId` must be
  `<invitationId>_<ms>` and `atMs` needs a `recordingId`; update only `label`. Students and parents: no access. Tests:
  `functions/lesson-moments-emulator.integration.js` (in `test:emulator`).
- `transcriberStatus/{workerId}`: staff read, written only by the worker (Admin SDK).
- Storage: `lessonRecordings/{recordingId}/*` written only by the recording teacher while `recording`, audio < 20 MB.
- Tests: `functions/lesson-recording-emulator.integration.js` (rules; not in `test:emulator`, run it by name),
  `tools/lesson-transcriber` `npm test` (`lib.test.js` merging, junk filter, retention; `analysis.test.js` analysis
  helpers and the „Pole viga” filter), `crm-v2/src/features/lesson-recording/lessonRecording.test.jsx` (UI),
  `errorReview.test.jsx`, `lessonTrend.test.jsx`.

## Setup on the Mac

See `tools/lesson-transcriber/README.md`: the owner saves the service account key, then runs
`tools/lesson-transcriber/install-mac.sh` once (Homebrew tools, models ~3.2 GB, `npm install`, launchd agent).
