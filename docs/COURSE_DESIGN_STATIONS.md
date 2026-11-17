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

7. **Rollimäng: eesmärk, mitte stsenaarium** (owner 2026-11-09, PR #1179: „звонок в страховую слишком детален и заранее
   прописан — ученик особо ничего не делает”). The learner's role card gives only the situation, the **goal** (what to
   achieve) and 1–2 **constraints** (a missing document, a deadline), optionally a small phrase bank — never a numbered
   list of what to say. The teacher's card (`teach()` note, also on the teacher page) holds the **hidden information**,
   2–3 **obstacles** to bring in one at a time (asks for a document the learner lacks, offers a partial deal, claims a
   missed deadline …) and the **success condition** (e.g. a written promise to re-check by a date, or a partial payout +
   what to send). The learner improvises: explains cause → consequence, pushes back politely, agrees on next steps.
   Gate `st-script`: a learner card (role card A, the caller's card of a phone card) with more than 2 lines starting with
   a speech verb (Ütle, Küsi, Selgita, Tervita, Paku, Viita, Lepi, …) fails; teacher cards may be scripts.

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
| `st-script` | a learner's role card is situation + goal + constraints, not > 2 lines „Ütle / Küsi / Selgita …” |
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

**B2 module 1** (`admin/course/b2/module01.js`, lessons b1b2-001…004, 2026-11-14) is the second station module: 001 the
B1 entry diagnostic as six stations (final: plan, W13 letter), 002 advise (W05 guide text), 003 decide (S17 argument
cards), 004 negotiate (S17 learning-plan talk); the check 005 is unchanged. Owner summary: `docs/review/b2-m01-stations.md`.
B2 `av-article` (one 500–600-word article a module) cannot live in a station (`st-input` ≤ 120 words): the module's
article is the check lesson's reading (005, owner 2026-11-14). Open: that length is over the B1+ sheet reading norm (≤ 500).
Since 2026-11-17 the module is the sample of design v4 „task-based” (§7): same stations and gates, no storyline.
**B2 module 2** (`b2/module02.js`, 006–010, 2026-11-17) is the second v4 module: 006 game (town, kus/kuhu/kust, R3
corner), 007 infogap (health, polite conditional, S1 home talk), 008 case (money, cause/effect complaint, L3 corner),
009 project (neighbours, plan B, S2 cards); 010 the short Harno check + „Minu linna abikaart”. Owner summary:
`docs/review/b2-m02-tasks.md`. Learnt for the next modules: a station lesson needs one non-opener text of ≥ 150 words
(av-voice) — in practice a listening or a gapped chat; a big writing task as the exam corner breaks V12 washback (≤ 25 %).

## 5. Next

Owner and a teacher run 2–3 pilot lessons; then decide whether the next modules move to v3-stations (one module per PR,
same gates), and the UI agent shows `meta.teacherPage` in the CRM.

## 6. Evidence rules (added 2026-11-10, from `A2B1_EVIDENCE.md`)

Ten non-negotiable rules for every new or rebuilt module of the A2→B1 course. Each names its source; details,
confidence and full references are in `A2B1_EVIDENCE.md` §2 (E-numbers). They add to §1, they do not replace it. No
gate exists for them yet — authors and reviewers check them by hand until `stations.js` gets the checks.

1. **Mediation every module.** ≥ 1 station where the learner passes on, explains or simplifies what a clear Estonian
   text or speaker says, for someone who needs it (a relative, neighbour, colleague); a Russian source with Estonian
   output is allowed when real, sentence translation is not. — CEFR CV 2018/2020 B1 „mediating a text /
   communication”; PRÕK Lisa 1 § 2.4.3 grade 6 outcomes 13, 17.
2. **Online interaction every module.** ≥ 1 station in a threaded written format (Stuudium / eKool, family chat,
   e-mail with the ühistu or an office, local group post) where the learner replies to someone else's message, asks
   for or gives a clarification. — CEFR CV B1 „written and online interaction”.
3. **Four strands per module.** Meaning-focused input, meaning-focused output, language-focused learning and fluency
   each take 20–30 % of the module's station minutes; the teacher page tags each station with its strand. — Nation
   2007 (E2).
4. **Fluency stations.** ≥ 2 per module: fully known content, time pressure, and a new addressee or channel (told to
   the teacher, then as a shorter voice message to someone else). **Needs owner OK**: until then `st-repeat` forbids
   the repeat, so do the time-pressure part only. — de Jong & Perfetti 2011; Bygate (E3).
5. **Explicit form inside the task.** Each teaching lesson has one notice → rule → practice station (≤ 10 min) for
   the module's I / P grammar item, and the final task cannot be done well without that item. — Norris & Ortega
   2000; Spada & Tomita 2010 (E4).
6. **Feedback protocol on the teacher page.** 2–3 feedback targets per lesson; on accuracy stations prompt first
   (clarification request, repeat the error, elicit, metalinguistic clue), recast only if self-repair fails; during
   fluency and final tasks no interruptions, ≤ 3 delayed points at the end; writing feedback on the same targets. —
   Lyster & Saito 2010 (prompts d = 0.83 vs recasts 0.53); Li 2010; Integratsiooni SA *hea tava* (E5).
7. **Homework = spaced retrieval.** The 10 minutes are retrieval (SRS cards both directions + mixed sentence
   practice), ≥ 4 days a week; every active item is retrieved in ≥ 3 sessions over ≥ 2 weeks with a different example
   sentence each time; no re-reading tasks as practice. — Kim & Webb 2022; Webb et al. 2020; Butowska-Buczyńska et
   al. 2024 (E6).
8. **Interleave and recycle.** Module checks and home sentence sets mix ≥ 3 grammar items incl. ≥ 1 from ≥ 2 modules
   back; ≥ 60 % of the previous two modules' active words reappear in the module in new contexts. — Nakata & Suzuki
   2019; Kim & Webb 2022 (E7, E9).
9. **Readable input and a listening cycle.** ≥ 95 % of running words in every station text are known or glossed (exam
   corners ≥ 90 %); every listening station runs predict → gist → verify → detail → one-line reflection. — Schmitt,
   Jiang & Grabe 2011; Nation 2006; Vandergrift & Tafaghodtari 2010 (E8, E10).
10. **Pronunciation for comprehensibility.** ≥ 2 micro-tasks (3–5 min) per module, perception before production, on
    the features that change meaning for Russian speakers: quantity (Q2 vs Q3), õ / ö / ü, first-syllable stress, long
    vowels in endings. — Lee, Jang & Plonsky 2015 (d = 0.89 / 0.80); Saito & Plonsky 2019; Meister & Meister 2012
    (E11).


## 7. v4 — task-based (TBLT), owner 2026-11-17 — mandatory for every new or rebuilt module

Owner: „учебные планы б1 и б2 слишком скучные, однообразные и все завязаны на какой-то истории; она может и имеет место
быть, но моментами это слишком точечно.” Measured: Sofia ≈ 750 mentions in `b2/module*.js` and ≈ 1300 in `b1/`; the same
people (docs/COURSE_CAST.md) in every lesson; one template everywhere. The owner chose task-based learning. Review of the
first sample (7/10): „long texts must not be the first task everywhere” — the rules below came from it.
v4 runs on the v3 station engine (§1–§3 stay); a module opts in by giving each lesson a `format` (courseSheet.js copies it
to `meta.format`, which switches on the v4 gates). Sample: B1→B2 module 1 (`b2/module01.js`); owner summary
`docs/review/b2-m01-tasks.md`.

### 7.1 The module and the lesson

1. **A module = one real goal in Estonia that the learner reaches for himself** („Ma oskan …”; module 1: „Ma oskan oma
   B2-tee ise käima panna”). Tasks speak to the learner about his life; a learner without a job gets a real alternative
   in the same task (the language school, a family member, a flatmate).
2. **Lesson arc (Willis):** hook → pre-task (his own experience and words) → input → task (+ oral report) → language
   focus (notice in the input → rule card → use) → product (in class: the plan and the first sentences) → exit check.
   The written product comes after the language focus on purpose, so that the learner uses the form he just noticed.
3. **Exactly 4 stations**, each with a stated time and a concrete outcome; station minutes ≤ 75 of a 90-minute lesson
   (room for slack and the homework talk). Typical split: 1 hook + pre-task (Avasta, 10–15 min) · 2 input + task
   (Avasta, 12–15) · 3 language focus (Harjuta, 12) · 4 product + exit check (Kasuta, 15).
3a. **One optional extension „Kui aega jääb”** (10–15 min) per lesson, on Kasuta after the product and before the exit
   check: a meaningful task on the topic (a role-play variant, a mini-debate, a quick game), never a drill
   (`extension(block, minutes)`). The teacher's minute plan, extension included, adds up to about 80–85 of 90 minutes;
   the 4 core stations stay ≤ 75. The extension is outside the lesson's strand balance and catalogue caps (V4, V11, V15).
4. **Hook first, 3–5 minutes.** Station 1 holds ≤ 80 words of material and needs an answer from the learner within the
   first minute: a personal question, a picture, a claim to agree or disagree with, a vote or a guessing game.
5. **Input after the hook**, varied across the module (audio, chart or picture, short text ≤ 150 words, dialogue, real-life
   document: announcement, info line, voice message, forum post, price list).
6. **Long texts:** at most one text over 250 words a lesson, only where the task needs it, never in the first 15 minutes,
   always after a pre-task and pre-taught words. The module's topic opener (§13 of COURSE_DESIGN_COMMUNICATIVE) is that
   text in lesson 1 or 2 — module 1 puts it in 001 station 2, after a 15-minute hook. The exam lesson keeps the Harno
   lengths.
7. **One format and one everyday topic a lesson; no two neighbours alike.** Formats (`format`): `case` (real case),
   `debate` (debate with a vote), `quest` (route of checkpoints), `facts` (news or fact analysis), `infogap` (two role
   cards), `project` (mini-project with a product), `game` (competition with the teacher), `exam` (Harno-format check).
   Topics (`topic`): languages, home, family, neighbours, town, free time, money, health, learning, culture, nature,
   work — **work at most once a module**.
8. **Titles** make the learner want to open the lesson („Neli päeva tööd — kas see sobiks Eestile?”); the grammar goes
   in the small subtitle (`phases` with the grammar line). Ids and goal keys stay; the roadmap file
   (`data/keelesepp-b1-b2-roadmap-NN.json`) gets the same titles; the library shows them after the owner's publish.
9. **Instructions are one line** (what to do) plus the purpose line (what you get). Teacher-only details (who the teacher
   plays, hidden information, obstacles) go to the teacher's card (`teach()`) and the teacher page.
10. **No mechanical tasks.** No „find the word and copy it”; every item needs a decision, an opinion, a comparison or
    personal language. Questions are what a real person would ask. Pronunciation rows: every distractor differs from
    the key word by one sound (sada / saada / saata; kala / kõla / küla).
11. **Grammar by discovery**: the notice card quotes the station 2 input first, then the rule; the product needs the form.
12. **Homework every lesson** (Kasuta, after the product): the long writing (120–150-word letter or text; in class only
    the plan and the first two sentences), a 1-minute voice message (`homeTask(B.speaking(…))`, recorded at home; a
    learner who cannot record says it at the next lesson), the lesson's words (vocabulary/lessonWords/<course>.json →
    Sõnavara → Teemad → „Harjuta”; keep that file in step with the vocabulary boxes) and a „Kodutöö” card listing all
    three (`B.phrasebank`).
