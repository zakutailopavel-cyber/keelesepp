# E-exam engine: the worksheet player in the 9th-grade e-exam format

Status: 2026-11-18, branch `agent/e-exam-engine` (draft PR „E-eksami vorm: taimer, kaks kuulamist, lohistamine tekstis,
näidis 0, sektordiagramm”). The format contract and the content are in `docs/EXAM_9KL_E_EKSAM.md` (content agent, PR
#1267). This file is the engine's side: which data fields switch each interaction on, and the status of §4's gap table.

Rule: **every option defaults off.** A sheet without these fields renders and scores exactly as before.

## 1. Exam sheet and gates

- `doc.meta.exam = 'E9'` makes a sheet an exam sheet (`engine/examMode.js isExamSheet`). Course files: lesson flag
  `exam: 'E9'` → `courseSheet.js` copies it to `meta.exam` (keep `assessment: true` as well).
- On an exam sheet a solved example (`block.opts.example`) is **item 0** and the items count 1… after it (Sheet.jsx gives
  the block `ctx.numFrom = 0`); without `meta.exam` the numbering is unchanged.
- Gates (owner 2026-11-18: the exam must match the real format exactly):
  - `didactics/didacticCheck.js EXAM_EXEMPT`: on an exam sheet these level norms are not checked — `items` (items per
    task), `example`, `bank`, `closed-share`, `productive`, `progression`, `instruction`, `reading-len`, `reading-inf`,
    `sentence-avg`, `sentence-max`, `vocabulary`. The solvability checks (≥ 3 options, no give-away answer, true/false
    absolutes …) still run.
  - `admin/course/quality.js sheetProblems`: an exam sheet skips the lesson-shape rules (block count, 40–55 min,
    variety, how it ends, phase jobs); constructor errors, didactic warnings and duplicate ids still count.
  - Tested in `engine/examMode.test.jsx` („gates”).

- **On screen an exam sheet is one continuous page** (`examMode.js onScreenContinuous`: `meta.exam` and the player /
  teacher check, `mode` `interactive` or `review`): no A4 page breaks, page footers or running heads between the tasks,
  one footer at the end (`.ws-page.is-continuous`). The phone's column (`flow`) is unchanged. **Print keeps A4 pages**:
  on `beforeprint` Sheet.jsx draws the pages again, `afterprint` goes back. The constructor (`edit`) and the print view
  stay paged.
- **Keep with next on paper** (`examMode.js keepsWithNext`, used by `pageSplit.js packPages`): a word strip (every sheet,
  as before) and, on an exam sheet, a `chart` start on the same page as the task after it when both fit. A pie is drawn at
  most 62 mm high so the W2 chart and its task fit on one page (mock 1: 4 printed pages instead of 5).

## 2. Data fields per interaction (API for the content agent)

| Need | Block | Fields |
|---|---|---|
| Exam key | `exampart` | `exam: 'E9'` (harnoScales `E9_EXAM_DATA`: W 70 min / 20 p, L 50 / 20 / 35 items, R 95 / 40 / 65 items, S 24–26 / 20; B1 ≥ 60 %, no part 0). `B.examPart(id, 'L', { exam: 'E9' })` fills minutes, points, tasks, items. `withHarnoExam` never overwrites an `exam` the block has. |
| Timer + lock | `exampart` | `lock: true`. The learner presses „Alusta aega”, or her first answer / first play starts it. Start stored as answer `<blockId>:$startedAt`; sticky clock over the sheet (in the phone's top bar); at 0 the sheet becomes read-only and is handed in through the normal `submitWorksheet` (no confirm); if that fails, „Esita tööleht” stays. Staff (teacher, admin) see the clock with „eelvaade”, no lock. |
| Part points | `exampart` | `exam: 'E9'` (or `convert: true` on any exampart with `points`): result banner „II osa · Kuulamine: 13,7 / 20 punkti (24/35 õiget)” + the B1 rule. Denominator = all scored items of the sheet except the example (unanswered = 0). |
| Heard twice | `examlisten`, `listening` | `plays: 2, lockPlays: true`, optional `playGap` (seconds before the next play starts by itself, default 10; 0 = learner presses play). One play button, no pause / seek, „Kuulamisi jäänud: 1 / 2”. Count stored as `<blockId>:$plays` (per clip `$plays.<i>`). Staff and a checked sheet play freely. |
| 1.3 clips | `examlisten` mode `choice` | `questions[i].situation` („Kuuled telefonisõnumit.”) and optional `questions[i].audio` ({ src }) → table number · situation (+ own player) · question. **Per-clip recordings:** give each question its spoken text `questions[i].script` (see §2.1); the audio tool then builds one file per clip and the course builder puts it into `questions[i].audio`. |
| 2.5 endings | `adsmatch` | On an exam sheet the rows are numbered 0 (example), 1 … n like the other tasks (`.ws-ads-num`; a lesson sheet stays as before). `layout: 'chips'`: the ads are the endings in a bank „Lause lõpud”, dragged / tapped into the gap after each beginning (bankDrop.jsx DropTask; a trailing „…” of the beginning is dropped). The answer stays the ending's letter, so key, scoring and mistakes are unchanged. |
| Rubric target | `examrubric` | `scale: 'E9W' \| 'E9S'` shows the e-exam's 60 % (`rubricShare`), like the part header; every other scale keeps the course's 80 %. |
| 1.1 speakers | `examlisten` mode `speakers` | `topic`, `claims: [text …]` (lettered A, B …), `speakers: [{ name, img?, answer: 'D' }]`. Row per speaker (photo or initials), letter dropdown, a letter used by another speaker is disabled; statement table beside (above on a phone). `opts.example` → speaker 0 solved. `explain`: one line per speaker (incl. 0). |
| 2.1 chat | `insertion` | `layout: 'chat'`; `passage` one line per turn „**Nimi:** text”, a taken-out reply is the whole line „**Nimi:** [[reply]]”; `extra` = extra replies. Bank beside (sticky under the chat on a phone). |
| 2.2 / 2.4 drag | `insertion` | `layout: 'chips'`; running text with `[[word or phrase]]`; `extra` = extra chips (one per line). Bank in alphabetical order (`bankOrder: 'mixed'` = mixed by block id). Mouse: drag; touch: tap chip → tap gap; keyboard: Enter on chip → Enter on gap, Delete empties a gap. Each chip once. Scoring unchanged (gap i ↔ i-th `[[ ]]`). |
| Item 0 | `cloze`, `formtext`, `insertion` (+ already `gaps`, `choice`, `truefalse`, `adsmatch`, `examlisten`) | `opts.example: true` → the first gap / row filled, greyed, read-only, never scored. Put item 0 back into the data and its line into `EXPLAIN`. |
| 2.7 base form | `formtext` | `hint: 'inside'` → the base form is the field's grey placeholder (on paper inside the box), not „(base)” after it. |
| W1 letter | `examwriting` | `letterSubject`, `letter: [{ text, note?, side?: 'left' \| 'right' }]` → e-mail card, notes in the margin with arrows (under the sentence on a phone). `about: 'u 100 sõna'` → counter „n sõna · u 100 sõna” without range colours. |
| W2 genre / pie | `examwriting`, `chart` | `genre: 'kokkuvote' \| 'arutlus'`; `chart.kind: 'pie'`, `rows: 'Silt \| 34'` one value per row (2–8 slices), `unit: '%'`. Colours are tokens `--ws-chart-1…8`; labels outside with % so it reads in black and white. |
| Rubrics | `examrubric` | `scale: 'E9W'` (content 0–5 + language 0–5), `'E9S'` (two raters × 0–10). |

### 2.1 Per-clip audio (1.3) — content contract

The audio tool (`tools/listening-audio/plan.mjs`, `build.mjs`) makes **one MP3 per clip** for an `examlisten` block in
mode `choice` whose questions carry `script`:

- `questions[i].script`: exactly what is heard in clip i, lines „Name: text” as in every transcript (a clip's intro line
  such as „Esimene lõik. Kuulete telefonisõnumit.” may stay in: it is read by the narrator voice). A question without
  `script` gets no file.
- Output `public/audio/<lessonId>/<blockId>_<i>.mp3`, manifest key `"<lessonId>:<blockId>#<i>"` (hash = sha1 of the
  script). No file for the whole block; `withListeningAudio` (`admin/course/listeningAudio.js`) sets
  `questions[i].audio = { src, name, seconds }`, and the clip table shows a play button per clip (heard twice per clip
  with `lockPlays`, count `$plays.<i>`).
- Keep `transcript` as the whole text (all clips, for the teacher's „Tekst”); it is not recorded when the clips are.
- Run `node tools/listening-audio/build.mjs --only <lessonId>:<blockId>` (only changed clips are built; TartuNLP, free,
  pre-generated once). `listeningAudio.test.js` checks every clip file and hash.
- Mock 1 `ee1_l_13`: **TODO (content agent)** — split `T13` into the 8 clips: question i gets the clip's lines from „Näidis.
  Kuulete …” / „Esimene lõik. …” up to the next clip header (e.g. question 1: `'Esimene lõik. Kuulete telefonisõnumit.\n
  Registraator: Tere! Siin Kase hambaravi. …'`), keep `transcript: T13.join('\n')`, then run the build for
  `a2b1-ee1-l:ee1_l_13` and delete the old `a2b1-ee1-l:ee1_l_13` entry and file (the test „no recordings of blocks that no
  longer exist” asks for it).

Mistakes after hand-in (`engine/mistakes.js`, MistakesPanel) work for all of these: speakers show „B — statement”, drag
tasks the chosen chip text, with the right answer and the `explain` line.

## 3. Gap table status (EXAM_9KL_E_EKSAM.md §4)

| Need | Status |
|---|---|
| Part header + timer, lock, save at 0; E9 key; not overwritten by `withHarnoExam` | DONE |
| Item 0 solved in cloze, formtext, insertion; exam-sheet exemption from the „example” norm | DONE |
| Audio heard twice (`lockPlays`) | DONE |
| One audio per clip (1.3) | DONE in the engine and the audio tool (`questions[i].script`, §2.1); mock 1's `ee1_l_13` still has one transcript: TODO content |
| Speakers ↔ statements A–I | DONE |
| Subheading ↔ part of recording | TODO (same form with `parts`) |
| Drag replies into a dialogue (2.1) | DONE (`layout: 'chat'`) |
| Drag words / text parts into a text (2.2, 2.4) | DONE (`layout: 'chips'`) |
| Sentence endings by drag (2.5) | DONE (`adsmatch` `layout: 'chips'`, numbered rows on an exam sheet; mock 1 uses it) |
| Continuous screen page for exam sheets; chart kept with its task on paper | DONE (§1) |
| Base form inside the gap (2.7) | DONE (`hint: 'inside'`) |
| Letter with arrow notes (W1) | DONE |
| Counter „n sõna · u 100 sõna” | DONE (`about`) |
| Genres kokkuvõte / arutlus | DONE |
| Pie chart | DONE |
| Rubric scales E9W, E9S | DONE |
| Part points 35 → 20, 65 → 40 | DONE (per sheet); the mock's total over four sheets: TODO |
| Paging one task per screen, bookmarks | not done (nice to have) |

## 4. Where to see it

Sheet lab: `/sheet-lab.html?set=eexam-w`, `eexam-l`, `eexam-r` (`src/test/sheetLab/examSample.js`, a short excerpt of
mock 1; the lab user is a student, so the lock is on). The recordings are mock 1's files in `public/audio/a2b1-ee1-l/` (on the content
branch). e2e: `cd e2e && npx playwright test -c playwright.layout.config.cjs -g "e-exam"` (also: mock 1 W is one page on a desktop with
the chart right above task 2 and A4 pages when printing; 2.5 numbers and a tapped ending, phone).
