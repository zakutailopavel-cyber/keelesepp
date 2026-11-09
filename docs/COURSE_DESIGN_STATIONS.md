# Lesson design v3 „stations” (pilot: B1 module 12)

Owner 2026-11-09: „курс слабый, куча однотипных шаблонов, задания иногда глупые, всё завязано на одном тексте или
аудио — пропустишь его, и ничего не получается”. An audit of 12 lessons confirmed it: Kasuta sheets were 97 % the same
skeleton (situation → input text → role cards → speech → letter → rubric), 9 of 12 Kasuta phases hung ≥ 2/3 on one
input, ~24 blocks a lesson, and fake tasks (a pronoun swap posing as listening, the same monologue three times,
„interview three people” in a one-to-one lesson, gaps copyable from the same page, three drills on one notice board).
The causes were in the contract (COURSE_DESIGN_COMMUNICATIVE.md §11–12) and its gates: Kasuta must start with a
situation and hold two productive types and a rubric, Avasta must start with „Mäletad?”, 5–9 blocks and 40–55 min per
sheet, ≥ 10 items per closed task, one exam corner of 8–12 min, a home monologue in every Kasuta.

This file is the contract for a module written with `MODULE.design: 'v3-stations'`. Pilot: `admin/course/b1/module12.js`
(lessons a2b1-056…059; the mock exam 060 is unchanged and keeps the v2 / v4 rules). Other modules are not affected.

## 1. Rules

1. **A lesson = 4–6 independent stations of 8–15 min.** Each starts with its own small input — a situation card, a chart,
   a timeline, people cards, a 4–8 line dialogue, a text of ≤ 120 words, an audio script (≤ ≈ 2,5 min, 320 words) — or
   none. Any station can be skipped or reordered. **At most one task per lesson depends on an earlier station**, on the
   same sheet, and then prints a fallback card („Kui jätsid jaama X vahele, kasuta seda kaarti: …”). No dependency
   between sheets.
2. **Every task has a purpose line**: who does this, for whom, with what result (shown in italics before the
   instruction). It must pass „would a real person do this?”. No answers copyable from the same page, no fake
   information gaps, one-to-one by design (the teacher plays a role with a real reason; never „ask three people”), no
   monologue said again, at most one closed task per station input, a self-check at most once a module.
3. **Variety**: no two lessons of a module open with the same first two stations; the final tasks rotate (decide / plan /
   complain / advise / explain / negotiate / present — each kind once a module). Use the under-used blocks where they
   add something: chart, diagram (timeline), profiles, phrase bank, idea card (ranking), dialogue.
4. **Fewer, better blocks**: at most 16 blocks a lesson (a ceiling, not a target); closed tasks 5–8 items.
5. **One teacher page per lesson** (Russian is fine for the teacher): goal (one line), stations with minutes and sheet,
   the core 45-min path (three stations, the final one included, 35–50 min), one alternative station, the „if short on
   time” path, common errors.
6. Estonian natural and correct at B1; real Estonian contexts; no invented fact presented as real data (an invented
   number lives only inside a cast scene; a real fact has its source line). A station that would gain from a picture gets
   a brief (TEXTBOOK_ART_BIBLE.md §6); no station needs the picture to work.

The three sheets (Avasta / Harjuta / Kasuta) stay — routes, homework, Live Classroom and Õpik are unchanged — but they are
only containers: Avasta holds stations 1–2, Harjuta the next ones, Kasuta the final station (and in 058 the station it
may depend on). The old grammar line, topic and exam-format coverage of the module stay.

## 2. Authoring (`admin/course/stationBlocks.js`, pure, node-importable)

```js
import { purpose, station } from '../stationBlocks.js';
station(B.text('058_t_sit', 'Kindlustus ütles „ei”', '…'), 6, 15, { final: 'complain', needs: { from: 5, card: '…' } })
purpose(B.examWriting(…), 'Pere ootab otsust. Kirjuta vestlusesse teade, mille järgi igaüks teab, …')
```

- `station(block, n, minutes, { final, needs })` marks the first block of station n (its title becomes „Jaam n · title ·
  m min”; `needs` prints the fallback card into the card text / task instruction; `final` is one of `FINAL_KINDS`).
- `purpose(block, text)` stores `data.purpose` and shows it before the instruction. Only on tasks.
- The lesson carries `teacherPage: { goal, core: [n, n, n], alt: n, short, errors: [...], notes?: [...] }`.
  `courseSheet.js` builds the page (`stations.js teacherPage`) onto every sheet of the lesson as `meta.teacherPage`;
  `teacherPageText(page)` gives the plain text. The CRM does not show `meta.teacherPage` yet (UI follow-up: show it in
  „Õpetaja võti” / the lesson drawer).
- In a v3-stations module `courseSheet.js` gives teaching lessons `meta.design = 'v3-stations'` (no template) and the
  exam lesson `design: 'v2'` + the module's template.

## 3. Gates

