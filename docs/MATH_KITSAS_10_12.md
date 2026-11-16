# Matemaatika kitsas 10.–12. klass — gümnaasiumi kursused saidil

Owner 2026-11-16: „срочно делаем курс по математике с 10 по 12 класс и экзамены”. The grade 12 exam prep (`mk12`) is
described in `docs/MATH_RIIGIEKSAM_KITSAS.md`. This file covers the school-year courses: grade 10 (`mk10`, courses I–III)
and grade 11 (`mk11`, courses IV–VI).

## Placement (docs/CURRICULUM_MATEMAATIKA_1_12.md)

The GRÕK courses are official; their placement in grades is our decision. okmv gives only the course numbers.

- **10. klass:** I „Arvuhulgad. Avaldised. Võrrandid ja võrratused”, II „Trigonomeetria”, III „Vektor tasandil. Joone
  võrrand”.
- **11. klass:** IV „Tõenäosus ja statistika”, V „Funktsioonid”, VI „Jadad. Funktsiooni tuletis” (GRÕK p 2.2.2 names;
  p 1.2 calls V and VI „Funktsioonid I” and „Funktsioonid II”).
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

## Program `mk11` — `crm-v2/src/features/worksheet-generator/admin/course/math/kitsas11.js`

The same pattern as mk10: level „11. klass matemaatika kitsas” (Õppevara → Matemaatika), sheet level „Kitsas 11”,
90-minute lessons, sheet 3 „3 Kontrollülesanne”, a 25-point „Kordamine ja kontrolltöö” lesson after every course
(`roadmapKind: 'check'`). 26 lessons: course IV has 8 lessons + a test, V 7 + a test, VI 8 + a test. 18 worked examples
have a graph (a histogram is drawn with `shade` rectangles, a scatter plot and a sequence with `points`), 9 larger tasks
have a blank grid. Every graph gives a positive `stepY`.

| # | Id | Lesson | Course | Sheet 3 |
|---|---|---|---|---|
| 1 | mk11-001 | Sündmused ja klassikaline tõenäosus | IV | 10 p |
| 2 | mk11-002 | Geomeetriline tõenäosus | IV | 5 p |
| 3 | mk11-003 | Faktoriaal, permutatsioonid ja kombinatsioonid | IV | 10 p |
| 4 | mk11-004 | Sündmuste summa ja korrutis | IV | 10 p |
| 5 | mk11-005 | Juhuslik suurus, jaotustabel ja keskväärtus | IV | 10 p |
| 6 | mk11-006 | Keskmine, mood, mediaan, standardhälve ja normaaljaotus | IV | 10 p |
| 7 | mk11-007 | Histogramm, valim ja üldkogum | IV | 10 p |
| 8 | mk11-008 | Kahe suuruse seos ja korrelatsioonikordaja | IV | 10 p |
| 9 | mk11-009 | **Kordamine ja kontrolltöö: IV kursus** | IV | test 25 p |
| 10 | mk11-010 | Funktsiooni mõiste ja käigu uurimine | V | 10 p |
| 11 | mk11-011 | Lineaar-, ruut- ja pöördvõrdeline funktsioon | V | 10 p |
| 12 | mk11-012 | Logaritm ja selle omadused | V | 5 p |
| 13 | mk11-013 | Eksponent- ja logaritmfunktsioon | V | 10 p |
| 14 | mk11-014 | Eksponent- ja logaritmvõrrandid | V | 10 p |
| 15 | mk11-015 | Liitprotsendiline kasvamine ja kahanemine | V | 10 p |
| 16 | mk11-016 | Trigonomeetrilised põhivõrrandid graafiku abil | V | 10 p |
| 17 | mk11-017 | **Kordamine ja kontrolltöö: V kursus** | V | test 25 p |
| 18 | mk11-018 | Arvjada ja aritmeetiline jada | VI | 10 p |
| 19 | mk11-019 | Geomeetriline jada | VI | 10 p |
| 20 | mk11-020 | Tuletise mõiste ja geomeetriline tähendus | VI | 5 p |
| 21 | mk11-021 | Tuletiste leidmine tabeli abil | VI | 10 p |
| 22 | mk11-022 | Puutuja võrrand | VI | 10 p |
| 23 | mk11-023 | Kasvamine, kahanemine ja ekstreemum | VI | 10 p |
| 24 | mk11-024 | Polünoomi uurimine ja graafik | VI | 10 p |
| 25 | mk11-025 | Ekstreemumülesanded | VI | 10 p |
| 26 | mk11-026 | **Kordamine ja kontrolltöö: VI kursus** | VI | test 25 p |

Choices to know: „Uurimisküsimus ja andmete analüüs arvutis” (IV) is in lesson 8 as the spreadsheet function
`CORREL`/`KORREL`, not a separate computer lesson. Only the derivative table (xⁿ, eˣ, ln x, sum, constant factor) is
taught; the product and quotient rules are not part of the kitsas course.

All tasks are our own. Answers use `|` between alternative right forms and `;` between several answers
(`engine/mathExpr.js sameMathAnswer`).

## Wiring and tests

- `math/sheets.js` `MATH_PROGRAMS = [KITSAS_12, KITSAS_10, KITSAS_11]`. Each program becomes one module, `<id>-module-01`.
  `mathCurriculum.js` makes the records of every program in `MATH_PROGRAMS`.
- `math/kitsas10.test.js` and `math/kitsas11.test.js` check:
  - three sheets per lesson;
  - unique lesson and block ids across all math modules;
  - the lesson shape;
  - the points: 5 or 10, tests 20–30, and a test every 6–8 lessons;
  - every key form is accepted and wrong answers are rejected;
  - every formula renders in KaTeX and every graph formula compiles;
  - all trigonometric and decimal keys are recomputed in JS;
  - (mk11) every graph has a positive `step` and `stepY`;
  - the records sit under Matemaatika.

## Publishing

Nothing is in production yet. Publishing follows the mk12 way: a create-only script from a clean `origin/main` export,
which runs only with the owner's yes. It never overwrites an existing record.
