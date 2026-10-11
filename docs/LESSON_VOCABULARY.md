# Lesson vocabulary A2 → C1

Owner request (2026-10-11): collect the vocabulary of every course lesson A2–C1 and give it to the student through
flashcards and the pet.

## Data

`crm-v2/src/features/vocabulary/lessonWords/{a2,a2b1,b1b2,c1}.json` — `{ "<lessonId>": [{ "et", "ru", "ex", "pos" }] }`.

- Lesson ids are the roadmap / `curriculumLessons` ids: `a2-001…100`, `a2b1-001…090`, `b1b2-001…090`, `est-c1-001…100`
  (380 lessons, 5 047 words).
- `et` dictionary form (nouns / adjectives singular nominative, verbs ma-infinitive, set phrases ≤ 3 words);
  `ru` short Russian meaning used in the lesson; `ex` one Estonian example (≤ 12 words), taken from the lesson's
  worksheet text when the lesson has course sheets (220 lessons: a2b1-006…035, b1b2, est-c1), otherwise written at
  the lesson's level from the roadmap title / module / plan; `pos` noun | verb | adj | adv | phrase | other.
- 12–15 words per teaching lesson, 8–12 for diagnostic / control / assessment lessons; no duplicates inside a lesson;
  later lessons avoid repeating the previous four lessons of the course.
- `lessonWords.data.test.js` enforces coverage of every roadmap lesson and the format.
- Produced 2026-10-11 by Claude (drafted in eight parallel batches with an automatic format check, then sampled).
  The words were not reviewed by a teacher yet: corrections go straight into the JSON files.

## Delivery

- `lessonWords.js`: `loadLessonWords(lessonId)` lazy-loads one course file (a separate build chunk each).
- „Sõnavara” (`VocabularyPage.jsx`): a lesson deck = the lesson's vocabulary first, then sheet words not in it;
  button „Lisa tunni sõnad minu sõnadesse”.
- „Minu õpingud” (`StudentDashboardPage.jsx`, `useLessonWordsImport.js`): the vocabulary of held lessons
  (`lessons.topicLessonId`, status `Toimunud` / empty) from the last `IMPORT_DAYS` = 14 days, at most
  `IMPORT_LESSONS` = 3 lessons per visit, goes into „Minu sõnad” (`studentWords`, box 0) by itself. Words the student
  already has are skipped. A notice lists new words not practised yet (`freshLessonWords`, 3 days).
- Fixed document ids `lw_<studentId>_<lessonId>_<index>` mark where a word came from (the rules allow no extra
  field) and keep a lesson from being imported twice; `studentWordsService.addLessonWords` writes one lesson in a
  single batch, so a lesson is never half imported. A concurrent second import fails as a whole (create only).
- Pet: „Minu sõnad” already feed the pet (`petCare.js` food = repeating due words; `petModel.js` learned words
  XP). No pet code changed.

## Regenerating or extending

Keep the contract above; run `npx vitest run src/features/vocabulary` (data test) before a PR.
