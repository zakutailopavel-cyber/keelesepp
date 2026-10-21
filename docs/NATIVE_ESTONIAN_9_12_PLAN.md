# Eesti keel emakeelena: 9. ja 12. klass (plan)

Owner request 2026-10-21: add Estonian as a mother tongue for grades 9 and 12 to Õppevara.

This is a plan only. No course file, data or rule is written yet. Decisions marked **(owner)** are open.

## Goal

Two exam-preparation courses for pupils of Estonian-medium schools (not „eesti keel teise keelena”):

- **9. klass:** the basic school final exam „Eesti keel” (written), 28 April 2027 (Harno). Still on paper in 2027.
- **12. klass:** the gymnasium state exam „Eesti keel” (written), with a reading part and a writing part. The writing part
  is an argumentative essay („arutlev kirjand”) of at least 400 words. The 2026/2027 date is 12 April 2027 (Harno).

### Official exam descriptions (Harno eristuskirjad 2026/2027, read 2026-10-21)

Sources:
- projektid.edu.ee → „Põhikooli lõpueksamite materjalid 2027” → „Lisa 1 Põhikooli eesti keele lõpueksami
  eristuskiri 26 27 õa.pdf”;
- „Riigieksamite materjalid 2027” → „Lisa 1_Eesti keele riigieksami eristuskiri 26 27 õa.pdf”;
- for the grade 9 spelling topics: PRÕK 2011 lisa 1 (riigiteataja.ee aktilisa 1290/8201/4020), pp. 16–17, which the
  grade 9 exam description names as the source of its language tasks.

**9. klass (põhikooli lõpueksam).**
- Written exam, 100 points, 180 minutes, no aids.
- An e-exam was planned for 2027, but Harno postponed it by a year (ERR, 2026-05-04), so 2027 is still on paper.
- Tasks: 20% recognition, 30% reproduction, 50% application.
- Part I, reading (30 p, ~50 min):
  1. a literary text of up to 800 words (15–20 p, 30 min);
  2. a practical, informative or media text of up to 800 words (10–15 p, 20 min).
- Part II, writing (70 p):
  - a narrative-argumentative short essay of at least 200 words (40 p, 90 min);
  - 3–5 language tasks (30 p, 40 min; 0.5 or 1 p per answer).
- Essay marks: content 20/15/10/5/1, spelling 10/8/6/3/1 (0–2 / 3–4 / 5–8 / 9–11 / 12+ errors), vocabulary and style 5–1,
  structure 5–1. Off-topic or under 150 words = 0.
- Spelling in reading answers costs no points.

**12. klass (riigieksam).**
- Written exam, 100 points, 360 minutes. The õigekeelsussõnaraamat is allowed.
- Reading (40 p, ~120 min): a base text or a set of base texts of up to 1000 words (fiction, journalism,
  (popular) science), four variants, one chosen. Three open tasks, answers of 50–100 words. Each answer scores 8 or 13
  for content plus 2 for language.
- Writing (60 p, ~240 min): an argumentative essay of about 400 words with a title (0 if under 250 words).
  Content ×5, correctness ×4, style ×2, form ×1, each on a 0–5 scale.

## Course outline (draft)

Each course has 6 modules × 5 lessons = 30 lessons (one school year, weekly). Lesson 5 of each module is a check in
exam form. Phases stay Avasta / Harjuta / Kasuta, as in the CEFR courses.

**9. klass (`ek9`)**

1. Tekstimõistmine: finding information, main idea, fact vs opinion, the author's view.
2. Õigekiri I: sound spelling (g/k/b/p/d/t, h, i/j, double letters), capital and small letters.
3. Õigekiri II: compound vs separate writing, loanwords, abbreviations, numbers.
4. Lauseõpetus ja kirjavahemärgid: simple and compound sentence, comma rules, direct speech.
5. Sõnavara ja vormiõpetus: cases and verb forms, word classes, synonyms, idioms, style; media texts.
6. Kirjutamine: the narrative-argumentative short essay (≥ 200 words: claim – reason – example, opening, ending); full mock exam.

Built: module 1 „Tekstimõistmine” (ek9-001…005), see „State” below.

**12. klass (`ek12`)**

1. Funktsionaalne lugemine: mixed texts, tables, comparing and concluding.
2. Teksti analüüs: author's position, argumentation, rhetoric, influence in media.
3. Short answers and summary in one's own words.
4. Arutlev kirjand I: opening the topic, the problem, thesis, arguments, examples (literature, history, society).
5. Arutlev kirjand II: structure, coherence, style, typical errors; spelling and punctuation review.
6. Mock exams: two full mocks and an analysis against the marking guide.

