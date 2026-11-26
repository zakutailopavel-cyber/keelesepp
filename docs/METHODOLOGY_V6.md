# Methodology v6 — A2, B1 and B2 („from 6.5 to 9”), 2026-11-25

Normative for the Estonian courses A2 (`a2-*`), B1 (A2→B1, `a2b1-*`) and B2 (B1→B2, `b1b2-*`). **v6 extends v5; it does not
replace it.** `METHODOLOGY_B1_B2_V5.md` and `METHODOLOGY_A2_V5.md` stay in force (lesson budget, one input, lengths,
gates G1–G13). v6 adds what the independent audit of the v5 rewrite found missing (2026-11-25: B1 6.2, B2 6.7, A2 6.4 out
of 10; target 9). Where v6 and v5 disagree, v6 wins for every module in `strictModulesV6.json`.

The gates are in `crm-v2/src/features/worksheet-generator/admin/course/methodV6.js` (G14–G25), the report in
`tools/course-audit/method-v6.mjs`, the tests in `methodV6.test.js`.

---

## 0. v6 checklist for content agents

Read this before you write or retrofit a module. Every point is a gate unless it says *(doc)*.

**Commands**

```
node tools/course-audit/method-v5.mjs --course b1 --module 13   # v5 first: must be 0
node tools/course-audit/method-v6.mjs --course b1 --module 13   # v6: must be 0 before the module joins strictModulesV6.json
cd crm-v2 && npx vitest run src/features/worksheet-generator src/features/practice src/features/worksheet-studio src/features/pet
```

(`--course a2 | b1 | b2`; `--gate G14,G15` for some gates; `--retrofit` for all v5 modules against the baseline.) A new
or retrofitted module goes into **both** `strictModulesV5.json` and `strictModulesV6.json`. A retrofit that lowers a
module's count runs `node tools/course-audit/method-v6.mjs --retrofit --write-baseline` and commits the lower baseline.

**Every teaching lesson**

1. **Exit = performance (G14).** The `exitCheck` is a mini-performance of the lesson's can-do in the main task's skill:
   30 s of speech (`speaking`) or one line of the product (`writing`, rewritten from feedback). At most **one** form item
   besides it. A selfcheck alone or three gap items is no exit.
2. **Grammar is produced (G15).** The form task's answers contain ≥ 60 % of the rule box's bold forms (`**…**` in the
   `notice`). If the lesson's grammar is a choice (tõttu / sest / seepärast), the task makes the learner choose it — do
   not print the choice in the sentence. The hint is the dictionary form, never the answer: „(tomat)”, not „(tomatid)”.
3. **Main task has a type and differentiation (G17, G24).** Set `data.taskType` (`phone`, `message`, `jigsaw`, `survey`,
   `presentation`, `ranking`, `project`, `mediation`, `debate`, `roleplay`, `narrative`, `interview`, `infogap`, `essay`,
   `report`, `form`), at most 2 lessons a module with the same type. Give it `data.support` (2–3 sentence starters, the
   „Abikaart”) and `data.stretch` (one „Lisaväljakutse” line).
4. **Spaced retrieval (G18).** The vocab block carries `data.review`: 3 old words from 3–15 lessons back, and the lesson's
   input or card uses them. Every lesson has a `homeTask` whose text says **„Harjuta → moodul N”**.
5. **Short instructions (G22).** A2 ≤ 12 words, B1 001–040 ≤ 18, B1 041+ ≤ 25, B2 ≤ 25 — the italic purpose line
   counts while it is printed. Put the purpose in the teacher note (`teach()`), not in `purpose()`. Lexis: ≤ 5 % of the
   input / card / control tokens beyond the stage's EKI lists (taught words and `tag.topic` words excepted).
6. **Keys fit the instruction (G19).** „Vasta ühe-kahe sõnaga” → no key over 3 words. A free rewrite (`transformation`
   „ütle viisakamalt / oma sõnadega”) is `open: true` or has ≥ 3 variants or a model answer with „…”.
7. **Pronunciation corner, A2 and B1 (G23).** ≈ 5 min, one task type, `data.pronunciation: 'välted' | 'vokaalid' |
   'varjutamine' | 'intonatsioon'` (§2 l).