13. **Pictures serve the task**: a lesson's picture must fit its topic and come with questions the learner can answer
    (TEXTBOOK_ART_BIBLE, LESSON_SCENE_STANDARD); reuse a fitting existing image (copy it to the lesson's folder and
    retarget the brief) before ordering a new one.
14. **Exit check every lesson**: 2–3 quick scored items (`exitCheck(…)`, Kasuta) + „Ma oskan …” self-rating
    (`B.selfcheck`). Every scored item of the module has an explanation (`export const EXPLAIN`), shown to the learner
    after hand-in (`engine/mistakes.js`).
15. **Characters** (docs/COURSE_CAST.md): at most one short model line in the whole module, and only if it helps.
16. **Teacher page** (`teacherPage`): goal, `hook` (what to say), `plan` (minute plan), `core` / `alt`, `short` (plan B for
    a tired or weak learner: what to skip), `errors`, `sources` (where the answers come from), `groups` (how a mini-group
    of 2–4 runs it; in 1:1 the teacher is the partner), role cards in the `teach()` notes.
17. Real Estonia, own texts, real facts with a source; speaking in pairs in class, voice at home; no dictation at B1–C1.

### 7.2 The learner test (mandatory before a module PR)

Walk through every lesson as four learners and write their honest notes into the module's review doc, then fix what they
found: (a) a 35-year-old Russian-speaking shift lead in Narva who comes after work, tired; (b) a 22-year-old university
student; (c) a 60-year-old pensioner who wants the citizenship exam; (d) a mother on parental leave. For each: where is
he bored, confused or tired, what would he skip, does every task fit his life (job / no job, family / alone), can he do
the homework (time, recording). Then a strict methodologist pass against the CEFR B1→B2 descriptors and the Harno B2
formats: is every task at the right level, does each lesson move the learner measurably toward B2 (the exit check and
„Ma oskan …” show it).

