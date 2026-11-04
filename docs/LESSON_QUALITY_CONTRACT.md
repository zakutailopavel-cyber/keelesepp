# Lesson quality contract (2026-10-12)

The CEFR standard (`docs/CEFR_A2_B1_LEARNING_STANDARD.md`) defines the didactics; this contract is the short,
measurable part every lesson must pass before it is published. Each rule is checked by `tools/course-audit/audit.py`.

## A. The lesson goal (shared by all three sheets)

1. **One learner goal in Estonian**, first person, action + situation + measure: „Ma oskan viisakalt paluda ja soovida
   tingiva kõneviisiga (sooviksin, saaksin, võiksin)”. Stored as `meta.canDo` on all three sheets (same text).
2. **3–4 sub-goals** (`meta.goals`, ids `g_*`), each specific to this lesson — it names the lesson's language focus or
   situation. Generic sentences that fit any lesson („Õpilane mõistab teksti põhiideed ja detaile”) fail.
3. **Coverage:** every task block has a `goal`; every sub-goal is trained by ≥ 2 task blocks across the three sheets
   and appears in the Kasuta self-check („Ma oskan…”).
3a. **Listening goal `g_listen`** („saan kuuldust aru”, 2026-11-04): an optional extra sub-goal on top of the 3–4 above.
   A lesson gets it in its `lessonGoals.js` entry (`goals.g_listen` + `tags: { blockId: 'g_listen' }`) when ≥ 2 of its
   scored tasks are done on a recording: a `listening` gap task, a Harno listening part (`examlisten`), true/false or
   choice questions on a recording heard again, a dictation (A2 only, see 3b). Tagging must not leave another sub-goal
   with < 2 tasks or a phase without its can-do goal. Its score (`score.perGoal.g_listen`) feeds „Kuulamine” on the
   admin's skill estimate (`docs/PROGRESS_ESTIMATE.md`). A lesson with one listening task keeps it under its old goal.
3b. **No dictation in B1, B2 and C1** (owner 2026-11-04: „диктанты вообще не нужны на Б1 Б2 и С1”). The B1 (`a2b1-*`),
   B2 (`b1b2-*`) and C1 courses have no `dictation` block (also no pair dictation in a speaking task); the A2 course
   keeps its dictations. Checked by `admin/course/noDictation.test.js`; the generator offers `practice-dictation` up
   to A2 only (`engine/activityCatalog.js`). A lesson that lost its dictation and has < 2 listening tasks left drops
   `g_listen` (3a). Sheets published before this rule keep their dictation until they are re-published from
   „Kursuse tootmine”.
4. The Russian teacher note (`curriculumLessons.goal`, `languageFocus`, `successCriteria`) stays for the teacher.

## B. Every sheet

5. 40–55 minutes, 5–8 task blocks; instructions ≤ 16 words.
6. **Every closed task has ≥ 5 items** (choice, true/false, gaps, match, error fix, transformation, word order, forms).
7. No two neighbouring lessons of a module share the same block sequence (Jaccard ≤ 0.75, as in `quality.js`).

## C. Phase specifics

8. **Avasta:** opens with a mini-situation (activation), has a reading text or dialogue of 120–250 words with 5–6
   questions (factual, paraphrase, cause, inference), a noticing block before any rule, one short own production.
9. **Harjuta:** retrieval from Avasta, ≥ 2 transformation tasks (not selection), recycling of the previous lesson,
   exit check.
10. **Kasuta:** no model answer before production; one new scenario with a changed condition (B1-); speaking 60–150 s
    and/or writing 60–120 words; „Ma oskan…” self-evaluation per sub-goal.

## D. Assessment lesson (Kontroll / Vahehindamine)

- No new vocabulary or grammar; covers the **goals of the module's lessons**.
- Part A language (one task per lesson goal, ≥ 6 items, auto-checked); Part B reading/listening (module text,
  6 questions of 4 types); Part C speaking + writing in a new situation, teacher rubric 3 criteria × 0–2.
- The result is reported **per module goal**: ≥ 70 % „oskan”, 50–69 % „harjutan”, < 50 % „kordame”; this feeds
  „Minu areng” and the review plan.