8. **Self-check with evidence (G24).** `selfcheck` with `data.criteria` (the task's 3 success criteria, rated 0–1–2) and
   `data.evidence: true` (the learner copies one own sentence that proves it).
9. **B2 writing loop (G16).** ≈ 10 min of drafting in class (a `writing` / letter block that is not `home`), and the next
   lesson opens with a 5-min „Parandatud versioon” block with `data.revisionOf: '<previous lesson id>'`.

**Every module**

10. **Real network (G25).** From module 2 the teacher is no real addressee. One `data.peerReply` (a classmate reads and
    answers) and one `data.mediaLog` („Minu eesti keele võrgustik”: what I heard / read in Estonian this month).
11. **Station rhythm varies (G17).** Not the same station minutes in more than 3 lessons in a row.
12. *(doc)* One **mediation** task at B1/B2 (§2 l), one **real document** with light support from B1 on, one
    **jigsaw** or peer feedback round, the L1-contrast note where Russian speakers typically err.

**Every control**

13. **Points add up (G20).** Items of an R / L part = its `points` (or `items`); the open parts' points = the maxima of
    the rubrics on the sheet; every writing and speaking task has descriptors.
14. **No part 0 points (G21)** is named in every control (A2, B1, B2): „… ja ükski osa ei tohi olla 0 punkti”.
15. **B2 control ≥ lesson level (G20).** Longest recording ≥ 150 s; ≥ 30 % of listening gap answers paraphrased.
16. *(doc)* Built from the course blueprint (§2 g), ≈ 20 % items from earlier modules, cold and parallel forms truly
    parallel.

---

## 1. Why v6 (the audit in one table)

| Audit weakness | Score impact | v6 rule | Gate |
|---|---|---|---|
| W1 checks test forms, not the outcome | constructive alignment 6 | §2 a, b | G14, G15 |
| W2 B2 writing only at home, no correction loop | B2 alignment 6 | §2 c | G16 |
| W3 task-shape monotony (47 lessons, one rhythm) | motivation 6 | §2 d | G17 |
| W4 long instructions, calques, Russian-only glosses | cognitive load 6 | §2 e | G22 |
| W5 retrieval and spacing not planned | retrieval 5 | §2 f | G18 |
| W6 control validity (points, no-zero, parallel forms) | assessment 6–7 | §2 g | G20, G21 |
| W7 keys disagree with the instruction | assessment | §2 h | G19 |
| W8 differentiation only on the teacher page | differentiation 4–6 | §2 i | G24 |
| W9 level drifts (lexis, time) | input / load | §2 j | G22 (lexis) |
| W10 „connectivism” = writing to the teacher | motivation | §2 k | G25 |
| §5 missing strands (pronunciation, mediation, strategies, peers, error log, L1, real documents) | 9/10 ceiling | §2 l | G23 (+ doc) |

## 2. The rules

### a. Exit check = a short performance (G14)

The lesson ends with evidence of the can-do, not of the forms. The exit (`exitCheck(block)`) is one of:

- **30 seconds of speech** in the main task's situation (`speaking`, 20–40 s), e.g. „Ütle 30 sekundiga kindlustusele,
  mis juhtus ja miks.”;
- **one line of the product**, rewritten after the teacher's or a peer's feedback (`writing`, 1–2 sentences).

The exit's skill matches the main task's skill (speech after a call, writing after a message). Besides it the exit may
hold **at most one form item** (one gap). The selfcheck stays, but it is not the exit. A2 lessons get an exit too
(10–20 s of speech or one sentence).

### b. The grammar task makes learners produce the rule box (G15)

- The form task's answers cover ≥ 60 % of the bold forms of the lesson's `notice` (words or endings; grammar terms in bold
  such as **osasihitis** are labels and do not count).
- If the rule is a **choice** (connector, case, mood), the item leaves the choice open: „Tuul oli tugev, ___ jäid bussid
  hiljaks (põhjus või tagajärg?)” — not „seepärast [jäid]”.
- **The hint never gives the answer.** The bracket shows the dictionary form („(tomat)”, „(kirik)”), never the answer
  form; when the answer equals the dictionary form (kodu → kodu), choose another word or show two options.
- Guided before free (v5): 8 closed items, then whole sentences — unchanged.

### c. B2 writing: drafted in class, revised next lesson (G16)

- **Kasuta: ≈ 10 min drafting in class** — the first paragraph (≈ 50–70 words) of the home text, with feedback on **one**
  criterion of the analytic rubric (teacher, or a peer with the rubric line). The rest of the text (140 / 180 words) is
  finished at home.
- **Next lesson, Jaam 1: a 5-min „Parandatud versioon”** block with `data.revisionOf: '<lesson id>'`: the learner
  rewrites the three sentences the teacher marked and says in one line what changed. It counts in the budget (replace
  the warm-up question, not add a block).
- B1: the same loop for the module's main writing (home letter in 058_t_home and similar) — recommended, not gated.

### d. Main-task variety (G17)

Rotate the main task's archetype across the module, **at most 2 lessons a module with the same type**:

| Type | What the learner does | Typical blocks |
|---|---|---|
| `phone` | calls a service with a hidden-information card | `phoneCards`, `rolecards` |
| `message` | writes a message / letter to a real addressee | `writing`, `letter`, `examWriting` |
| `jigsaw` | reads one of two/three texts, tells the partner, they solve a task together | two `text` cards + `speaking` |
| `survey` | asks 3–5 real people (classmates, family) and reports | `table` + `speaking` |
| `presentation` | 1–2-min talk with a photo or one slide, answers questions | `speaking`, `ideaCard` |
| `ranking` | ranks or decides with a partner under a condition | `ideaCard` (agreement) |
| `project` | a poster, a guide for newcomers, a class map — over 2 lessons | `planning` + product |
| `mediation` | explains a notice / letter / meeting to someone who did not understand it | `speaking` / `writing` |
| `debate` | argues a side, answers a counter-argument, reaches a position | `rolecards`, `speaking` |
| also | `roleplay` (counter, shop), `narrative`, `interview`, `infogap`, `essay`, `report`, `form` | |

Mark the type with `data.taskType` on the main task; without it the gate infers it from `tag.task` (S04 → phone, S03 /
S12 → ranking, S13 / W12 → mediation …) or the block type. The station rhythm varies too: no identical station minutes in
more than 3 lessons in a row (e.g. a reading lesson 8 / 20 / 15 / 22, a project lesson 5 / 15 / 30 / 15).

### e. Instructions short, purpose to the teacher page, gloss language (G22)

- Instruction ceilings (words of `data.instruction`, the purpose line included while it is printed there): **A2 ≤ 12,
  B1 001–040 ≤ 18, B1 041+ ≤ 25, B2 ≤ 25.** One verb per sentence; the situation goes to the card, not the instruction.
- **The purpose line moves to the teacher page** (`teach(block, …)`), or it is at most 8 plain words. No calques: never
  „… on sinu sõnumi materjal” → „Neid lauseid kasutad hiljem sõnumis.”
- *(doc, UI later)* **Gloss language follows the learner**: a vocab entry keeps its Russian gloss today; the learner
  profile will choose `ru` / `en` / `uk` and the sheet shows that column. Content agents write the Estonian word and the
  Russian gloss as now; an English gloss may be added after „ / ” only where the word is ambiguous. Station minutes on
  learner-facing titles („Jaam 2 · Tunni sõnad · 17 min”) move to the teacher page when the UI changes `station()`;
  until then they are not gated.

### f. Spaced retrieval (G18)

- **Every vocabulary block brings back 3 old words** (`data.review: ['…', '…', '…']`) from 3–15 lessons back; the
  lesson's input, card or task **uses** them (the gate looks for them in the lesson's other blocks).
