# Practice engine — sentence constructions and grammar (phase 2)

Owner goal 2026-11-09: a Duolingo-like learning area in the student cabinet for words, sentence constructions and
grammar. Phase 1 = SRS word cards (`features/vocabulary/`), **phase 2 = this engine**, phase 3 = path, streak, XP, pet
and stored results. Code: `crm-v2/src/features/practice/` (engine in `engine/`, pure; components next to it).

## Item types (`engine/items.js`)

| type | Estonian label | how it is answered | source blocks |
|---|---|---|---|
| `build` | Pane lause kokku | word tiles in order; every order the source lists is right | `wordorder` |
| `transform` | Ütle teisiti / Paranda viga | typed, or tiles in the first half of a lesson | `transformation`, `errorfix` |
| `form` | Vali õige vorm | course options (cloze / bank / choice) or typed, base form shown | `gaps` with `(base)`, `formtext`, `wordforms`, `cloze` with forms of one word, grammar `choice` |
| `connector` | Vali sidesõna | options or typed | gaps / cloze / choice whose answer is a linking word |
| `listen` | Kuula ja pane kokku | a `build` item heard: the stored Neurokõne file of the sentence, else speechSynthesis et-EE; slow replay (0.75×) | made by the lesson builder when `canListen` allows that item (a stored file — `vocabulary/wordAudio.js`, docs/VOCABULARY_SRS.md „Sõnade heli” — or a browser Estonian voice), otherwise skipped |

`checkItem(item, response)` → `{ verdict: 'correct' | 'almost' | 'wrong', expected, letters }`.

### Answer checking (`engine/compare.js`)

- correct: same words ignoring case, punctuation, quotes, dashes, extra spaces;
- almost: the same once õ/ä/ö/ü/š/ž are read as o/a/o/u/s/z → hint „Kontrolli täpitähti” (+ ru/en) and the letters,
  **not** counted as correct, not retried;
- wrong: anything else — no typo tolerance, because one letter is often the grammar (koolis / kooli);
- tiles: compared with each valid order (`ordersOf`: the source's alternatives that use exactly the same tiles).

## Content (`engine/extract.js`) — nothing invented

`extractCourseItems(course, MODULES)` reads the course files (`worksheet-generator/admin/course/<a2|b1|b2|c1>/module*.js`,
the same blocks as the worksheets) and keeps only items whose answer is the course key:

- skipped: open tasks („Näidisvastus on üks võimalus”, „oma sõnadega”), style rewrites (selgemaks, täpsemaks, registris…),
  transformations that keep < 50 % of the sentence's words (a rewrite, not a grammar change), vocabulary gaps without a
  form cue, cloze gaps whose options are different words (reading), options without one right option, answers > 30 words;
- wrong options are only the course's own (cloze options, the task's word bank, choice options) — never generated;
- level: course a2 → A2, b1 → B1, b2 → B2, c1 → C1; stage, module, lesson, phase (Avasta/Harjuta/Kasuta) kept;
- grammar point (`engine/grammar.js`, ids = `grammarPlan.js` ids): from the item's own key explanation, the task's title
  and instruction, then the preceding „Märka” rule, then the course plan of the lesson; base-form gaps with no named
  point get `forms`; linking-word answers get `connectors`; error fixes that only move words get `word-order`;
- feedback line: the item's line in the teacher's key (`B.why`), else the lesson's „Märka” rule title, else the hint
  sentence of the instruction. Russian / English: the course has no translated rule lines, so only the grammar term and
  the UI strings are shown in the learner's language (gap — see below).

The patterns generator (`worksheet-generator/patterns`) is **not** used: its sentences are combined by rule.

### Coverage (`engine/coverage.js`, main 394df9f, 2026-11-09)

| level | items | distinct sentences | build | transform | form | connector | with explanation | no grammar tag |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| A2 | 2488 | 2360 | 301 | 819 | 1354 | 14 | 389 | 794 |
| B1 | 2312 | 2245 | 206 | 1022 | 1030 | 54 | 848 | 466 |
| B2 | 2317 | 2245 | 181 | 1030 | 1039 | 67 | 304 | 563 |
| C1 | 2859 | 2486 | 362 | 595 | 1828 | 74 | 432 | 597 |

Plan points with fewer than 16 items (gaps — fill in the course, not here):

