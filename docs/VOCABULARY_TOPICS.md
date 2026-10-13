# Vocabulary topics („Sõnavara → Teemad”)

Owner request (2026-10-13): give the student all course words at once, grouped by topic; a topic opens only after
the student has gone through a repetition cycle of the previous topic and confirmed the knowledge with tasks in the
same section.

## Word data (from PR #519)

`crm-v2/src/features/vocabulary/lessonWords/{a2,a2b1,b1b2,c1}.json` — `{ "<lessonId>": [{ "et", "ru", "ex", "pos" }] }`,
taken unchanged from PR #519 (`agent/lesson-vocabulary`, not merged; only the data and a trimmed loader were taken).

- 380 lessons (`a2-001…100`, `a2b1-001…090`, `b1b2-001…090`, `est-c1-001…100`), 5 047 words, 8–15 per lesson;
  `et` dictionary form, `ru` short Russian meaning, `ex` Estonian example.
- Drafted by an AI agent; **not reviewed by a teacher yet** — corrections go straight into the JSON files.
- `lessonWords.data.test.js` checks coverage of every roadmap lesson (`data/*-NN.json`) and the format.
- `lessonWords.js`: `loadLessonWords`, `loadWordsForLessons` (one lazy build chunk per course file),
  `lessonWordId(studentId, lessonId, index)` = `lw_<student>_<lesson>_<index>`.

## Model (`topicModel.js`)

- Topic = a course module of the student's level (`buildTopicCatalog`, curriculum order); its words = the lesson
  words of the module's lessons, deduped by `et` within the level (a word of an earlier topic is not repeated).
  Topics with fewer than 4 words are left out; levels without course lessons with words are not offered.
- State: `passed` when every topic word is in the student's `studentWords` under its fixed id (or the student already
  has the same spelling — it is not added twice); `open` = the first topic not passed; the rest `locked`
  (title, count and the first five words greyed, no study).
- „Kordamine” (cycle): StudySession „Õpi” over 10 unlearned words at a time (a short rest is joined to the portion);
  when a portion is finished (`learnedCount === deck.length`, `StudySession onLearnDone`), its word ids are saved in
  `localStorage` `keelesepp.vocabTopics.<studentId>.<topicKey>`. The cycle is done when all topic words are saved.
  Other device / cleared storage = the cycle starts anew (passed topics are not affected: they live in Firestore).
- „Kinnita teadmisi” (enabled after the cycle): 14 words (fewer if the topic is smaller) — a match block of 4 pairs
  (select the meaning), then meaning choices (Estonian → 4 options) and written words (meaning → Estonian, `checkAnswer`,
  one letter off counts). One point per word, pass ≥ 80 %.
- Pass: `studentWordsService.addLessonWords` creates the missing topic words (box 0, fixed ids, the existing allowed
  keys, batches of 400) — the next topic opens, the words are reviewed in „Minu sõnad” with the Leitner boxes. Fail:
  score + missed words, „Proovi uuesti” (the cycle stays done). Staff preview never writes.

## Limits

- The unlock is enforced in the app only: `firestore.rules` are unchanged and allow a student to create own words
  with box 0 anyway.
- Staff see the topic progress read only on the student card → „Areng” (`StudentTopicsCard.jsx`, `topicReport`):
  state, known/all words per topic, passed/all and the date of the last passed topic (newest `createdAt` of its words).
  The repetition cycle lives on the student's device and is not visible to staff.