- **Every control has about 20 % items from earlier modules** *(doc: mark them in the teacher note „Varasemast: …”)*.
- **Every home task links to Harjuta**: „Harjuta → moodul N: sõnad ja vormid (10 min)”. Harjuta holds the drills that
  left the sheet (v5 §4) and the learner's error log (§2 l).
- The warm-up keeps v5's „recall without looking”, from two distances (the previous lesson + one 8–15 lessons back).

### g. Controls (G20, G21)

- **A blueprint per course** *(doc)*, the same for every control of the course; parallel forms (cold ↔ parallel, entry ↔
  control 1) are built from the same row with new content:

| Course | Control | Skills × format × items × points |
|---|---|---|
| A2 | lesson 5 of a module | 4 skills × 10 p: R (8–10 items, 1 p), L (8–10 items, 1 p), W (0/1/2 × 5 rows), S (0/1/2 × 5 rows); Harno ×2 |
| B1 | lesson 5 of a module | 2 skills alternating (R+W / L+S): R or L 2 tasks, 14–16 items × 1 p = part points; W: W1 8 p (rubricW1) + W2 12 p (rubricW2); S: 2 tasks scored with rubricSpeaking or 0/1/2 rows whose max = part points |
| B2 | lesson 5 of a module | 2 skills alternating: R ≈ 16 items (≥ 1 inference task), L ≥ 150 s, 8–10 items, ≥ 30 % paraphrased; W 140-word letter (W 12 analytic) + optional 180; S 1-min monologue + discussion (S 20 or a stated conversion) |

