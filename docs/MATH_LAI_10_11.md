# Matemaatika lai 10.–11. klass — gümnaasiumi kursused saidil

Owner 2026-11-17: the lai (broad) school courses for grades 10–11. The lai exam prep (`ml12`) is described in
`docs/MATH_RIIGIEKSAM_LAI.md`; the kitsas school courses (`mk10`, `mk11`) in `docs/MATH_KITSAS_10_12.md`. This file covers
grade 10 (`ml10`, courses I–V) and grade 11 (`ml11`, courses VI–X, section added by its own PR).

## Placement (docs/CURRICULUM_MATEMAATIKA_1_12.md)

The GRÕK lisa 5 lai courses are official (p 2.3.2); their placement in grades is our decision. okmv gives only the course
numbers.

- **10. klass:** I „Avaldised ja arvuhulgad”, II „Võrrandid ja võrrandisüsteemid”, III „Võrratused. Trigonomeetria I”,
  IV „Trigonomeetria II”, V „Vektor tasandil. Joone võrrand”.
- **11. klass:** VI–X.
- **12. klass:** XI–XIV and the riigieksam prep (`ml12`).

The outcomes were checked against the okmv course pages (lai 1., 3., 4. and 5. kursus, read through the REST API on
2026-11-17). Two choices follow from them:

- **Course IV** ends with the sine and cosine rules and the area formulas. The general solution of trig equations,
  arcsin / arccos / arctan as functions and the graphs of the trig functions are course VIII (grade 11), not here. Course IV
  only finds an angle from its value with the calculator (sin⁻¹, cos⁻¹, tan⁻¹) on [0°; 360°] (okmv outcome 5).
- **Course I** includes percent problems (GRÕK lists them as revision) and the proof by contradiction (√2 ∉ Q), which
  okmv recommends for the number sets.

## Program `ml10` — `crm-v2/src/features/worksheet-generator/admin/course/math/lai10.js`

- **Library:** level „10. klass matemaatika lai” puts the records under Õppevara → Matemaatika. The sheet level box shows
  „Lai 10”. A lesson is 90 minutes.
- **Lessons:** 40, built step by step from the basics, deeper than kitsas: proofs (answer `''`, the teacher judges),
  parameters, derivations of the trig formulas, multi-step tasks. Each course has 7 topic lessons and ends with a
  „Kordamine ja kontrolltöö” lesson, whose third sheet is a 25-point test for 45 minutes.
- **Sheet shape:** as `mk10` (`math/sheets.js`): sheet 3 is „3 Kontrollülesanne” (`program.phases`). A normal lesson has
  theory, a Russian hint, a worked example, 4 practice tasks with keys and LaTeX solutions and one larger task (5 or 10 p).
- **Lai rule (from `ml12`):** every theory line ends with *valemilehel* (on the lai valemileht: sin² + cos² = 1, tan =
  sin/cos, parity, reduction, sum / difference and double-angle formulas, periodicity) or *pähe* (everything else: all of
  algebra, exact values, radians, arc and sector, 1 + tan²α, the sine and cosine rules, areas, vectors, lines and circles).
  Every Russian hint says what the formula sheet holds.
- **Visuals:** 19 worked examples have a graph and 8 have a geometry figure (`geofigure`: triangles, a circle sector,
  polygons in coordinates); 6 larger tasks have a full-width figure and 5 have a blank grid for a „Joonesta” part. Every
  graph has a positive `step` and `stepY`; every triangle figure is consistent (`solveTriangle`).
- **Teacher's plan:** the record description is in Russian (`mathCurriculum.js coursePlan`). With `program.track: 'lai'`
  it says „широкая математика (lai)” and names the lai formula sheet (`program.formulaSheetRu`); the kitsas text is
  unchanged.
- **Test lessons:** `roadmapKind: 'check'`, tag „Kontrolltöö”.

