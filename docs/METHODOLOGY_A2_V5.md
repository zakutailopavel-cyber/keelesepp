# A2 methodology v5 („lesson budget” for beginners) — the school methodologist's decisions, 2026-11-25

> **Extended by `docs/METHODOLOGY_V6.md` (2026-11-26, gates G14–G25).** New and retrofitted modules follow both; start with its §0 checklist.

Normative for the Estonian A2 course (A1 → A2, `a2-001 … a2-100`, 20 modules × 5 lessons, files
`crm-v2/src/features/worksheet-generator/admin/course/a2/module01.js … module20.js`) for every module listed under `"a2"`
in `strictModulesV5.json`. It is the A2 version of `docs/METHODOLOGY_B1_B2_V5.md`: the principles are the same, the numbers
are made for learners who start from A1. Where this document and older rules disagree (`CEFR_A2_B1_LEARNING_STANDARD.md`
§2 „7–9 blocks per sheet”, §13 „≥ 25 min of closed drills”, the 40–55 min per sheet of `timeEstimate.js`), **this document
wins** for a listed module. The evidence: the pedagogical audit of 2026-11-25 (a2-001 „lähtediagnostika” was a teaching
lesson with rules, word lists and model phrases before the learner's own answer, so its result could not be a baseline;
a2-001 had 35 blocks and a2-005 43 blocks in a 60-minute lesson; the 70 % / 80 % thresholds were not explained).

Owner's decisions that bind A2 (memory, 2026-11): A2 keeps dictations (only B1–C1 dropped them); texts are adapted to the
level and their facts need not be verified (learning texts, people invented); the continuing story only in places;
target quality 9/10; no near-empty pages; pictures that teach.

## 1. What a lesson is for

One lesson = **one real communicative outcome** the learner can do afterwards and could not do before (CEFR Companion
Volume 2020, action-oriented approach): introduce yourself in a new group, describe your house, give your data to a
secretary. „Ma oskan …” at the end names that outcome with a skill verb (räägin, kirjutan, loen, saan kuuldust aru).
Everything on the sheet builds towards it or is cut.

## 2. Principles (B1/B2 v5 adapted to beginners)

1. **Task first, form in service of the task.** Retrieval → input → noticing (the learner finds the form in the input,
   e.g. the sina/teie table of a2-002) → one guided use in Avasta → form practice in Harjuta → the outcome in Kasuta.
   Grammar is a tool, never the lesson's goal on its own.
2. **Cognitive load for beginners.** One short input a lesson; fewer and fuller blocks (§3); a 60-minute lesson
   (`A2_CURRICULUM_100.md`: one roadmap lesson = 60 min) with a 50-minute core. Support fades inside the lesson.
3. **Ready phrases early, faded by the module's end.** In the first lessons of a module a speaking task may carry ready
   phrases (`tipText`, a phrase bank, a given opening „Tere!”). The module's **last teaching lesson** has one speaking task
   and one writing task without them (G9) — that is the evidence that the phrases were learned.
4. **Retrieval and spacing.** Avasta opens with „Mäletad?” (B.review, `from` = the previous lesson): the learner answers
   from memory, nothing is re-read. Word and form drills beyond the lesson's need live in **Harjuta** (spaced repetition);
   removed drills stay in the module file as `hide(block, why)` and keep feeding Harjuta.
5. **A true placement diagnostic, separate from teaching.** The module's first lesson of the course (a2-001) is a short
   check **without models**: no rule box, no word list, no ready phrases, no picture with speech bubbles, no given opening.
   The learner's first attempt is the baseline; the teacher records points per skill and the support given. Teaching
   starts in a2-002. Growth is measured on a **parallel new task** (the module control, a2-005: same skills and criteria,
   new content), not on the same exercise repeated.
