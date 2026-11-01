# B2→C1 course final shape: the B1 rules against the Harno C1 exam

Owner 2026-10-30: a new course **„Eesti keel C1”** (subtitle „B2 tasemelt · Harno C1 eksamini”) that leads to the Harno C1
exam, as B1→B2 leads to B2. The existing 240-hour programme stays separate as **„C1 süvakursus”** (course key `c1`, ids
`est-c1-*`, unchanged). This file is the **delta** to `docs/COURSE_FINAL_SHAPE_B1.md`: every rule there (archetypes §4, module
arc §5, balance §7, gates V1–V16 §8) holds unless this file says otherwise. The nearest sibling is
`docs/COURSE_FINAL_SHAPE_B2.md`. Authoring: `docs/FINAL_SHAPE_AUTHORING.md`. Lesson plan: `docs/B2_C1_CURRICULUM.md`.

**State: foundation only (2026-10-30).** Profile, formats and names exist in code; there are **no modules and no lessons**.
Content starts after the A2 course is finished (owner). Labels as in the B1 file: **[H]** harno.ee, **[INF]** our decision.

## 1. The profile (`PROFILES.b2c1` in `worksheet-studio/didactics/finalShape.js`)

Course key **`b2c1`** instead of the `c1x` first suggested: it says what the course is, it cannot be confused with `c1`, and it
equals the prefix of the lesson ids.

| What | B2 profile | C1 profile |
|---|---|---|
| Course | 18 modules, b1b2-001…090 | **18 modules, `b2c1-001…090`**, module ids `b2c1-module-01…18`, curriculum id `est-b2-c1-roadmap-v1` (71 teaching lessons) |
| Harno formats (V6, V12) | B2 ids | **C1 ids** (§2) |
| Format families / variants ≥ 3 | W2, R2 / W2a W2b R2a R2b | **W2 / W2a, W2b** |
| Speaking types every module needs (V3-min) | S02, S16, S17 | **S18** (2-minute talk), **S19** (discussion); S02 not required (the exam has only a 1–2 min intro) |
| Exam corner in every teaching lesson (V12) | from module 2 | from module 2 |
| Timed exam parts (V6) | from module 2 | from module 2 |
| Tingiv kõneviis in speaking (V16) | allowed everywhere | allowed everywhere |
| Known vocabulary (V14) | EKI etLex A1–B2 | **EKI etLex A1–C1** (`formsLabel: 'A1–C1'`) |
| Mocks with all four parts (V6) | 060, 080, 089, 090 | 060, 080, 089, 090; practice counted up to 089 |
| Exam lessons | every fifth | every fifth |

Everything else (V1, V2, V4 shares, V5 archetype counts, V7–V11, V13, V15, V16 pair in the lesson + home recording) is
identical. The C1 süvakursus has **no** profile and is not checked by these gates.

## 2. Harno C1 exam map [H]

Re-checked on https://harno.ee/eesti-keele-tasemeeksamid (C1 section) on 2026-10-30, and the listening T3 task PDF; agrees with
`docs/HARNO_LEVEL_REQUIREMENTS.md` „C1”. Paraphrased. Pass: ≥ 60 % overall and no part at 0; each part 25 points. Bands: 50–59 %
nõrk, 60–75 % rahuldav, 76–90 % hea, 91–100 % väga hea. Our target, as for B1/B2: **≥ 80 % in every part**.

| Part | Minutes | Raw points → weighted |
|---|---|---|
| Writing | 90 | 24 (12 + 12) → 25 |
| Listening | ≈ 45 | 27 → 25 |
| Reading | 60 | 34 → 25 |
| Speaking | ≈ 20 | 20 → 25 |