| # | Id | Lesson | Course | Sheet 3 |
|---|---|---|---|---|
| 1 | ml10-001 | Hulgad ja hulgatehted | I | 5 p |
| 2 | ml10-002 | Arvuhulgad ja irratsionaalsus | I | 5 p |
| 3 | ml10-003 | Reaalarvude piirkonnad ja absoluutväärtus | I | 10 p |
| 4 | ml10-004 | Astmed, standardkuju ja juured | I | 5 p |
| 5 | ml10-005 | Ratsionaalarvulise astendajaga aste ja irratsionaalavaldised | I | 10 p |
| 6 | ml10-006 | Ratsionaalavaldiste teisendamine | I | 10 p |
| 7 | ml10-007 | Protsentülesanded | I | 10 p |
| 8 | ml10-008 | **Kordamine ja kontrolltöö: I kursus** | I | test 25 p |
| 9 | ml10-009 | Võrdus, samasus ja lineaarvõrrand parameetriga | II | 10 p |
| 10 | ml10-010 | Ruutvõrrand, Viète'i teoreem ja parameeter | II | 10 p |
| 11 | ml10-011 | Murdvõrrandid | II | 10 p |
| 12 | ml10-012 | Juurvõrrandid | II | 10 p |
| 13 | ml10-013 | Absoluutväärtust sisaldavad võrrandid | II | 10 p |
| 14 | ml10-014 | Lineaarvõrrandisüsteemid (kuni kolm tundmatut) | II | 10 p |
| 15 | ml10-015 | Ruut- ja murdvõrrandite süsteemid | II | 10 p |
| 16 | ml10-016 | **Kordamine ja kontrolltöö: II kursus** | II | test 25 p |
| 17 | ml10-017 | Võrratuse omadused ja lineaarvõrratused | III | 10 p |
| 18 | ml10-018 | Ruutvõrratused | III | 10 p |
| 19 | ml10-019 | Murdvõrratused ja intervallmeetod | III | 5 p |
| 20 | ml10-020 | Võrratusesüsteemid ja absoluutväärtusega võrratused | III | 10 p |
| 21 | ml10-021 | Teravnurga trigonomeetrilised funktsioonid | III | 5 p |
| 22 | ml10-022 | Põhiseosed ja täiendusnurk | III | 10 p |
| 23 | ml10-023 | Täisnurkse kolmnurga lahendamine | III | 10 p |
| 24 | ml10-024 | **Kordamine ja kontrolltöö: III kursus** | III | test 25 p |
| 25 | ml10-025 | Radiaanmõõt, kaar ja sektor | IV | 10 p |
| 26 | ml10-026 | Mis tahes nurga trigonomeetrilised funktsioonid | IV | 10 p |
| 27 | ml10-027 | Täpsed väärtused ja taandamisvalemid | IV | 5 p |
| 28 | ml10-028 | Kahe nurga summa ja vahe valemid | IV | 10 p |
| 29 | ml10-029 | Kahekordse nurga valemid ja trigonomeetrilised samasused | IV | 10 p |
| 30 | ml10-030 | Siinusteoreem | IV | 10 p |
| 31 | ml10-031 | Koosinusteoreem, kolmnurga lahendamine ja pindala | IV | 10 p |
| 32 | ml10-032 | **Kordamine ja kontrolltöö: IV kursus** | IV | test 25 p |
| 33 | ml10-033 | Kahe punkti kaugus, lõigu keskpunkt ja vektor | V | 5 p |
| 34 | ml10-034 | Tehted vektoritega | V | 10 p |
| 35 | ml10-035 | Skalaarkorrutis, nurk, ristseis ja kollineaarsus | V | 10 p |
| 36 | ml10-036 | Sirge võrrandid | V | 5 p |
| 37 | ml10-037 | Sirgete vastastikune asend ja nurk | V | 10 p |
| 38 | ml10-038 | Ringjoone, parabooli ja hüperbooli võrrand | V | 10 p |
| 39 | ml10-039 | Joonte lõikepunktid | V | 10 p |
| 40 | ml10-040 | **Kordamine ja kontrolltöö: V kursus** | V | test 25 p |

All tasks are our own. Answers use `|` between alternative right forms and `;` between several answers
(`engine/mathExpr.js sameMathAnswer`). Some keys are words or symbols (`jah`, `ei`, `puudub|∅`, `R|ℝ`, `romb`,
`nürinurkne`, `cosα|cos(α)`); they match only the listed forms, so the teacher should glance at a „wrong” word answer.

### Checks (`math/lai10.test.js`)

- three sheets per lesson, level box „Lai 10”, sheet 3 label „3 Kontrollülesanne”;
- unique lesson and block ids across all math modules;
- the lesson shape; every theory line is marked *valemilehel* / *pähe* (courses I–II only *pähe*); every hint names the
  formula sheet;
- the points: 5 or 10, a 25-point test after every 7 lessons, tests for courses I–V;
- every key form is accepted and wrong answers are rejected; at least 3 of 4 practice tasks are auto-checked;
- every formula renders in KaTeX, and no formula lost its backslashes (a plain string instead of r`…`);
- every graph formula compiles and every graph has positive steps; „Joonesta” parts have a blank grid; triangle figures
  are consistent;
- about 250 numeric keys (decimals, roots, trig, multi-step) are recomputed in JS;
- the records sit under Matemaatika with the lai plan; the kitsas plan text is unchanged.

## Publishing

Nothing is in production. Publishing follows the mk12 way: a create-only script from a clean `origin/main` export, which
runs only with the owner's yes. It never overwrites an existing record.