## What the system needs (technical)

1. **Course data.** `data/keelesepp-ek9-curriculum.json` and `data/keelesepp-ek12-curriculum.json`, same shape as
   the C1 manifests (module → lessons with id, title, focus, kind, hours). Lesson ids: `ek9-001…030`,
   `ek12-001…030`.
2. **Registry.**
   - `admin/course/registry.js`: `COURSES.ek9 = { label: 'Eesti keel · 9. klass (lõpueksam)', badge: 'KeeleSepp
     emakeel 9' }` and `COURSES.ek12`.
   - Module files `admin/course/ek9/moduleNN.js` and `ek12/moduleNN.js`.
3. **Level and norms.**
   - The `level` of the sheets is `'9. klass'` / `'12. klass'`, so Õppevara shows them as their own stage under
     the subject „Eesti keel” (library groups subject → stage (`level`) → topic).
   - The didactic and quality norms are keyed by CEFR level (A1…C1). They need a native-language norm set:
     9. klass close to the B2 text lengths, 12. klass close to C1.
   - Its own rules: the share of spelling tasks, essay length 250+ (9) / 400+ (12), and no RU→ET translation tasks.
4. **Installer.**
   - Writes `curriculumLessons/{ek9-NNN}` with `subject: 'Eesti keel'`, `level: '9. klass'`, a module `topic`,
     `curriculumId`, and `roadmapManaged: true`, like `a2CurriculumRecords`.
   - It writes to the production database, so it needs the owner's yes.
5. **Task types.** The existing blocks cover the exam: gaps, cloze, errorfix, formtext, reading with questions,
   writing and rubric.
   - New, small: a spelling block with a choice per word (kokku/lahku, suur/väike täht) can reuse `cloze`.
   - The essay rubric follows Harno's marking criteria (content, structure, language, spelling).
6. **Students.** A pupil's track gets `subject: 'Eesti keel'` and `level: '9. klass'`. The subject switcher and teacher
   scope already work by subject.

## Owner decisions (2026-10-21)

1. **Pupils:** both groups. The core is written for bilingual pupils of Estonian-medium schools: rules are explained
   and texts are a little easier. Every lesson also has harder tasks for native speakers (a „Raskem” block).
2. **Length:** 30 lessons a grade (6 modules × 5, one lesson a week, lesson 5 = check in exam form).
3. **CRM subject:** „Eesti keel” with level „9. klass” / „12. klass”. Price and teacher are set per track, as now.
4. **Still open:** which school textbooks or workbooks to follow, and the limits of the permission. The owner will
   photograph them.

## State (2026-10-21)

- **Technical base (worksheet-studio/didactics).**
  - `nativeStage()`: „9. klass” / „12. klass” are levels EK9 / EK12, no longer read as A2. They have their own
    LEVELS, HARNO, GRAMMAR, DEPTH, LEVEL_LENGTHS and reading speed.
  - EK9 tasks need at least 8 items and sentences averaging 5 or more words.
  - The exams have no speaking part, so speaking length is not checked.
- **Strict spelling scoring.** In a course sheet whose level is a school grade, gaps, errorfix and transformation get
  `data.strict`. The answer is then compared with commas, capitals and letters (`strictNorm`); only spaces and the
  quote style are forgiven. Without it the unfixed sentence was accepted as right.
- **Other check changes.**
  - didacticCheck and the fix-same gate compare native sentences as written.
  - A masked spelling gap „(kor_a)” is not a base-form hint.
  - A check lesson's Kasuta sheet (the essay) needs no reading text.
- **Course module `ek9/module01.js` + `module01b.js`.**
  - Registered as course `ek9` and in strictModules; it passes every gate.
  - All texts are written for KeeleSepp:
    - 001: a literary text, character and choices;
    - 002: imagery and main idea;
    - 003: an informative text with a chart, numbers and abbreviations;
    - 004: news vs opinion piece, fact and opinion, influence;
    - 005: the module check as a full mock exam (two readings, ten language tasks, short essay with the exam rubric).
- **Not done.**
  - The installer for `curriculumLessons/ek9-NNN` (production write; owner's yes).
  - Publishing the sheets.
  - Modules 2–6 of grade 9 and the whole grade 12 course.

## Next safe step

The owner reviews module 1. Then the ek9 installer (curriculumLessons records: subject „Eesti keel”, level „9. klass”),
with the owner's yes for the production write, and modules 2–6 by the same pattern.