| Id | Part | Format | Items / length | Prepared by (catalogue) |
|---|---|---|---|---|
| **W1** | Writing T1 | Generalising summary of source data on **two** figures or tables: compare, analyse, conclude; only a few key numbers; public reader, neutral tone, **no opinion** | ≈ 180 words, 12 p | **W16**, W15 (with the comment removed), G14 |
| **W2a** | Writing T2 (genre) | **Arvamuslugu** (formal, journalistic), from a situation and **two points**, both analysed; introduction, development, short conclusion; examples; never personal | **220–260 words, not more**, 12 p | **W17**, W14, W11, W10 |
| **W2b** | Writing T2 (genre) | **Arvamus** (semi-formal, to an institution's representative or similar), same structure | **220–260 words, not more**, 12 p | **W18**, W13, W11, W10 |
| **L1** | Listening T1 | News recordings 2–3 min, mostly monologue; 30 s to read; **played twice**; 7 short answers of **1–3 words** (the first example item is extra) | 7 | **L11**, L03, L04 |
| **L2** | Listening T2 | Interview, talk show or debate ≈ **7 min, played once**; 1 min to read; 10 MC (3 options or sentence endings), inference, the last may be about the whole | 10 | **L12**, L02, L05 |
| **L3** | Listening T3 | Lecture ≈ **10 min, played once**, notes on a draft sheet; then **15 min** to write out **10 main ideas** of 1–2 sentences so that a reader gets the lecture; understanding is scored, not spelling; names and terms given | 10 (items 18–27) | **L13**, L08 (short) |
| **R1** | Reading T1 | A text of ≈ 600 words in **4 paragraphs** (novel excerpt, opinion or problem article, popular science); **12 one-sentence statements** ↔ paragraph, each paragraph 2–4 | 12 | **R17**, R14 |
| **R2** | Reading T2 | Opinion, problem or popular-science text ≈ 550 words; **10 gaps**, each a whole sentence from **3 options**, must fit content and form | 10 | **R18**, R16, R10 |
| **R3** | Reading T3 | Long authentic informational text (service, product, manual, ad); **12 short answers of 1–4 words**; a partly right answer is wrong | 12 | **R19**, R15, R08 |
| **S0** | Speaking intro | 1–2 min: introduce yourself, where you work | 1–2 min | S01 |
| **S1** | Speaking T1 | **2-minute talk** on a work-related topic, one of **two** on the card; **3 min** preparation with notes; address or short opening, development, brief conclusion; factual, not personal; the partner asks **1–2 questions**. Answering matters more than expert knowledge | ≈ 12 min for the pair | **S18**, S16, S11, S15 |
| **S2** | Speaking T2 | **Discussion** with a topic card of guiding thoughts; get to the point fast, turns of a fair length; **take, keep and give up the turn**; must not become a monologue; **no joint position required** | ≈ 7 min | **S19**, S11, S17, S12 |

How writing is judged [H]: three aspects, task fulfilment, structure and cohesion, language use. T1: generalisation, no needless
repetition of the data. T2: both points developed, the addressee kept, what matters stressed. Speaking: task fulfilment and
language together: genre, pragmatic skill, fluency; the talk is judged on answering questions; the discussion on turn-taking.

**Not clear in the source:** the page gives the L3 answer a scale of 0–5, but 7 + 10 + the task's 10 items is exactly the stated
27 points. [INF] Until the owner or a Harno booklet settles it, we score L3 as 10 items of 1 point. The consultation booklet
(`Konsultatsioonivihik_C1_2023.pdf`) was only sampled for the word cap and the card topics, not read in full; read it and the
performance samples before writing module 2.

## 3. New catalogue types (`taskCatalogue.js`, 71 → 83)

| Id | Name | Level | Harno | Block types that host it |
|---|---|---|---|---|
| W16 | Üldistav kokkuvõte kahest joonisest (≈ 180 sõna, arvamuseta) | 4 | W1 | `writing` after two `chart` / `table` |
| W17 | Arvamuslugu (220–260 sõna, kaks punkti) | 4 | W2a | `writing` (`examwriting` has no C1 genre yet, §8) |
| W18 | Arvamus asutusele (220–260 sõna, kaks punkti) | 4 | W2b | `writing` |
| L11 | Uudised: lühivastused (1–3 sõna) | 2 | L1 | `listening` (gapped answers), played twice |
| L12 | Vestlus või väitlus: järeldused (kuuleb üks kord) | 3 | L2 | `examlisten` mode `choice`, `plays: 1` |
| L13 | Loengu konspekt: olulisemad mõtted (kuuleb üks kord) | 3 | L3 | a recording + open lines (§8: no dedicated block yet) |
| R17 | Väited neljale lõigule (12 väidet, ≈ 600 sõna) | 2 | R1 | `manymatch`, the paragraphs as targets |
| R18 | Lause lünka kolmest valikust (≈ 550 sõna) | 3 | R2 | `cloze`, whole sentences as options |
| R19 | Teabetekst: lühivastused (1–4 sõna) | 2 | R3 | `reading` with short-answer questions |
| S18 | Kaheminutiline ettekanne (teemakaart, küsimused) | 4 | S1 | `speaking` (solo: home recording) or `speakcard` |
| S19 | Diskussioon teemakaardiga (kõnevoor) | 4 | S2 | `speaking` / `rolecards`, a pair task, done in the lesson |
| G14 | Ümbersõnastus: register ja tihedus | 3 | W1, W2, R2 | `transformation` |

The eleven format types may appear **up to 2 times a module** (a teaching task + an exam corner); G14 too. S16 and S17 stay
allowed but are B2 formats: S17's joint position is not what S2 asks. Per module S18 ≥ 1, S19 ≥ 1 (max 2).

**Below level at C1 [INF], avoid even though the gates would count them:** R01, R07, R08 (as main), R12, L01, L10, W01, W02, W03,
W07, S05, S06, S09, S10, G11, G13. Word-level gaps, literal questions on one text and personal-experience writing do not
prepare for this exam (`HARNO_LEVEL_REQUIREMENTS.md` C1 §6). V3 still needs ≥ 20 different ids a module, so plan the id table first.

## 4. Lesson archetypes and the module arc

As in the B1 file §4–§5. The default plan is the B2 plan (`COURSE_FINAL_SHAPE_B2.md` §4.1, proven in 18 modules): four different
archetypes per module, four lead pairs, no two of a type in a row, no module opening like the previous one. Course totals: LUGU,
KUUL, AVAS, PROB, LUGE, KIRJ, RÄÄK 9 each, PROJ 8 (V5: 7–12, PROJ ≥ 3). Lessons 5, 10, … are the module exams (EKS); 060 / 080 / 089 /
090 are full mocks (PROOV).

C1 emphasis inside the same archetypes [INF]:
- **PROB** ends in S19 (discussion), **RÄÄK** in S18 or S19; the home recording (S15, V16) is the learner's own 2-minute talk.
- **KIRJ** alternates W16 and W17 / W18; **PROJ** uses two data sources or two opinions and ends in W16 or S18.
- **LUGE** reads 550–600-word texts, including novel excerpts (R1 allows them), and always asks what is **not** said.
- **KUUL** uses news (twice), 3–7-minute debates (once) and lectures with notes (once); **AVAS** discovers the module's style axis.
- **LUGU** is the course story; its product turns a personal case into a general argument: W2 must not become personal.

### 4.1 Default plan: archetype, lead and exam corner per lesson

The corner rotation was checked with a script against §5 (no family twice in a row, every intro met, gaps, counts). A module may
swap the order inside its four or change a corner when the topic needs it; the gates must still hold.

| Module | Lessons | 1st | 2nd | 3rd | 4th | 5th |
|---|---|---|---|---|---|---|
| 1 | 001–005 | LUGU R→W | KUUL L→W | AVAS L→S | PROB R→S | EKS |
| 2 | 006–010 | LUGE R→S · W1 | RÄÄK L→S · L1 | KIRJ L→W · S1 | PROJ R→W · R3 | EKS |
| 3 | 011–015 | KUUL L→W · S2 | PROB R→S · R1 | LUGU R→W · S1 | AVAS L→S · W1 | EKS |
| 4 | 016–020 | KIRJ L→W · L2 | PROJ R→W · W2a | LUGE R→S · L1 | RÄÄK L→S · R3 | EKS |
| 5 | 021–025 | AVAS L→S · R2 | LUGU R→W · S2 | PROB R→S · S1 | KUUL L→W · R1 | EKS |
| 6 | 026–030 | RÄÄK L→S · L3 | LUGE R→S · W1 | PROJ R→W · L2 | KIRJ L→W · L1 | EKS |
| 7 | 031–035 | PROB R→S · S2 | AVAS L→S · S1 | KUUL L→W · R3 | LUGU R→W · R2 | EKS |
| 8 | 036–040 | PROJ R→W · W2a | KIRJ L→W · R1 | RÄÄK L→S · L3 | LUGE R→S · L2 | EKS |
| 9 | 041–045 | LUGU R→W · S2 | KUUL L→W · S1 | AVAS R→S · W1 | PROB L→S · L1 | EKS |
| 10 | 046–050 | LUGE R→W · R2 | RÄÄK R→S · R3 | KIRJ L→W · L3 | PROJ L→S · W2b | EKS |
| 11 | 051–055 | KUUL L→W · S2 | PROB L→S · S1 | LUGU R→W · R1 | AVAS R→S · L2 | EKS |
| 12 | 056–060 | KIRJ L→W · L1 | PROJ L→S · W1 | LUGE R→W · R2 | RÄÄK R→S · W2a | **PROOV** (060) |
| 13 | 061–065 | AVAS R→S · S2 | LUGU R→W · S1 | PROB L→S · L3 | KUUL L→W · R3 | EKS |
| 14 | 066–070 | RÄÄK R→S · R1 | LUGE R→W · L2 | PROJ L→S · W2b | KIRJ L→W · R2 | EKS |
| 15 | 071–075 | PROB L→S · S2 | AVAS R→S · S1 | KUUL L→W · L1 | LUGU R→W · L3 | EKS |
| 16 | 076–080 | PROJ L→S · W1 | KIRJ L→W · R3 | RÄÄK R→S · R1 | LUGE R→W · L2 | **PROOV** (080) |
| 17 | 081–085 | LUGU R→W · S2 | KUUL L→W · S1 | AVAS R→S · W2a | PROB L→S · R2 | EKS |
| 18 | 086–090 | RÄÄK L→S · L3 | KIRJ R→W · L1 | LUGE R→S · W1 | **PROOV** (089) | **PROOV** (090) |

## 5. Introduction schedule and practice counts (`FORMAT_INTRO_C1`, `FORMAT_PRACTICE_C1`)

First taught in module: **S1, W1, L1, R3 → 2; S2, R1 → 3; W2a, L2 → 4; R2, W2b → 5; L3 → 6.** The learners passed B2 and know the exam
situation, so all formats are met by module 6 and modules 7–18 rotate them.

Before 090 (practice up to 089) each family is practised at least: exam lessons 5, corners 5 (S1, S2: 6), total 11 (S1, S2: 12);
at most 3 modules between two practices (S1, S2: 2). Variants W2a, W2b ≥ 3 each. Higher than B2 (4 + 4), since C1 has ten families
rather than twelve for the same 67 corners.

What the default plan gives (corners + exam lessons up to 089):

| Family | Corners | Exam lessons | Total |
|---|---|---|---|
| W1 | 7 | 10 | 17 |
| W2 | 6 | 10 | 16 |
| L1 | 7 | 9 | 16 |
| L2 | 6 | 8 | 14 |
| L3 | 6 | 6 | 12 |
| R1 | 6 | 13 | 19 |
| R2 | 6 | 10 | 16 |
| R3 | 6 | 13 | 19 |
| S1 | 9 | 17 | 26 |
| S2 | 8 | 16 | 24 |

## 6. Exam corner (V12) and short forms

From module 2 every teaching lesson has exactly one task tagged with a C1 format, **8–12 minutes**, not the same family as the
previous lesson's corner, and exam-form tasks ≤ 25 % of the lesson. Most C1 tasks do not fit 8–12 minutes in their real size, so
a corner is a **short form that keeps the task's mental act** [INF]: L2 a 3-minute debate, played once, 4–5 MC with inference; L3 a
3–4-minute talk, played once, 5 ideas; R1 ≈ 250 words in 4 paragraphs, 6 statements; R2 ≈ 250 words, 4–5 sentence gaps; W1 and W2 a
plan and one paragraph, or the full text only in the main task; S1 the full 2 minutes + 3 min preparation + questions; S2 4–5 minutes.

## 7. Exam lessons

Module exams test a part of each skill (table), with `B.examPart` minutes and points fitted to the task; **the four mocks use the
real sizes**: writing 90 min (24), listening 45 (27), reading 60 (34), speaking 20 (20). That is ≈ 215 minutes, so a mock is spread
over its three sheets like the B2 mocks (reading and writing on Harjuta, listening and speaking on Kasuta, or as the recognition
share needs). 005 is a shorter diagnostic with no gate on timing (timing starts in module 2). 060 and 089 ask W2a, 080 and 090 W2b.

| Lesson | Kind | Formats tagged |
|---|---|---|
| 010 | EKS | W1, L1, R3, S0, S1 |
| 015 | EKS | W1, L1, R1, R3, S0, S1, S2 |
| 020 | EKS | W1, L1, R1, R3, S0, S1, S2 |
| 025 | EKS | W2b, L2, R1, R2, S0, S1, S2 |
| 030 | EKS | W1, L2, R3, R1, S0, S1, S2 |
| 035 | EKS | W2a, L3, R2, R3, S0, S1, S2 |
| 040 | EKS | W2b, L1, R1, R2, S0, S1, S2 |
| 045 | EKS | W1, L2, R3, R1, S0, S1, S2 |
| 050 | EKS | W2a, L3, R2, R3, S0, S1, S2 |
| 055 | EKS | W2b, L1, R1, R2, S0, S1, S2 |
| 060 | PROOV | W1, W2a, L1, L2, L3, R1, R2, R3, S0, S1, S2 |
| 065 | EKS | W1, L2, R3, R1, S0, S1, S2 |
| 070 | EKS | W2a, L3, R2, R3, S0, S1, S2 |
| 075 | EKS | W2b, L1, R1, R2, S0, S1, S2 |
| 080 | PROOV | W1, W2b, L1, L2, L3, R1, R2, R3, S0, S1, S2 |
| 085 | EKS | W1, L2, R3, R1, S0, S1, S2 |
| 089 | PROOV | W1, W2a, L1, L2, L3, R1, R2, R3, S0, S1, S2 |
| 090 | PROOV | W1, W2b, L1, L2, L3, R1, R2, R3, S0, S1, S2 |

## 8. Before the first module (not done here; needs its own PR)

The gates are ready, the course is not. A content agent will hit these; each one is a UI or engine change, so it is not in the
content zone (AGENTS.md):

1. **Levels.** `LEVEL_ORDER` has B2 → C1 and no step between. Proposal: add a stage `C1-` (`levels.js`) for modules 1–8; modules 9–18
   `C1`, as B2 added `B1+` / `B2-`. The C1 norms are already Harno's (writing 180–260, speaking 90–180 s, reading 400–650).
2. **Two courses on level „C1”.** `courseForLevel('C1')` stays the süvakursus (`sharesLevel` in `courseNames.js`). Õppevara
   (`libraryModel.js levelFacets`), „Minu kursus” (`StudentCoursePage`) and the textbook cover (`BookPage`) are keyed by level, so
   they would mix the two courses. They need the curriculum id before anything of `b2c1` is published.
3. **L13 has no block.** The exam needs a recording played once, notes, then 10 open answers with a teacher score;
   `examlisten` has only `choice`, `truefalse`, `match`. Also open short answers (L11) in the same block.
4. **Scales.** `RUBRIC_SCALES` and `EXAM_PART_DEFAULTS` hold the B1 scale, `WRITING_GENRES` has no C1 genre. Add W1 / W2 (three aspects,
   12 points each) and a speaking scale of 20, or pass overrides as B2 does.
5. **Registration.** `registry.js` imports and `COURSE_MODULES`; `b2c1/lessonGoals.js` in `LESSON_GOALS`; `lessonWords.js` prefix; `textbookContract.js`;
   `EXAM_FORMATS.b2c1` in `methodGaps.js`; the roadmap data file with the curriculum id.
6. **Audio.** TartuNLP gives clean synthetic speech; Harno's listening is authentic radio with noise and music. A 10-minute lecture and a 7-minute
   debate may be too long for the voice models, so test one first. A real recorded lecture would be closer to the exam; owner's choice (§10).

## 9. How the course reaches 0

- Baseline: `admin/course/finalShapeBaselineB2C1.json`, now `{}`. While the course has no modules the course test has no groups
  for it and `final-shape.mjs --course b2c1` says so.
- When the first module is registered the test gets its groups, including `course`. All course-level rules (V5, V6) then fire at
  once: rewrite the baseline in that PR (`UPDATE_FINAL_SHAPE_BASELINE=1 npx vitest run src/features/worksheet-generator/admin/course/finalShape.test.js`).
- Summary: `node tools/course-audit/final-shape.mjs --course b2c1` (`--module N`, `--rule V12`).
- Work order: module by module, 1 → 18, one branch `agent/b2c1-mNN` and one PR per module, written new in the final shape from the
  start (template v4, `design: 'v2'`), not rewritten from an older version.

## 10. Open for the owner

1. Same size as B2 (18 modules, 90 lessons)? The step B2 → C1 is usually longer than B1 → B2; the süvakursus has 100 lessons.
2. Mocks 060 / 080 / 089 / 090 as in B2, at full real length (≈ 215 min each)? Alternative: only 089 / 090 at full length and 060 / 080
   at reduced length (`PROFILES.b2c1.shape.mocks` stays, the sizes change).
3. L3 scoring (§2) and the audio source (§8.6).
4. Whether a learner may move between the two C1 courses; they share topics but no sentences.
