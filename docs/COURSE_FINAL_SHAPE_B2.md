# B1→B2 course final shape: the B1 rules against the Harno B2 exam

Owner 2026-10-29: „продолжаем с курсами”. The A2→B1 course passed every final-shape gate on 2026-10-29 (baseline `{}`).
The B1→B2 course (`admin/course/b2/module01.js` … `module18.js`, lessons `b1b2-001` … `b1b2-090`) now gets the same
treatment. This file is the **delta** to `docs/COURSE_FINAL_SHAPE_B1.md`: every rule there (archetypes §4, module arc
§5, balance §7, gates V1–V16 §8) holds for B2 unless this file says otherwise. Authoring how-to: `docs/FINAL_SHAPE_AUTHORING.md`
(same tags, same builders); B2 exam facts: `docs/HARNO_LEVEL_REQUIREMENTS.md` „B2”.

## 1. Why a profile, not a copy

The gates are the same code (`worksheet-studio/didactics/finalShape.js`) with a course profile (`PROFILES.b2`):

| What | B1 profile | B2 profile |
|---|---|---|
| Harno formats (V6, V12) | B1 ids (§2.2 of the B1 file) | B2 ids (§2 below) |
| Format families | W1a/W1b → W1, W2a/W2b → W2, L3a/L3b → L3, R3a/R3b → R3 | W2a/W2b → W2, R2a/R2b → R2 |
| Variants that need ≥ 3 uses | W1a W1b W2a W2b L3a L3b R3a R3b | W2a W2b R2a R2b |
| Speaking types every module must have (V3-min) | S02, S03 (idea card), S04 (phone) | S02, **S16** (talk at a meeting), **S17** (argument cards) |
| Exam corner in every teaching lesson (V12) | from module 6 | **from module 2** (the learners passed B1) |
| Timed exam parts in exam lessons (V6) | from module 9 | **from module 2** |
| Tingiv kõneviis in speaking (V16) | from module 13 | **allowed everywhere** (taught at B1) |
| Known vocabulary (V14) | EKI etLex A1–B1 | EKI etLex **A1–B2** |
| Mocks with all four parts (V6) | 060, 080, 089, 090 | 060, 080, 089, 090 (Vahehindamine 3, 4 and the two final mocks) |

Everything else (V1, V2, V4 shares, V5 archetype counts, V7, V8, V9, V10, V11 strands, V13 review, V15 caps, V16
pair-in-lesson + home recording) is identical. The supplement `b1b2-kaanded-01` (`MODULE.supplement`) is not on the
course path and is not checked.

## 2. Harno B2 exam map [H]

Sources: harno.ee „Eesti keele tasemeeksamid” (B2 section), B2 konsultatsioonivihik 2021 — summarised in
`docs/HARNO_LEVEL_REQUIREMENTS.md`. Pass: ≥ 60 % and no part at 0; each part 25 %. Our target, as for B1: **≥ 80 % in
every part**.

