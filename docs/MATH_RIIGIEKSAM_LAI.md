# Matemaatika lai riigieksam — course contract

Owner 2026-11-16: „срочно делаем курс по математике с 10 по 12 класс и экзамены”. The kitsas exam course is done
(`docs/MATH_RIIGIEKSAM_KITSAS.md`, `mk12-001…017`). This is its broad-track counterpart: `ml12-001…020`, one lesson per
recurring lai exam task type, in `crm-v2/src/features/worksheet-generator/admin/course/math/lai12.js`. The sheet shape,
the part format and the records are the same as kitsas (see the kitsas contract, „Sheet contract”). Mock exams for lai
come in a later PR.

## The exam (Harno, 2027 spec of 31.08.2026)

The kitsas and lai papers have the same format; only the content and the formula sheet differ.

- **Dates:** 19.05.2027 at 10:00 (both papers on the same day); resit 02.06.2027. Written on paper, in Estonian or Russian.
- **Part I:** 120 min. Tasks 1–4 are worth 5 p each and tasks 5–7 are worth 10 p each.
- **Break:** 45 min.
- **Part II:** 150 min. Tasks 8–12 are worth 10 p each.
- **Total:** 100 p. A pass is ≥ 1 % of the maximum (1 p).
- **Levels:** about 20 % level I, 30 % level II and 50 % level III. Points are given for every correct step.
- **Calculator:** not programmable, not graphing, no memory of data. Pen only (pencil answers get 0 p).
- **Choice:** the student registers for kitsas or lai by 20.01.2027.

### The 2026 lai paper by task (marking scheme `l26_hj` and correspondence table `vl2026`)

| Task | Points | Content (2026) | Courses |
|---|---|---|---|
| I-1 | 5 | probability with combinations (buttons drawn from a box) | VI, XIV |
| I-2 | 5 | text problem with a system of equations (jam and jars) | I, II, XIV |
| I-3 | 5 | simplify a quotient of rational and power expressions | I |
| I-4 | 5 | quadratic inequality with a geometric condition (rectangle area) | III, XI, XIV |
| I-5 | 10 | cubic: decreasing interval, largest value on a segment, convexity by f'' | X, VII, II, III |
| I-6 | 10 | arithmetic sequence (percent condition) + three terms of a geometric sequence | I, VII, II |
| I-7 | 10 | triangle in a real setting: cosine rule, then a right triangle and speed | III, IV, XI, II, XIV |
| II-8 | 10 | trig: show an identity with the sum formulas, solve an equation on a segment in radians | III, IV, IX |
| II-9 | 10 | tangent of a parabola, sketch and shade, area with an integral | IX, X, VII, XI |
| II-10 | 10 | rhombus in coordinates: midpoint, perpendicular line, vertices, exact perimeter | V, XI, II |
| II-11 | 10 | log functions: zero, show a point lies on a graph, intersection via a log equation | VII, VIII, II |
| II-12 | 10 | prism with a section: sine rule / right triangles, lateral area | XIII, XII, XI, III, IV |

The learning outcomes in `vl2026` also name the volume of a simple solid of revolution (II-9), full function
investigation (I-5) and angles between lines and planes in stereometry (II-12). Those are in the lessons too.

## Valemileht (lai)

**On the sheet** (students get it in the exam):

- trigonometry: $\sin^2\alpha+\cos^2\alpha=1$, $\tan\alpha=\frac{\sin\alpha}{\cos\alpha}$, parity, double angle (sin, cos,
  tan), sum and difference formulas (sin, cos, tan), all reduction formulas in degrees and in radians, periodicity;
- the derivative table: $c'$, $x'$, $(1/x)'$, $(\sqrt x)'$, $(x^n)'$, $(a^x)'$, $(e^x)'$, $(\log_ax)'$, $(\ln x)'$,
  $(\sin x)'$, $(\cos x)'$, $(\tan x)'$;
- the integral table: $\int dx$, $\int x^n dx$, $\int\frac1x dx$, $\int a^x dx$, $\int e^x dx$, $\int\sin x\,dx$,
  $\int\cos x\,dx$, $\int\frac{dx}{\cos^2x}$.

**Not on the sheet, to memorise:** powers, roots and the factoring formulas; logarithm rules and change of base; the
general solutions of trig equations and the exact values; the product, quotient and chain rules; the tangent
equation; the Newton–Leibniz formula, area between curves and the volume of revolution; sequence formulas and the sum of
an infinite geometric series; combinatorics, probability, expectation, standard deviation, binomial and normal
distribution, confidence interval; vectors, the line, circle and plane equations; the sine and cosine rules and the
area formulas; all solid formulas.

Every theory line on sheet 1 ends with *valemilehel* or *pähe*, and every Russian hint says what is on the sheet
(`lai12.test.js` checks both).

## Course I–XIV → task type → lesson

`slots` in `lai12.js` are the exam task numbers a lesson trains. The exam task of a lesson has 5 p when all its slots
are 1–4 and 10 p otherwise (the test checks it, and that slots 1–12 are all covered).

