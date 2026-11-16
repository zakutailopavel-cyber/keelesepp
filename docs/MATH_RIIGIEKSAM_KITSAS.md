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

Next come three mock exams (`mk12-015…017`) in the full 2027 format: Part I = 4×5 p + 3×10 p, Part II = 5×10 p.

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
