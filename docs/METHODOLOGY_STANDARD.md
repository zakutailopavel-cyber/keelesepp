# KeeleSepp course methodology standard (A2–C1, Estonian as a second language)

Owner 2026-10-22: „Наша задача — создать курс, который соответствует методике, дидактике и методологии.”
This document is the reference for every course module: what a level must contain, how a lesson is built, and which
rule the quality gates check. Each rule names its source. Where the gates do not check a rule yet, it says so
(„gate: planned”). Status of the course against the standard: §6 (checked 2026-10-22 on `main` efd80db).

Related, more detailed documents: `docs/CEFR_A2_B1_LEARNING_STANDARD.md` (stages A2+…B2-, item counts),
`docs/COURSE_DESIGN_COMMUNICATIVE.md` (lesson design v2 → template v4), `worksheet-studio/didactics/levels.js` (norms
in code).

## 1. Sources

Official (Estonia):

| Id | Source | What we take from it |
|---|---|---|
| H | Harno, „Eesti keele tasemeeksamid” — https://harno.ee/eesti-keele-tasemeeksamid | exam parts, task formats, item counts, text lengths, minutes, writing word counts, speaking tasks, topic list (teemaringid) |
| R | HTM regulation „Eesti keele tasemeeksamite ülesehitus ja läbiviimise kord” — https://www.riigiteataja.ee/akt/113092012005 | four skills, pass mark 60 % with no skill at 0; B2/C1 speaking includes work topics |
| K | Keeleseadus, lisa 1 „Keeleoskustasemete kirjeldused” — https://www.riigiteataja.ee/akt/113032019080 | the legal global descriptor of each level (no grammar list) |
| A2H | „Algaja keelekasutaja. A2-taseme eesti keele oskus” (2008) — https://harno.ee/sites/default/files/documents/2021-06/Algaja-keelekasutaja.-A2-tase.pdf | A2 grammar (pp. 69–70), functions, situations, topics, basic vocabulary (Lisa 2) |
| B12H | „Iseseisev keelekasutaja. B1- ja B2-taseme eesti keele oskus” (2008) — https://harno.ee/sites/default/files/documents/2021-06/Iseseisev-keelekasutaja.pdf | B1 and B2 grammar (2.2.6, ch. V, 3.3, 9.3.2), topics |
| C1H | „Vilunud keelekasutaja. C1-taseme eesti keele oskus” (Kerge 2008) — https://harno.ee/sites/default/files/documents/2021-06/Krista_Kerge_Vilunud_keelekasutaja_C1.pdf | C1 grammar (II.2.6, V.3), situations |

