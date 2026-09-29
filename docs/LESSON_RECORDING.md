# Lesson recording and free transcription

Owner decision 2026-09-29: record Live Classroom lessons and turn them into text for free, so the teacher can see after
the lesson what the student said and where they struggled. No AI analysis yet (a local model was postponed).

## Consent and privacy

- Recording is possible only when the student card has `recordingConsent == true` (Õppetöö tab → "Tunni salvestamine";
  for minors the parent's consent). Staff set it; students and parents cannot (not in their allowed fields).
- While recording, the student sees "Tundi salvestatakse · Урок записывается" in the room.
- Readers: the recording teacher, the student and admins. Audio is deleted after 60 days; the text stays.
- No audio or text is sent to any service outside our Firebase project and the school Mac.

## Flow

1. **Room (teacher):** "Alusta salvestamist" (after "Käivita video ja mikrofon"). The browser records the teacher's
   microphone and the student's incoming audio as two tracks, each in standalone 5-minute files, uploaded to Storage
   `lessonRecordings/{recordingId}/{teacher|student}_NNN.webm`; `lessonRecordings/{recordingId}` lists the segments.
   "Lõpeta salvestamine" uploads the rest and sets `status: uploaded`. If the student joins later or reconnects, their
   track starts on arrival. A tab closed mid-recording is handed over by the worker after 3 hours.
2. **Worker (school Mac):** `tools/lesson-transcriber` (whisper.cpp; Estonian lessons: TalTech `whisper-large-v3-turbo-et-verbatim-2604`, MIT; other languages: large-v3-turbo) claims `uploaded`, converts
   each file to 16 kHz WAV, transcribes in the lesson language (`et`, `en` for English learners), merges both tracks by
   time into `transcript = [{ speaker, startMs, endMs, text }]` → `done` (or `failed` with the error).
3. **Student card (staff):** "Tunnisalvestised" lists recordings with status; "Ava tekst" shows the dialogue with
   timestamps, search, a teacher/student filter and how many words the student said.

## Data and rules

- `lessonRecordings/{invitationId}_{ms}`: `invitationId, teacherUid, teacherName, studentId, studentUid, studentName,
  title, language, status, segments[], startedAt, endedAt, updatedAt`; worker adds `transcript, transcribedAt,
  transcriptModel, audioDeletedAt, error`.
- Firestore: create only by the teacher of an accepted invitation with consent on the student card; browser updates
  only `status, endedAt, segments, updatedAt` while `recording`; transcript is written by the worker (Admin SDK).
- Storage: `lessonRecordings/{recordingId}/*` written only by the recording teacher while `recording`, audio < 20 MB.
- Tests: `functions/lesson-recording-emulator.integration.js` (rules), `tools/lesson-transcriber/lib.test.js`
  (merging, junk filter, retention), `crm-v2/src/features/lesson-recording/lessonRecording.test.jsx` (UI).

## Setup on the Mac

See `tools/lesson-transcriber/README.md`: service account key (owner), whisper model download (~1.6 GB), `npm install`,
one test run, launchd agent.
