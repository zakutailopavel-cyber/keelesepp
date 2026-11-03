# English B1→B2 course final shape: the English state exam (inglise keele riigieksam)

Owner 2026-11-03: „приступай к английскому на Б2”. Earlier decisions: English B2 comes after the English B1 gaps are closed
(2026-11-01, `docs/CURRICULUM_INGLISE_1_12.md` question 2); every course is a step from the level below (2026-11-02, B2 = B1 → B2);
its size follows the Estonian average of comparable courses, scaled as C1 was (`docs/COURSE_FINAL_SHAPE_C1.md` §10); mocks are full
length and look like the real exam; every sheet is a real lesson with sourced facts (`docs/COURSE_DESIGN_COMMUNICATIVE.md` §13,
`docs/ACADEMIC_VALUE_ROUND1.md`, `docs/ACADEMIC_VALUE_ROUND2.md`).

**State: design only (2026-11-03).** No code, no module, no lesson, no curriculum record. Labels: **[H]** Harno (eristuskiri, 2026
exam paper), **[C]** Cambridge English, **[W]** a provider's own page, **[INF]** our decision. The existing English course is
`docs/ENGLISH_COURSE_PLAN.md` (A2 and B1, 50 lessons each, course key `en`).

## 1. Course identity

| What | Proposal |
|---|---|
| Name (`COURSE_NAMES.enB2`) | **English B2**, subtitle „B1 tasemelt · inglise keele riigieksamini” |
| Course key | **`enb2`**, its own `courseModules.enb2.js` and loader. The A2/B1 key `en` and its gates stay untouched; the B2 gates (academic value, final shape) can then run on this course alone |
| Curriculum id | **`en-b2-v1`**, level „English B2”, subject „Inglise keel” |
| Ids | lessons `en-b2-001…050`, modules `en-b2-module-01…10`, block ids `en_b2_NNN_[dpt]_…` (the B1 pattern) |
| Step | English B1 (the basic school exam, `en-b1-050`) → B2 (≥ 75 % in the state exam) |
| Norm stages (`MODULE.level`) | modules 1–3 `English B1+`, 4–6 `English B2-`, 7–10 `English B2` (`levelKey` already reads B1+ / B2- / B2) |
| Language of sheets | English only, no Russian tip on the learner's sheet (B2) [INF]; the teacher's key stays in Russian, as in B1 |

## 2. English B1 gaps (checked 2026-11-03 in `admin/course/en/b1/*`)

Search of all 40 B1 module files and keys for the forms and their names:

| Point | Found | Verdict |
|---|---|---|
| **Past perfect** | No rule, no tip, no task. It occurs only inside reading texts: `en_b1_004_d_read` („she had left her umbrella”), `en-b1-028` story „Everything went wrong” („it had left ten minutes before”, „he had forgotten his driving licence”, „the timetable had changed … the last bus had left”) and its answers | **Missing** (only passive exposure) |
| **Third conditional** | No rule or task. „would have” occurs only as a wrong option in second-conditional items (`en-b1-032`, `033`, `035`, `047`, `050`), as „would have” + noun in the second conditional (032), and in two reading sentences (`041`, `050`) | **Missing** |
| **Mixed conditionals** | Nothing | Missing; okmv puts them at B2 (`CURRICULUM_INGLISE_1_12.md`, grade 11), so they belong to English B2 module 3, not to B1 |
| **Question tags** | Nothing („isn't it?”, „don't you?” not found) | **Missing** |
| I wish | `en-b1-033` (wish + past simple) | present; wish + past perfect missing |

