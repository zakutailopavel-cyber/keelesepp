# A2 course final shape: the B1 rules against the Harno A2 exam

Owner 2026-10-29: after B1→B2 the courses go under the final-shape gates in the order **A2 → C1 → English**. The A2
course (`admin/course/a2/module01.js` … `module20.js`, lessons `a2-001` … `a2-100`) gets the same treatment as A2→B1 and
B1→B2. This file is the **delta** to `docs/COURSE_FINAL_SHAPE_B1.md`: every rule there (archetypes §4, module arc §5,
balance §7, gates V1–V16 §8) holds for A2 unless this file says otherwise. Authoring: `docs/FINAL_SHAPE_AUTHORING.md`;
A2 exam facts: `docs/HARNO_LEVEL_REQUIREMENTS.md` „A2”. B2's delta file `docs/COURSE_FINAL_SHAPE_B2.md` shows the same
pattern for another exam.

## 1. The A2 profile (`PROFILES.a2` in `worksheet-studio/didactics/finalShape.js`)

| What | B1 profile | A2 profile |
|---|---|---|
| Course | 18 modules, a2b1-001…090 | **20 modules, a2-001…100** (78 teaching lessons; module 20: 096, 098 teaching, 097, 099, 100 exams) |
| Harno formats (V6, V12) | B1 ids | **A2 ids** (§2) |
| Families / variants | W1, W2, L3, R3 families; 8 variants | W2a / W2b → W2; variants W2a, W2b ≥ 3 |
| Speaking types every module needs (V3-min) | S02, S03 idea card, S04 phone | S02, **S06 picture + questions**, **S05 idea card: ask and answer** |
| Exam corner in every teaching lesson (V12) | from module 6 | from module 6 |
| Timed exam parts (V6) | from module 9 | from module 9 |
| Mocks with all four parts | 060, 080, 089, 090 | **060, 080, 099, 100**; practice counted up to 099 |
| Tingiv kõneviis in speaking (V16) | from module 13 | **never** (B1 grammar) |
| Known vocabulary (V14) | EKI A1–B1 | **EKI A1–A2** |
| V5 relaxed last module | 18 | **20** (two teaching lessons, two lead pairs suffice) |

Everything else (V1, V2, V4 shares, V5 course counts 7–12 / PROJ ≥ 3, V7, V8, V9, V10, V11, V13, V15, V16 pair in the lesson
+ home recording) is identical. Supplements `a2-kohakaanded-01`, `a2-lihtminevik-01` (`MODULE.supplement`) are not checked.

## 2. Harno A2 exam map [H]