- **Points add up (G20):** the items after an R / L `examPart` equal its `points` (or its `items`); the W / S parts'
  points equal the maxima of the rubrics on the sheet. Every writing task has descriptors (W1, W2, or 0/1/2 rows).
- **„No part 0 points” in all courses (G21)** — the B1 controls lacked it.
- **Control level ≥ lesson level (G20):** a B2 control's longest recording ≥ 150 s, ≥ 30 % of the listening gaps
  paraphrased (not copied from the script). *(doc)* B1 control texts use no lexis above the stage (§2 j).
- *(doc)* A borderline sample for B1 writing, as B2 has; speaking in B1 controls scored by 4 criteria, not 0–5 overall.

### h. Answer keys fit the word limit (G19)

- If the instruction states a limit („üks-kaks sõna”, „1–3 sõnaga”), **every key variant has ≤ limit + 1 words**, and
  the key is in the text.
- **Free rewrites are teacher-check:** a `transformation` that asks for another register / own words / politeness gets
  `data.open: true`, or ≥ 3 variants, or a model answer with „…” (the engine then leaves it to the teacher).

### i. Differentiation on the sheet (G24)

- Each main task: `data.support` — the „Abikaart”, 2–3 sentence starters the learner may unfold (its use is noted) —
  and `data.stretch` — one „Lisaväljakutse” line for a strong learner (an extra condition, a second addressee, a counter-
  argument). *(UI later: the fold-out card and the line are rendered by the sheet; until then the fields are stored
  and the teacher page shows them.)*
- Self-check: the task's three success criteria rated 0–1–2 (`data.criteria`) plus **one own sentence as evidence**
  (`data.evidence: true`).
- **A2 gets teacher pages** like B1 *(doc)*: core path, alternative, short path, „Kui aega jääb”.

### j. Level control (G22 lexis; time model doc)

- **Vocabulary profiler (G22):** in inputs, cards and control texts ≤ 5 % of tokens beyond the stage's EKI lists
  (A2 course: A1–A2; B1 001–040: A1–A2; B1 041+: A1–B1; B2: A1–B2). Words of the lesson's and the module's vocab blocks,
  `tag.topic` words and names (capitalised) are excepted.
- **Time model per station** *(doc; gate later)*: speaking as timed; writing 3 sentences a minute at A2 / B1, 15 words a
  minute at B2; reading 80 words a minute at A2, 100 at B1, 130 at B2; a closed item 0.5 min. The sum of a station's
  tasks must fit its minutes (058_t_helgi: 9–11 sentences + 8 gaps in 15 min does not).

### k. Real networks (G25)

- **From module 2 the teacher no longer counts as the real addressee.** The link task goes to a real source (title +
  URL), a real institution or a classmate.
- **One peer exchange a module** (`data.peerReply`): the product goes to a classmate, who answers with one question or
  „two stars and a wish” against the success criteria.
- **One media log a module** (`data.mediaLog`, „Minu eesti keele võrgustik”): one podcast, channel or page the learner
  follows; three lines — what, one new word, one sentence about it.

### l. New strands