| Id | Part | Format | Items / length | Prepared by (catalogue) |
|---|---|---|---|---|
| **W1** | Writing T1 | Semi-formal or informal letter: explanatory note to a boss, recommendation to a friend, complaint, request | ≈ 140 words | **W13**, W08, W12 |
| **W2a** | Writing T2 (option) | Summary of source data (table, chart, survey) with **own comment** | ≈ 180 words | **W15**, W11 |
| **W2b** | Writing T2 (option) | Argumentative text: **pros, cons, examples, conclusion** | ≈ 180 words | **W14**, W11, W10 |
| **L1** | Listening T1 | 5 authentic clips 35–45 s (announcement, speech, lecture, news, debate), **played once**, 3-option MC | 5 | L01, L06 |
| **L2** | Listening T2 | Interview / talk show 3–4 min, played twice, MC | 5 | L02, L09 |
| **L3** | Listening T3 | Lecture / talk / review 3–4 min, **10 gapped sentences**, 1–2 words | 10 | L04, L03 |
| **L4** | Listening T4 | Interview with 2 guests or talk show with 3 speakers, 3–4 min, **12 true/false** | 12 | L05 |
| **R1** | Reading T1 | Opinion, problem or review article **500–600 words**, 7 MC (3 options) | 7 | R02, R13 |
| **R2a** | Reading T2 (option) | 8 statements / tips / warnings ↔ 6 paragraphs of a 300–400-word text (handbook, institution site, manual) | 8 | **R14**, R09 |
| **R2b** | Reading T2 (option) | 8 short answers of **1–3 words** to a 200–300-word informational text | 8 | **R15** |
| **R3** | Reading T3 | Cloze ≈ 250 words, **12 gaps, 4 options**, a word **or expression** | 12 | R03, G08 |
| **R4** | Reading T4 | Text 350–400 words, **8 whole sentences** removed, bank with **one extra** sentence | 8 | **R16**, R10 |
| **S0** | Speaking intro | 1 min about the learner's work or studies | ≈ 1 min | S01 |
| **S1** | Speaking T1 | **1-minute talk at a meeting / seminar / presentation** from a topic card (work-related), 2 min preparation, notes allowed; the partner asks one question | 7–8 min for the pair | **S16**, S15, S11 |
| **S2** | Speaking T2 | Opinions on the examiner's questions, then a situation: the pair agrees on a **joint position** with **argument cards A (pro) / B (con)** and own arguments | 9–10 min | **S17**, S03, S12, S14 |

How writing and speaking are judged [H]: task fulfilment and structure, **register and addressee**, range and precision of
vocabulary, varied and complex sentences (including **lauselühendid**), natural linking; in T2 generalising from data,
justifying with **examples**, logic. Speaking: genre fit, highlighting what matters, fluent answers, pro/con arguments
with examples, taking and keeping the turn, linking to the partner, even tempo.

## 3. New catalogue types (`taskCatalogue.js`, 63 → 71)

| Id | Name | Level | Block types that host it |
|---|---|---|---|
| W13 | Poolametlik kiri (≈ 140 sõna) | 4 | `guidedletter` / `examwriting` with `tag(block, { task: 'W13' })` |
| W14 | Arutlus: poolt ja vastu (≈ 180 sõna) | 4 | `writing`, `examwriting` |
| W15 | Kokkuvõte andmetest + kommentaar (≈ 180 sõna) | 4 | `writing` after a `chart` / `table` |
| R14 | Väited lõikudele | 2 | `manymatch` (paragraphs as the targets) |
| R15 | Lühivastused tekstist (1–3 sõna) | 2 | `reading` with short-answer questions |
| R16 | Lausepank lünkadesse (üks üleliigne) | 3 | `insertion` with a bank of whole sentences + 1 |
| S16 | Sõnavõtt koosolekul (1 min, teemakaart) | 4 | `speaking` (solo: home recording) or `speakcard` |
| S17 | Arutelu argumendikaartidega (ühine seisukoht) | 4 | `rolecards` (card A pro / card B con) — a pair task, done in the lesson |

Per module (V3/V4, teaching lessons): S16 1–2, S17 1–2; the other new types at most 1. The B1 minima for S03 and S04
are off in the B2 profile — the phone call and the idea card are B1 exam formats.

## 4. Lesson archetypes and the module arc

As in the B1 file §4–§5: every teaching lesson has an archetype and lead skills (`withShapes(LESSONS, { … })` in the
module file), four different archetypes per module, at least 4 of the 4 lead pairs, no two lessons of the same type in a
row; course totals 7–12 per archetype, PROJ ≥ 3. The fifth lesson of each module is the module exam (`EKS`), and
060 / 080 / 089 / 090 are full mocks (`PROOV`) with all four parts timed (`B.examPart`).

B2 emphasis inside the same archetypes [INF]:
- **PROB** and **RÄÄK** lessons end in S17 (joint position with argument cards) or S16 (talk at a meeting) — the two
  B2 speaking tasks; the home recording (S15, V16) is the learner's own 1-minute talk.
