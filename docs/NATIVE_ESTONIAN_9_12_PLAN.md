# Eesti keel emakeelena: 9. ja 12. klass (plan)

Owner request 2026-10-21: add Estonian as a mother tongue for grades 9 and 12 to Õppevara.

This is a plan only. No course file, data or rule is written yet. Decisions marked **(owner)** are open.

## Goal

Two exam-preparation courses for pupils of Estonian-medium schools (not „eesti keel teise keelena”):

- **9. klass:** the basic school final exam „Eesti keel” (written). From spring 2027 it is an e-exam on a computer
  (HTM). The 2026/2027 date is 28 April 2027 (Harno).
- **12. klass:** the gymnasium state exam „Eesti keel” (written), with a reading part and a writing part. The writing part
  is an argumentative essay („arutlev kirjand”) of at least 400 words. The 2026/2027 date is 12 April 2027 (Harno).

Exam structure, from open sources; **check against Harno's official exam description (eksamikirjeldus) before
writing content**:

| | 9. klass lõpueksam | 12. klass riigieksam |
|-|-|-|
| Reading | text comprehension, ~30 % | functional reading: several texts and tables, short answers |
| Language | spelling, case forms, sentence structure, punctuation, ~30 % | (inside reading and writing) |
| Writing | argumentative text, ~40 % | arutlev kirjand ≥ 400 words |
| Time | ~180 min | two parts |

## Course outline (draft)

Each course has 6 modules × 5 lessons = 30 lessons (one school year, weekly). Lesson 5 of each module is a check in
exam form. Phases stay Avasta / Harjuta / Kasuta, as in the CEFR courses.

**9. klass (`ek9`)**

1. Tekstimõistmine: finding information, main idea, fact vs opinion, the author's view.
2. Õigekiri I: sound spelling (g/k/b/p/d/t, h, i/j, double letters), capital and small letters.
3. Õigekiri II: compound vs separate writing, loanwords, abbreviations, numbers.
4. Lauseõpetus ja kirjavahemärgid: simple and compound sentence, comma rules, direct speech.
5. Sõnavara ja vormiõpetus: cases and verb forms, word classes, synonyms, idioms, style; media texts.
6. Kirjutamine: the argumentative text (claim – reason – example, opening, ending); full mock exam.

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

## Open questions (owner)

1. Who are the pupils: native speakers, or bilingual pupils of Estonian-medium schools? This sets the text difficulty
   and how much grammar is explained.
2. Course length: 30 lessons a grade (one per week), or a shorter intensive (e.g. 10–15 lessons before the exam)?
3. Textbooks: which school textbooks or workbooks (and the permission's limits) should the content follow?
4. Price and subject name in the CRM: „Eesti keel” with level „9. klass”, or a separate subject „Eesti keel
   (emakeel)”?

## Next safe step

The owner answers the four questions. Then build `ek9` module 1 (5 lessons) as a sample in its own branch and PR,
without the production installer.
