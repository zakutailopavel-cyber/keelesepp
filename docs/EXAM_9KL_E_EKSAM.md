# 9th-grade e-exam „eesti keel teise keelena” — format contract, engine gaps, our mocks

Status: draft contract, 2026-11-18 (branch `agent/exam-9kl-e-eksam`). Owner 2026-11-18, with screenshots of Harno's
sample test: „вот это новый экзамен который будет”; then „и такие же задания сделай в курсе у нас, чтобы давать
пробник B1 ученикам”.

This file is the contract for every mock and practice sheet in the format of the new computer-based basic-school exam
„B1/B2-taseme eksamiga ühitatud eesti keel teise keelena” (EIS e-exam from spring 2027). It describes the **format
only**. No Harno text, item or picture is copied into the repo (copyright); every KeeleSepp item is our own.

Related: `A2B1_COURSE_BLUEPRINT.md` §8 (the 9th-grade track, decision 3: our own three mocks, mock 1 by December 2026),
`HARNO_LEVEL_REQUIREMENTS.md` (adult Harno exams), `COURSE_FINAL_SHAPE_B1.md` (adult B1 task ids).

## 1. Sources and what was verified

| Label | Source | Read | What it gave |
|---|---|---|---|
| [S] | Harno sample test „Eesti keele teise keelena 9. klassi e-eksami näidistest” in EIS (owner's 20 screenshots, `eis.harno.ee/testing/16186/…`) | 2026-11-18 | screens, instructions, task order, item counts, example items, interactions |
| [E9] | „Põhikooli eesti keele teise keelena lõpueksami eristuskiri” 2026/2027, Lisa 2 (kinnitatud 31.08.2026), and the file „…eristuskiri 2027.pdf” (same text, page 7 partly unreadable), both on https://projektid.edu.ee/pages/viewpage.action?pageId=390178894 | 2026-11-18, PDF text extracted | parts, minutes, points, task types, marking, B1/B2 rule |
| [P9] | https://harno.ee/eksamid-testid-ja-uuringud/eksamid-testid-ja-lopudokumendid/pohikooli-lopueksamid | 2026-11-18 (search excerpt) | dates: written 20.04.2027, oral 20.–23.04.2027, make-up 20.05.2027; B1 certificate at ≥ 60 % and no part 0 |
| [INF] | our inference | — | marked where used |

**Verified from [E9]:**
- The exam measures **B1 and B2 combined**; half of the tasks are B1, half B2. The certificate (B1 or B2) follows the
  average percentage; **no part may be 0 points**.
- Written part in EIS: **I Kirjutamine** 70 min, 20 p, 2 tasks; **paus 30 min** (pupils leave the room); **II
  Kuulamine** 50 min, 20 p, **5 tasks / 35 items**; **III Lugemine ja keele struktuur** 95 min, **40 p**, **7 tasks / 65
  items**; written part 255 min, 80 p. **Suuline osa** 24–26 min, 20 p, **not electronic**: an interviewer runs it
  (the [E9] table lists 3 tasks).
- Every part („osaoskus”) gives 20 points: listening, reading and language structure are marked by the key; writing by
  two raters on two criteria, **task fulfilment and content 0–5** and **language 0–5** (third rating when the two
  differ by ≥ 25 %); speaking by an outside rater and a teacher on a **0–10 scale**, holistic (task fulfilment,
  exchange of information, vocabulary and grammar, intelligibility). All answers of the oral part are recorded.
- **Listening texts are heard twice.** Text types: radio news, everyday conversations, announcements / short messages,
  instructions, interviews, overviews.
- Task types by skill (the table on pages 6–7): writing — a letter to a reader (~100 words) and an argument or summary
  on a given topic (~160 words), which may require describing detailed information from diagrams or pictures;
  listening — 3-option MC, true / false, 3-option question, short answer (gap from what is heard), matching a
  subheading / subtopic to a part of the recording; reading — 3-option MC, answer-bank gap task, gap task with a phrase
  or text part, completing a conversation; language structure — gap task with 3 options, sentence ↔ fitting
  continuation, short-answer gap with the right word form; speaking — opinion task, information exchange (asker and
  answerer roles, questions built from given information), discussion on a topic and decision.
- Written part starts at 10.00; oral part from 9.00 by the school's schedule; no dictionaries or devices.

**Not verified / open:**
- The B1 and B2 **thresholds** in points (the specification says „lävend”, no numbers). [P9] says B1 = ≥ 60 % of the
  maximum and no part 0.
- Which tasks count as „lugemine” and which as „keele struktuur” (20 p each). [INF] from the table order and the sample:
  2.1–2.4 reading (35 items), 2.5–2.7 structure (30 items).
- The weight of one item (35 items → 20 p, 65 items → 40 p): EIS shows no points per item. [INF] equal weight, scaled.
- The sample test has **speaker ↔ statement matching** (1.1); [E9] names **subheading ↔ part of recording**. Both may
  appear; our mocks use the sample's type now and the subheading type in mock 2.
- The oral part: [P9] says „e-eksam suuline”, [E9] says it is not electronic and run by an interviewer. The task list
  of the interviewer's guide (blueprint §8.1 [O9]: intro + opinion, ad call, discussion, debate) is used for our oral card.
- In the sample test the audio can be played many times, paused and the pupil may move between tasks; the screen says
  the **real exam has a time limit and plays each recording twice without a pause**.

## 2. Parts and minutes

| Part | Minutes | Points | Tasks / items | Interaction on screen [S] |
|---|---|---|---|---|
| Sissejuhatus | 10 | — | intro, rules, preparation and audio check | info pages, „Edasi” |
| I Kirjutamine | 70 | 20 | 2 | two text boxes with a live word counter; timer „Testiosa max aeg: 1 tund 10 minutit” |
| Paus | 30 | — | — | pupils leave the room |
| II Kuulamine | 50 | 20 | 5 / 35 | audio play button per task; dropdown, radio, true/false grid, typed gaps |
| III Lugemine ja keele struktuur | 95 | 40 | 7 / 65 | drag from a bank, dropdowns in the text, radio, typed gaps |
| Suuline osa | 24–26 (pair) | 20 | intro + 3 tasks | with an interviewer, recorded; not on the computer |

On every screen [S]: a left task list (1.1 … 1.5, 2.1 … 2.7, „Algus”, „Lõpp”, part status „pooleli / tehtud 3/7”),
„Tagasi”, „Märgi ülesanne” (bookmark), „Edasi”. When the time runs out, EIS closes the part and saves the answers given.

## 3. Task types (format only)

Every task starts with an instruction of 1–3 sentences in bold, an italic line on how to answer, and **item 0 solved as
an example**. Items are numbered 1… after it.

### I Kirjutamine

| Id | Task | Instruction pattern | Length | Interaction | Points |
|---|---|---|---|---|---|
| W1 | Reply to a friend's e-mail | „Loe ülesannet ja kirjuta selle järgi kõrvale kasti oma vastus.” A short situation (you went to an event, your friend could not come), then the friend's e-mail as a picture with **4–5 arrow notes** in the margin: „Vastan”, „Pole sellega nõus!”, „Vastan, kes / mis …”, „Vastan, mis ma sellest mõttest arvan”. Every note must be answered. | „u 100 sõna” | text box with B / I / U and a live counter „0 sõna” | 10 (content 0–5, language 0–5) |
| W2 | Summary („kokkuvõte”) or argument from a chart | „Loe ülesannet ja kirjuta kõrvale lahtrisse kokkuvõte.” Source line (who asked, when, how many answered), a **pie chart** with 4 shares in %, and **4 bullet tasks**: summarise the answers; analyse why…; write whether you prefer … and why; discuss how … could … | „u 160 sõna” | text box with live counter | 10 (content 0–5, language 0–5) |

### II Kuulamine (each text heard twice)

| Id | Task | Items | Extras | Example (0) | Interaction |
|---|---|---|---|---|---|
| 1.1 | Opinions of different people on one topic: match each speaker (a **photo** + „1. kõneleja”) to a statement | 6 | 9 statements A–I: 1 used by the example, **2 left over** | speaker 0 with the letter filled in | a **dropdown of letters** beside each photo; the statement table beside |
| 1.2 | Monologue (a person about their unusual hobby or job), sentence-completion questions | 7 | 3 options each | question 0 marked | radio |
| 1.3 | 7 short clips (interview, news, lecture, ad …), each with its situation line („Kuuled intervjuud …”) and one question | 7 | 3 options each | clip 0 marked | radio; a table: situation · question · options |
| 1.4 | Interview, true / false statements; a topic picture | 7 | — | statement 0 marked | ÕIGE / VALE radio grid |
| 1.5 | Monologue, gap sentences („kirjuta lünka sobiv sõna, sõnad või arv”) | 8 | — | gap 0 filled („20”) | typed gap inside the sentence |

### III Lugemine ja keele struktuur

| Id | Task | Items | Extras | Example (0) | Interaction |
|---|---|---|---|---|---|
| 2.1 | Phone conversation: one side given, the other side's replies taken out | 5 | bank of 8 (incl. the example), **2 left over** | first reply in place | **drag** a reply from the bank into the empty speech bubble; drag back to change |
| 2.2 | Text with a word bank (topic text with a picture) | 13 | bank of 18 words (incl. the example), **4 left over** | first gap filled | **drag** a word into the gap in the running text („lase hiireklahv lahti alles siis, kui lünk on muutunud halliks”) |
| 2.3 | Article + questions beside it | 7 | 3 options each | question 0 marked | radio |
| 2.4 | Text with phrase / clause parts taken out | 10 | bank of 13 (incl. example), **2 left over** | first gap filled | **drag** a text part into the running text |
| 2.5 | Sentence beginnings in a text (a notebook picture), endings in a bank | 10 | bank of 12 (incl. example), **1 left over** | sentence 0 ended | **drag** an ending into the gap |
| 2.6 | Text with dropdown gaps („Vali lünka sobiv sõna”) | 10 | 3 options per gap | gap 0 chosen | **dropdown** inside the running text (‐‐ Vali ‐‐) |
| 2.7 | Text where the base form is given and the right form is written | 10 | — | gap 0 filled, its base form in a tooltip | typed gap; the **base form is shown greyed inside the empty box** |

Counts: listening 6 + 7 + 7 + 7 + 8 = **35**; reading and structure 5 + 13 + 7 + 10 + 10 + 10 + 10 = **65** — both equal
[E9]'s totals, which confirms the item counts read from the screenshots.

Levels [S][E9]: the sample mixes everyday B1 items (1.1, 1.4, 2.1, 2.7) and B2 items (1.3 lecture and science clips,
2.3 article, 2.4 personal essay with abstract clauses).

### Suuline osa (not on the computer)

[E9] table: opinion task with reasons; information exchange (asker / answerer roles, questions from given information);
discussion on a topic with a decision. [O9] (blueprint §8.1): intro 2–3 min on hobbies, plans, home, family, school;
opinion card (30 s to read, 3–4 sentences + reason); a call about an ad (question card / answer card, then swap);
discussion on 1–2 topics; pro / contra debate towards an agreement. Marked 0–10 holistically by two raters.

## 4. Engine gap table (for the UI PR)

**Status 2026-11-18:** built in PR #1270 (fields: `docs/E_EXAM_ENGINE.md` §2) and mock 1 uses it — exam key `E9` with
the locking timer, item 0 in every task, heard twice, `speakers`, clip table, `chat` / `chips`, `hint: 'inside'`, letter
card, pie chart, `kokkuvote`, E9W / E9S, part points. Still open: one audio file per clip (1.3, audio tool), subheading
matching (mock 2), 2.5 by drag, paging one task per screen, the mock's total over its four sheets. The table below is the
original analysis.

„Block now” = what our mocks use today. „Waits” = the block ids that should move to the new interaction. Blocks are in
`crm-v2/src/features/worksheet-studio/engine/blocks/*`; the course builders in `admin/course/blocks.js`.

| E-exam need | Block now | Status | What to add (precise) | Waits |
|---|---|---|---|---|
| **Part header with exam timer** (70 / 50 / 95 min, countdown, auto-close and save at 0) | `B.text` header (the `exampart` timer is manual, does not lock; and in the `b1` course `withHarnoExam` stamps every `exampart` with `exam: 'B1'`, which prints the adult Harno B1 line — wrong for this format) | MISSING | 1) an exam key for this format in `harnoScales.js` (e.g. `E9`: W 70 min / 20 p / 2 tasks; L 50 / 20 / 5 / 35 items; R 95 / 40 / 7 / 65 items; S 24–26 / 20; rule: B1 ≥ 60 %, no part 0), accepted by `exampart.data.exam` and **not overwritten** by `courseSheet.js withHarnoExam`; 2) exam mode on the sheet (`meta.examMode` or `exampart.data.lock: true`): the timer starts with the sheet, is always visible (sticky), at 0 saves and submits the sheet and makes it read-only | `ee1_w_intro`, `ee1_l_intro`, `ee1_r_intro` (replace by `exampart` with `exam: 'E9'`) |
| **Item 0 shown solved** | instruction text says the example; it is not an item | PARTIAL | `opts.example` exists for gaps, listening, choice, truefalse, examlisten, adsmatch, but **not** for `cloze`, `formtext`, `insertion`; and the B1 level norm (`didacticCheck` „example”) flags any solved example at B1. Add example support to the three blocks and skip the „example” norm on exam sheets (`meta.assessment` + exam key) | every task: item 0 of `ee1_l_11 … ee1_r_27` (then add item 0 back to the data and to `eeksamKey.js`) |
| **Audio heard twice** (no pause, no seeking, counter „1 / 2”) | `examlisten.data.plays = 2` is only a label; `ListenAudio` plays freely; `listening` has no `plays` | MISSING | `ListenAudio` exam mode: play button only, plays left counter, no seek / pause, a 10–20 s pause between plays (configurable), disabled after the last play; `listening.data.plays`; free replay stays the default outside exam mode (the sample test allows it) | `ee1_l_11 … ee1_l_15`, `eep_l_1 … eep_l_3` |
| **One audio per clip** (1.3: seven clips, each with its own play button and question) | one `examlisten` with one transcript / audio for all clips | MISSING | `examlisten` mode `choice` with `questions[i].situation` (the line „Kuuled …”) and `questions[i].audio` / transcript; table layout situation · question · options; the audio tool (`tools/listening-audio`) builds one file per clip (`blockId-i.mp3`) | `ee1_l_13` |
| **Speakers with photos ↔ statements A–I, extras, dropdown of letters** | `examlisten` mode `choice` with all statements as options (keepOrder) per speaker | MISSING | new mode `examlisten.mode = 'speakers'` (or block `speakermatch`): `statements` lettered A–I shown once as a table, `speakers: [{ name, img, answer }]`, a letter dropdown per speaker, extras allowed, example row, scored per speaker; `explain` one line per speaker | `ee1_l_11`, `eep_l_1` |
| Subheading ↔ part of the recording ([E9]) | — | MISSING | the same block with `parts` instead of speakers | mock 2 |
| True / false grid with topic picture | `examlisten` mode `truefalse` | OK | optional: ÕIGE / VALE as a two-column grid; picture via `data.img` | `ee1_l_14` |
| Gap from what is heard (word / words / number) | `listening` (`[20|kakskümmend]`) | OK | — (accepts several forms) | `ee1_l_15` |
| **Drag replies into a dialogue** (2.1) | `insertion` (B.bankText): a letter dropdown in each gap, options listed A–H under the text | PARTIAL | `insertion` variant `layout: 'chat'`: two columns of speech bubbles (given side / empty side), the bank beside, **drag** (and tap on a phone) a reply into a bubble, a used reply leaves the bank, drag back to change; scoring unchanged (gap i ↔ option i) | `ee1_r_21`, `eep_r_1` |
| **Drag words from a bank into a running text** (2.2) | `gaps` with a bank, one sentence per line, tap a bank word to place it | PARTIAL | `insertion` variant `bank: 'chips'` (or `gaps` with `passage`): the running text with inline drop targets, chips of the bank (each usable once), drag / tap to place, back to the bank to change; extras allowed | `ee1_r_22` |
| **Drag text parts into a running text** (2.4) | `gaps` with a phrase bank, one sentence per line | PARTIAL | same as above; chips may be long (wrap) | `ee1_r_24` |
| **Sentence beginnings ↔ endings with an extra** (2.5) | `adsmatch` (ends A–K, a letter dropdown per beginning, example) | OK (other look) | optional: drag the ending into the gap after the beginning | `ee1_r_25` |
| **Dropdown inside a running text** (2.6) | `cloze` (`{*right|wrong|wrong}`) | OK | example (0) support (see above) | `ee1_r_26`, `eep_r_2` |
| **Gap with the base form as hint** (2.7) | `formtext` (`[form] (base)`: „(n) ____ (base)”) | OK (other look) | optional: show the base form as the input's placeholder instead of after the line; example (0) support | `ee1_r_27`, `eep_r_3` |
| 3-option questions beside a long text (2.3) | `text` + `choice` | OK | optional: side-by-side layout (text left, questions right, both scroll) | `ee1_r_23` |
| **Letter with arrow notes** (W1) | `examwriting` (situation with the letter as a quote, the notes as bold „→ …” after the sentence, content points listed) | PARTIAL | `examwriting.data.letter = [{ text, note }]`: the letter as a card with margin notes and arrows to their sentence (print and screen) | `ee1_w_1`, `eep_w_1` |
| **Live word counter with target** | `examwriting` (pill „n sõna” turns ok inside min–max) | OK | optional: show only „n sõna” and the target „u 100 sõna” like EIS (no range colouring in exam mode) | `ee1_w_1`, `ee1_w_2` |
| Writing genre „kokkuvõte / arutlus” | `examwriting.genre: 'kokkuvote'` (not in `WRITING_GENRES`, the card falls back to „Kirjutamine”) | MISSING (label) | add `kokkuvote: 'Kokkuvõte'`, `arutlus: 'Arutlus'` to `harnoScales.js WRITING_GENRES` | `ee1_w_2`, `eep_w_2` |
| **Pie chart** (W2) | `chart` kind `bar` with % | MISSING | `chartModel.js CHART_KINDS` + `chart.jsx`: kind `pie` (one series, labels with %, legend), print-safe | `ee1_w_chart`, `eep_w_chart` |
| Writing scale 2 × (content 0–5 + language 0–5) | `examrubric` with custom criteria (`eeksam.js rubric9`) | OK | optional: a named scale `E9W` in `RUBRIC_SCALES` | `ee1_w_r1`, `ee1_w_r2`, `eep_w_r2` |
| Speaking 0–10 holistic, two raters | `examrubric` scale `S` (4 × 0–5 = 20) | PARTIAL | a scale `E9S`: one holistic 0–10 per rater, two raters → 20 | `ee1_s_rubric` |
| Points of a part (35 items → 20 p, 65 items → 40 p; B1 ≥ 60 %, no part 0) | the player shows correct / total and % | MISSING | with the exam key: part points = correct / items × part points (1 decimal), the mock's result card sums W + L + R + S and applies the rule (like `harnoResult`) | all mock sheets |
| Task list, „Märgi ülesanne”, Tagasi / Edasi per task | the sheet scrolls | NICE TO HAVE | exam mode paging: one task per screen with a side list and bookmarks | — |

