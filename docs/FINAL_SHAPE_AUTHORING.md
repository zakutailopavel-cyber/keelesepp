# How to write a B1 lesson that passes the final-shape gates

For content agents rewriting `admin/course/b1/moduleNN.js` towards `docs/COURSE_FINAL_SHAPE_B1.md` (the normative spec).
This file is the practical side: the tags, the new builders, what each gate wants and how to see your problems.
The working example is `crm-v2/src/features/worksheet-generator/admin/course/finalShapeExample.js` (one lesson that
passes every lesson rule; `finalShapeExample.test.js` keeps it so).

## 1. The loop

```bash
cd crm-v2
npm run course:final-shape                    # counts per rule and module (+ audit measurements)
npm run course:final-shape -- --module 7      # every problem of module 7: lesson, phase, check, text
npm run course:final-shape -- --rule V12      # every problem of one rule
npx vitest run src/features/worksheet-generator  # before the PR (AGENTS.md)
```

`admin/course/finalShapeBaseline.json` lists the problems the course had when the gates came in (2026-10-26). The test
`admin/course/finalShape.test.js` fails on a **new** problem and on a problem you **fixed** that is still listed. After you
fixed content, rewrite the baseline and commit it with the module:

```bash
UPDATE_FINAL_SHAPE_BASELINE=1 npx vitest run src/features/worksheet-generator/admin/course/finalShape.test.js
```

The baseline may only shrink in a content PR. If it grows, the PR explains why (a rule that was wrong, not content that
got worse). The older quality gate (`qualityBaseline.json`, strict modules) still applies too.

## 2. Lesson shape: archetype and lead skills (§4)

Every teaching lesson declares what leads it. One line per module at the end of the file:

```js
import { B, tag, teach, withShapes } from '../blocks.js';
export const LESSONS = withShapes({ /* … lessons … */ }, {
  'a2b1-031': 'KUUL L→W', 'a2b1-032': 'LUGU R→S', 'a2b1-033': 'AVAS L→S', 'a2b1-034': 'KIRJ R→W', 'a2b1-035': 'EKS',
});
```

