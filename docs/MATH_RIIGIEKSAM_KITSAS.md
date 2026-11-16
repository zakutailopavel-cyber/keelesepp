# Matemaatika kitsas riigieksam — course contract

Owner 2026-11-16: „срочно делаем курс по математике с 10 по 12 класс и экзамены”. The order is the kitsas
riigieksam prep (grade 12) first, then the grade 10–11 kitsas courses, then lai. The sheets are in Estonian with short
Russian hints, as lessons on the site (Õppevara → Matemaatika) and in print.

## The exam (Harno, 2027 spec of 31.08.2026, same in substance as 2026)

- **Dates:** 19.05.2027 at 10:00; resit 02.06.2027. The exam is written on paper.
- **Part I:** 120 min. Tasks 1–4 are worth 5 p each and tasks 5–7 are worth 10 p each.
- **Break:** 45 min.
- **Part II:** 150 min. Tasks 8–12 are worth 10 p each.
- **Total:** 100 p. A pass is ≥ 1 p.
- **Levels:** about 20 % level I (knowledge), 30 % level II (application) and 50 % level III (reasoning). Points are
  given for every correct step, so the sheets always ask for the full solution.
- **Calculator:** non-programmable and non-graphing. Students write with a pen.
- **Valemileht (kitsas):** trigonometry identities and the derivative table only. Students must learn every other
  formula: powers, logarithm rules, sequences, the sine and cosine rules, areas, volumes and integrals. Every lesson
  says which ones on its theory panel and in its Russian hint.
- **Language:** the paper exists in Estonian and in Russian (as a special condition on request). Registration closes
  20.01.2027; the kitsas/lai choice is fixed after that.
- **Copyright:** Harno past papers may be used for practice. Commercial use needs Harno's written permission, so
  **every task in our course is our own** and the past papers serve as a format reference only.

## Course I–VIII → recurring task types → lessons

The lessons are `mk12-001…014`, written in `crm-v2/src/features/worksheet-generator/admin/course/math/kitsas12.js`.

| # | Lesson | Course | Exam form |
|---|---|---|---|
| 1 | Avaldiste lihtsustamine | I | I osa 5 p |
| 2 | Võrrandid ja võrratused | I | 10 p |
| 3 | Eksponent- ja logaritmvõrrandid | I, V | 10 p (growth) |
| 4 | Protsendid ja liitintress | I | 5 p |
| 5 | Siinus ja koosinus kraadides | II, V | 10 p (graph in degrees) |
| 6 | Kolmnurga lahendamine | II, VII | 10 p |
| 7 | Vektorid ja sirge võrrand | III | 10 p |
| 8 | Tõenäosus ja statistika | IV | 10 p |
| 9 | Aritmeetiline ja geomeetriline jada | VI | 10 p (word problem) |
| 10 | Tuletis ja puutuja | VI | 10 p |
| 11 | Funktsiooni uurimine | V, VI | 10 p (cubic + sketch) |
| 12 | Integraal ja pindala | VII | 10 p (parabola + area) |
| 13 | Ruumilised kehad | VIII | 10 p |
| 14 | Tekstülesanded võrrandi ja süsteemiga | I | 10 p |

## Mock exams (`mk12-015…017`)

Three full papers in the 2027 format, written in `math/kitsas12mocks.js` (`KITSAS_12.mocks`). All tasks are our own,
with realistic contexts; every part has a key (forms with `|`, several answers with `;`) and a worked solution.

- **Sheets** (per-lesson phase labels `MOCK_PHASES`; `buildCourseSheet` reads `lesson.phases` before `MODULE.phases`):
  - discover „1 I osa (120 min)”: an „Eksami juhend” tip and tasks 1–7 of 5, 5, 5, 5, 10, 10, 10 p;
  - practice „2 II osa (150 min)”: the tip and tasks 8–12 of 10 p each;
  - transfer „3 Eneseanalüüs”: „Minu punktid” (topic and points of every task, total /100), „Hindamine” with school
    grade bands that are **only an orientation** (the riigieksam gives 0–100 points, pass ≥ 1 p), and „Kontrolli end”.