- **KIRJ** lessons alternate W13 (register, addressee), W14 (pros / cons / examples / conclusion) and W15 (data → summary →
  comment).
- **LUGE** lessons read 500–600-word problem articles (R1) and the sentence-bank text (R4); **KUUL** lessons use
  3–4-minute interviews and talks (L2–L4) and once-played clips (L1).

### 4.1 Default plan (owner 2026-10-29)

Odd modules 1–7 take the set {LUGU R→W, KUUL L→W, AVAS L→S, PROB R→S}, odd modules 9–17 {LUGU R→W, KUUL L→W, AVAS R→S,
PROB L→S}; even modules 2–8 {LUGE R→S, KIRJ L→W, RÄÄK L→S, PROJ R→W}, even modules 10–16 {LUGE R→W, KIRJ L→W, RÄÄK R→S,
PROJ L→S}. The order inside a module rotates with a period of four modules (m1 = m9 = m17, m3 = m11, m5 = m13, m7 = m15;
m2 = m10, m4 = m12, m6 = m14, m8 = m16). Every fifth lesson is the module exam (EKS); 060 and 080 are mocks (PROOV) inside
their EKS slot (marked PROOV below). A module may swap the order inside its four when its topic or grammar needs it — the V5 rules must still
hold (four types, four lead pairs, no type twice in a row, lesson 1 differs from the previous module's lesson 1). Course
totals of the plan: LUGU, KUUL, AVAS, PROB, LUGE, KIRJ, RÄÄK 9 each, PROJ 8 (V5: 7–12, PROJ ≥ 3).

| Module | Lessons | 1st | 2nd | 3rd | 4th | 5th |
|---|---|---|---|---|---|---|
| 1 | 001–005 | LUGU R→W | KUUL L→W | AVAS L→S | PROB R→S | EKS |
| 2 | 006–010 | LUGE R→S | RÄÄK L→S | KIRJ L→W | PROJ R→W | EKS |
| 3 | 011–015 | KUUL L→W | PROB R→S | LUGU R→W | AVAS L→S | EKS |
| 4 | 016–020 | KIRJ L→W | PROJ R→W | LUGE R→S | RÄÄK L→S | EKS |
| 5 | 021–025 | AVAS L→S | LUGU R→W | PROB R→S | KUUL L→W | EKS |
| 6 | 026–030 | RÄÄK L→S | LUGE R→S | PROJ R→W | KIRJ L→W | EKS |
| 7 | 031–035 | PROB R→S | AVAS L→S | KUUL L→W | LUGU R→W | EKS |
| 8 | 036–040 | PROJ R→W | KIRJ L→W | RÄÄK L→S | LUGE R→S | EKS |
| 9 | 041–045 | LUGU R→W | KUUL L→W | AVAS R→S | PROB L→S | EKS |
| 10 | 046–050 | LUGE R→W | RÄÄK R→S | KIRJ L→W | PROJ L→S | EKS |
| 11 | 051–055 | KUUL L→W | PROB L→S | LUGU R→W | AVAS R→S | EKS |
| 12 | 056–060 | KIRJ L→W | PROJ L→S | LUGE R→W | RÄÄK R→S | PROOV (060) |
| 13 | 061–065 | AVAS R→S | LUGU R→W | PROB L→S | KUUL L→W | EKS |
| 14 | 066–070 | RÄÄK R→S | LUGE R→W | PROJ L→S | KIRJ L→W | EKS |
| 15 | 071–075 | PROB L→S | AVAS R→S | KUUL L→W | LUGU R→W | EKS |
| 16 | 076–080 | PROJ L→S | KIRJ L→W | RÄÄK R→S | LUGE R→W | PROOV (080) |
| 17 | 081–085 | LUGU R→W | KUUL L→W | AVAS R→S | PROB L→S | EKS |
| 18 | 086–090 | RÄÄK L→S | KIRJ R→W | LUGE R→S | PROOV (089) | PROOV (090) |

**Module 1 as built (2026-10-29, `b2/module01.js`, 41 → 0 problems).** 001 LUGU R→W (main W13 letter to the head of
personnel), 002 KUUL L→W (main W05 text for the new-employee guide), 003 AVAS L→S (main S17 argument cards, S16 talk
recorded at home), 004 PROB R→S (main S17 learning-plan talk). Pitfalls on top of the B1 ones (`FINAL_SHAPE_AUTHORING.md`):
- **Catalogue caps first.** The v4 module had 12 × S02, 8 × W05, 7 × L04, 6 × R02: most of the work was giving every
  block its real id (13 W, 12 R, 8 L, 13 S ids in 4 lessons). Plan the id table before editing.
- **Recognition share at B1+ is ≤ 2 of 7 tasks a Harjuta sheet** (`did-closed-share`): `cloze`, `match`, `choice`,
  `truefalse` and `examlisten` count. Turning a gap listening into `examlisten` also lowers the „live” depth (items ×
  0.15 min instead of the recording's minutes) — do it in Avasta, where a reading is the input, not in Harjuta.
- **Speaking at B1+ is 120–240 s** for the didactic check: an S16 „1-minute” talk in Harjuta is done twice (3 min, then
  2 min) to stay in the band; the S16 in Kasuta (60–120 s) is the home recording.
- **Kasuta inputs of level 3:** R15 tagged `level: 3` (rules applied to Sofia's case, 1–3-word answers), R16 sentence bank
  (an `insertion` with one extra), R11 cards, L07 voice message.

## 5. Introduction schedule and practice counts (`FORMAT_INTRO_B2`, `FORMAT_PRACTICE_B2`)

First taught in module: S1, W1 → 2; L1, R2a → 3; S2, L3, R3 → 4; W2b → 5; R1, L2 → 6; R4, W2a → 7; L4, R2b → 8.
Modules 1–8 thus meet every format once; modules 9–18 rotate them in the corners and exams.

Before 090 (practice up to lesson 089) each family is practised at least: exam lessons 4, corners 4 (S1, S2: 5), total 9
(S1, S2: 10); at most 3 modules between two practices (S1, S2: 2). Variants W2a, W2b, R2a, R2b ≥ 3 each.

## 6. Exam corner (V12)

From module 2 every teaching lesson has exactly one task tagged with a B2 format (`tag(block, { harno: 'R4' })`),
8–12 minutes, not the same family as the previous lesson's corner, and exam-form tasks ≤ 25 % of the lesson.

## 7. How the course reaches 0

- Baseline: `admin/course/finalShapeBaselineB2.json` (1182 problems on 2026-10-29, `main` 0db8252). The course test
  (`admin/course/finalShape.test.js`) fails on a new problem and on a fixed one still in the baseline.
- Summary: `node tools/course-audit/final-shape.mjs --course b2` (`--module N`, `--rule V12`).
- Work order: module by module, 1 → 18, one branch `agent/b2-mNN-final` and one PR per module; after each module rewrite
  the baselines (`UPDATE_FINAL_SHAPE_BASELINE=1 npx vitest run src/features/worksheet-generator/admin/course/finalShape.test.js`).
  Course-level problems (V5-course, V6) close as the modules fill in.
- Publishing as for B1: after merge, the module's sheets are published from code (old versions stay in
  `worksheetVersions`; owner 2026-10-28: manual edits on course sheets may be overwritten).

## 8. Open for the owner

- The B2 mocks are 060 / 080 / 089 / 090 like B1. If the owner wants only 089 / 090 as full mocks, change
  `PROFILES.b2.shape.mocks`.
- Practice counts in §5 are lower than B1's (4 exam + 4 corner instead of 6 + 4): the B2 course has the same 72
  teaching lessons for 12 format families plus speaking, and the learners already know the exam situation from B1.