or per lesson: `'a2b1-031': { title, canDo, ...shape('KUUL', 'L→W'), discover, practice, transfer }`.
Archetypes: LUGU, PROB, KUUL, LUGE, RÄÄK, KIRJ, AVAS, PROJ (teaching), EKS, PROOV (exam lessons, no lead). Take the
module's row of the §6.2 plan; you may swap two lessons of a module if the grammar needs it — the V5 rules must still hold
(4 different archetypes, the pairs L→S, L→W, R→S, R→W once each, no archetype twice in a row, lesson 1 differs from
the previous module's lesson 1).

## 3. Tags on tasks (§3, §9)

`tag(block, { … })` puts didactic tags on `block.tag` (never in the text the learner sees). A wrong value throws at once.

| tag | value | when |
|---|---|---|
| `task` | catalogue id `R01`…`G13` (`didactics/taskCatalogue.js`) | when the block type's default is not what the task does (a `reading` that is a prediction task → `R13`; a `table` that is a survey → `S09`; a `rolecards` complaint → `S10`) |
| `harno` | `R1 R2 R3a R3b R4 L1 L2 L3a L3b L4 W1a W1b W2a W2b S0 S1a S1b S2` | the task is in Harno exam form. In a teaching lesson (module 6+) exactly **one** such task = the lesson's „Eksaminurk”; in exam lessons every exam task |
| `level` | 1–4 | when the default level of the catalogue id is wrong for this task (1 recognise · 2 controlled · 3 guided · 4 free / negotiate) |
| `fluency` | `true` | fluency work with known language: 4-3-2, timed retelling, speed reading (Nation's 4th strand, ≥ 10 % of the lesson) |
| `main` | `true` | the main Kasuta task (the can-do done). Without it: the last speaking/writing task of Kasuta |
| `topic` | `['sõna', …]` | on a `vocab` block only: words that are topic words on purpose (not in EKI A1–B1, V14) |

Defaults per block type (no tag): reading R02 · cloze R03 · insertion R05 · truefalse R06 · manymatch R07 · adsmatch R01 ·
profiles R11 · dialogue R12 · listening L04 · dictation L08 · examlisten L02 / L05 (truefalse) / L09 (match) · writing W05 ·
guidedletter W02 (≤ 70 words) / W04 · examwriting by genre (kusimustik W01, teade W02, kutse W03, kiri W04, jutt W05,
vastus W08) · planning W11 · speaking S02 · rolecards S05 · speakcard S03 / S04 (phone) · notice G01 · table, diagram G02 ·
gaps, formtext G03 · categorize G04 · transformation G05 · errorfix G06 · wordorder G07 · match G08 · wordforms G09 ·
translation G10 · crossword and picture games G11 · choice, clock G13. Non-tasks: text, tip, vocab, phrasebank, rubric,
examrubric, selfcheck, notice (counts as G01 only for V3), image, chart, exampart, review.

**Review items name their lesson** (V13): `B.review(id, [['Mida Markus eile tegi?', 'a2b1-021'], ['…', 'a2b1-009'], 'Kuidas sul läheb?'])`
— one item from the previous lesson and one from a module 2–4 back.

## 4. New builders (Harno B1 formats, §2.2)

All render in the student's player, the teacher's check, the studio and print (`engine/blocks/harno.jsx`); the closed
ones have answer keys and are scored.

| builder | format | notes |
|---|---|---|
| `B.adsmatch(id, title, instruction, [[adTitle, text], …], [[situation, 'C'], …])` | R1 situations ↔ ads | ads lettered A, B, … in order; one ad may fit several situations; `'A\|C'` accepts both |
| `B.bankText(id, title, instruction, passageTitle, passage, extra)` | R3b word bank, R4 phrase bank | removed parts in `[[…]]`, `extra` = the bank's extra options (an `insertion` block) |
| `B.cloze(…)` (existing) | R3a | `{*right\|wrong\|wrong}` |
| `B.examListen(id, title, instruction, mode, transcript, items)` | L1, L2 (`'choice'`: `[[q, right, wrong, wrong]]`), L4 (`'truefalse'`: `[[statement, true]]`), matching (`'match'`: `[[left, right]]`) | audio from `tools/listening-audio/build.mjs` like `listening`; L3a/L3b stay `B.listening` |
| `B.examWriting(id, title, instruction, genre, { situation, points, questions, words, opening, closing })` | W1a (`kusimustik` + `questions`), W1b (`teade`/`kutse`, words [40, 60]), W2a (`jutt`), W2b (`kiri`, words [90, 110]) | the Harno task card + the answer; live word count against the target |
| `B.ideaCard(id, title, instruction, situation, [ideas], outcome)` | S1b agreement | pictures can be added in the studio |
| `B.phoneCards(id, title, instruction, situation, [roleA, [questions]], [roleB, [info]])` | S2 phone role play | question card / answer card |
| `B.rubricW1(id, [4 content points])` · `B.rubricW2(id)` · `B.rubricSpeaking(id)` | exam scale 8 / 12 / 20 (§2.4) | shows the 80 % target; points per criterion |
| `B.examPart(id, 'R' \| 'L' \| 'W' \| 'S', overrides)` | the part header of an exam lesson | Harno minutes, tasks, points, 80 % target; a timer on screen. Every part of an exam lesson from module 9 needs one (V6) |

Owner rule (2026-10-26): the course certificate needs **≥ 80 % in every exam part**; module and mock exams show the
target per part.

## 5. What each gate wants

| rule | what to do |
|---|---|
| V1, V2 | consecutive teaching lessons: different task-id sequence in every phase, whole lesson ≥ 40 % different; a phase does not open with the same task id as the previous lesson |
| V3 | a module's 4 teaching lessons: ≥ 20 different ids, ≥ 3 different R, L, W and S ids, ≥ 4 G ids; catalogue minimums (S02, S03, S04 ≥ 1, G01 ≥ 2, G02 ≥ 1) |
| V4 | no id > 12 % of the module's tasks, no block type > 20 %; catalogue maximums (most ids ≤ 1 a module) |
| V5 | archetype and lead declared; rotation as in §2 above; course counts per §4.1 rule 4 |
| V6 | Harno formats practised per §6.4 (counted from `harno` tags in exam lessons and corners up to 089); exam lessons from module 9 have `B.examPart` for each part; mocks 060, 080, 089, 090 have all four parts |
| V7 | no instruction in two lessons (digits, quoted words and brackets ignored). Exam lessons may repeat the fixed wording of one Harno format on `harno`-tagged tasks |
| V8 | no exercise sentence (choice question, gap sentence, T/F statement, transformation row …) in two lessons, except inside review |
| V9 | every goal has ≥ 2 tasks; the main Kasuta task has the can-do goal (`g_use`, or the lesson's `canDoGoal`); the can-do says what the learner does — *räägin, lepin kokku, küsin, tutvustan* (S), *kirjutan, vastan kirjale, täidan* (W), *saan kuuldust aru* (L), *loen, leian tekstist* (R) — and that skill is the main task's |
| V10 | every phase has a task with the can-do goal; Harjuta starts at level ≤ 2 and ends at ≥ 3; Kasuta has no level ≤ 2 task and its main task is level 4; Avasta has a level 1 (a notice) and a level 3 task. A Kasuta input text is a `text` block or the task card's situation, not a `reading` task |
| V11 | minutes over the lesson (timeEstimate.js): input (R, L) ≥ 20 %, output (S, W) ≥ 25 %, language (G, notices, dictation, sentence joining) ≤ 40 %, fluency ≥ 10 % |
| V12 | modules 6–18: exactly one `harno` task a teaching lesson, 8–12 minutes, a different format family than the previous lesson's, ≤ 25 % of the lesson |
| V13 | Avasta starts with `B.review` whose items name the previous lesson and a lesson from a module 2–4 back |
| V14 | ≥ 90 % of a module's vocab-box headwords are in the EKI etLex A1–B1 lists (CC BY, `levelForms.*.json`) or an earlier module's boxes; the others are tagged `topic` |
| V15 | a module: errorfix ≤ 2, translation ≤ 1, dictation ≤ 2; Kasuta has no G task; a drill id once a lesson |

## 6. Minimal example (module 7, lesson 1: KUUL L→W)

Trimmed from `finalShapeExample.js` (there the ids are `naidis-031…`; see the file for every block):

```js
import { B, tag, teach, withShapes } from '../blocks.js';

export const LESSONS = withShapes({
  'a2b1-031': {
    title: 'Arsti juures',
    canDo: 'Ma kirjutan sõbrale 80–100-sõnalise kirja oma arstivisiidist ja annan talle ühe nõuande.',
    discover: [
      B.review('031_d_review', [['Mis juhtus Liisi koogiga?', 'a2b1-030'], ['Mida Markus eile tegi?', 'a2b1-021'], 'Kuidas sa täna end tunned?']),
      B.listening('031_d_call', 'Perearstikeskuse sõnum.', 'Kuula sõnumit kaks korda. Kirjuta lünka üks sõna või number.', transcript, gapSentences),
      tag(B.categorize('031_d_sort', …, 'full', 'g_vocab'), { level: 2 }),
      B.notice('031_d_notice', 'Märka: mis sul viga on?', ['Ma **jäin** haigeks. Ma **sain** terveks.']),
      B.table('031_d_rule', 'Kuidas muutus?', …, 'g_notice'),
      teach(tag(B.speaking('031_d_432', 'Räägi kolm korda.', '… 2 minutit, siis 1,5 ja lõpuks 1 minut.', questions, [60, 120]), { task: 'S08', fluency: true }), 'Üks-ühele: …'),
    ],
    practice: [
      B.choice('031_p_form', …, 'full', 'g_notice'),          // level 1: the ladder starts low
      B.match('031_p_words', …),
      B.reading('031_p_blog', 'Jaani blogi.', …),
      B.dialogue('031_p_chat', …, 'g_read'),
      tag(B.examWriting('031_p_note', 'Kirjuta teade.', 'Kirjuta kolleegile umbes 50 sõna. …', 'teade',
        { situation: 'Sa oled haige ja ei tule homme tööle.', points: [/* 4 */], words: [40, 60], opening: 'Tere, Kati!' }),
        { harno: 'W1b' }),                                   // the one exam corner, ≈ 8 min, level 3
    ],
    transfer: [
      B.text('031_t_sit', 'Sõber küsib nõu', 'Sinu sõber Jaan on kaks nädalat köhinud …'),
      teach(B.ideaCard('031_t_talk', 'Leppige kokku.', …, ['perearst', 'apteek', 'puhkus', 'tee ja mesi'], 'Mida te Jaanile soovitate ja miks?'), 'Üks-ühele: …'),
      tag(B.examWriting('031_t_letter', 'Kiri Jaanile.', 'Kirjuta Jaanile 80–100 sõna.', 'kiri',
        { situation: '…', points: [/* 4 */], words: [80, 100], opening: 'Tere, Jaan!', closing: 'Saa terveks!' }), { main: true }),
      B.rubricW2('031_t_rubric'),
    ],
  },
}, { 'a2b1-031': 'KUUL L→W' });
```

Why it passes: the can-do says *kirjutan* and the main task is a W04 letter (V9) at level 4 (V10); Harjuta climbs
1 → 2 → 2 → 2 → 3; Kasuta has only level-4 tasks; the W1b note is the one Harno corner (V12); the 4-3-2 retelling gives
the fluency strand (V11); the review names 030 and 021 (V13).

## 7. Exam lessons (EKS / PROOV)

- Each part starts with `B.examPart(id, 'R')` (or L, W, S); tasks carry `tag(…, { harno: 'R1' })` etc.
- Use the Harno shapes: `B.adsmatch` (R1), `B.choice` after a `B.reading` without questions or `B.reading` + `B.choice`
  (R2), `B.cloze` (R3a), `B.bankText` (R3b, R4), `B.examListen` (L1, L2, L4), `B.listening` (L3a, L3b),
  `B.examWriting` (W1, W2) with `B.rubricW1` / `B.rubricW2`, `B.ideaCard` (S1b), `B.phoneCards` (S2), `B.rubricSpeaking`.
- Full mocks (060, 080, 089) and the final (090): all four parts, Harno item counts and minutes (§2.1).

## 8. Lessons from the pilot module (B1 module 2, 2026-10-26)

Module 2 (`b1/module02.js`, a2b1-006…010) was the first module rewritten to the final shape: 47 → 0 problems, the older
quality gate and the strict gate 0. What took the time and what worked:

**The budget is the real constraint — plan it before you write a sentence.**
- Every sheet must be 40–55 min (`quality.js`, `timeEstimate.js`) and have 5–9 own blocks with ≥ 4 task types, while most
  catalogue ids may appear **once a module** (V4). With 12 teaching sheets that means ~55–65 tasks and ~50 different ids:
  in practice the module uses almost the whole catalogue. Make a table first: one row per id (R01…G13), one column per
  lesson/phase, and fill it before writing. Ids with max 2 (S02, S03, S04, G02–G06, G08, G13, L08) are the only doubles.
- The estimator decides the minutes, not your feeling. Our first draft was 35–39 min on 6 sheets. Cheap ways up, without
  more production: longer input texts (a reading of 230 words + 7–8 questions ≈ 9–10 min; a listening of 250 words +
  8 gaps ≈ 8 min), more items in `categorize`, a few more words in `writing` / `examWriting`. A speaking block is capped at
  10 min, role cards are 9, an idea card or phone card 8. Our sheets ended at 40–43 min; reaching 45+ everywhere would
  need more tasks, which the id caps do not leave room for.
- The didactic word count is lower than you think (`didacticCheck` reading 120–250 words): our „~180-word” texts
  counted 103–118. Count with the tool, not by eye.

**Kasuta is the hardest sheet.** It needs: a ≥ 80-word input of type reading / listening / dialogue / profiles /
insertion (level gate), ≥ 6 min of non-speaking/writing exercise (depth), no task of level ≤ 2 (V10), no G task (V15),
no drill block (v4), a partner task (role cards, dialogue or speak card), ≥ 2 kinds of production and a rubric. Only
**R05 insertion, R11 profiles and L07 phone message → notes** meet all of that by default — three ids for four lessons.
We used them in 006 (L07), 007 (R11), 008 (R05) and, in 009, a reading whose questions apply the plan's numbers to a
decision, tagged `{ task: 'R08', level: 3 }`. Write the level tag only when the questions really are application
(„Kas raha jätkub? Miks?”), and say so in the PR.

**Fluency ≥ 10 % per lesson needs two fluency tasks.** A lesson has ~115–120 task minutes, one speaking block is ≤ 10.
S08 (4-3-2) is allowed once a module, so the other lessons need honest repetition formats: retell the same story twice
with less time (S07), describe the picture to three partners in turn (S06), ask three people the same questions (S09),
8-minute non-stop writing (W06), a phone call or meeting done a second time with a new partner and less time. Tag them
`{ fluency: true }` — fluency minutes do not count as output, so keep ≥ 25 % output too.

**Gate pitfalls we hit.**
- `canDo` and the goals come from `b1/lessonGoals.js`, not from the module file — edit both, or V9 keeps failing.
- V9 verb map: the can-do must contain *kirjutan / räägin / lepin kokku / helistan / küsin …* matching the main
  Kasuta task's skill („kirjeldan” is not in the map).
- `quality.js` same-opening: consecutive Avasta sheets may not start with the same block type — a `vocab` box first
  counts as the opening. Put the vocab box after the first input in every second lesson.
- The one-to-one check (v4) reads the learner's text: „klassis”, „grupis”, „paarilisega”, „vahetage” in a reading or a
  self-check line demand a `teach()` note. Reword (we had „käin kolmandas klassis”, „maja grupis”).
- A transformation answer with alternatives (`a|b`) is measured as one sentence: two long alternatives exceed 16 words.
- V2 also looks at the previous module's last teaching lesson (006 vs 004) and the next module's first (009 vs 011);
  `npm run course:final-shape` shows it, our temporary report printed „NEW outside module” to catch it.
- Renaming a lesson title can break `ui/CourseProductionPage.test.jsx` (it looks for „a2b1-006 · Pere ja lähedased”).
- Audio: `build.mjs` adds recordings but never removes old ones — delete the manifest entries and `public/audio` files
  of removed blocks yourself (`listeningAudio.test.js` fails otherwise). An unknown speaker name gets a random voice
  gender; add female names to `FEMALE` in `tools/listening-audio/plan.mjs` (we added „Marika”).
- The Vabamorf speller (`tools/course-audit/language.py`, venv in the main checkout) caught *bürosse*, *saatet*; it does
  not know *nõbul / nõbule* (added to `language-allow.txt`); the `examwriting` genre value `kusimustik` is reported
  too (technical value, ignore).

**Module 6 (B1-, 2026-10-26): what changes from module 6 on.**
- B1- is a B1 band for the gates: every closed task has **exactly 10 items** (`depth.js` wants ≥ 10, `didacticCheck`
  allows ≤ 10 at B1-) — choice, true/false, gaps, match, error, transformation, word forms, word order, translation,
  formtext, adsmatch, examlisten. Readings 150–320 words with a „Miks …?” question; an Avasta and a Kasuta input of
  ≥ 140 words; speaking 68–225 s with one block ≥ 120 s a sheet; writing blocks 7–14 sentences; a `guidedletter` ≥ 70
  words. Harjuta needs ≥ 25 min of exercises without speaking/writing (`depth.js`), so a long reading and a long
  listening there are the cheap way.
- Average task-sentence length must stay ≥ 6 words a sheet (`didacticCheck` B1- „liiga lihtsad”) and ≥ 5 (`depth.js`):
  short gap sentences, error rows and transformation sources pull it down — write 6–9-word items.
- The Eksaminurk is counted to the minute (8–12): an `adsmatch` with 10 situations needs ~160 words of ads, a
  10-clip `examListen` ~260 words of transcript.
- `guidedletter` does not count as „use” at the end of Harjuta (`v4-use`); end Harjuta with speaking, writing, role
  cards or an `examWriting` card (genre `kutse` gives W03 without a tag).
- §6.2's „PROB L→W” for module 6 fails V5-lead (§4: PROB → S). Leads were moved (AVAS L→W, PROB R→S) and the main
  tasks with them; check the row of your module against the §4 lead table before writing.
- V14 counts the share of known headwords, not only the tagged ones: tagging `topic` silences V14-topic, but ≥ 90 % of a
  module's vocab-box words must still be in EKI A1–B1 or earlier boxes — keep at most ~4 topic words in ~50.
- A text with two `[[…]]`/`{…}` alternatives (`a|b`) is one sentence for `sentence-max`: keep one answer when it is
  longer than 9 words.
- Exam lessons from module 6: keep the reading part's recognition share ≤ 50 % (B1-), e.g. A2 „three people” as
  `profiles` (not recognition) instead of a `reading` with letter answers (letters are counted as copied answers).

**Patterns that worked.**
- One storyline with stakes across the module (Helgi's 60th; the lost cousin from the old photo comes back in the
  voicemail, the gift is in the lost backpack, the exam reading closes the story). It makes every input new but
  connected, and V8 (no repeated sentences) is easy.
- Archetype = route, not decoration: LUGU story → listening continuation → rule → timed retelling; KUUL two genres of
  listening → act on what was heard (explain the radio advice); AVAS „proovi kõigepealt” choice test → rule → „proovi
  uuesti” transformation, Kasuta repeats the situation (phone call to lost property); PROJ brief (voicemail with
  numbers) → offers (R1 ads) → booking call → plan & budget → letter → rewrite with the rubric (W10).
- Instructions: write each one for its task (who, what, how much); the „Kuula …/Loe …/Kirjuta …” templates collide with
  V7 across the course. Exam lessons in teie-form („Lugege…, valige…”) sound official and do not collide.
- A2 exam lesson: tag only tasks whose shape is the B1 format (R2 text + MC, R3a cloze, L1 clips MC, L4 T/F, L3a short
  answers, W1b message with points, S0) — the A2-only formats (phrases MC, sentences ↔ 3 texts, signs, business card,
  picture, idea-card Q&A) stay untagged. Keep the reading part's recognition share ≤ 60 % (`didacticCheck`): we made
  A2 reading 2 and 3 `reading` blocks with letter answers.
- Work loop: a temporary vitest file that prints per sheet the minutes, own blocks, didactic score, each block's id /
  level / strand and every gate problem (module + „new elsewhere”) — one run instead of four tools. Do not commit it.

**Added after module 4 (2026-10-26, `b1/module04.js`, 69 → 0 problems).**
- The estimator counts fewer words than you think in transcripts too: our first draft was 37–39 min on 9 of 15 sheets.
  The cheapest honest fix is longer listening transcripts (+100 words ≈ +1.8 min, no length gate) and readings up to
  ~240 words (A2+ `didacticCheck` stops at 250). Plan the minutes with the report, not by eye.
- Harjuta „live” depth (≥ 12 min): closed items count only 0.15 min each (sentence tasks 0.4), while a `listening` or
  `reading` counts with its full minutes — a longer listening fixes it, more items do not.
- The vocabulary-recycling gate (`gates.js moduleGates`) splits a vocab box at **every comma**: „kiire — срочный,
  быстрый” makes „быстрый” a word of its own that is never recycled. Write translations with „/”.
- That gate needs the stem of the **dictionary form** in the text of 3 sheets: „ära jääma” needs „jääma”, not „jäi ära”.
  Particle verbs therefore appear in their base form in a notice, a self-check or a role card on three sheets.
- `methodGaps.test.js` wants ≥ 30 % of the **previous** module's vocab stems in your module (`recyclingShare`); module 3
  words (ristmik, valgusfoor, pöörama, tervisekeskus, linnaosa, omanik …) went into directions, ads and role cards.
  Re-check after merging the neighbour's rewrite.
- One drill block type once a lesson (`v4-lesson-repeat`) is counted by **block type**, not by tag: a `transformation`
  in Avasta and a W09-tagged `transformation` in Harjuta collide. We made the Avasta one a `wordforms` tagged `G05`.
- V14: 9 of 50 vocab words outside EKI A1–B1 was too many (82 %). Keep ≤ 5 topic words a module (`tag(vocab, { topic })`)
  and replace the rest with known words.
- V8 and the module's `unique` gate also catch the exam lesson copying a teaching-lesson sentence (and module 1's
  errorfix rows). Write the exam items fresh.
- `paarilisega` in a self-check line and `rühmas` / `rühmaga` in gap sentences trigger the one-to-one check (v4); the
  transcript is not checked.
- A PROB L→S Kasuta can take its ≥ 80-word input as a `listening` tagged `{ task: 'L06', level: 3 }` when the gap
  sentences ask for consequences („…, seepärast sõidab pere kontserdile [bussiga]”), not facts.
- Speaker names of new characters must be in `FEMALE` / `MALE` of `tools/listening-audio/plan.mjs` (we added „Kaie”);
  „Mees:” / „Naine:” are not known — use first names. `preview_start` allows 5 dev servers per folder; we started the
  local stand with Vite on a free port instead.

## 9. Lessons from module 3 (B1 module 3, 2026-10-26)

Module 3 (`b1/module03.js`, a2b1-011…015) went 54 → 0 problems. New pitfalls, in addition to §8:

- **§6.2 row 3 is not valid as written:** „RÄÄK L→W*” fails V5-lead, because §4 and `ARCHETYPES` allow RÄÄK (and PROB)
  only with a speaking outcome; the `*` only relaxes the input. With KUUL, LUGE, RÄÄK, PROB in one module the four lead
  pairs force **KUUL L→W** and RÄÄK/PROB to take L→S and R→S. Module 3 uses KUUL L→W · LUGE R→W · RÄÄK L→S · PROB R→S.
  Check your row against `ARCHETYPES` before planning.
- **A2+ didactic norms (score ≥ 85):** a closed task has **exactly 8 items** (depth wants ≥ 8, the didactic check calls
  > 8 tiring); a listening block ≤ 8 gaps; an instruction ≤ ~16 words; a sentence of a reading text ≤ 16 words (a quote
  ending in „…!” glued to the next sentence counts as one sentence); speaking 60–120 s (a 4-3-2 block with 180 s fails).
  Shortening the instructions was the biggest single fix (25 instructions).
- **`examlisten` is not an input for the level gate** (Avasta/Kasuta need one reading, listening, dialogue, profiles,
  cloze, formtext or insertion of ≥ 80 words) and counts only ~9 s per item in the „live” depth check. An Avasta with
  two `examlisten` and speaking fails text-short, live-fast and the 4-task-types rule: put a gap `listening` there.
- **V14 is a share, not a list:** topic tags do not raise it. ≥ 90 % of the module's vocab-box headwords must be in the
  EKI A1–B1 forms (`levelForms.*.json`) or earlier boxes — so at most 4–5 topic words a module. Check candidate words
  against the forms before writing the boxes (`ruumikas`, `lärmakas`, `kaubik`, `hoov`, `puumaja` are not in them).
- **Vocab box entries:** no comma inside a translation (`moduleGates` splits the box on commas and counts „соседи” as a
  word), and every box word must appear on ≥ 3 sheets of the module (stem match) or the lesson gets
  `vocabulary-not-recycled`.
- **`table` rows:** `[a|b]` alternatives break the row — the pipe is the column separator. One answer per table cell.
- **Harjuta must end in use:** a `B.letter` (guidedletter) is not counted as „use” by v4; end with speaking, writing,
  role cards, dialogue, `examWriting` or a speak card (we turned the W12 register-shift note into `examWriting` 'teade').
- **Exam points:** the `examPart` points must equal the items you give (our listening first had 26 items for 25 points).
- Keeping the art: the module's existing picture briefs (011 flat, 012 moving boxes in Kasuta, 013 map, 014 directions,
  015 route) fit the new storyline, so no new images were needed — write the story around the pictures you have.
### 8.1 Module 5 (2026-10-26, `b1/module05.js`, a2b1-021…025)

Module 5 reached 0 problems on every gate with the same loop. New pitfalls on top of the pilot's:

- **Plan the speaking and writing ids first.** S01–S13 (+ S02, S03, S04 twice) and W01–W12 give ~28 productive slots a
  module; 4 Avasta talks + 4 Harjuta uses + 3 Kasuta tasks × 4 + the fluency tasks need ~26. We ran out in lesson 4 on the
  first draft. An idea card tagged `{ task: 'S12' }` (ranking) frees a `speaking` block where Harjuta already has one
  (two speaking blocks on one Harjuta sheet = `v4-repeat`).
- **Word counts are lower than they look** (again): texts written as „~180 words” counted 91–146. Count with a 10-line
  node script over `LESSONS` (words with a letter or digit, gaps removed) before running the gates.
- **Vocab boxes:** a comma inside the Russian gloss („приз, награда”) splits the entry into two headwords — use „/”.
  The recycling gate (`gates.js`) looks for the headword minus its last two letters on ≥ 3 sheets: irregular-past heads
  (*tulema* ↔ *tuli*) and phrases (*tagasi saama* ↔ *sain tagasi*) never match — choose heads whose stem recurs.
- **`B.bankText` is an `insertion` block** — without `tag({ task: 'R04' })` it counts as R05 and its level 3 breaks the
  Harjuta ladder. Give the bank's extra words both cases (a capitalised extra), else capital letters show which words
  start a sentence.
- **`same-opening` counts the block type**, so two Avasta sheets that open with any `examlisten` collide; an AVAS lesson
  can open with its „try first” choice test instead. An Avasta sheet must still end with a speaking/writing task,
  a rubric or a self-check (`end`) — moving a listening to the end fails.
- **A transformation prompt „Eile …”** fixes the word order, so the key needs no alternatives (alternatives are measured
  as one long sentence).
- **Swapping AVAS and RÄÄK** (§6.2 allows it) kept the grammar placement: the irregular past (023) is the AVAS lesson,
  as §4.1 rule 6 wants.
- **Exam headers:** `B.examPart` points must equal the items of that part — recount after every edit.
- A „try first” test with over-generalised forms (*tulis, sõis*) is reported by the Vabamorf speller; that is expected.
- Keep one timeline for the module in a scratch note (who did what on which day): with 15 sheets the same event is told
  in a story, a diary, a call and a letter, and a weekday slips easily.

### 8.2 Module 8 (2026-10-26, `b1/module08.js`, a2b1-036…040, 78 → 0 problems)

§6.2 row 8 (AVAS R→S · KUUL L→W · LUGE R→W · RÄÄK L→S) is valid as written: no swap. New pitfalls:

- **Corners in R2 and L2 (introduced in module 8).** Only the `harno`-tagged block counts for the 8–12 corner minutes,
  and a `choice` is n × 0.4 min (4 min for 10 questions). A teaching-lesson R2 corner is therefore the `reading` itself,
  tagged `{ harno: 'R2' }`: ≈ 230–260 words + 7–8 paraphrase questions ≈ 9–10 min (the teacher note says that the exam
  has three options). An L2 corner is `B.examListen(…, 'choice', …)` with a ~330-word radio transcript and 10 questions
  ≈ 10 min. The same reading is also the module's ≥ 240-word text for `harno-reading`.
- **The speaking ids run out first.** S01–S13 with S02/S03/S04 twice are 16 slots; module 8 used all 16. Plan the
  fluency tasks on S06, S07, S08, S09, S11 and a second S02, and tag role cards with the id they really are (S10 a
  request to the boss, S13 relaying a voicemail) — an untagged second `rolecards` is S05 again (`V4-max-S05`).
- **`dialogue` items are counted by `[` in the JSON** of its lines (`didacticCheck`), so the array's own bracket adds
  one: 10 gaps measure as 11 (> 10 at B1-). Write 9 gaps.
- **One-to-one regex:** `\bklassis` also matches „klassist” (a passage title „Uudised 3.b klassist”) and a gap sentence
  „samas [klassis]”; an `examPart` note „paaris” counts too. Reword („Uudised: 3.b”, „kahekesi”).
- **Exam lesson goals:** `lessonGoals.test.js` wants exactly g_read, g_notice and g_use for an assessment lesson — no
  g_vocab, even when its Avasta has a vocab box.
- **Speller:** bold inside a word („tege**ma** → teh**a**”) splits it into „tege”, „teh” for Vabamorf. Bold whole words.
- **Names:** check `COURSE_CAST.md` before naming a new person: Tiina (Sofia's neighbour) and Aivar (Kase kool's
  director) were almost reused for a language teacher and a language-school head (now Hanna, Mihkel).
- **Minutes at the cap:** with 9 own blocks and every catalogue id used, a sheet stays at 40 min; longer texts add
  little (+100 words ≈ +1.9 min of reading). An Avasta with a free slot can take a W12 register-shift letter
  (`tag(B.letter(…), { task: 'W12' })`, ≈ 10 min) — 039 used it for Markus's message rewritten for the teacher.
- **Vahehindamine 2 (040)** follows 030's shape (Avasta = review and language with `why(…, areas(…))`, Harjuta = R and L
  parts, Kasuta = W and S parts) plus 020's profile table with three columns (lessons 1, 20, 40). The Harjuta of an exam
  lesson is exempt from the item norm, but its `choice` questions still count for the sheet's average sentence length
  (≥ 5 words): write 6–9-word questions.
