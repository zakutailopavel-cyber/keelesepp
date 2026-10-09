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
2. ~~The generator obeys the norms.~~ Done for item counts, speaking and writing ranges, and word bank: `difficultySpec`
   reads them from `levels.js`, using the lesson's `levelStage`. Every generated sheet carries
   `sheet.didactic = {level, score, issues}`.
   - Re-calibration on the same fixtures: the average score is 83%; item findings fell from 64 to 27.
   - The rest are content limits (profiles have only 3–4 error or translation items) and instruction texts.
   - Still open: the planner preferring the task types a profile wants.
3. ~~Level vocabulary A1–C1.~~ Done.
   - **Source:** the EKI etLex adult learner lists (Sõnaveeb „Õpetaja tööriistad”, CC BY), read from the public etLex API by `tools/lexicon/build_level_forms.py fetch` into `tools/lexicon/etlex-levels.json`. That is 10,539 lemmas: A1 730, A2 1056, B1 2832, B2 5167, C1 754.
   - **Forms:** `build` generates every form with Vabamorf into `didactics/levelForms.<level>.json`, 321k forms in total. The constructor loads only the levels up to the sheet's level: A2 ≈115 kB gz, C1 ≈745 kB gz.
   - **The check:** `didacticCheck(doc, {forms})` reports the share of words above the level, with examples. It works on every level; on C1 it counts only words outside all lists.
   - **Rules for unlisted words:** names and numbers are skipped; a compound counts by its harder known part; a -mine noun in any form counts as its verb.
   - The 2018 PDF lists (A1–B1) can still be parsed with `parse`; `build` uses etLex when it is present.
   - Still open: generator lexicon breadth. etLex has no translations, so `source.json` entries still need a Russian translation and tags.
4. ~~Grammar targets from EKI.~~ Done.
   - **Source:** `tools/lexicon/build_level_forms.py grammar` reads EKI's grammar competence profile for adults (etLex `gramprofiles`, CC BY) into `didactics/grammarProfile.json`. It has 547 topics: A1 84, A2 136, B1 171, B2 135, C1 21. Each topic carries an „oskab” statement, a category and an example.
   - **Constructor:** „Leht” → „Tasemel X õpitav grammatika (EKI)” (`GrammarPanel`). The AI fields „Lünk harjutab” and „Grammatika tekstis” suggest the level's topics (datalist).
   - **School Mac:** the prompts list what is known (earlier levels) and the level's targets from this profile (`ekiGrammar`). `levels.js` `GRAMMAR` is only the fallback.
   - ~~Detecting the grammar actually used in a sheet.~~ Done with EKI's own tool, „Õppeteksti hindamine” (etLex `POST /projects/etLex/evaluation`). It gives the level of every word and every grammatical form („ostaksin — tingiv kõneviis — B1”).
     - EKI does not allow browser calls from our domain (the CORS preflight answers 400), so the call goes through `languageApi` `POST /evaluate`, which is staff only (`evaluationRequest` / `summarizeEvaluation` in `functions/language-core.js`).
     - Constructor: „Leht” → „Hinda EKI-ga” (`editor/EkiEvaluation.jsx`) sends `sheetText(doc)`, the solved learner-facing text. It shows the word and form level bars and the words and forms above the sheet's level.
5. ~~Local models under the norms.~~ Done for gap sentences and reading texts.
   - On the school Mac, `answerAiRequests` loads `levels.js` and `levelForms.json` (copied into `app/didactics`, or from the repository).
   - **Gap sentences:** gemma3 gets the level's sentence length and grammar, and writes twice as many as asked. Sentences that are too long or have more than one word above the level are dropped; the rest are checked by GEC.
   - **Reading:** a text with questions at the level's length. When over 8% of its words are above the level, it is simplified once. Every sentence is GEC-checked; the CRM shows the hard words and the corrections („Paranda kõik”).
   - Measured: 8 A2 gap sentences in 34 s, 6 clean. A 110-word A2 text in 40 s, with 5 real errors caught and fixed by GEC.
6. ~~Personal sheets from the learner model.~~ Done.
   - „Areng” → „Tee isiklik tööleht” (`features/students/personalWorksheet.js`) builds a draft with:
     - his due words (vocabulary + matching);
     - his own lesson errors (errorfix, gaps, word forms);
     - one task for the weaker of speaking and writing, with the amounts of his level.
   - It opens as an unsaved private draft (`/students/:id/worksheets/new`).
7. ~~Calibration.~~ Done.
   - **„Halb lause”:** in the gaps / word order inspector a sentence is marked bad. It is removed from the sheet and stored in `generatorFlags`. The generator skips it (`createDiversityState({ blocked })`, normalised by `sentenceKey`).
   - **Calibration:** `didactics/calibration.js` computes, over all done `worksheetAssignments` (up to 800), the share of right answers per level × task type. With at least 20 answers it gives „Liiga raske” (<50%) or „Liiga lihtne” (>92%). It is shown on the „Generaatori katvus” page (`CalibrationCard`).

## Next (after the 7 steps)

- Translations and tags for the EKI level words, so the generator lexicon grows beyond 314 words.
- Grammar detection in a sheet with Vabamorf analysis (on the Mac), against `GRAMMAR`.
- Feed the calibration verdicts back into `levels.js` once enough answers exist.
