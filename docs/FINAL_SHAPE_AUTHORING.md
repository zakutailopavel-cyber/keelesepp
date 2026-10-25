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
