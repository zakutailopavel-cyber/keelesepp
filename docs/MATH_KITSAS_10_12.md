# Matemaatika kitsas 10.–12. klass — gümnaasiumi kursused saidil

Owner 2026-11-16: „срочно делаем курс по математике с 10 по 12 класс и экзамены”. The grade 12 exam prep (`mk12`) is
described in `docs/MATH_RIIGIEKSAM_KITSAS.md`. This file covers the school-year courses: grade 10 now (`mk10`), grade 11
(`mk11`, courses IV–VI) in a later PR.

## Placement (docs/CURRICULUM_MATEMAATIKA_1_12.md)

The GRÕK courses are official; their placement in grades is our decision. okmv gives only the course numbers.

- **10. klass:** I „Arvuhulgad. Avaldised. Võrrandid ja võrratused”, II „Trigonomeetria”, III „Vektor tasandil. Joone
  võrrand”.
- **11. klass:** IV–VI.
- **12. klass:** VII–VIII and the riigieksam prep.

## Program `mk10` — `crm-v2/src/features/worksheet-generator/admin/course/math/kitsas10.js`

- **Library:** level „10. klass matemaatika kitsas” puts the records under Õppevara → Matemaatika. The sheet level box
  shows „Kitsas 10”. A lesson is 90 minutes.
- **Lessons:** 26, built step by step from the basics, not exam-only. Each course ends with a „Kordamine ja
  kontrolltöö” lesson, whose third sheet is a 25-point test for 45 minutes.
- **Sheet shape:** the same three sheets as mk12 (`math/sheets.js`). The third sheet is labelled „3 Kontrollülesanne”
  (`program.phases` overrides only that label), not „Eksamiülesanne”. The „Riigieksamil” box on sheet 1 tells where the
  topic shows up on the exam.
- **Teacher's plan:** the record description is in Russian (`mathCurriculum.js coursePlan`). A normal lesson runs
  theory → worked example → practice → larger task. A test lesson runs review → warm-up → 45-minute test.
- **Test lessons:** marked `roadmapKind: 'check'` and tag „Kontrolltöö”.

| # | Id | Lesson | Course | Sheet 3 |
|---|---|---|---|---|
| 1 | mk10-001 | Hulgad, arvuhulgad ja absoluutväärtus | I | 5 p |
| 2 | mk10-002 | Standardkuju, astmed ja juured | I | 5 p |
| 3 | mk10-003 | Ratsionaal- ja irratsionaalavaldiste teisendamine | I | 5 p |
| 4 | mk10-004 | Lineaar- ja ruutvõrrandid (võrdus, samasus, Viète) | I | 10 p |
| 5 | mk10-005 | Murdvõrrandid | I | 10 p |
| 6 | mk10-006 | Võrrandisüsteemid | I | 10 p |
| 7 | mk10-007 | Lineaar- ja ruutvõrratused (ka süsteemid) | I | 10 p |
| 8 | mk10-008 | Elulised ülesanded võrrandite abil | I | 10 p |
| 9 | mk10-009 | **Kordamine ja kontrolltöö: I kursus** | I | test 25 p |
| 10 | mk10-010 | Teravnurga trigonomeetria | II | 10 p |
| 11 | mk10-011 | Mis tahes nurga siinus, koosinus ja tangens | II | 5 p |
| 12 | mk10-012 | Kraadi- ja radiaanmõõt (täiendusnurk) | II | 5 p |
| 13 | mk10-013 | Trigonomeetriliste funktsioonide graafikud | II | 10 p |
| 14 | mk10-014 | Avaldiste teisendamine valemikogu abil | II | 5 p |
| 15 | mk10-015 | Siinusteoreem | II | 10 p |
| 16 | mk10-016 | Koosinusteoreem ja kolmnurga lahendamine | II | 10 p |
| 17 | mk10-017 | Pindalad, kaar ja sektor | II | 10 p |
| 18 | mk10-018 | **Kordamine ja kontrolltöö: II kursus** | II | test 25 p |
| 19 | mk10-019 | Vektor, kahe punkti kaugus ja lõigu keskpunkt | III | 5 p |
| 20 | mk10-020 | Tehted vektoritega | III | 10 p |
| 21 | mk10-021 | Skalaarkorrutis, ristseis ja kollineaarsus | III | 10 p |
| 22 | mk10-022 | Sirge tõusunurk ja võrrand | III | 5 p |
| 23 | mk10-023 | Sirgete vastastikune asend ja nurk | III | 10 p |
| 24 | mk10-024 | Ringjoone võrrand ja parabool | III | 10 p |
| 25 | mk10-025 | Kahe joone lõikepunktid | III | 10 p |
| 26 | mk10-026 | **Kordamine ja kontrolltöö: III kursus** | III | test 25 p |

All tasks are our own. Answers use `|` between alternative right forms and `;` between several answers
(`engine/mathExpr.js sameMathAnswer`).

## Wiring and tests

- `math/sheets.js` `MATH_PROGRAMS = [KITSAS_12, KITSAS_10]`. Each program becomes one module, `<id>-module-01`.
  `mathCurriculum.js` makes the records of every program in `MATH_PROGRAMS`.
- `math/kitsas10.test.js` checks:
  - three sheets per lesson;
  - unique lesson and block ids across all math modules;
  - the lesson shape;
  - the points: 5 or 10, tests 20–30, and a test every 6–8 lessons;
  - every key form is accepted and wrong answers are rejected;
  - every formula renders in KaTeX and every graph formula compiles;
  - all trigonometric and decimal keys are recomputed in JS;
  - the records sit under Matemaatika.

## Publishing

Nothing is in production yet. Publishing follows the mk12 way: a create-only script from a clean `origin/main` export,
which runs only with the owner's yes. It never overwrites an existing record.
