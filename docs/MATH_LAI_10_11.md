# Matemaatika lai 10.–11. klass — gümnaasiumi kursused saidil

Owner 2026-11-17: the lai (broad) math courses for grades 10–11. Grade 12 exam prep (`ml12`) is in
`docs/MATH_RIIGIEKSAM_LAI.md`; the kitsas courses are in `docs/MATH_KITSAS_10_12.md`. Placement of the GRÕK courses in
grades is our decision (`docs/CURRICULUM_MATEMAATIKA_1_12.md`: grade 10 lai = I–V, grade 11 lai = VI–X).

## Program `ml11` — `crm-v2/src/features/worksheet-generator/admin/course/math/lai11.js`

- **Library:** level „11. klass matemaatika lai” (Õppevara → Matemaatika), sheet level „Lai 11”, 90-minute lessons,
  `plan: 'course'`, `track: 'lai'`, `formulaSheetRu` (the lai sheet). Sheet 3 is „3 Kontrollülesanne”.
- **Courses** (names from GRÕK lisa 5 p 2.3.2 as in the curriculum doc): VI „Tõenäosus, statistika”, VII „Funktsioonid.
  Arvjadad”, VIII „Eksponent- ja logaritmfunktsioon”, IX „Trigonomeetrilised funktsioonid. Funktsiooni piirväärtus ja
  tuletis”, X „Tuletise rakendused”. GRÕK p 1.2 uses other names („Funktsioonid I/II” …); the content is the same.
- **Lessons:** 39 = 34 topic lessons + 5 „Kordamine ja kontrolltöö” lessons (one after each course, 25-point test,
  `roadmapKind: 'check'`, tag „Kontrolltöö”). Each lesson: theory (every line ends with *valemilehel* or *pähe*, the lai
  valemileht from `MATH_RIIGIEKSAM_LAI.md`), a Russian hint that says what is on the lai sheet, a worked example
  (27 with a graph: histograms with `shade`, scatter plots and sequences with `points`, every graph has positive `step`
  and `stepY`), 4 practice tasks with keys and solutions, one larger task (5 or 10 p; 8 with a blank grid).
- **Deeper than kitsas:** variations, conditional („sõltuvad”) events, binomial and normal distribution (68–95–99,7, z,
  Φ given in the task), 95% confidence interval for a mean and a share, parity and composite functions, graph
  transformations, sequence limits and e, inverse function, exp/log equations and inequalities, trig functions as
  functions (period, amplitude, tan), arcsin/arccos/arctan, general solutions of trig equations and simple trig
  inequalities on [0; 2π], function limits and continuity, derivative by definition, product/quotient/chain rules,
  second derivative, convexity (Estonian convention: *kumer* f″ < 0, *nõgus* f″ > 0), full investigation incl.
  asymptotes, largest/smallest value on a segment, optimisation.
- All tasks are our own. Keys use `|` between right forms and `;` between answers (`engine/mathExpr.js sameMathAnswer`).