- A task is `{ topic, context, parts, grid? }`. The title on the sheet is „N. ülesanne (P punkti)”; the topic is shown
  only on the analysis sheet. A drawing part has a blank `graph` grid right after its task.
- **Records** (`mathCurriculum.js`): `roadmapKind: 'check'`, tag and type „Proovieksam”, contactMinutes 270, Russian
  plan with timing (120 + 45 + 150 min, or the two parts on two lessons), exam rules and scoring by steps.

| # | Proovieksam 1 (mk12-015) | Proovieksam 2 (mk12-016) | Proovieksam 3 (mk12-017) |
|---|---|---|---|
| 1 (5 p) | lihtsustamine | lihtsustamine + astmed | lihtsustamine + astmed |
| 2 (5 p) | protsendid | võrratused | log- ja juurvõrrand |
| 3 (5 p) | eksponent- ja log-võrrand | protsendid + eksponentvõrrand | protsendid |
| 4 (5 p) | tõenäosus | statistika | statistika + tõenäosus |
| 5 (10 p) | võrratus + juurvõrrand | võrrandisüsteem (tekst) | vektorid ja sirge |
| 6 (10 p) | vektorid ja sirge | sin/cos graafik kraadides | võrrand (tekst) |
| 7 (10 p) | aritmeetiline jada | vektorid ja sirge | aritm. + geom. jada |
| 8 (10 p) | sin/cos graafik | geomeetriline jada | sin/cos (vaateratas) |
| 9 (10 p) | kolmnurk (cos- ja sin-teoreem) | kolmnurk (cos-teoreem) | kolmnurk (siinusteoreem) |
| 10 (10 p) | kuupfunktsioon + puutuja | kuupfunktsioon + puutuja | kuupfunktsioon + paralleelsed puutujad |
| 11 (10 p) | parabool + pindala | parabool + pindala | parabool + pindala |
| 12 (10 p) | silinder | püramiid | koonus (trigonomeetriaga) |

`math.test.js` checks the points per task (sum 100), the phase labels, the grids, recomputes the numeric keys, renders
every formula with KaTeX and checks that every key form is accepted and a wrong answer rejected.

## Sheet contract (`math/sheets.js`)

- **Sheet 1, „Teooria ja näited”:**
  - the formulas to know;
  - the Russian hint;
  - a worked example, with a graph where one helps;
  - „Riigieksamil”, which says where the topic shows up on the exam.
- **Sheet 2, „Harjutame”:** 4 tasks on the block „Matemaatika ülesanne”:
  - parts a) b) c) with their points;
  - squared paper for the working, and a „Vastus:” line;
  - the answer is checked as mathematics (2,5 = 5/2), and several right forms are separated by `|`;
  - the worked solution appears in the teacher's key.
- **Sheet 3, „Eksamiülesanne”:**
  - one task with the exam's own points, 5 or 10 (a test checks the sum);
  - a blank grid for drawing when the task asks for one;
  - „Kontrolli end”.
- **A part** is `[text, points, answer, solution, rows]`:
  - `answer: ''` means the teacher judges the part (a drawing, an explanation, a table);
  - `rows: 0` gives no squared paper.
- **Outside `COURSE_MODULES`,** like `kids/sheets.js`. The Estonian-language gates do not judge a maths sheet, and the
  sheet lab opens a sheet with `set=course:mk12-NNN:<phase>`.
- **Records** come from `features/curriculum/mathCurriculum.js` with level „12. klass matemaatika kitsas”, which puts
  them under the Õppevara → Matemaatika tab. The description is the teacher's plan in Russian.
- **Publishing:**
  - a create-only script writes the records and their three published sheets, and runs only with the owner's yes;
  - it never overwrites an existing record;
  - the sheets show the short level „Kitsas” in the level box.
