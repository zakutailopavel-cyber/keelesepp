# Codex: B1→B2 modules 2–18 to every quality gate

Owner's goal (2026-10-14): an ideal curriculum whose worksheets guarantee Harno exam readiness. The quality gates and
the reference module exist; this file is the whole contract for producing the remaining B1→B2 modules. Read it fully
before every module. If anything here conflicts with older docs, this file wins for this work.

## 0. Before each module

1. Fresh `main`; open PRs (`gh pr list`). Never touch a module someone else has an open PR for.
2. Read: `AGENTS.md` (Sisuagent), `docs/CEFR_A2_B1_LEARNING_STANDARD.md` §13 (depth) and §14 (gates),
   `docs/HARNO_LEVEL_REQUIREMENTS.md` (B1/B2 parts), this file.
3. Read the **reference module** `crm-v2/src/features/worksheet-generator/admin/course/b2/module01.js` (lessons
   b1b2-001…005, strict, all gates pass). Copy its *way of working*, not its sentences.
4. Measure the module you start (from `crm-v2`):

   ```
   COURSE_REPORT=b1b2-module-02 npx vitest run src/features/worksheet-generator/admin/course/courseTools.test.js --reporter=verbose
   ```

## 1. Scope

- One module = one branch `agent/b1b2-module-NN-ideal` = one draft PR. At most 2 open PRs at a time.
- Allowed files: `crm-v2/src/features/worksheet-generator/admin/course/b2/moduleNN.js` (your module),
  `…/admin/course/b2/lessonGoals.js` (only your lessons, only if a goal text must change),
  `…/admin/course/strictModules.json` (add your module id), `…/admin/course/qualityBaseline.json` (regenerated, see §4),
  `…/admin/course/listeningAudio.json` + `crm-v2/public/audio/b1b2-NNN/*` (only when you change a listening
  transcript, see §3.8), `tools/course-audit/language-allow.txt` (only words you checked in a dictionary),
  `docs/PROJECT_STATE.md` (one entry).
- Forbidden: the gates and the engine (`worksheet-studio/**`, `admin/course/{blocks,registry,quality,readiness}.js`),
  any UI, rules, functions, other modules, production database writes, publishing, deploys. If a gate looks wrong,
  stop and describe it in the PR — do not change the gate.

## 2. What „done” means (the PR is ready only when all hold)

- The module report shows **every lesson READY** (structure, depth, keys, level, uniqueness, vocabulary).
- The module id is in `strictModules.json` and `npx vitest run src/features/worksheet-generator src/features/worksheet-studio`
  passes with no failure.
- The language check reports **0 unknown lower-case words** for the module:

  ```
  COURSE_DUMP=/tmp/mNN.json COURSE_DUMP_MODULE=b1b2-module-NN npx vitest run src/features/worksheet-generator/admin/course/courseTools.test.js
  cd .. && .venv/bin/python tools/course-audit/language.py /tmp/mNN.json
  ```

  (`.venv` with EstNLTK 1.7.5 is in the repo root; create it with `python3 -m venv .venv && .venv/bin/pip install estnltk==1.7.5`
  if missing.) Capitalised unknown words are names: check they are real names.
- Every sheet is 40–55 min (the report shows minutes).

## 3. How to rewrite a lesson (the reference does exactly this)

1. **Keep every existing item** (stable block ids, old sentences); add new items of the same level and topic. Remove a
   block only when the sheet would exceed 55 min, and prefer shortening `writing` first.
2. **Closed tasks ≥ 10 items** (choice, true/false, gaps, match, error fix, transformation, word forms, word order,
   translation, sort). Dictation: 6–8 sentences. Exam parts of a check lesson keep the exam's sizes (see 3.7).
3. **Exercise time**: Avasta and Harjuta ≥ 25 min of exercises (speaking, writing, rubric and text blocks do not count);
   Kasuta ≥ 12 min. Writing 6–8 sentences (not 10–12): the writing must not fill the lesson's time.
4. **Whole sentences**: every sheet has ≥ 2 tasks where the learner writes a whole sentence (error fix,
   transformation, translation, dictation). Kasuta typically gets: „opinion → argument sentence with a connector”
   (transformation) and „typical errors of the genre” (error fix) — see `004_t_trans`, `004_t_fix`, `001_t_fix`.
5. **Vocabulary**: every lesson has one `B.vocab('NNN_d_vocab', title, ['eesti — русский', …], '2')` with ~10 core words
   of the lesson; each word must come back on ≥ 3 sheets of the module (weave them into new items).
6. **Level lengths** (module level from `MODULE.level`: B1/B1+ → B1, B2-/B2 → B2): the longest text of Avasta and Kasuta
   ≥ 140 words (B1) / 220 (B2); a letter (`B.letter`) ≥ 70 / 140 words; one speaking task per sheet with
   `maxSec` ≥ 120 (B1) / 240 (B2).
7. **Check lessons** (Kontroll / Vahehindamine / the final assessment of module 18): add `assessment: true` to the
   lesson object (see `'b1b2-005'`). Their Harjuta exam parts keep the exam sizes (6 / 8 / 9 points); their Kasuta is
   the exam's writing and speaking part. Their Avasta (Korda) follows the normal rules.
8. **Listening**: if you change a `B.listening` transcript, rebuild its audio (free TartuNLP TTS, no key):
   `node tools/listening-audio/build.mjs --only b1b2-NNN:NNN_p_listen` and commit the mp3 + `listeningAudio.json`.
   Prefer not to change transcripts.
9. **Uniqueness**: no task sentence (≥ 4 words) on two sheets of the module. Practice must not repeat discover's error
   sentences — write new ones.
10. **Answer keys**: alternatives with `|` for every natural variant (word order with/without the pronoun, `ma`-less
    forms). A correction must differ from the error by more than punctuation. A sort item or bank entry may contain a
    comma (the builder handles it).

## 4. Estonian quality (the gates only check spelling)

- Write natural standard Estonian at the module's level; sentences of real life, Estonian names and places.
- Errors in error-fix tasks must be the errors Russian speakers really make (case after a verb, V2 word order after an
  adverbial, partitive/total object, `kui` vs `nagu`, `-ma`/`-da` infinitive, plural partitive, `kell kolm`, tense).
- Russian sources in translation tasks: natural Russian, one Estonian target meaning.
- After the module is READY, regenerate the known-problem baseline once, then run all tests normally:

  ```
  UPDATE_QUALITY_BASELINE=1 npx vitest run src/features/worksheet-generator/admin/course
  npx vitest run src/features/worksheet-generator src/features/worksheet-studio
  ```

## 5. PR and hand-over

- Draft PR „B1→B2 module NN at every quality gate”: before/after of the report (lessons READY, minutes), language check
  result, list of blocks removed (if any) and why.
- One entry in `docs/PROJECT_STATE.md` (newest on top).
- Do **not** publish. After review and merge, Claude publishes the module through the scratch publish script only
  where the database's last version is a code publish (manual CRM edits are never overwritten).

## 6. Order

Modules 2–18 (`b2/module02.js` … `module18.js`). Owner's priority: modules being taught first; otherwise in order.
Check lessons: 010 (Kontroll 2), 015, 020 (Vahehindamine 1), 025, 030, 035, 040 (Vahehindamine 2), 045, 050, 055,
060 (Vahehindamine 3), 065, 070, 075, 080 (Vahehindamine 4), 085 and the final assessment lessons of module 18.