| # | Lesson (`ml12-0NN`) | Course | Exam task | Exam form |
|---|---|---|---|---|
| 1 | Astmed, juured ja avaldised | I | 3 | 5 p |
| 2 | Tekstülesanded võrrandisüsteemiga | II, XIV | 2 | 5 p |
| 3 | Võrratused ja võrratusesüsteemid | III | 4 | 5 p |
| 4 | Kombinatoorika ja tõenäosus | VI | 1 | 5 p |
| 5 | Juhuslik suurus, binoom- ja normaaljaotus | VI | 1 | 5 p |
| 6 | Statistika ja korrelatsioon | VI | 1 | 5 p |
| 7 | Aritmeetiline ja geomeetriline jada | VII | 6 | 10 p |
| 8 | Piirväärtus ja hääbuv geomeetriline jada | VII, IX | 6 | 10 p |
| 9 | Trigonomeetrilised võrrandid radiaanides | III, IV, IX | 8 | 10 p |
| 10 | Trigonomeetrilised funktsioonid ja tuletis | IV, IX | 8, 9 | 10 p |
| 11 | Eksponent- ja logaritmfunktsioon | VIII | 11 | 10 p |
| 12 | Tuletis ja puutuja | IX, X | 9 | 10 p |
| 13 | Funktsiooni uurimine | X | 5 | 10 p |
| 14 | Ekstreemumülesanded | X, XIV | 5 | 10 p |
| 15 | Integraal, pindala ja pöördkeha ruumala | XI | 9 | 10 p |
| 16 | Matemaatilised mudelid ja tekstülesanded | XIV, VIII | 11 | 10 p |
| 17 | Vektorid ja joone võrrandid tasandil | V | 10 | 10 p |
| 18 | Sirge ja tasand ruumis | XII | 12 | 10 p |
| 19 | Kolmnurk ja planimeetria | III, IV, XI | 7 | 10 p |
| 20 | Stereomeetria: kehad ja lõiked | XIII | 12 | 10 p |

Points of the exam tasks: 6 lessons × 5 p, 14 lessons × 10 p.

## Lesson shape (same as kitsas, plus figures)

- `title`, `ru`, `course`, `slots`, `exam` (the „Riigieksamil” tip), `can`, `theory`, `ru_hint`, `example`, 4
  `practice` tasks, `examTask`, `self`.
- `example.graph` / `examTask.grid` are `graph` blocks as in kitsas. New: `example.figure` and `examTask.figure` are
  `geofigure` blocks („Geomeetriline joonis”, `engine/blocks/geofigure.jsx`): the triangle in lesson 19, the pyramid in
  lesson 20, the cuboid in lesson 18. `math/sheets.js` places the example's figure at half width next to the example,
  and the exam figure at full width **before** the exam task, as on the paper.
- `math/sheets.js` `graph()` now defaults `stepY` to `step`. Before, a graph without `stepY` (15 kitsas graphs and every
  blank grid) got `stepY: 0`, which the engine read as 0.01: a grey band of lines and y tick labels.
- **Program fields** read by `mathCurriculum.js`: `track: 'lai'` (the plan says „(lai)”) and `formulaSheetRu` (the
  materials line names the lai formula sheet). Kitsas programs without these fields keep their text.
- **Records:** level „12. klass matemaatika lai” → Õppevara → Matemaatika; sheet level box „Lai”; `curriculumId`
  `math-ml12-v1`; `roadmapKind: 'theme'`.

## Copyright

Harno past papers may be used for practice; commercial use needs Harno's written permission. **Every task in
`lai12.js` is our own.** The 2026 lai marking scheme and correspondence table were used only to fix the format, the
points and the task types.

## Sources

- Harno, „Kitsa ja laia matemaatikakursuse riigieksami eristuskiri” (2027, 31.08.2026), incl. Lisa 1 „Laia matemaatika
  valemileht”.
- Harno, „Matemaatika riigieksami põhieksami ülesanded ja hindamisjuhend 2026, lai kursus” (format and task types only).
- Harno, „Laia matemaatikakursuse riigieksami põhieksami vastavustabel 2026” (task ↔ course ↔ learning outcomes).
- GRÕK lisa 5 (lai courses I–XIV), summarised in `docs/CURRICULUM_MATEMAATIKA_1_12.md`.

## Checks

`crm-v2/src/features/worksheet-generator/admin/course/math/lai12.test.js`: three sheets per lesson with level „Lai”;
unique block ids across all math modules; exam points by slot and full slot coverage; theory marks and hints; every
part has a solution, every key form is accepted and wrong answers are rejected; drawing parts have a blank grid; figures
are geometry blocks; graph formulas compile; every formula renders in KaTeX; numeric keys are recomputed in JS; the
records sit under Matemaatika with the lai plan.

## Publishing

Nothing is published by this PR. A create-only script (owner's yes) writes the 20 records and their 60 sheets and never
overwrites an existing record.