Harno names these three handbooks as the basis of its exams; the national school curricula give no grammar list by
level, so the handbooks are the grammar authority. Practice references (Keeleamet-approved course curricula): TLÜ C1
(https://www.tlu.ee/sites/default/files/T%C3%9CHI/E2%20keskus/Oppekava_eesti_keel_C1_TLU.pdf), A&E B2
(https://aekeeltekool.ee/programm/b2-taseme-eesti-keele-oppekava/).

Methodology:

| Id | Source | Principle |
|---|---|---|
| CEFR | Council of Europe, CEFR Companion Volume (2020) — https://rm.coe.int/16809ea0d4 (ET: https://rm.coe.int/cefr-cv-2020-estonian/1680b4007f) | can-do outcomes; reception, production, interaction, mediation |
| N4 | Nation, „The four strands”, *Innovation in Language Learning and Teaching* 1(1), 2007 | about equal time for meaning-focused input, meaning-focused output, language-focused learning, fluency |
| TBLT | Ellis, *Task-based Language Learning and Teaching* (2003); Willis, *A Framework for Task-Based Learning* (1996) | a task has a focus on meaning, a gap and an outcome; pre-task → task → report → language focus |
| SR | Cepeda et al., *Psychological Bulletin* 132(3), 2006; Nation, *Learning Vocabulary in Another Language* (2013) | spaced, planned recycling of words and forms |
| UbD | Wiggins & McTighe, *Understanding by Design* (2005) | backward design: the outcome and its evidence first (the Harno task), then the lessons |

## 2. Course level (backward design: UbD, H)

| Rule | Source | Gate |
|---|---|---|
| Every level ends in its Harno exam form (parts, formats, lengths, minutes); every module ends in a module check in the same form | H, R, UbD | partly: `harnoProblems` (listening, longest text); exam formats per part — planned |
| The level's grammar inventory (§5) is taught, each item in at least one lesson with a notice and practice, and met again later | A2H, B12H, C1H, SR | planned: a coverage map in code (grammar item → lessons) |
| The exam topic list (teemaringid) and domains (isiklik elu, avalik elu, töö, haridus) are covered; B2/C1 speaking has work topics | H, R | planned |
| Each skill gets real practice in every module: listening ≥ 2 tasks a module (A2: in most lessons) | H, N4 | v4: `v4-listening`; older templates: `harno-listening` (1 a module) |
| Words and forms of a module return in the next modules (planned recycling) | SR | planned |

## 3. Lesson level (CEFR, TBLT, N4)

| Rule | Source | Gate |
|---|---|---|
| The lesson has one can-do outcome; the Kasuta task is that outcome done in a situation, assessed by its rubric | CEFR, TBLT | `transfer-rubric`, `v4-partner`; „tasks serve the can-do” — planned (review) |
| Phases: Avasta (input → notice → find the rule → talk), Harjuta (a varied ladder from controlled to free), Kasuta (a situation with a partner and an outcome) | TBLT | template v4 (`v4Problems`) |
| Balance of the four strands across the lesson: drills ≤ 40 % of the time, speaking + writing ≥ 25 % | N4 | `v3-drill`, `v3-use` (v3 and v4) |
| A lesson opens with a short review of the previous lesson (2–3 min) | SR | planned |
| Variety: a task type once a sheet in Harjuta; error correction, translation and dictation are spice (module caps) | owner 2026-10-22, N4 | v4 |
| Level norms: text length, items per task, sentence length, writing word counts, speaking seconds | H, levels.js | `levels.js`, `depth.js`, `gates.js` |
| One-to-one lessons work too: every pair or group task says what to do with the teacher as the partner | owner's teaching reality | planned |
| The time estimate does not favour drills over meaning tasks (it decides whether a sheet „is a lesson”) | N4 | planned: recalibrate `timeEstimate.js` |

## 4. Harno exam formats a course must train (H)

- **A2** (80 p, 20 per part): writing — business card to text ≥ 25 words, message or description ≥ 30 words;
  listening — 4 tasks (MC 7, T/F 6, short answer 6, matching 6), played twice; reading — 5 tasks (phrases MC 6,
  sentence-to-text, signs matching 5, text ~150 words MC 5, letter gap fill ~100 words 8 gaps); speaking ~15 min in
  pairs — picture description and questions, then question cards.
- **B1** (100 p, 25 per part): writing — message ~50 words, story or personal letter ~100 words; listening — 4 tasks
  (MC 7, MC 6 on 2–3 min, short answer 8, interview T/F 9); reading — ads matching 9, text 200–300 words MC 6,
  gap fill ≤ 200 words 10, phrase bank 120–150 words 8; speaking — topic questions + pair task ending in an agreement
  (kokkulepe), then a phone role play with an institution.
- **B2**: writing — semi-formal or informal letter ~140 words, summary with comment or argument ~180 words; listening —
  excerpts played once (MC 5), interview MC 5, lecture gap fill 10, interview T/F 12; reading — article 500–600 words
  MC 7, matching 8, gap fill 4 options 12, sentence bank 350–400 words 8; speaking ~20 min — 1-min monologue on a work
  topic, then debate with pro/contra cards and a decision.
- **C1**: writing — data summary from two charts ~180 words (no opinion), opinion text 220–260 words; listening — news
  short answers 7, debate played once MC 10, lecture notes → 10 main ideas; reading — matching to sections ~600 words
  12, sentence gaps ~550 words 10, information text short answers 12; speaking ~20 min — 2-min presentation on a work
  topic, then a discussion.

## 5. Grammar inventory by level (handbooks)

- **A2 (A2H):** 14 cases in singular and plural, short illative (kooli, pähe); adjective agreement; comparative and
  superlative; ordinals, numbers 1–10 in cases; indicative in four tenses (olevik, lihtminevik, täisminevik,
  enneminevik), affirmative and negative; impersonal present and simple past; conditional present; imperative;
  nud-/tud- and v-/tav-participles (recognition); ma- and da-infinitive; mas/mast/mata and des-forms of frequent verbs;
  oskama, tohtima, võima; normal, existential and possessive (mul on) sentences; ja, aga, sest, et.
- **B1 (B12H):** quotative mood (kaudne kõneviis, mainly recognition) and some jussive (olgu); particle verbs (alla
  kirjutama, ära minema); completion with ära / läbi / valmis; verb government (rektsioon) with cases and postpositions;
  total vs partial object; ma-forms with case endings (käime tantsimas); impersonal (öeldi); adjective suffixes -line,
  -kas, -lik, -tu, eba-; participles as attributes; kes/mis relative clauses; translative of change (värvis siniseks);
  quantity + partitive singular/plural; perfect and pluperfect; ways to express the future.
- **B2 (B12H):** non-finite clauses (lauselühendid); ma/mas/mast, des and participles for time and place;
  nominalisation -mine / -ja; government of verbs and adjectives (uhke mille üle); conditional to soften a request;
  hakkama/muutuma/jääma/minema + translative; essive (eraisikuna); total vs partial subject in existential clauses;
  object case; quotative; impersonal; -ki/-gi; complex sentences.
- **C1 (C1H):** government differing from the learner's language (mille nimel, toetuma millele); auxiliary verbs
  (pruugib, juhtusin nägema); object case incl. objects of non-finite forms; phase and change constructions;
  da-constructions; des- and mata-clauses, participial phrases; nuks-forms (recognition); multi-clause sentences;
  simultaneity / anteriority (minu saabudes, töö teinud); every verb category (tense, mood, voice, kõnelaad); reference
  chains; i-plural and parallel forms; indirect questions; numbers and pronouns in all cases.

## 6. Status of the course (2026-10-22, `main` efd80db)

Method: each lesson's notice blocks and grammar focus read against §5 (survey of all 375 lessons). „Yes” = a lesson
teaches it (notice + practice); „partly” = met in passing or only some forms; „no” = no lesson teaches it.

### 6.1 Grammar coverage

| Level / course | Yes | Partly | No |
|---|---|---|---|
| A2 (`a2/`) | cases sees/peal (017, 018), genitive (007), partitive + quantity (027), comparative (033, 052), lihtminevik (059, 076), imperative (023, 064), conditional request (072), ma/da-infinitive and modals (037, 062, 068), mul on (006, 008), kui…siis (083), linking (092) | plural cases beyond the nominative; adjective agreement (031); superlative; numbers in cases (089); täisminevik (079); essive / comitative / terminative (056, 061, 034); mas-form (046) | **short illative; enneminevik; impersonal; participles (recognition); des-form** |
| B1 (`b1/`, A2+→B1) | genitive (006, 008), locatives (012), modals (017), lihtminevik (021, 023), partitive (026, 028), imperative (033), ma/da (037, 043), sest/kuna (038), comparative (052), conditional (062), täisminevik (067), future (071), kui-clauses (073), impersonal in notices (081) | ma-forms with case endings (014, 018) | **quotative mood; jussive; particle verbs; ära/läbi/valmis; verb government; total vs partial object; adjective suffixes; participles as attributes; kes/mis relative clauses; translative of change; enneminevik** |
| B2 (`b2/`, B1+→B2) | locatives (006), three pasts (011–013), object (016), ma/da (017), verb government (018), conditional advice (042), quotative (048), impersonal (058), complex sentences and word order (062, 076, 077), participles and des-form (078), mood by function (079) | non-finite clauses (078); adjective government | **nominalisation -mine/-ja; change + translative; essive; total vs partial subject; -ki/-gi** |
| C1 (`c1/`) | object (008), government (009, 069), word order (018), cases (019), tenses in text (028), moods (029), infinitives (038), participles (039), impersonal (048), nominalisation (049), relative and subordinate clauses (058, 059), connectors (068), reported speech (078), parallel forms (079), punctuation (088), reference (089) | nuks-forms; numbers and pronouns in cases | **indirect questions** (as a taught item) |

The B1 gaps matter most: the B1 handbook's core items (quotative, object, government, particle verbs, relative
clauses) are taught only in the B2 course or not at all, while a learner may take the Harno B1 exam after our B1 course.

### 6.2 Topics (exam list, H)

Missing as a module or lesson theme: **media and technology, society / current events** in A2 and B1 (the B1 handbook
adds politics, current events, economy and law); **food, housing, personal identity** in B2; **food** in C1. Work is
covered at every level.

### 6.3 Skills and lesson design

- Listening in non-exam lessons: A2 92 %, **B1 42 %**, B2 61 %, **C1 41 %** of lessons.
- Controlled form tasks vs skills tasks (all sheets): A2 601 / 858, B1 463 / 672, B2 294 / 722, C1 566 / 794. Dictation:
  A2 68, B1 25, B2 0, C1 0. Speaking is the most frequent task type at every level (~3 a lesson).
- **No lesson opens with a review** of the previous one; review happens only in the module check lessons.
- **Recycling is not planned:** of a module's key words, 5–25 % come back twice in the next three modules (mid-course),
  5–20 % in the last third. Vocabulary blocks exist in B1 and B2 only (A2: 2 blocks, C1: none).
- **One-to-one lessons are not considered:** „paariline” in A2 68 / 78, B1 62 / 67, B2 33 / 71 lessons; group tasks
  („rühm”, „klass”, „käi ringi”) in B1 43 / 67 lessons; no task says the teacher can be the partner.

### 6.4 Structure

- B1 module 1 (a2b1-001…005) has no file in code (the course starts at `b1/module02.js`).
- C1 modules 9–10 (est-c1-081…100) have no design / template; their check lessons (090, 099, 100) are not marked
  `assessment`.
- B1 modules 15–18 have design v2 but no template; B1 module 5 is the v4 sample (PR #740).
- `library/grammarIndex.js` lists 15–20 lessons a level; a few entries do not match the lesson's notice (a2-006,
  a2-002); C1 098 is missing.

## 7. Plan

1. **Gates (code):** grammar coverage map per level (§5 → lessons) with a test; exam-format coverage per level (§4);
   review at lesson start; recycling of a module's words in the next modules; a teacher-as-partner line for pair /
   group tasks; recalibrate the time estimate; module listening ≥ 2 for every template. New gates enter the quality
   baseline first (known problems shown, new ones blocked), as with earlier gates.
2. **Content:** B1 first — add the missing B1 grammar (§6.1) to the module plan, B1 module 1, listening; then B2 (gaps
   in §6.1, topics), A2, C1 (modules 9–10 into the current format). Every rewritten module uses template v4.
   B1 grammar placement (owner 2026-10-22: build the missing B1 items into the existing 18 modules, no new modules).
   Each item gets a notice + practice in its module and returns later (spiral):

   | B1 module | Theme | Added grammar (B12H) |
   |---|---|---|
   | 02 | Mina, pere ja suhted | kes/mis relative clauses (inimene, kes…; asi, mida…) |
   | 03 | Kodu, kohad ja linn | adjective suffixes -line, -kas, -lik, -tu, eba- |
   | 04 | Aeg, plaanid ja kohustused | particle verbs (kokku leppima, ära minema, ette valmistama) |
   | 06 | Toit ja teenindus | total vs partial object (sõin leiba / sõin leiva ära) |
   | 07 | Tervis ja enesetunne | translative of change (jäin haigeks, sain terveks) |
   | 08 | Õppimine ja kool | verb government with cases and postpositions (huvituma millest, osalema milles) |
   | 09 | Töö ja ametid | ma-forms with case endings (käin koosolekul / lähen ujuma / tulen tööl…: -mas, -mast, -mata) |
   | 10 | Reisimine ja transport | pluperfect (kui jõudsime, oli rong juba läinud) |
   | 11 | Raha, ostlemine ja teenused | participles as attributes (kasutatud auto, tehtud töö, ostetav kaup) |
   | 13 | Suhtlemine ja probleemilahendus | quotative mood and reported speech (ta olevat…, ta ütles, et…) |
   | 14 | Minevik, kogemused ja jutustamine | completion with ära / läbi / valmis |
   | 15 | Tulevik, plaanid ja eesmärgid | jussive (olgu, tehku) — recognition |

3. **Pilot:** one rewritten module with 2–3 real learners; compare real minutes and error rates with the estimates,
   adjust this standard.