| # | Id | Lesson | Course | Sheet 3 |
|---|---|---|---|---|
| 1 | ml11-001 | Sündmused ja tõenäosuse omadused | VI | 10 p |
| 2 | ml11-002 | Permutatsioonid, variatsioonid ja kombinatsioonid | VI | 10 p |
| 3 | ml11-003 | Sündmuste summa ja korrutis | VI | 10 p |
| 4 | ml11-004 | Juhuslik suurus ja selle arvkarakteristikud | VI | 10 p |
| 5 | ml11-005 | Binoomjaotus | VI | 10 p |
| 6 | ml11-006 | Normaaljaotus | VI | 10 p |
| 7 | ml11-007 | Valim, üldkogum ja usalduspiirkond | VI | 10 p |
| 8 | ml11-008 | Hajuvusdiagramm ja korrelatsioonikordaja | VI | 10 p |
| 9 | ml11-009 | **Kordamine ja kontrolltöö: VI kursus** | VI | test 25 p |
| 10 | ml11-010 | Funktsioon, määramispiirkond ja nullkohad | VII | 10 p |
| 11 | ml11-011 | Paaris- ja paaritud funktsioonid. Liitfunktsioon | VII | 10 p |
| 12 | ml11-012 | Graafikute teisendused | VII | 10 p |
| 13 | ml11-013 | Aritmeetiline jada | VII | 10 p |
| 14 | ml11-014 | Geomeetriline jada ja hääbuv geomeetriline jada | VII | 10 p |
| 15 | ml11-015 | Jada piirväärtus. Arvud π ja e | VII | 10 p |
| 16 | ml11-016 | **Kordamine ja kontrolltöö: VII kursus** | VII | test 25 p |
| 17 | ml11-017 | Liitprotsendiline kasvamine ja kahanemine | VIII | 10 p |
| 18 | ml11-018 | Eksponentfunktsioon | VIII | 10 p |
| 19 | ml11-019 | Logaritm ja selle omadused | VIII | 5 p |
| 20 | ml11-020 | Logaritmfunktsioon ja pöördfunktsioon | VIII | 10 p |
| 21 | ml11-021 | Eksponentvõrrandid ja -võrratused | VIII | 10 p |
| 22 | ml11-022 | Logaritmvõrrandid ja -võrratused | VIII | 10 p |
| 23 | ml11-023 | **Kordamine ja kontrolltöö: VIII kursus** | VIII | test 25 p |
| 24 | ml11-024 | Siinus- ja koosinusfunktsioon, perioodilisus | IX | 10 p |
| 25 | ml11-025 | Tangensfunktsioon ja arkusfunktsioonid | IX | 5 p |
| 26 | ml11-026 | Lihtsamad trigonomeetrilised võrrandid | IX | 10 p |
| 27 | ml11-027 | Funktsiooni piirväärtus ja pidevus | IX | 10 p |
| 28 | ml11-028 | Funktsiooni muut ja tuletise mõiste | IX | 5 p |
| 29 | ml11-029 | Tuletise leidmise eeskirjad | IX | 10 p |
| 30 | ml11-030 | Liitfunktsiooni tuletis ja teine tuletis | IX | 10 p |
| 31 | ml11-031 | **Kordamine ja kontrolltöö: IX kursus** | IX | test 25 p |
| 32 | ml11-032 | Puutuja võrrand | X | 10 p |
| 33 | ml11-033 | Kasvamine, kahanemine ja ekstreemumid | X | 10 p |
| 34 | ml11-034 | Kumerus, nõgusus ja käänupunkt | X | 10 p |
| 35 | ml11-035 | Polünoomi täielik uurimine ja graafik | X | 10 p |
| 36 | ml11-036 | Murd- ja eksponentfunktsiooni uurimine | X | 10 p |
| 37 | ml11-037 | Suurim ja vähim väärtus lõigul | X | 10 p |
| 38 | ml11-038 | Optimeerimisülesanded | X | 10 p |
| 39 | ml11-039 | **Kordamine ja kontrolltöö: X kursus** | X | test 25 p |

### Wiring and tests

- `math/sheets.js`: `LAI_11` appended to `MATH_PROGRAMS` (module `ml11-module-01`).
- `curriculum/mathCurriculum.js` `coursePlan`: a program with `track: 'lai'` says „широкая математика (lai)” and adds
  its formula sheet to the materials line; the kitsas text is unchanged.
- `math/lai11.test.js` (12 tests): ids, three sheets, unique block ids, lesson shape, *valemilehel*/*pähe* marks (only
  trig and derivative lines are *valemilehel*), Russian hint names the lai sheet, points (5/10, five 25-point tests,
  every 6–8 lessons), every key form accepted and wrong answers rejected, KaTeX, graph formulas and positive steps,
  decimal keys recomputed, records under Matemaatika with a lai plan.

### Publishing

Nothing is in production. Publishing is a create-only script from a clean `origin/main`, only with the owner's yes.