6. **More visual support.** One purposeful picture per teaching lesson that carries the task (an information gap, a
   picture description, an error hunt), drawn by the art bible (`TEXTBOOK_ART_BIBLE.md`: black line, white, one lime
   accent), never decoration and never on the diagnostic. Word strips (art/wordStrips.js) illustrate the lesson's words.
7. **Short dictation stays** (owner 2026-11-04): at most one a lesson, ≤ 6 sentences, on the lesson's own language
   (questions with sina/teie, personal data). It trains listening and spelling together; it counts as a listening task.
8. **Formative assessment with transparent scores.** Every check shows raw points per skill, the Harno scale and the
   internal threshold as three different things (§5). Open tasks of a check use 0/1/2 descriptors per line, so another
   teacher reaches the same score.
9. **Thresholds named one way everywhere:** *Harno: pass from 60 % and no part with 0 points. KeeleSepp: ready for the
   exam from 70 %, our certificate from 80 % (internal threshold, a safety margin for the exam).* The internal threshold is
   never called Harno's.
10. **Connectivism suited to A2.** Each module has one link task with a real person or a real source the learner can
    manage: a message to his own teacher (real addressee, `data.realAddressee`), a classmate's poster, a real public page
    read for one fact (eesti.ee, a municipality, a timetable — the sheet gives the title and the URL, never copies it).
11. **Independence is evidence.** Each module has one role card where the teacher holds hidden information or an
    obstacle (`teach(block, 'Varjatud info: …')`): in a2-004 the secretary's list has errors only the teacher knows.
12. **Story only in places.** The continuing cast (Sofia, Anna, Markus …) appears in at most one lesson a module (G7);
    module 1 uses none.

## 3. Lesson budget (G1–G3)

| | A2 |
|---|---|
| Blocks per sheet (Avasta / Harjuta / Kasuta) | ≤ 5 / ≤ 4 / ≤ 5 |
| Blocks per lesson | ≤ 14 (the picture, its „Vaata pilti” card and word strips do not count) |
| Lesson time | 60 min; the sheets' estimate ≤ 65 min (50-min core + buffer) |
| Avasta | „Mäletad?” → words → the one input → noticing (rule box or a „find the rule” table) → one guided use (level 3) |
| Harjuta | one form task (≤ 8 items, the A2 sheet norm) → one whole-sentence task → short dictation or a meaning task → pair talk with the picture |
| Kasuta | situation → the outcome task (pair, teacher as partner) → product (message / text) → home recording → „Ma oskan …” |
| Diagnostic (a2-001) | one sheet, ≤ 10 blocks, ≈ 30 min (estimate ≤ 35), no models (G1, G9) |
| Module control | one sheet, ≤ 10 blocks, 45 min, four skills × 10 points |

Lengths with a floor **and a ceiling** by lesson number. The floors are the A2 sheet norms of `levels.js` (a reading task
80–200 words, a talk 45–120 s with its 25 % margin, writing 4–8 sentences), so the two gates never pull apart; shorter
texts (a note, a sign, a 30-word message) are welcome inside tasks, but they are not the lesson's input:

| A2 lessons | stage | input text | audio | writing | speech |
|---|---|---|---|---|---|
| 001–020 | A2 algus | 80–120 words | ≤ 75 s | 20–45 words | 35–60 s |
| 021–050 | A2- | 80–140 | ≤ 90 s | 25–50 | 45–75 s |
| 051–080 | A2 | 100–150 | ≤ 2 min | 30–60 | 45–90 s |
| 081–100 | A2 eksam | 100–150 (Harno T4 ≈ 150) | ≤ 2.5 min (Harno T4) | 30–70 (Harno ≥ 25 + ≥ 30) | 60–120 s |

A pair card (`speakcard`) may run twice the speech ceiling. A module control may hold **one** reading of the Harno A2
length (≤ 150 words) at any stage: the module must contain one exam-length text (`quality.js` harno-reading, ≥ 120 words),
and that text belongs in the control, not in a beginner's lesson. Mock exams (097, 099, 100) keep the real exam's format.