### 8.2 Module 7 (2026-10-26, `b1/module07.js`, a2b1-031…035)

Module 7 („Tervis”, KUUL L→W · LUGU R→S · AVAS L→S · KIRJ R→W, §6.2 row as written) went 57 → 0 problems. New pitfalls:

- **Minutes are in the transcripts.** `timeEstimate.js` counts a listening as words/110 × 2 + 0.4 a gap and has no length
  gate: +100 words of transcript ≈ +1.8 min, the cheapest honest way to 40+ min. An `examWriting` card counts
  (min + max words)/20 + 3, so a letter of 90–110 words is 13 min (80–100: 12).
- **Avasta can carry two speaking blocks.** `own` blocks (5–9) do not count the review and the picture; with the input,
  the notice, one rule task and two fluency talks (S06 + S11, or S07 + S02 to two listeners) an Avasta is 43–45 min and
  the lesson's fluency strand is done in one sheet.
- **Harjuta „live” depth (≥ 15 min at B1-):** `cloze`, `choice`, `adsmatch`, `examlisten` count ~9 s an item; only
  `listening`, `reading`, `formtext` and `insertion` count their full minutes. A Harjuta of closed tasks needs one of those
  (032 got a medicine-leaflet `reading` tagged `{ task: 'R07', level: 2 }`).
