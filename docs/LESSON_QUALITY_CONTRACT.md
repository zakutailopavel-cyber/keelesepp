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