The learner already sees score, mistakes and the „why” of each wrong item after hand-in (`engine/mistakes.js`); every
auto-checked item of the mock and the practice sheets has one (`b1/eeksamKey.js`, `b1/eeksamHarjutus.js EXPLAIN`;
`b1/eeksam.test.js` checks one line per scored item).

## 5. Our sheets in this format

### 5.1 Mock 1 — „B1 proovieksam (e-eksami vormis) 1” (`admin/course/b1/eeksam.js`, module `a2b1-eeksam-01`)

A supplement of the B1 course, so any teacher can assign it to any B1 learner (teens and adults): one lesson per part.

| Lesson | Sheet | Content |
|---|---|---|
| `a2b1-ee1-w` | I osa · Kirjutamine (70 min, timer with lock) | W1 reply to Kris about a museum night: the e-mail as a letter card with 4 margin notes (`examwriting.letter`), counter „n sõna · u 100 sõna”; W2 „kokkuvõte” of a **pie chart** „Kuidas jõuad tavaliselt kooli või tööle?” (invented data, labelled), 4 bullet tasks, „u 160 sõna”; two E9W rubrics (0–5 + 0–5) for the teacher |
| `a2b1-ee1-l` | II osa · Kuulamine (50 min, timer with lock, every text heard twice) | 1.1 speakers ↔ statements A–I (`mode: 'speakers'`, Helen = item 0, 6 items, 2 extra); 1.2 volunteer sea rescuer Kertu, 0 + 7 × 3 options; 1.3 clip table with a situation line per clip (radio news = item 0, then dentist message, mall announcement, friends, weather, young entrepreneur, lecture, swap market ad), 0 + 7; 1.4 interview on „Teeme ära” (real facts), 0 + 7 true / false; 1.5 Soomaa guide, 0 + 8 gaps |
| `a2b1-ee1-r` | III osa · Lugemine ja keele struktuur (95 min, timer with lock) | 2.1 phone chat about a hike (`layout: 'chat'`), 0 + 5 replies, 2 extra; 2.2 Eesti Rahva Muuseum (`layout: 'chips'`), 0 + 13 gaps, bank of 18 (4 extra); 2.3 article on sleep (AASM), 0 + 7 × 3 options; 2.4 a volunteer's Saturdays at an animal shelter (`chips`), 0 + 10 parts, 2 extra; 2.5 cycling, 0 + 10 beginnings ↔ 12 endings (1 extra); 2.6 Lahemaa, 0 + 10 dropdown gaps; 2.7 „Minu esimene palk”, 0 + 10 base-form gaps (`hint: 'inside'`) |
| `a2b1-ee1-s` | Suuline osa (with the teacher, ~15 min) | teacher card; intro questions; opinion card „Igaüks peaks vähemalt korra elus tegema vabatahtlikku tööd”; call about an ad (cycling trip) with question / answer cards and a swap (guitar lessons); discussion „more people on bikes” with a pro / contra on paid parking and a joint decision; speaking rubric |