### 7.3 Gates (changed for v4 only; v2 / v3 modules keep the old rules)

| where | rule | v4 change |
|---|---|---|
| `stations.js` `st-stations` | 4–6 stations | exactly 4 |
| `stations.js` `st-load` (new) | — | station minutes ≤ 75 |
| `stations.js` `st-exit` (new) | — | one exit check (2–3 items) and one self-check on Kasuta |
| `stations.js` `st-items`, `st-closed` | closed tasks 5–8 items, ≤ 1 a station | the exit check is exempt (its own 2–3 rule) |
| `stations.js` `st-selfcheck` | ≤ 1 self-check a module | one a v4 lesson |
| `stations.js` `st-teacher` | goal, core, alt, short, errors | + hook, plan, sources |
| `academicValue.js` `av-record` | ≤ 2 home recordings a module | one a v4 lesson |
| `depth.js` short tasks, `didacticCheck.js` items and order | ≥ 5 items; controlled before free | the exit check is exempt |
| `didacticCheck.js` speaking length | level band (B1 120–240 s) | the home 1-minute talk (`data.home`) is exempt |
| `finalShape.js` V4 caps and type shares, V15 Kasuta drills, V11 strands | every task | the exit check, the home task and the extension are not the lesson body (V3 formats and V9 goals still count them); V11 leaves out only the extension |
| `finalShape.js` V11 strands, V12 washback | every task's minutes | the long writing marked `homeTask()` (the „Kodus” card: the class plans and writes the first sentences, the text is homework) has 0 lesson minutes; it still counts as the lesson's exam corner, so a W1 corner on it is allowed (round 3, 2026-11-17) |
| `stations.js` `st-items` / `st-closed`, `didacticCheck.js` items | a chat (`dialogue`) always counted as a closed task of 1 item (the bracket of the JSON array) | gaps are counted in the line texts: a chat without gaps is an input |
| `academicValue.js` `av-voice`, `av-boltedon` | a cast-free text of ≥ 150 words (B1+) besides the opener and fact boxes | one substantial input besides the hook (stations 2–4): a text, chat or the opener of ≥ 120 words, or a recording of ≥ 60 s (≈ 110 words); not a fact box, no cast (`V4_INPUT`) |
| `didacticCheck.js` sentence length | every task sentence, choice questions included | a short listening row (choice / true-false of goal `g_listen`) is left out |