## 4. What leaves the lesson sheet

- **To Harjuta:** crosswords, second and third sorting / matching tasks, word cards, any drill beyond 8–10 items. Matching,
  sorting and word order may stay on an A2 sheet up to lesson 050 (the CEFR standard's A2 controlled practice); from lesson
  051 they go to Harjuta (G8).
- **Cut:** the second and third input, three writing tasks in one lesson, the 4-3-2 triple monologue, rubrics in ordinary
  lessons (the control has one), „Kas teadsid?” unless the task uses it, models on the diagnostic.
- Removed blocks are **hidden, not deleted** (`hide(block, why)`): ids and learners' answers stay.

## 5. Diagnostic, controls and exams

- **a2-001 placement diagnostic** (`assessment: true`, `placement: true`): speaking about yourself and asking the teacher
  (cold, first, no help), listening, reading, twelve forms (the answer key names the lesson that teaches each item), a
  20–40-word message without a given opening; the profile table: points per skill, what to practise. ≈ 30 minutes; the
  rest of the first meeting is the profile talk.
- **Module control** (lesson 5 of a module): one sheet, 45 min, reading / listening / writing / speaking 10 points each
  (40), open tasks by 0/1/2 descriptors. The sheet shows: raw points (/10), the Harno scale (× 2 = /20 per part, Harno A2
  has 80 points, 20 per skill), the result of the diagnostic (%), and what to practise. Pass by Harno's rule = total
  ≥ 60 % and no part 0; KeeleSepp's internal thresholds: ready 70 %, certificate 80 %. A part under 6/10 gets one
  concrete correction task for the next week.
- **Mock exams** only at 097, 099, 100 (module 20).

## 6. Gates (tests) that enforce this

`methodV5.js` with `course: 'a2'` (the B1/B2 rules are unchanged; unit tests in `methodV5.test.js` keep both apart):

G1 budget (≤ 5/4/5, ≤ 14 a lesson, ≤ 65 min; diagnostic one sheet ≤ 10 blocks ≤ 35 min; control one sheet ≤ 10 blocks)
· G2 `meta.methodV5` on the sheets · G3 the A2 stages above (control text ≤ 150) · G5 **A2 exception**: one dictation a
lesson, ≤ 6 sentences · G6 recordings heard twice, locked in the diagnostic and the control · G7 cast in ≤ 1 lesson · G8
≤ 1 tip, no exam rubric in a lesson, matching / sorting / word order off the sheet from lesson 051 · G9 the module's last
teaching lesson has one speech without ready phrases and one text without phrases and opening; one hidden-information
card a module; **the diagnostic has no model** (`notice`, `vocab`, `phrasebank`, „Mäletad?”, `tipText`, writing
`keywords`, a given `opening`, role-card phrases) · G11 the thresholds named one way, and an A2 control also names
Harno's second condition (no part with 0 points) · G12 no „pausideta” in an A2 rubric · G13 a link task.

Report: `node tools/course-audit/method-v5.mjs --course a2 --module 1` (or `--course a2` for the counts of every module).
Switch a module on by adding its id to `strictModulesV5.json` → `"a2"`. Other gates on the same sheets stay on: the
quality gate with the A2 level norms (`levels.js`), the final shape against the Harno A2 exam (`finalShape.js` profile
`a2`; the deviations that are the v5 design — one short input, so V11-input under 20 %; speaking share; three R formats in
a module — are in `finalShapeBaselineA2.json`), the listening goal, the word strips, the art briefs.

## 7. Order

Step 0 this document + the A2 gates → pilot **A2 module 1 (a2-001 … a2-005)**, shown to the owner as „сейчас | будет” →
module by module, one module = one branch = one draft PR, at most 2–3 open. Each module: diagnostic or retrieval link to
the previous module, one input a lesson, one picture that teaches, the dictation where it helps, the control with the
three fields.