Item counts (2026-11-18, after the engine PR #1270): exactly the sample's — listening 6 + 7 + 7 + 7 + 8 = 35, reading and
structure 5 + 13 + 7 + 10 + 10 + 10 + 10 = 65 — each task with item 0 solved (`opts.example`, numbered 0, not scored).
The sheets are exam sheets (`exam: 'E9'`): the lesson-shape and level norms that would bend the format are not checked.

Real facts and sources: Teeme ära 2008 (≈ 50 000 people, ≈ 10 000 t, World Cleanup Day each September — teemeara.ee,
worldcleanupday.org); Soomaa (national park since 1993, „viies aastaaeg”, rabakingad — Keskkonnaamet); ERM (founded
1909, new building at Raadi opened in autumn 2016, exhibitions „Kohtumised” and „Uurali kaja” — erm.ee); sleep
(AASM 2016 / 2015: 13–18-year-olds 8–10 h, adults ≥ 7 h); Lahemaa (1971, the first national park, Palmse, Käsmu —
Keskkonnaamet, loodusegakoos.ee). The people, the chart data and the events in the recordings are invented.

Audio: TartuNLP Neurokõne through `tools/listening-audio/build.mjs` (one file per block, played twice with `lockPlays`; 1.3 still has one file for its eight clips — per-clip files from the audio tool are the open piece).

### 5.2 Practice of the task types in the A2 → B1 course (`admin/course/b1/eeksamHarjutus.js`)

Short supplement sheets placed in `courseModules.b1.js` right after the module of the blueprint's exam station (§8.3);
the modules are not rebuilt.

| Lesson | After | Types |
|---|---|---|
| `a2b1-ee-p-l` | module 7 (health and sport) | speakers ↔ statements (5 + 2 extra), interview true / false (5, WHO activity guidelines), announcement gaps (6) |
| `a2b1-ee-p-r` | module 11 (online shopping) | chat with an e-shop (5 replies + 2 extra), dropdown cloze on safe online shopping (6, TTJA: 14-day withdrawal), base-form gaps (7) |
| `a2b1-ee-p-w` | module 12 (environment) | reply to a letter with notes (~100 words), chart summary (~160 words), rubric |

### 5.3 Mocks 2 and 3 (to do)

Mock 2 (February) adds the subheading ↔ recording task and a W2 argument („arutlus”) instead of a summary; mock 3 (late
March) is the full timed run in exam mode once §4 is built. Mock thresholds (blueprint §8.3): 50, 55, 65 points.