Why the last four (owner OK 2026-11-17, found while building module 2): the old rules made authors bend lessons — a
shortened homework text to keep the input share, a W1 corner moved off the complaint, a 150-word text that no station may
hold, padded listening rows. The v4 input rule keeps the old aim (every lesson has one real text or recording to work on,
not only the hook) at the station's own size; 60 s is the shortest recording that still carries a gist and details.
Older v2 / v3 modules are untouched: the full B1 + B2 course report (36 modules) is identical before and after.

Tests: `admin/course/v4Gates.test.js` (the gates above; round 3 adds one test per change, each with the unchanged v3 result), `admin/course/v4Tasks.test.js` (every v4 module: one extension of
10–15 min in the minute plan, core + extension ≤ 90; format menu and
no two neighbours alike; topics, work ≤ 1; hook ≤ 80 words with a response; no text > 150 words in the first 15 minutes;
≤ 1 text > 250 words a lesson; ≥ 3 input kinds; 4 stations ≤ 75 min; exit check + „Ma oskan” + home talk + homework
card; cast ≤ 2 mentions a module; final task addresses the learner; teacher page complete; every scored item explained).
No gate forced a long text early: the topic opener may sit in lesson 1 or 2 anywhere on Avasta, and `st-input` caps
station texts at 120 words; module 1 only had to move the opener behind the hook.