- **Two `listening` blocks on one Harjuta = `v4-repeat`.** When the corner is L3a (a `listening`), the L10 numbers task
  goes to another lesson.
- **The exam corner is counted to the minute:** an `adsmatch` with ~120 words of ads and 10 situations is 7.7 min and
  fails V12 (8–12); ~150 words of ads are needed.
- **`didacticCheck` texts:** a quote ending in „…” glued to the next sentence makes one 24-word sentence (> 18) — use
  reported speech in readings. A diary in telegraphic style („Kohv: 4 tassi. Uni: 1.00.”) pulls the sheet's average
  sentence length to 6 (B1- wants ~11): write full sentences. An R2 article followed by `choice` needs one
  „miks / mida arvab” question in the choice block, or the reading is reported as „all factual”.
- **Exam lesson goals:** `lessonGoals.test.js` lists 035 (not 030) among the assessments, so 035's goals are exactly
  `g_notice`, `g_read`, `g_use` — no `g_vocab`.
- **Vocabulary recycling:** headwords that do not come back (tõstma, keelama) are easier to swap for ones that do
  (trepp, kepp) than to force into three sheets. The stem is the headword minus two letters, so short words pass easily.
- **One-to-one regex reads readings too:** „Päikese rühmas” in a column text triggered `v4-one-to-one`.
- **Self-check the sorting columns:** „Anna sai tööle tulla” is saama + infinitive, not the translative — the gates do not
  see that. Read every categorize column against its heading.
- Speller: the endings „-ge / -ke” in the imperative notice are reported (not in `GRAMMAR`); „pilates” is unknown
  (replaced by „venitus”).
- Timeline: keep the month of every episode in a note — „jõuluks” in a January letter and a new colleague who already
  appears in November were caught only on re-reading.