- A2: enneminevik 0, nud-/tud-kesksõna 0, des-vorm 0 (the plan itself lists no lessons), omadussõna ühildumine 13;
- B1: täisminevik 10, omadussõnaliited -line/-kas/-lik/-tu/eba- 5, möönev kõneviis (olgu) 10;
- B2: ma- ja da-infinitiiv 0 (lesson b1b2-017's tasks name other points);
- C1: kirjavahemärgid 12, nuks-vorm 0.
- Connector items are few at A2 (14): most A2 linking practice is in transformations („Ühenda … sest”).
- No item has a Russian / English rule line; untagged items (mostly „Paranda viga” without a named point) still serve
  module lessons but not a grammar-focus lesson.

The staff page shows these numbers live per course.

## Lesson (`engine/lesson.js`)

`buildLesson({ pool, level, moduleId, grammarFocus, studentHistory, size = 10, canListen, seed })` →
`{ items, types, focusCount, spacedCount, short }`:

- 8–12 items (`size` clamped); ~70 % focus (module and/or grammar point; a point the module barely has is taken from
  the level up to that module), ~30 % spaced: other grammar from earlier modules, the learner's weak points first
  (`studentHistory.wrong = { grammarId: n }`), `studentHistory.recent` sentence keys are left out;
- 2–3 types (the focus's most frequent), never three of one type in a row;
- easy → hard (`difficultyOf`: type and input, length, phase, error fix); transformations alternate tiles (easier) and
  typed; up to two builds become listening when `canListen` (boolean or `(item) => boolean`) allows them;
- one sentence once per lesson (`sentenceKey`); tiles shown mixed (`item.shown`); deterministic for a seed.

## Session (`engine/session.js`) and events

`createSession` → `submitAnswer` → `advance` → `summaryOf`. A wrong first answer comes back once after the last item
(„Kordame vigu”). Summary: `{ kind: 'grammar'|'sentences', total, correct (first try), almost, wrong, retried, fixed,
grammarPoints, missed, minutes }`.

`features/practice/events.js`: `announcePractice({ kind, items, correct, minutes, grammarPoints })` (window event
`ks-practice-done`) and `onPractice(fn)`; the lesson announces once at its end. Nothing is stored (phase 3).

## Components

- `PracticeLesson.jsx` — progress bar, prompt, answer, feedback panel (green / amber / red, rule line, grammar term
  in Estonian + learner's language), retry round, result ring; Enter checks / goes on, 1–9 picks an option, focus moves
  to „Edasi”.
- `SentenceBuilder.jsx` — tiles are buttons: a tap puts a bank tile at the end / takes a sentence tile back, Backspace
  takes the last back. Drag and drop (`@dnd-kit/core` + `@dnd-kit/sortable`, MIT, only in the lazy practice chunk):
  bank → a place in the sentence (before / after the tile it is dropped on, `tileDrop.js dropsAfter`), reorder within
  the sentence, sentence → bank. Mouse starts after 6 px, touch after a 180 ms press (8 px tolerance) so the page still
  scrolls; keyboard: Space lifts a sentence tile, arrows move, Space / Enter drops, Escape cancels (Enter alone stays the
  tap); Estonian screen-reader instructions and announcements; reduced motion → no drop / sorting animation. Drop rules
  are pure in `tileDrop.js`. The answer is still the tile indexes in sentence order, checked by `checkItem`.
- `AnswerInputs.jsx` (`OptionChoice`,
  `TypedAnswer` with õ ä ö ü š ž buttons), `PracticeItem.jsx` (prompt, gap sentence, listen button).
- `practice.css` — app tokens only (dark-theme tokens with light fallbacks), 44 px+ targets, reduced motion.
- `PracticePreviewPage.jsx` — „Harjutuste eelvaade”, staff route `/library/harjutused` (`routes.jsx`: one lazy import +
  one route): course, module, grammar point, size, learner language; coverage panel. Loads one course on demand
  (`courseLoaders.js`). No menu link yet.

## Next steps

1. Done (agent/student-tana): the lesson is step „Laused ja grammatika” of the student's „Täna” (`studentPractice.js`,
   own sentences `engine/ownSentences.js`, XP / streak `progress.js`, docs/LEARNER_PROFILE.md). Still to do: store
   per-item results and pass `studentHistory` (weak grammar points).
2. For students, precompute the items per course into a JSON file at build time instead of loading course modules.
3. Course content: Russian/English rule lines (`explain.ru`) and more items for the gaps above.
