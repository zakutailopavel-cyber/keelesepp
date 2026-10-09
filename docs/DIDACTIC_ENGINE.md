# Didactic engine — level norms, the check, and the plan

The owner wants a worksheet generator that knows the didactic norms of every level (2026-10-10, „сделай все сам”).
This document is the contract for the constructor, the generator and the local models. It is architecture, not
content: the content agent keeps writing packs, and they are measured with the same norms.

## Principles

1. **Norms are data, not prose.** `crm-v2/src/features/worksheet-studio/didactics/levels.js` holds one profile per
   level: A1, A2, A2+, B1- (= A2+/B1-), B1, B2, C1. Each profile defines:
   - sentence length (average and maximum);
   - answers per closed task;
   - reading length, the number of questions, and whether inference questions are required;
   - writing amount (sentences, or words from B1 on);
   - speaking seconds;
   - word bank: yes, tip or no;
   - whether a solved example is used;
   - the largest allowed share of recognition tasks;
   - the longest instruction a learner reads alone;
   - the can-do statement.

   Sources: CEFR; the Estonian national level descriptions (Harno); `docs/CEFR_A2_B1_LEARNING_STANDARD.md`.
2. **One check for everything.** `didacticCheck(doc, { level, phase })` measures any worksheet against its profile:
   generator output, a teacher's own sheet, a content pack, or what the local models write. It returns
   `{ level, label, phase, checks[], score, issues[] }`. The issues are warnings or tips only, so publishing is never
   blocked by a norm.
3. **Phase aware.** Avasta (discover) and Harjuta (practice) do not need production; Kasuta (transfer) and a full
   sheet do. The phase comes from `meta.phase`, or from a generated sheet's title or subtitle.
4. **Language correctness is separate from didactics.**
   - Word forms come from the lexicon (step 2: Vabamorf).
   - Free text is checked by TartuNLP's GEC model on the school Mac.
   - A model never writes a sheet unchecked.
5. **The learner model feeds the generator.** It draws on:
   - the learner's errors (lesson analysis);
   - weak skills (automatic „Areng”);
   - words due in „Minu sõnad”.
6. **Calibration from real answers.** The share of learners solving each item, from submitted worksheets, tunes
   difficulty. A teacher's „bad sentence” flag removes a sentence forever.

## What the check measures (step 1, done)

| Check | How |
|---|---|
| sentence length | solved task sentences (gaps filled, choice questions), average and longest vs the profile; „too simple” only from B1- |
| answers per task | items of closed tasks vs `items` (sorting: minimum only) |
| reading | passage words vs `reading.words`; from B1- at least one „miks / kuidas / mida arvad” question |
| production amount | writing `minSent–maxSent`, letter `minWords–maxWords`, speaking `minSec–maxSec` |
| scaffolding | a word bank from A2+ (tip) or B1 (warning); a solved example where the profile says `no` |
| balance | the share of recognition tasks vs `closedShare`; speaking or writing on transfer and full sheets; practice before use |
| instructions | words in an instruction vs `instructionWords` |

The constructor shows the score („Didaktika · tase A2 · 80%”) and the issues in the quality pop-up.

**Calibration on the generator (2026-10-10).** Fixture lessons, 3 seeds × 4 stages:

- Closed tasks have 3 answers; the norm is ≥4 at A2 and ≥5 from A2+.
- Sentences for B1 profiles average 4–7 words; the norm is about 13.
- Speaking and writing amounts do not grow with the level.

These are real gaps of the generator, fixed in step 2.

## Plan

1. ~~Level norms + the didactic check in the constructor.~~ Done.
2. The generator obeys the norms:
   - `difficultySpec` takes item counts, speaking and writing ranges, and bank use from `levels.js`;
   - `inspectGeneratedSheet` adds the didactic check;
   - the planner prefers task types the profile wants.
3. Lexicon breadth: generate word forms with Vabamorf / EstNLTK on the school Mac, plus a frequency band per level.
4. Grammar targets: `GRAMMAR` in `levels.js` drives the planner and the local model prompts. Grammar in a sheet is
   detected later with the morphological analyser.
5. Local models fill slots only (situations, names, short texts) under the profile's limits. Every sentence goes
   through GEC and `didacticCheck`; anything that fails is dropped.
6. Personal sheets from the learner model (errors, weak skills, due words).
7. Calibration: item difficulty from submitted answers, and the teacher's „bad sentence” flag.