**Smallest fix (a separate content PR `agent/en-b1-gaps`, not done here):** put each point into one existing lesson whose topic
already carries it (owner's rule: B1 grammar goes into existing modules), with explanation, controlled practice and use. The B1
sheets have 11–12 blocks each, so blocks are **replaced**, not added; kept tasks keep their ids.

1. **Past perfect → `en-b1-009` „Telling a story”** (module 2). Avasta: the rule tip `en_b1_009_d_rule` becomes narrative tenses
   (past simple / continuous / perfect; „the earlier past”, after / before / by the time / already) and `en_b1_009_d_gaps` practises
   past perfect vs past simple; Harjuta: `en_b1_009_p_fix` and `en_b1_009_p_cloze` get past-perfect items; Kasuta: the story task asks
   for at least two past-perfect sentences and the rubric names them. `en-b1-028` Avasta adds one noticing question on its two
   „had left / had forgotten” lines. `en-b1-010` (module check): 2 items.
2. **Third conditional → `en-b1-033` „What would you do?”** (module 7, after the second conditional in 032). `en_b1_033_d_wish` becomes
   regrets about the past (If I had known…, I would have…; I wish I had…); the rule tip adds the third conditional against the second;
   Harjuta `en_b1_033_p_dilemma` becomes a past decision („What would have happened if…?”) with a transformation task; Kasuta
   `en_b1_033_t_advice` asks the learner to talk about a past choice. `en-b1-035` check: 2 items.
3. **Question tags → `en-b1-004` „Asking politely”** (module 1). Tags to check information and to sound polite („You're Anita, aren't
   you?”), rising vs falling intonation; replace `en_b1_004_d_sort` with a tag-forming task, `en_b1_004_p_requests` gets tag items,
   the Kasuta role play (`en_b1_004_t_situation`) asks for two tags. `en-b1-005` check: 1–2 items.
4. Keys (`module01Key.js`, `module02Key.js`, `module07Key.js`), `curriculum/enB1Curriculum.js` focus lines for 004, 009, 033 and
   `EN_B1_VERSION`; `cd crm-v2 && npx vitest run src/features/worksheet-generator src/features/curriculum` green; republishing the
   three lessons and updating their curriculum records is the owner's step.

Also found: `en-b1-050` „Final mock exam (B1)” uses ordinary blocks (no `B.examPart` timing, points or exam look). It does not meet the
owner's full-length mock rule; out of scope here, noted for the B1 review.

## 3. Exam target: the English state exam [H], recommended

**Recommendation: the Harno English state exam (inglise keele riigieksam, B1/B2).** Cambridge B2 First is a second, optional target
inside the same lessons, without its own mock.

Why:
- It is the exam our learners meet. Gymnasium graduation needs a foreign-language state exam; in English it is this B1/B2 exam, or
  Cambridge C1 Advanced instead, or an earlier international certificate at B1 or higher ([H] eristuskiri §1.2). The English
  learners are Estonian school pupils (`ENGLISH_COURSE_PLAN.md`: grades 6–8), and English B1 already leads to the Harno basic school
  exam: the same body, the same task family, the same marking style.
- It is free, held every May (2027: written 3 May, oral 3–6 May; harno.ee riigieksamid), and graded on CEFR: **B2 = 75–100 %**.
- Its format is fully published: specification 2026/27, the 2026 papers, audio, keys and marking scales.
- Its speaking is one-to-one with an interviewer (no partner): it fits our individual lessons. B2 First speaking needs a pair.
- Its tasks overlap B2 First (multiple-choice cloze, open cloze, word formation, gapped text, multiple matching, MC reading;
  listening MC, completion, matching), so the language work also serves a learner who later takes B2 First.

### 3.1 The exam [H]

Sources: „Inglise keele riigieksami eristuskiri” 2026/27 (Lisa 3, kinnitatud 31.08.2026), the 2026 papers (I and II vihik) and
marking scales. Paraphrased.

| Part | Minutes | Points | Tasks / items | Scoring |
|---|---|---|---|---|
| I Writing | 90 | 25 | 2 | two independent raters; third rater if they differ by > 5 |
| (break) | 30 | | | |
| II Listening | 40 | 25 | 5 / 40 | 0.625 an item, by key |
| III Reading (incl. language use) | 90 | 30 | 7 / 60 | 0.5 an item, by key; ≈ 2500 words of text in all |
| Written part | 220 (listening + reading 130 in one go) | 80 | 14 / 102 | |
| IV Speaking | ≈ 15 | 20 | 2 | recorded; rated by a trained teacher who is not the pupil's teacher |

Result: total rounded to a whole number; **B1 = 50–74 %, B2 = 75–100 %**, and no part may be 0 points for a level. „Passed” = at least
1 %. Texts are authentic or semi-authentic, from all six topic areas: **inimene ja ühiskond; inimene ja keskkond; Eesti ja maailm;
kultuur ja looming; haridus ja töö; teadus ja tehnoloogia**. Language tasks draw on English Vocabulary Profile, English Grammar
Profile and the British Council – EAQUALS Core Inventory (Appendix E). No dictionaries.

Task by task, as in the 2026 paper (the specification lists the allowed task types; the order and counts below are the 2026 paper):

| Id | Part, task | Format | Items | Notes |
|---|---|---|---|---|
| **EW1** | Writing 1 | Letter to a given reader (semi-formal / formal): ask for or give information, complain, propose, persuade; 2026: an application to volunteer (why, experience, two questions); pen name, no addresses | **120 words**, 9 p | scale: task completion, vocabulary, grammar, 0–3 each; < 60 words caps the mark |
| **EW2** | Writing 2 | Opinion text: **report** on data (2026: two pie charts, compare two age groups, explain the two biggest differences; header Subject / From / To / Date given) **or essay** | **200 words**, 16 p | content, organisation, vocabulary, grammar, 0–4 each; < 100 words caps the mark |
| **EL1** | Listening 1 | Podcast; sentence completion, **≤ 2 words**; **played once**; 30 s to read | 8 | the only once-only task |
| **EL2** | Listening 2 | News items ↔ headlines, 2 extra; twice | 6 | |
| **EL3** | Listening 3 | Interview (2026: an actress on her youth); MC, 3 options; twice; 45 s to read | 9 | |
| **EL4** | Listening 4 | Interview answers ↔ questions, 2 extra; twice | 7 | |
| **EL5** | Listening 5 | Talk (2026: new materials in fashion); sentence completion, **≤ 3 words**; twice | 10 | |
| **ER1** | Reading 1 | Multiple-choice cloze, **4 options** (words, prepositions, articles, collocations) | 9 | ≈ 300 words |
| **ER2** | Reading 2 | Article ≈ 550 words; MC, 3 options; the last item asks the writer's attitude | 8 | |
| **ER3** | Reading 3 | Five short texts (A–E) ↔ questions; letters may repeat | 8 | multiple matching |
| **ER4** | Reading 4 | Open cloze, **one word** a gap | 9 | grammar words |
| **ER5a** | Reading 5.1 | One long text; removed phrases ↔ gaps, 2 extra | 8 | gapped text |
| **ER5b** | Reading 5.2 | Same text; bold words ↔ dictionary definitions, 3 extra | 9 | vocabulary in context |
| **ER6** | Reading 6 | **Word formation**: change the word in bold, one word | 9 | |
| **ES1** | Speaking 1 | Picture description, comparison and contrast, the question under the pictures, then the examiner's questions | ≈ 7 min | |
| **ES2** | Speaking 2 | Monologue on a topic card (answer every listed question), then the examiner's questions | ≈ 7 min | at least **1 min 45 s** of talk in ES1 and in ES2 |

Speaking scale: task completion, vocabulary, grammar, fluency and pronunciation, 0–5 each (20). Our course target, as for the
Estonian courses: **≥ 80 % in every part** (`PASS_SHARE`), which is above the 75 % B2 line.

### 3.2 Cambridge B2 First [C], for comparison

Reading and Use of English 75 min, 7 parts, 52 questions (MC cloze, open cloze, word formation, key word transformations, MC,
gapped text, multiple matching), 40 % of the mark; Writing 80 min, 2 parts, 140–190 words each (compulsory essay; article, email /
letter, review or report); Listening ≈ 40 min, 4 parts, 30 questions, each heard twice; Speaking 14 min per pair, 4 parts.
Cambridge English Scale: 160–179 = B2 (grade C 160–172, B 173–179), 180–190 = grade A (C1), 140–159 = B1 certificate.
Paid, taken at a centre. Only **key word transformations** and its writing genres (article, review) are not in the state exam;
the course practises key word transformations as a language task (they train B2 grammar) but builds no B2 First mock [INF].

## 4. Size by the Estonian average

English B2 courses in Estonia that cover the whole B1→B2 step, in academic hours (45 min), checked 2026-11-03 on each provider's
page [W]:

| # | Provider | Course | Contact | Self-study | Total |
|---|---|---|---|---|---|
| 1 | Kaitseväe Akadeemia | Inglise keele B1+–B2 veebikursus | 60 | 58 (+ 2 feedback) | 120 |
| 2 | Alterum | Inglise keel B2 Upper-Intermediate (B2.1 + B2.2) | 200 | 200 | 400 |
| 3 | Multilingua | Inglise keele õppekava B2 (4 modules, aim B2.1) | 120 | 80 | 200 |
| 4 | Kirjatäht | B2-taseme inglise suhtluskeel (B2.1 + B2.2) | 120 | 120 | 240 |
| 5 | Pleasant English (Muttik OÜ) | Tööalane inglise keel B2 | 80 | 120 | 200 |
| 6 | Dialoog | B2 inglise keele õppekava (B2.1 + B2.2) | 160 | 240 | 400 |
| 7 | Kivilinna Keeltekool | Inglise keele kõrgem kesktase B2 (B2.1 + B2.2) | 240 | 180 | 420 |
| 8 | A&E Keeltekool | B2.1 + B2.2 + B2.3 (summed) | 420 | 210 | 630 |
| 9 | Eterna Koolituskeskus | Inglise keel B2.1 + B2.2 (summed) | 88 | 32 | 120 |
| 10 | Pärnu Rahvaülikool | Inglise keel B2 (from B1.2) | 46 | 14 | 60 |

Sorted contact hours: 46, 60, 80, 88, 120, 120, 160, 200, 240, 420 → **median 120**. Self-study: 14, 32, 58, 80, 120, 120, 180,
200, 210, 240 → **median 120** (1 : 1). Without Multilingua (aims at B2.1 only) both medians stay 120. Left out: Express English
(B2→C1), Folkuniversitetet and Tartu Rahvaülikool (only single modules published, no B2 total), ABC Keeltekool (one B1–B2
programme), Akubens (English not running), Kaja, Shermankoolitus and others (pages not reachable). Notes on the sources: Alterum's
header says 170 + 30, its curriculum text 100 + 100 per module (used); Kirjatäht's paragraph also has a stray „60 + 42”. Group
sizes, where stated: Alterum 6–10, Eterna 2–4.

Arithmetic, as for C1 (`COURSE_FINAL_SHAPE_C1.md` §10):
- Precedent: Estonian B2 group courses have a median of **240** contact ak h; our Estonian B2 course is 90 individual lessons of
  60 min = **120** ak h, so **our course = 0.5 × the group median**.
- English B2 group median **120** ak h × 0.5 = **60 ak h** = 60 × 45 min = 2700 min = **45 lessons of 60 min** (9 modules of 5).
- Self-study: the Estonian courses plan it 1 : 1 (median 120 : 120), so about **60 minutes of homework per lesson**.

**Proposal: 50 lessons (10 modules of 5), 66.7 ak h of contact + the same in self-study** [INF]. The arithmetic gives 45; the five
extra lessons make room for the second full mock and the exam-strategy module without cutting a topic module, and the course
then has the size of English A2 and B1 (50 each). The owner decides 45 or 50 (§10). The English median is half the Estonian one,
which matches what the learners bring: English B1 is the end of basic school and English surrounds them, Estonian B2 does not.

## 5. Module plan (50 lessons)

Lesson 5 of every module is the module check in the exam's task types; **005** is a short diagnostic (no timing gate), **030** and
**050** are full mocks (§7). Every module covers word formation (ER6 is in every exam) and one or more exam formats. Grammar follows
the English Grammar Profile B2 / Core Inventory and the okmv B2 table (`CURRICULUM_INGLISE_1_12.md`, grades 10–12).

| Module | Lessons | Stage | Main topic area (secondary) | Broader theme | Grammar axis | Skills and formats introduced |
|---|---|---|---|---|---|---|
| 1 Who we are | 001–005 | B1+ | inimene ja ühiskond (kultuur) | identity, generations, how young people in Estonia live | tense system review; present perfect simple vs continuous; **narrative tenses incl. past perfect simple and continuous**; question tags review | EW1 (semi-formal letter), EL3, ER1, ER2, ER6, ES1; 005 diagnostic |
| 2 Learning and work | 006–010 | B1+ | haridus ja töö (Eesti ja maailm) | school systems, studying abroad, careers, CV and interview | future forms (continuous, perfect, be about to); gerund vs infinitive, incl. meaning change (stop, remember, try); complex object (want him to) | EW1 (application), EL1 (once only), ER4, ES2 |
| 3 Living with nature | 011–015 | B1+ | inimene ja keskkond (teadus) | climate, Estonian nature, sustainable consumption | conditionals 0–III review; **mixed conditionals**; unless, provided, as long as; wish / if only (present and past), would rather | **EW2 report** (charts), EL5, ER5b |
| 4 Science around us | 016–020 | B2- | teadus ja tehnoloogia (inimene ja ühiskond) | discoveries, medicine, Estonian science and tech | passive in all tenses and with modals; it is said / is believed to; have something done | EL4, ER5a |
| 5 Media and truth | 021–025 | B2- | inimene ja ühiskond (teadus ja tehnoloogia) | news, social media, fact and persuasion, AI and data | reported speech; reporting verbs (suggest, deny, admit, accuse of); reported questions | **EW2 essay**, EL2 (news) |
| 6 Estonia in the world | 026–030 | B2- | Eesti ja maailm (haridus ja töö) | the e-state, EU, migration, Estonia's image | relative clauses (defining, non-defining), participle clauses; articles with countries and institutions | ER3 (multiple matching); **030 full mock 1** |
| 7 Culture and creativity | 031–035 | B2 | kultuur ja looming (Eesti ja maailm) | books, film, music, art; comparing works, themes and characters (B2 outcome 8) | modal perfects (must / can't / might have, should / needn't have); adjective order, -ed / -ing, intensifiers | all formats in rotation |
| 8 Society and responsibility | 036–040 | B2 | inimene ja ühiskond (inimene ja keskkond) | rights and duties, volunteering, health, the city | emphasis: cleft sentences, inversion (never have I, not only); so / such, too / enough; linking for contrast, purpose, result | EW1 (complaint / proposal) |
| 9 Travel and global English | 041–045 | B2 | Eesti ja maailm (kultuur ja looming) | tourism, cultural differences, English as a world language | quantifiers (few / little, both / neither, every / none); future in the past (was going to, was to); used to / would / be used to / get used to | all formats in rotation |
| 10 Exam module | 046–050 | B2 | all six in rotation | the exam itself: how it is marked, timing | B2 error review; word formation and prefixes (counter-, sub-, dis-, mis-, over-, under-) | 046 writing, 047 listening, 048 reading and language use, 049 speaking; **050 full mock 2** |

Coverage: each of the six areas is a main topic at least once (inimene ja ühiskond 1, 5, 8; haridus ja töö 2; inimene ja keskkond 3;
teadus ja tehnoloogia 4; Eesti ja maailm 6, 9; kultuur ja looming 7) and appears in every mock. Every format is taught by module 6,
before mock 1. The skills of the B2 outcomes [H] are spread over the modules: fact vs opinion (5), a lecture (EL5 talks, 4),
comparing works (7), letters to institutions (2, 8), reports synthesising sources (3, 6).

### 5.1 Formats: first taught and practice

| Family | First taught (module) | At least before 050 |
|---|---|---|
| EW1 letter | 1 | 6 (variants: information, application, complaint / proposal) |
| EW2 report / essay | 3 / 5 | 3 each |
| EL1 once-only completion | 2 | 5 |
| EL2, EL3, EL4, EL5 | 5, 1, 4, 3 | 4 each |
| ER1, ER2, ER4, ER6 | 1, 1, 2, 1 | 5 each (ER6 every module) |
| ER3, ER5a, ER5b | 6, 4, 3 | 4 each |
| ES1, ES2 | 1, 2 | 6 each |

From module 2 every teaching lesson has one **exam corner**: one task in an exam format, 8–12 minutes, not the family of the previous
lesson's corner, as in the Estonian courses. A corner keeps the task's mental act in a shorter form (EL3: 4–5 items; ER2: 250–300
words, 4 items; EW2: plan + one paragraph; ES1 / ES2 full length, since they are short).

## 6. Lesson shape

As in the Estonian final shape (template v4, `design: 'v2'`): every lesson has three sheets **Avasta / Harjuta / Kasuta**, each
**40–55 minutes**, with the lesson's canDo and sub-goals (`en/b2/lessonGoals.js`). Avasta: a text to think about, the language noticed
in it, one full language task, a talk. Harjuta: the exam's text tasks and a monologue. Kasuta: a new situation used independently.
The 60-minute lesson works through the talk and the hard parts with the teacher; the rest is the hour of self-study (§4). Texts:
B1+ 250–500 words, B2- / B2 300–700; writing 120 (letter) and 200 (report / essay) words; speaking turns 105–180 s.

## 7. Mocks and module checks

- **Module checks** (010, 015, 020, 025, 035, 040, 045): one task from each part (writing, listening, reading, speaking), in the
  exam's form, with `B.examPart` minutes and points fitted to the task, scored on the exam's scales.
- **005**: a short diagnostic in the exam's form (one task a part), to place the learner on the B1/B2 line.
- **030 and 050: full mocks**, nothing shortened [owner 2026-11-02]: writing 90 min (EW1 + EW2), listening 40 min (EL1–EL5, 40 items,
  EL1 played once), reading 90 min (ER1–ER6, 60 items, ≈ 2500 words), speaking 15 min (ES1 + ES2). They look like the exam papers:
  booklet I (writing: task pages, rough notes, the report header or letter frame, answer lines), booklet II (listening, then reading;
  items numbered 1–100 in one sequence; answer boxes and the „for the rater” margin), the speaking cards, the same instructions and
  point totals. 030 asks the report, 050 the essay. Sheets: booklet I on one sheet, booklet II on another, speaking + review on the
  third; the written parts are done under time at home or in a longer session (≈ 220 min), the speaking part in the lesson.
- Harno's papers are models of form only. Harno allows its materials for exam preparation but **not commercial use without written
  permission**, so every text and task is written for KeeleSepp, and the sheets carry no Harno name or logo [INF].

## 8. Academic value in English

The §13 standard applies in full, with English wording:
- **Topic opener** per module (300–450 words at B2, 250–350 at B1+), no cast, real facts with a „Source: …” line, 3–4 „Think about it”
  questions of different kinds (prediction, problem, opinion, reaction, comparison).
- **Every teaching lesson**: a cast-free main text of the stage's length (B1+ 150, B2- / B2 180 words), labelled with its voice
  (`article`, `interview`, `expert`, `news`, `popsci`, `fiction` …); an opinion question wider than the episode; something new to
  know („Did you know?” with its source, or a sourced text). Every module: one cast-free **450–600-word** article (the ER2 text).
- **Facts are real**: a number given as a fact carries „Source: …” (Statistics Estonia, ERR News, Eurostat, OECD, WHO, BBC, museum
  and university pages). Our texts are written by us from those facts; no copied articles (exam papers use adapted authentic texts,
  we cannot reuse them).
- **Cast vs non-cast**: English B1 has its own recurring cast (Kaisa, Markus, Ellie, Robin, Sam, Priya, Grace by name frequency) and no
  „Source:” line anywhere. B2 may keep two or three of them as the thread of a module, never as the whole lesson; listening uses news,
  interviews, talks and podcasts without cast names (the exam's voices); one recurring voice opens ≤ 2 listening texts a module.
- **Home-country wording**: our English learners are mostly school pupils who live in Estonia, many with a home language other than
  Estonian. Questions say „in Estonia”, „where you live”, „in another country you know well”; „your home country” at most twice a
  module, never as the default comparison.
- Variety limits as §13.4 (retelling ≤ 1, recording at home ≤ 2, Kasuta not always call → letter); no fact repeated across the
  English courses.

## 9. Engine and UI changes before module 1 (own PR, not content)

1. **Registration.** New `admin/course/courseModules.enb2.js`; `registry.js` adds it to `COURSE_MODULES`; `courseLoaders.js`
   `enb2: () => import('./courseModules.enb2.js')`; `courseSheet.js` `COURSES.enb2 = named('enB2')` (a fixed badge „KeeleSepp · English
   B2 · moodul N”, so `MODULE.level` can carry the stage); `MODULE = { id: 'en-b2-module-NN', course: 'enb2', level: 'English B1+' |
   'English B2-' | 'English B2', language: 'en', design: 'v2', template: 'v4' }`.
2. **Name and curriculum.** `curriculum/courseNames.js` `COURSE_NAMES.enB2` (§1); `curriculum/enB2Curriculum.js` + test (records
   `en-b2-001…050`, level „English B2”, `levelStage` per module, a check every fifth lesson). Writing the records to Firestore is a
   production write: owner's yes.
3. **Lesson goals.** `admin/course/en/b2/lessonGoals.js` into `LESSON_GOALS` in `courseSheet.js` (English has none today).
4. **The exam's data** (`engine/blocks/harnoScales.js`): an English state exam entry (`EN-RE`: W 90 min / 25 p in 2 tasks; L 40 / 25,
   40 items × 0.625; R 90 / 30, 60 items × 0.5; S 15 / 20) with its own pass rule (B1 ≥ 50 %, B2 ≥ 75 %, no part 0; not `HARNO_PASS`
   60 %); `COURSE_EXAM.enb2 = 'EN-RE'`; `RUBRIC_SCALES` for the letter (3 × 0–3), report and essay (4 × 0–4), speaking (4 × 0–5);
   `WRITING_GENRES` letter / report / essay; `course.test.js` „exam-part headers” gets `['enb2', 'EN-RE']`.
5. **Exam blocks in English.** `engine/blocks/harno.jsx` prints Estonian („Kuulad teksti kaks korda”, „Kirjutamine”); with
   `meta.language: 'en'` it must print English (Part II Listening, 40 minutes, 25 points; „You will hear the recording only once”) and
   offer the mock layout of §7 (one item sequence across tasks, answer boxes, rater margin, report header / letter frame).
   `B.know` and `B.topicOpener` write „Allikas:” / „Kas teadsid?” / „Mõtle kaasa”: English labels for English sheets.
6. **Norms.** `levels.js harnoFor('English B2')` returns the Estonian Harno B2 exam (60 s monologue, 120–200 words); English sheets
   need the state exam's profile (texts up to ≈ 600 words, writing 120 / 200, monologue ≥ 105 s, 3–4 options), chosen by
   `meta.language`. V14-style known-vocabulary checks (EKI etLex) do not apply to English.
7. **Academic-value gates** (`academicValue.js`): the word lists are Estonian (opinion cues, „kodumaa”, „salvesta”, „Allikas:”, the
   Estonian cast). Add `profile: 'enb2'` with English cues, the English cast, „Source:” and „Did you know?”, and run
   `academicValueGate.test.js` and the round-2 gate on `enb2`.
8. **Final shape** (`finalShape.js`, `taskCatalogue.js`): a `PROFILES.enb2` with the format ids of §3.1 (EW1–ES2), the intro schedule
   and practice counts of §5.1, mocks 030 / 050; `finalShapeBaselineEnB2.json` (`{}`) and a `finalShape.test.js` entry.
9. **Strict gates.** Each finished module goes into `strictModules.json`, as A2 and B1 did.
10. **Audio.** The course TTS is Estonian (TartuNLP); English transcripts are read by the teacher today. EL1 (played once) and the
    40-minute mock listening need recorded English audio with several voices: an English TTS choice (§10).
11. Later, not blocking: English word cards (`vocabulary/lessonWords.js` knows only `a2b1-` / `b1b2-`), an English Õpik.

## 10. Open questions for the owner

1. **Size: 45 or 50 lessons?** The Estonian average gives 45 (§4); we propose 50 (10 modules, two full mocks), the size of English A2
   and B1.
2. **English audio.** Which voice for English listening (a free or a paid TTS service; paid needs your yes)? Without it the teacher
   reads the texts, and the once-only task and the mocks are not like the exam.
3. **Cambridge B2 First.** Is the state exam enough as the target (our proposal), or do some learners (adults) need a B2 First mock as
   well?

Next safe step: the B1 gap PR (§2), then the engine PR (§9), then module 1.

## Sources (read 2026-11-03)

- Harno, Inglise keele riigieksami eristuskiri 2026/27: https://projektid.edu.ee/download/attachments/390178947/Lisa%203_Inglise%20keele%20riigieksami%20eristuskiri%2026%2027%20%C3%B5a.pdf?version=1&modificationDate=1788165051663&api=v2
- Harno, Riigieksamite materjalid 2027: https://projektid.edu.ee/spaces/THO/pages/390178947/Riigieksamite+materjalid+2027
- Harno, Riigieksamite materjalid 2026 (papers I and II, audio, keys, writing and speaking scales): https://projektid.edu.ee/display/THO/Riigieksamite+materjalid+2026 ;
  booklet I: https://projektid.edu.ee/download/attachments/383882051/2026_RE_inglise%20keele_eksamitoo_I_vihik_A4.pdf?version=1&modificationDate=1785763872703&api=v2 ;
  booklet II: https://projektid.edu.ee/download/attachments/383882051/2026_RE_inglise%20keele_eksamitoo_II_vihik_A4.pdf?version=1&modificationDate=1785763916464&api=v2 ;
  earlier years 2021–2025: https://projektid.edu.ee/display/THO/Riigieksamite+materjalid+2025 (and …2024, …2023, …2022, …2021)
- Harno, riigieksamid (dates, foreign-language requirement, use of materials): https://harno.ee/eksamid-testid-ja-uuringud/eksamid-testid-ja-lopudokumendid/riigieksamid
- Cambridge English, B2 First format: https://www.cambridgeenglish.org/exams-and-tests/qualifications/first/format/ ; results:
  https://www.cambridgeenglish.org/exams-and-tests/first/results ; sample tests: https://www.cambridgeenglish.org/exams-and-tests/qualifications/first/preparation/
- Course volumes: https://adr-docs.karlerss.com/GmZU8VFv4D3tKfRs9EG6xjljz570sYIW/_ppekava_Inglise_keele_B1__B2_taseme_veebikursus.rtf ;
  https://alterum.ee/et/oppekavad/inglise-keel-–-b2-upper-intermediate/ ; https://multilingua.ee/keeltekool/meist/oppekavad/inglise-b2/ ;
  https://kirjataht.ee/wp-content/uploads/2021/05/INGLISE-KEELE-OPPEKAVA-1.pdf ; https://www.keelekool.ee/inglise-keel-b2-face2face-oppekava ;
  https://dialoog.ee/oppekava/b2-inglise-keele-oppekava/ ; https://www.kivilinnakeeltekool.ee/inglise-keele-kursus-b2/ ;
  https://aekeeltekool.ee/programm/b2-taseme-inglise-keele-oppekava/ ; https://eterna.ee/courses/inglise-keel-b2-1/ ,
  https://eterna.ee/courses/inglise-keel-b2-2/ ; https://www.noorusemaja.ee/inglise-keel-b21/