| Id | Part | Format | Items / length | Prepared by (catalogue) |
|---|---|---|---|---|
| **W1** | Writing T1 | Information transfer: a text about a person or institution from a business card, 4 bullet questions (who, where, when, contact) | ≥ 25 words | W07, W02 |
| **W2a** | Writing T2 (option) | Short message or invitation (e.g. you found a friend's wallet) | ≥ 30 words | W02, W03 |
| **W2b** | Writing T2 (option) | Description on a topic with 3 prompts („Minu nädalavahetus”) | ≥ 30 words | W05, W06 |
| **L1** | Listening T1 | 7 short monologues 20–30 s (announcements, instructions), MC with 3 pictures / numbers / words | 7 | L01, L10, L06 |
| **L2** | Listening T2 | Dialogue ≈ 2 min (radio / TV), true / false | 6 | L05, R06 |
| **L3** | Listening T3 | Monologue 1–1.5 min, short answers of 1–2 words | 6 | L03, L04 |
| **L4** | Listening T4 | Dialogue 2–2.5 min on personal life, matching | 6 | L09, L07 |
| **R1** | Reading T1 | Everyday set phrases and politeness formulas, MC 3 options | 6 | R12, G13 |
| **R2** | Reading T2 | Sentences matched to 3 short texts of ≈ 60 words (news, ads, notices) | — | R01, R11 |
| **R3** | Reading T3 | Notices, signs, packaging, warnings matched to information | 5 | R07, R08 |
| **R4** | Reading T4 | A text of ≈ 150 words, MC 3 options | 5 | R02, R13 |
| **R5** | Reading T5 | A personal letter of ≈ 100 words with 8 MC gaps (3 options) | 8 | R03 |
| **S0** | Speaking intro | Introduce yourself, a few questions | ≈ 1 min | S01 |
| **S1** | Speaking T1 | Each describes one picture (same topic, different people / places), then topic-sheet questions | 6–7 min | **S06**, S02 |
| **S2** | Speaking T2 | Idea card with keywords and pictures: one asks, the other answers, then swap | 5–6 min | **S05**, S09 |

Pass: ≥ 60 % (A2: 20 points of 80 per part) and no part at 0. Target, as for B1/B2: **≥ 80 % in every part**.

## 3. Introduction schedule and practice counts (`FORMAT_INTRO_A2`, `FORMAT_PRACTICE_A2`)

First taught in module (corrected 2026-10-29: corners start in module 6, so the formats come in with the module 5 exam
and the module 6 corners): S1, W1, L1, R3 → 5 (exam 025 tags them); S2, W2a, L2, R1 → 6; R2, L3 → 7; R4, W2b → 8;
L4, R5 → 9. Modules 1–4 practise the skills without exam form.
Up to lesson 099 each family is practised at least: exam lessons 4, corners 4 (S1, S2: 5), total 9 (S1, S2: 10); at most
3 modules between practices (S1, S2: 2). Variants W2a, W2b ≥ 3 each.

## 4. Default archetype plan

Odd modules use {LUGU, KUUL, AVAS, PROB}, even modules {LUGE, KIRJ, RÄÄK, PROJ}; the order rotates so no two lessons in
a row and no two module openers in a row share a type. Leads:

| Modules | LUGU | KUUL | AVAS | PROB | LUGE | KIRJ | RÄÄK | PROJ |
|---|---|---|---|---|---|---|---|---|
| 1–10 | R→W | L→W | L→S | R→S | R→S | L→W | L→S | R→W |
| 11–19 | R→W | L→W | R→S | L→S | R→W | L→W | R→S | L→S |

Order inside the module: m1 LUGU KUUL AVAS PROB; m3 KUUL PROB LUGU AVAS; m5 AVAS LUGU PROB KUUL; m7 PROB AVAS KUUL LUGU;
then repeat (m9 = m1 …); m2 LUGE RÄÄK KIRJ PROJ; m4 KIRJ PROJ LUGE RÄÄK; m6 RÄÄK LUGE PROJ KIRJ; m8 PROJ KIRJ RÄÄK LUGE;
then repeat; **m20: 096 RÄÄK L→S, 098 KIRJ R→W** (097, 099, 100 exams). Course totals: LUGU, KUUL, AVAS, PROB 10;
RÄÄK, KIRJ 10; LUGE, PROJ 9 — all within 7–12.

## 5. A2 specifics [INF]

- A2 learners are beginners: Kasuta's free production is short (S06 picture, S05 asking and answering, W02 / W03 message,
  W05 short description ≥ 30 words); the home recording (S15) is 30–60 s.
- No tingiv kõneviis in speaking prompts („Mida sa teeksid?” is B1); ask „Mida sa teed, kui …?”.
- Listening at A2 is played **twice** in every part (unlike B2 L1); clips 20–30 s.

## 6. How the course reaches 0

- Baseline: `admin/course/finalShapeBaselineA2.json` (2139 problems on 2026-10-29). The course test fails on a new problem
  and on a fixed one still in the baseline.
- Summary: `node tools/course-audit/final-shape.mjs --course a2` (`--module N`, `--rule V6`).
- Work order: module by module, one branch `agent/a2-mNN-final` and one PR per module; after each module rewrite the
  baselines (`UPDATE_FINAL_SHAPE_BASELINE=1 npx vitest run src/features/worksheet-generator/admin/course/finalShape.test.js`).
- Publishing as for B1/B2: after merge the module's sheets are published from code (old versions stay in
  `worksheetVersions`).