- **Pronunciation and prosody, A2 and B1 (G23).** ≈ 5 min a lesson, **one task type** („Hääldusnurk”): listen to 3–4
  minimal pairs (sada / saada / saaada; kalu / kallu / kaalu; õ / ö / ü / ä: sõda – söda, lõug – lüüa, käsi – kesi), then
  shadow one line of the lesson's recording twice. `data.pronunciation` names the focus (`välted`, `vokaalid`,
  `varjutamine`, `intonatsioon`). B2: once a module *(doc)*.
- **Mediation at B1 / B2** *(doc; the `mediation` task type counts for G17)*: explain a notice, school letter or meeting
  to someone who did not understand it, in plain Estonian. One a module.
- **Listening and reading strategy tips** *(doc)*: one line before the input, rotating predict → key words → check
  (listening) and skim → scan → guess from context (reading). It is the instruction, not an extra block.
- **Peer feedback and jigsaw** *(doc)*: one jigsaw (two texts, information exchanged) and one peer-feedback round with
  the success criteria per module; they may be the same lesson as `peerReply`.
- **Personal error log → Harjuta** *(doc; product)*: the teacher marks a learner's recurring error in the lesson; it goes
  into the learner's Harjuta queue. Until the product exists, the home task asks the learner to write the corrected
  sentence into „Minu vead” in Harjuta.
- **L1-contrast note** *(doc)*: at most one line in the rule box where Russian speakers typically err: case government
  vs prepositions (abielluma kellega ≠ на ком), total vs partial object, verb second after an adverbial, no gender,
  long vs short sounds. Start it with „Vene keeles … — eesti keeles …”.
- **Real documents with light support from B1** *(doc)*: one per module — an eesti.ee form, a real notice, an ERR news
  clip of 60–90 s — with a title, URL and a 3-item task; never copied onto the sheet.

## 3. Markers the gates read

| Marker | Where | Gate |
|---|---|---|
| `data.exit` (`exitCheck`) | the exit's blocks | G14 |
| `tag.main`, `data.taskType` | the main task | G14, G17, G24 |
| `**…**` in `notice.lines` | the rule box's forms | G15 |
| `data.revisionOf` | B2 Jaam 1 revision block | G16 |
| `data.station.minutes` | station blocks | G17 |
| `data.review` | vocab block | G18 |
| `data.home` (`homeTask`) + „Harjuta” in its text | home task | G18 |
| `data.open` | free `transformation` | G19 |
| `exampart.points` / `items`, rubric `criteria.max`, `rubric` rows × 2 | controls | G20 |
| „ükski osa … 0 punkti” | control text | G21 |
| `data.instruction`; EKI forms (`levelForms.*.json`) | every task; inputs and cards | G22 |
| `data.pronunciation` (or a title „Hääldus…”) | the pronunciation corner | G23 |
| `data.support`, `data.stretch`; selfcheck `criteria` + `evidence` | main task; self-check | G24 |
| `data.peerReply`, `data.mediaLog`, `data.realAddressee` | any block | G25 |

Code: `methodV6.js` (`methodV6Problems(methodV5Input(mod), { forms })`, `methodV6Report`, `formatMethodV6Report`), the
runner `tools/course-audit/method-v6.mjs`, the tests `methodV6.test.js`, the lists `strictModulesV6.json` (strict; empty
on 2026-11-25) and `methodV6Baseline.json` (the retrofit backlog of the v5 modules: the test fails when a module's count
rises; `--write-baseline` lowers it). The lexical profile needs the EKI forms; the runner and the test read them from
`worksheet-studio/didactics/levelForms.*.json` (`--no-lexis` skips G22-lexis).

**Doc-only rules and why:** the control blueprint, parallel forms and „20 % older items” (no machine-readable link
between an item and the module it comes from yet); gloss language and station minutes (they need a UI / `station()`
change, outside the content zone); the time model (it needs per-station block grouping that the sheets do not carry
reliably — gate later); mediation, strategy tips, jigsaw, L1 notes and real documents (judgement of content, checked in
review; `mediation` counts for G17); the error log (a product feature).

## 4. Retrofit table (2026-11-25, `node tools/course-audit/method-v6.mjs --retrofit`)