New, `admin/course/stations.js` (run by `quality.js moduleProblems`, so the course test and the strict-module test hold
them; unit tests `stations.test.js`):

| code | rule |
|---|---|
| `st-stations` | 4–6 stations, numbered in order; every sheet starts with a station |
| `st-minutes` | each station 8–15 min |
| `st-input` | text inputs ≤ 120 words (the module's topic opener excepted), audio ≤ 320 words, dialogue 4–8 lines |
| `st-depends` | ≤ 1 dependent station, on an earlier station of the same sheet, fallback card printed |
| `st-purpose` | every task has a purpose line (≥ 6 words) |
| `st-items` | closed tasks 5–8 items (sentence insertion excepted) |
| `st-closed` | ≤ 1 closed task per station |
| `st-group` | no group work / „ask several people” |
| `st-repeat` | no monologue said again („kaks korda”, „uuesti”, 3-2-1 …) in speaking tasks |
| `st-blocks` | ≤ 16 blocks a lesson |
| `st-final` | exactly one final station, on the Kasuta sheet |
| `st-teacher` | teacher page: one-line goal, 3 core stations incl. the final one, 35–50 min, an alternative outside the core, short path, ≥ 2 errors |
| `st-opening` (module) | no two lessons share their first two stations (task types) |
| `st-final-kind` (module) | final task kinds differ |
| `st-selfcheck` (module) | ≤ 1 self-check |

Old checks **skipped only for station sheets / lessons** (everything else still applies, e.g. the constructor's errors,
level norms, keys, vocabulary recycling, academic value round 1 and 2, final-shape V1–V9, V11, V12 corner count and
washback, V14–V15, `v4-one-to-one`):

- `quality.js`: sheet length 5–9 / 6–18 blocks, 40–55 min, ≥ 4–5 task types, how a sheet ends, v3 / v4 phase jobs
  (incl. `v4-review`, `v4-input`, `v4-notice`, `v4-talk`, `v4-repeat`, `v4-drills`, `v4-use`, `v4-partner`), Kasuta
  `transfer-situation` / `transfer-use` / `transfer-rubric`, `phases-same`, `module-same`, `neighbour`.
- `didactics/depth.js`: items ≥ 10 → ≥ 5 (ceiling 8 in `st-items`); exercise / live minutes per sheet; two whole-sentence tasks.
- `didactics/gates.js`: the 140-word text on Avasta and Kasuta (`text-short`).
- `didactics/didacticCheck.js`: the 200–400-word reading length; the instruction length no longer counts the purpose line
  (any design).
- `didactics/finalShape.js`: V10 (every sheet serves the can-do, the Harjuta ladder, Avasta levels 1 + 3, Kasuta level
  ≥ 3), V12 corner minutes (the station's own minutes are checked), V13 „Mäletad?”, V16 home monologue in Kasuta.

## 4. The pilot (B1 module 12)

| lesson | stations (min) | final | exam corner |
|---|---|---|---|
| 056 Ilm muudab plaani (KUUL L→W) | 1 topic page + colleague's notes + talk (12) · 2 radio forecast (12) · 3 radio intern: notes → sentences, listener's mail (10) · 4 L2 radio interview (12) · 5 weather app + Viktor → note to the family chat (15) | decide | L2 |
| 057 Äike rabas (LUGU R→W) | 1 popsci „Mis on raba?” + journalist (12) · 2 Viktor's timeline + grandma's call (12) · 3 trail notice board (10) · 4 Oskar's dictated message (8) · 5 where to search for Muki + village post (15) | explain | R2 |
| 058 Torm (AVAS R→S) | 1 notice + Viktor's e-mail to fix (10) · 2 storm news + colleague (12) · 3 R3a cloze: Päästeamet's advice (10) · 4 the fence with Ülo (10) · 5 Viktor's voicemail: damage list + note to Helgi (12) · 6 call the insurer (15, needs 5, fallback card) | complain | R3a |
| 059 Roheline hoov (RÄÄK L→S) | 1 radio interview on biowaste (10) · 2 opinion model + board member Tiina (12) · 3 sorting for a new neighbour (8) · 4 Tiina's notice in the stairwell (8) · 5 clean-up day invitation (10) · 6 three proposals + meeting within 300 € (15) | negotiate | S1b |

The story facts later lessons and the mock exam refer to stay (Muki lost in the bog; 12 seconds ≈ 4 km; the birch on the
sauna roof; 30 hours without electricity; deductible 100 €; 15 degrees on Midsummer Eve; the 300 € courtyard plan).
Visual briefs: `art/visuals/b1-module-12.js` (not registered in `textbookArt.js` until the images exist). Owner summary:
`docs/review/b1-m12-pilot.md`.

## 5. Next

Owner and a teacher run 2–3 pilot lessons; then decide whether the next modules move to v3-stations (one module per PR,
same gates), and the UI agent shows `meta.teacherPage` in the CRM.