Counts per gate of every module rewritten under v5, as in `methodV6Baseline.json` (29 modules; B1 m13, B2 m10 and A2 m4
merged as #1339, #1338, #1337). G22 counts both instruction length (the bulk) and lexis.

| Module | Total | G14 exit | G15 forms | G16 B2 loop | G17 variety | G18 retrieval | G19 keys | G20 points | G21 no-zero | G22 instr./lexis | G23 pron. | G24 diff. | G25 network |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| a2-module-01 | 26 | 3 | 2 | – | 0 | 5 | 0 | 0 | 0 | 2 | 3 | 9 | 2 |
| a2-module-02 | 48 | 4 | 1 | – | 0 | 8 | 1 | 0 | 0 | 15 | 4 | 12 | 3 |
| a2-module-03 | 49 | 4 | 0 | – | 0 | 8 | 1 | 0 | 0 | 17 | 4 | 12 | 3 |
| a2-module-04 | 44 | 4 | 1 | – | 0 | 8 | 1 | 0 | 0 | 10 | 4 | 14 | 2 |
| a2b1-module-01 | 49 | 3 | 3 | – | 0 | 4 | 2 | 3 | 2 | 18 | 3 | 9 | 2 |
| a2b1-module-02 | 64 | 4 | 3 | – | 1 | 8 | 0 | 1 | 1 | 28 | 4 | 12 | 2 |
| a2b1-module-03 | 64 | 4 | 4 | – | 1 | 8 | 0 | 1 | 1 | 27 | 4 | 12 | 2 |
| a2b1-module-04 | 63 | 4 | 4 | – | 1 | 8 | 1 | 1 | 1 | 25 | 4 | 12 | 2 |
| a2b1-module-05 | 63 | 4 | 2 | – | 1 | 8 | 0 | 1 | 1 | 28 | 4 | 12 | 2 |
| a2b1-module-06 | 62 | 4 | 5 | – | 1 | 8 | 0 | 1 | 1 | 24 | 4 | 12 | 2 |
| a2b1-module-07 | 65 | 4 | 6 | – | 1 | 8 | 0 | 1 | 1 | 26 | 4 | 12 | 2 |
| a2b1-module-08 | 69 | 4 | 6 | – | 1 | 8 | 0 | 1 | 1 | 30 | 4 | 12 | 2 |
| a2b1-module-09 | 50 | 4 | 7 | – | 1 | 8 | 2 | 1 | 1 | 8 | 4 | 12 | 2 |
| a2b1-module-10 | 49 | 4 | 4 | – | 1 | 8 | 1 | 1 | 1 | 11 | 4 | 12 | 2 |
| a2b1-module-11 | 46 | 4 | 4 | – | 1 | 8 | 1 | 1 | 1 | 8 | 4 | 12 | 2 |
| a2b1-module-12 | 53 | 4 | 3 | – | 1 | 8 | 0 | 0 | 0 | 19 | 4 | 12 | 2 |
| a2b1-module-13 | 68 | 4 | 3 | – | 0 | 8 | 2 | 1 | 1 | 31 | 4 | 12 | 2 |
| b1b2-module-01 | 61 | 4 | 2 | 7 | 1 | 6 | 1 | 2 | 0 | 24 | – | 12 | 2 |
| b1b2-module-02 | 71 | 4 | 2 | 7 | 1 | 8 | 2 | 3 | 0 | 30 | – | 12 | 2 |
| b1b2-module-03 | 73 | 4 | 2 | 6 | 1 | 8 | 2 | 1 | 0 | 35 | – | 12 | 2 |
| b1b2-module-04 | 78 | 4 | 9 | 7 | 1 | 8 | 0 | 0 | 0 | 35 | – | 12 | 2 |
| b1b2-module-05 | 76 | 4 | 4 | 6 | 1 | 8 | 0 | 4 | 0 | 35 | – | 12 | 2 |
| b1b2-module-06 | 76 | 4 | 8 | 7 | 1 | 8 | 0 | 2 | 0 | 32 | – | 12 | 2 |
| b1b2-module-07 | 73 | 4 | 2 | 6 | 1 | 8 | 1 | 2 | 0 | 35 | – | 12 | 2 |
| b1b2-module-08 | 73 | 4 | 3 | 7 | 1 | 8 | 1 | 0 | 0 | 35 | – | 12 | 2 |
| b1b2-module-09 | 74 | 4 | 5 | 6 | 1 | 8 | 1 | 2 | 0 | 33 | – | 12 | 2 |
| b1b2-module-10 | 72 | 4 | 1 | 7 | 2 | 8 | 0 | 2 | 0 | 34 | – | 12 | 2 |
| b1b2-module-17 | 55 | 4 | 4 | 3 | 0 | 8 | 3 | 1 | 0 | 18 | – | 12 | 2 |
| b1b2-module-18 | 39 | 3 | 1 | 2 | 0 | 6 | 3 | 0 | 0 | 13 | – | 9 | 2 |

Total: 1 753 violations in 29 modules.

### 4.1 What to change, ordered by impact

Do the steps in this order inside a module; one module = one branch = one draft PR, as in v5. Do not touch a module
another agent has open (check `gh pr list`); the 23 concrete errors of the audit are fixed on `agent/course-audit-fixes`.

1. **Exit → performance (G14), every lesson of every module.** Replace the three-gap `*_t_exit` (B1), add an exit to
   B2 (today only `*_t_self`) and A2 (none): 30 s of speech or one rewritten line in the main task's skill + ≤ 1 gap.
2. **Form task ↔ rule box (G15).** B1 m6, m7, m8, m9 and B2 m4, m6 first (lowest coverage; B1 029, 032, 047, 051 have
   a rule box and no form task; a2b1-058: choose the connector in 8 items). Fix every „hint = answer” item (B2 m4 and m6
   have 6 each: object and infinitive tasks — show the dictionary form or two options).
3. **B2 writing loop (G16), B2 m1–m10, m17–m18.** Draft 10 min in Kasuta, „Parandatud versioon” with `revisionOf` in
   the next lesson's Jaam 1 (lessons 2–4 of each module).
4. **Differentiation and self-check evidence (G24), all modules.** `support` + `stretch` on each main task; selfcheck
   `criteria` + `evidence`. A2 first (A2 score 4), A2 teacher pages with it.
5. **Retrieval (G18), all modules.** `review` words in every vocab block, used in the input or card; „Harjuta → moodul N”
   in every home task (B2 m2, m6–m9 and A2 m1–m4 name Harjuta nowhere).
6. **Pronunciation corner (G23), A2 m1–m4 and B1 m1–m13.** One 5-min corner a lesson, replacing a warm-up line or
   folded into the listening (shadowing one line), not an extra block over budget.
7. **Variety (G17).** B1 m2–m13 and B2 m1–m10: break the identical 8 / 17 / 15 / 25 (B1) and 5 / 20 / 20 / 25 (B2)
   rhythm; B1 m4–m12 replace 3–4 calls / messages with jigsaw, survey, presentation, project, mediation; B2 m6–m10 replace
   two letters with a presentation and a newsletter summary; B2 m10 has a type in 3 lessons.
8. **Instructions (G22).** All B1 modules (purpose lines: ≈ 80 „… materjal” calques), B2 m3–m10 (> 30 each), A2 m2–m4.
   Move `purpose()` text to `teach()`, shorten to the ceiling. Lexis over 5 %: B1 058, 059 and the module 11–13 cards.
9. **Controls (G20, G21).** B1 m1–m11, m13: add the no-zero sentence; give every W / S part a rubric whose max = the
   part points (B1 controls 010…055 have none for S 10 + W 8); a2b1-005 R 16 ≠ 14 items; b1b2-005, 030, 045 R parts
   (16 points, 8–9 items); B2 controls 010 and 025: a ≥ 150-s recording and paraphrased gaps (also 035_p_listen).
10. **Keys (G19).** B2 m2, m3, m17, m18 free rewrites → `open: true` (006_p_trans, 008_p_nominal, 011_p_trans,
    014_p_regret, 082_p_soft, 083_p_para, 086_p_develop, 087_p_polite …); B1 001_d_langs, 005_d_learn, 041, 043, 047,
    051 and A2 006, 011 keys over the word limit.
11. **Network (G25), all modules.** One `peerReply` and one `mediaLog` a module; A2 m2–m4: the addressee is a classmate
    or a public page, not „sinu õpetaja”.

When a module reaches 0: add it to `strictModulesV6.json`, run `--retrofit --write-baseline` (its baseline entry drops
out of the ratchet because strict modules are checked to 0), note it in `docs/PROJECT_STATE.md`.
