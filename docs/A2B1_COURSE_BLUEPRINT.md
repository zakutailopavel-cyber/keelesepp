# A2 → B1 course blueprint („Eesti keel B1”, lessons a2b1-001…090)

Status: **draft contract, written before any lesson is rebuilt** (2026-11-10, branch `agent/a2b1-blueprint`). Approved
by the owner → it becomes normative for every rebuilt B1 module. Russian summary for the owner:
`docs/review/a2b1-blueprint-ru.md`.

Owner 2026-11-10: „делай курс A2→B1 и начни с того, что делай не шаблонный курс, а очень чётко продуманный курс с
чёткой целью того, чего мы хотим добиться, и потом это проверить.”

Method: backward design (UbD, METHODOLOGY_STANDARD.md §1): first the exit profile and its evidence (§1–2), then the
module arc (§3), the lesson recipe (§4), assessment (§5), verification (§6) and production (§7).

**Sources and labels.** [H] Harno exam page https://harno.ee/eesti-keele-tasemeeksamid (B1 section re-read
2026-11-10: parts, minutes, raw points, task formats, 60 % / no-0 pass rule, „citizenship requires at least B1”).
[HB] the B1/B2 handbook *Iseseisev keelekasutaja* (2008) as summarised in `docs/HARNO_LEVEL_REQUIREMENTS.md`.
[INF] our own design decision, not an official rule. Repo docs this file builds on and does **not** repeat:
`HARNO_LEVEL_REQUIREMENTS.md` (exam facts), `COURSE_FINAL_SHAPE_B1.md` (task ids W1a…S2, rubrics, format schedule),
`CEFR_A2_B1_LEARNING_STANDARD.md` (levelStage, recycling), `METHODOLOGY_STANDARD.md` (grammar inventory),
`COURSE_DESIGN_STATIONS.md` (lesson design v3), `PROGRESS_ESTIMATE.md` (progress data).

---

## 1. Purpose, learners, exit profile

**Purpose (one sentence).** A Russian-speaking learner who lives in Estonia and has a working A2 leaves the course able
to handle the everyday, school, work and office situations of life in Estonia in Estonian **and** to pass the Harno B1
exam — the level required for citizenship [H] and for many jobs.

### 1.1 Who it is for (personas)

| Persona | Situation | Goal and constraint | What the course must give |
|---|---|---|---|
| **Olga, 38** | Shop / care / logistics worker in Tallinn or Narva; Russian at home; 1-to-1 online, 1 × 60 min a week, evenings, tired | Harno B1 for her job or citizenship within ~12 months; little time for homework | Exam formats early and often, 10-min homework she can do on the phone, work and office situations, speaking confidence |
| **Artjom, 15** | Pupil in a school that is moving to Estonian-language teaching; 1-to-1 at the school after classes, 2 × 45 min | Follow lessons, talk to teachers, write school messages; later a B1 certificate | Teen contexts (school, hobbies, friends, part-time job) — never adult bureaucracy as the only option; short stations; gamified practice |
| **Sergei, 52** | 25 years in Estonia, understands much, speaks with fixed errors; small group (3–4) at Laki 11b or 1-to-1 | Citizenship: Harno B1 | Accuracy on the forms he always gets wrong (object, cases after verbs, past forms), writing (he never writes), the phone role play |

Out of scope: children under ~12 (they use `KIDS_GROUPS_PROGRAM.md`) and learners below A2 (entry test routes them to
the A2 course, §5.1). Most lessons are one-to-one, so **every task works with the teacher as the only partner** (§4).

### 1.2 Exit profile — what the learner can DO at the end

Each line: observable can-do → Harno B1 part it maps to [H] (task ids from `COURSE_FINAL_SHAPE_B1.md` §2.2) → real
situation in Estonia.

**Listening**
- L-1 Catches the one fact that matters in a short announcement or voicemail (time, place, change, price) → L1 → train
  station / Elron announcement, the clinic's voicemail, the school's message.
- L-2 Follows the main points and key details of a 2–3-min radio or TV news item on a familiar topic → L2 → ERR news,
  weather, traffic, a city decision.
- L-3 Notes 1–2-word details (names, numbers, dates, what to bring) from a 3-min conversation → L3a/L3b → the family
  doctor's instructions, a landlord's call, a course registration.
- L-4 Tells what a speaker in an interview said vs did not say → L4 → radio interview with an official or a local expert.

**Reading**
- R-1 Matches needs to ads and notices quickly → R1 → flat ads, courses, job ads, notices in the stairwell.
- R-2 Understands a 200–300-word newspaper or web text on a familiar topic and its details → R2 → a news article, a
  municipal page, a school newsletter.
- R-3 Uses grammar in context to choose the right form in a text (case, verb form, government, linking) → R3a/R3b, R4 →
  reading any official letter correctly.
- R-4 Understands official letters, forms and e-service instructions well enough to act on them → (R1/R2 text types) →
  PPA, Töötukassa, eesti.ee, the building association (ühistu), Stuudium / eKool.

**Writing**
- W-1 Writes a ~50-word note that covers 4 given points (why, when, who replaces, how to reach) → W1b → absence note to
  work or school, message to the landlord.
- W-2 Fills a form or questionnaire with short reasons („Miks?”) → W1a → feedback form, registration form.
- W-3 Writes a ~100-word personal letter or story with a clear order, reasons and feelings → W2a/W2b → letter to a
  friend or relative, a post in a local group, a short complaint.

**Speaking (production)**
- S-1 Talks 1.5–2 min about a familiar topic with reason + example, without breaking down → S0, S1a → introducing
  oneself at work or in an office; answering a teacher's or examiner's questions.
- S-2 Tells what happened (past, sequence, feeling) in 1–2 min → S1a → explaining a delay, an accident, a lost item.

**Interaction**
- I-1 Reaches an explicit agreement with a partner on a practical choice (options, wishes, compromise) in 3–4 min →
  S1b → family plan, neighbours' meeting, team schedule.
- I-2 Makes a 4–5-min phone call to an institution: asks, explains, pushes back politely, agrees the next step → S2 →
  family doctor, landlord, insurer, Töötukassa, shop's customer service.
- I-3 Repairs a breakdown: asks to repeat, checks understanding, paraphrases a missing word → all speaking parts →
  every real conversation.

The B1 can-do statements behind this profile are in `HARNO_LEVEL_REQUIREMENTS.md` (B1 §4) [H][HB]; the B1 handbook
expects speech as a chain of simple sentences with pauses and frequent errors that do not block meaning [HB] — the exit
profile does not demand more.

---

## 2. Measurable exit targets

### 2.1 Exam result (Harno B1 format)

Harno B1 [H]: writing 35 min / 20 raw points, listening 30–35 min / 30, reading 50 min / 33, speaking ~15 min / 20;
each part weighted to 25 points; pass = ≥ 60 of 100 **and no part at 0**.

| Level of result | Rule | Meaning |
|---|---|---|
| Floor | ≥ 60 % in **every** part of the final 090 (W ≥ 12/20, L ≥ 18/30, R ≥ 20/33, S ≥ 12/20) | would pass Harno with every part safe |
| Exam-ready (register the learner) | ≥ 70 % in every part in the full mock 089 **or** in two full mocks in a row [INF] | 10-point margin over the pass mark for exam-day stress — **owner decision 1** |
| Course goal | ≥ 80 % in every part (= `COURSE_FINAL_SHAPE_B1.md` §6.5, owner's earlier target) | „hea” band starts at 76 % [H] |

Per-part requirement, not total: one weak part is the usual reason for failing, and Harno fails a 0 in any part [H].

### 2.2 Skill targets at the end of the course

| Skill | Target (checked in 089 / 090 and the last module checks) |
|---|---|
| Writing | W1 note ~50 words (40–60) with **4/4 points** in ≤ 12 min; W2 letter or story ~100 words (90–120 accepted) [H: ~100] in ≤ 20 min; ≥ 5 different linking words; ≤ 2 meaning-blocking errors per 100 words |
| Speaking | S1a: 1.5–2-min answer with reason + example in ≥ 3 of 4 answers; S1b: 3–4 min ending in an **explicit agreement**; S2: 4–5-min call where all card items are asked and answered; longest sentence in recorded lessons ≈ 12 words (B1 target, `PROGRESS_ESTIMATE.md`) |
| Listening | each task L1–L4 ≥ 70 % in mock 089; ≤ 1 L3 item lost to spelling that hides meaning |
| Reading | all four tasks done within 50 min; each R1–R4 ≥ 70 % |
| Vocabulary | Harno gives ~2,000 words as the A2 orientation [HB] and no B1 number. [INF] Course: ~12 new active items per teaching lesson × 72 teaching lessons ≈ **850 course items** on top of the A2 base; ≥ 70 % of a learner's course cards „learned” in SRS (`studentWords`, box ≥ 3); receptive vocabulary large enough to read R2 texts on all 15 Harno topics (≈ 2,500–3,000 words, [INF] rough estimate, not measured directly) |
| Grammar | every „must control” item ≥ 70 % correct in R3/R4 and in writing (`COURSE_FINAL_SHAPE_B1.md` §6.5); „recognise” items understood in reading/listening and chosen correctly in a 3-option cloze |

### 2.3 Grammar: must control vs recognise

Source of the inventory: B1 and A2 handbooks via `METHODOLOGY_STANDARD.md` §5 [HB]; the split is [INF], based on
what B1 output in Harno writing/speaking actually needs.

**Must control** (used in own speech and writing, errors do not block meaning):
- present, simple past (incl. frequent irregular: tulin, nägin, sain, läksin, sõin, jõin, tegin) and perfect —
  affirmative and **negative**;
- the 14 cases in singular in their main functions; plural nominative / genitive / partitive of frequent words;
  local cases with direction (kus / kuhu / kust; inner vs outer);
- partitive after numbers and quantities; **total vs partial object** with frequent verbs (incl. partitive after
  negation);
- ma- vs da-infinitive with frequent verbs; modals pidama, võima, saama, tohtima, oskama;
- imperative (2nd sg / pl, negative); conditional present for polite requests and wishes (sooviksin, kas te saaksite);
- translative of change (jäin haigeks, läheb külmemaks); comparative and kõige-superlative;
- **verb government** of ~40 frequent verbs (huvituma millest, osalema milles, aitama millega …) and frequent
  postpositions;
- frequent particle verbs (kokku leppima, ära jätma, edasi lükkama, tagasi helistama) and completion ära / läbi /
  valmis;
- ma-forms in case with käima / minema / tulema (käin ujumas, tulen poest — -mas / -ma / -mast);
- impersonal present and past of frequent verbs (tehakse, suletakse, öeldi);
- clauses with et, sest / kuna, kui (time and condition), kes / mis (relative), and sequence connectors (siis, pärast
  seda, enne kui, lõpuks); cause–result (sellepärast, seetõttu, … tõttu, nii et).

**Recognise** (understand; choose in a cloze; free use not required):
- pluperfect (oli juba läinud) — produce only in a fixed narrative frame;
- quotative mood (ta olevat haige) and reported speech („ta ütles, et …” is must-control);
- jussive (olgu, tehku);
- participles as attributes (tehtud töö, kasutatud auto, ostetav kaup) — frequent ones in own complaints;
- adjective suffixes -line, -lik, -kas, -tu, eba- (frequent words active);
- des-form, mata-form, conditional past (oleksin teinud), nominalisation -mine.

### 2.4 Time — is this realistic?

90 lessons (72 teaching + 18 check / exam) × 45–60 min ≈ **68–90 contact hours**, plus 10 min of practice on ~5 days
a week (≈ 40–60 h over the course) [INF]. At 2 lessons a week the course takes ~45 weeks; at 1 a week ~90 weeks.
[INF] That is enough for a learner who meets Estonian daily (work, school) and starts at a solid A2; a learner without
contact or at a weak A2 needs repeats or extra lessons. Hence the fast track and the exam track (**owner decision 2**,
§5.1).

---

## 3. Course arc: 18 modules

Ids stay: module ids `a2b1-module-01…18`, lesson ids `a2b1-001…090`, 4 teaching lessons + 1 check per module, and the
grammar slots tested in `admin/course/grammarPlan.js`. Learners' sheets, goals (`lessonId|g_*`) and progress curves
are keyed on these ids (AGENTS.md: keep immutable ids and the meaning of historical learning data), so the rebuild
re-anchors each module to a real-life outcome **inside its current grammar slot**; it does not shuffle lessons
between modules.

Stages (`CEFR_A2_B1_LEARNING_STANDARD.md` §1): M1–4 A2 · M5–8 A2+ · M9–12 A2+/B1- · M13–16 B1- · M17–18 B1.

### 3.1 Module map

„Final task” = the module's real-life outcome; at least one teaching lesson of the module ends in it, and the check
(lesson 5) assesses it in a new situation. Harno emphasis = the one exam format the module **teaches** (strategy +
worked example) — every module still practises all four skills (listening ≥ 2 tasks a module, METHODOLOGY_STANDARD §2).

| M | Lessons | Title (new) | Final task (real-life outcome) | Communicative functions | Vocabulary domain (Harno topics) | Harno emphasis | Recycles |
|---|---|---|---|---|---|---|---|
| 1 | 001–005 | Mina ja minu päev Eestis | Introduce yourself at a new course / job / school and fill in a registration form; describe your week | introduce, ask and answer personal questions, numbers, dates, spell, describe routine | isikuandmed, igapäevaelu, keel | S0 + S1a (speaking intro) | A2 base (entry test 001) |
| 2 | 006–010 | Pere, sõbrad ja naabrid | Write a ~50-word invitation / message to relatives or a class; describe a person to choose a babysitter / tutor | describe people and relations, invite, accept / decline, congratulate | suhted, isikuandmed | W (A2 message → W1b prep) | M1 present, questions, dates |
| 3 | 011–015 | Kodu ja üürileandja | Choose a flat from ads; report a fault to the landlord / ühistu by phone and in writing | describe and compare homes, report a problem, ask when it will be fixed | maja ja kodu, ümbruskond | R (signs, ads → R1 prep) | M2 kes / mis („korter, mis …”), M1 numbers |
| 4 | 016–020 | Ajad, kokkulepped ja kohustused | Book or move an appointment by phone (clinic, school, service); note: why you are absent and who replaces you | propose a time, accept / decline, obligation and permission, apologise | igapäevaelu, teenused | **S2 phone** (intro) + W1b note | M3 places, M1 times |
| 5 | 021–025 | Mis juhtus? | Tell a colleague / teacher what went wrong (missed bus, lost item); a ~80–100-word story on a title | narrate in order, explain a delay, react with feeling | igapäevaelu, vaba aeg | **W2a story** | M4 particle verbs (in past), M2 people |
| 6 | 026–030 | Pood, kohvik ja teenindus | Order with an allergy; complain about a delivery and ask for a refund | order, ask about ingredients, quantities, complain politely | söök ja jook, sisseostud | **R1** ads ↔ situations | M5 past („tellisin, ei tulnud”), M4 modals |
| 7 | 031–035 | Tervis: perearst, apteek, 112 | Call the family doctor centre, describe symptoms and how they changed, understand dosage; sick-leave message | symptoms and duration, ask advice, follow instructions, emergency call | tervis | **L3a** details | M5 past, M4 appointments, M6 quantities |
| 8 | 036–040 | Kool ja õppimine | Adult: message to the child's teacher in Stuudium / eKool, parents' meeting; teen: explain a school problem, choose a hobby group | ask for information, problem → solution, give reasons | haridus | **R2** article 200–300 words | M7 translative, M4 obligation, M2 relations |
| 9 | 041–045 | Töö | Answer the phone at work and take a message; job interview; short application | describe experience and skills, take a message, agree a team plan | töö | **S1b** agreement | M8 ma / da, government; M3 places |
| 10 | 046–050 | Reisimine ja transport | Solve a cancelled train / bus by phone; plan a trip in a budget; tell a trip story | ask for alternatives, compare, sequence events | reisimine, kohad | **L4** interview T/F | M5 past, M9 ma-cases, M3 local cases |
| 11 | 051–055 | Raha, e-poed ja e-teenused | Written complaint to an e-shop (warranty); explain safe e-service use (Smart-ID / ID-card, phishing) | compare offers, claim a right in writing, warn | sisseostud, teenused | **R3 / R4** cloze and phrase bank | M6 object, M3 adjective suffixes, M5 past |
| 12 | 056–060 | Ilm, loodus ja keskkond (**v3 pilot, kept**) | Decide a plan from a forecast; call the insurer after a storm; agree the courtyard plan | forecast, cause → result, opinion + reason, negotiate | ilm, ümbruskond | **L2** radio monologue | M7 translative, M8 sest / kuna, M11 participles · **060 Mock 1** |
| 13 | 061–065 | Naabrid, ühistu ja keerulised olukorrad | Solve a conflict with a neighbour / ühistu: polite request, refusal, compromise; pass on what others said; call an institution | request, refuse, propose, compromise, report speech | suhted, maja ja kodu, teenused | **S2** phone with an institution | M12 cause, M3 home words, M4 particle verbs |
| 14 | 066–070 | Minu lugu ja Eesti lugu | Tell your own life story (moving, work, family); personal letter ~100 words about experiences | narrate a life, experience („olen käinud”), finished vs unfinished | isikuandmed, suhted, kohad | **W2b** personal letter | M5 past, M10 pluperfect, M6 object |
| 15 | 071–075 | Plaanid ja valikud | Make a plan with plan A / B (course, job change, Töötukassa counsellor); agree first steps | intentions, conditions, alternatives | haridus, töö | **L3b** gapped sentences + L1 | M14 perfect, M8 government, M13 conditional |
| 16 | 076–080 | Uudised ja arvamus | Discuss a news item; give opinion with reason + example; reach a family / group decision | opinion, agree / disagree, compare, argue briefly | media and society (handbook adds current events [HB]), keel | **S1b** agreement | M12–13 cause, quotative, M11 comparison · **080 Mock 2** |
| 17 | 081–085 | Asutused ja kirjad | Read official notices and letters (PPA, Töötukassa, linnavalitsus, ühistu), fill a form, write a formal vs personal message | understand and act on official text, register (Teie), ask for a correction | teenused, kohad | **R** (all four tasks timed) + **W** (both tasks timed) | everything; impersonal, participles |
| 18 | 086–090 | Eesti, keel ja eksam | Speaking part rehearsal end to end; talk about holidays, language and life in Estonia | all speaking functions under time | keel, vaba aeg, isikuandmed | **S** full part | everything · **089 Mock 3, 090 final** |

All 15 Harno topics [H] are covered (isikuandmed 1, 2, 14, 18; maja ja kodu 3, 13; ümbruskond 3, 12; igapäevaelu 1,
4, 5; vaba aeg 5, 18; reisimine 10; suhted 2, 13, 14; tervis 7; haridus 8, 15; sisseostud 6, 11; söök ja jook 6;
teenused 4, 11, 13, 17; kohad 10, 14, 17; keel 1, 16, 18; ilm 12), and the four domains (personal, public, work,
education) each have ≥ 3 modules.

### 3.2 Grammar spiral

I = introduced (notice + rule + practice), P = practised again as a focus, R = recycled inside tasks (cloze item,
writing criterion, homework set), E = checked in a full mock (060 / 080 / 089–090). Slots follow `grammarPlan.js`.

| Item | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| present, questions, word order | I | R | R | R | | | | | | | | | | | | | | E |
| genitive, possession | | I | R | | | | | | R | | | | | | | | | |
| kes / mis clauses | | I | P | | | | | | R | | | | R | | | R | | E |
| local cases, direction | R | | I | R | | | | | | R | | | | | | | | |
| adjective suffixes (rec.) | | | I | | | | | | | | R | | | | | R | | |
| modals + ma / da | | | | I | | | R | P | R | | | | | | | | R | |
| particle verbs | | | | I | R | R | | | | | | | R | P | | | | |
| simple past (+ negation) | | | | | I | P | R | | | R | R | | | R | | | | E |
| quantity + partitive | | | | | | I | R | | | | R | | | | | | | |
| total vs partial object | | | | | | I | R | | | | R | E | | R | | | R | E |
| imperative | | | | | | | P | | | R | | | | | | | R | |
| translative of change | | | | | | | I | R | | | | P | | | R | | | |
| verb government | | | | | | | | I | R | | | | R | | R | R | R | E |
| sest / kuna, cause–result | | | | | R | | | I | | | | P | R | | | R | | E |
| ma-cases (-mas / -ma / -mast) | | | | | | | | | I | R | | | | | | | | |
| pluperfect (rec.) | | | | | | | | | | I | | | | R | | | | |
| comparison | | | R | | | | | | | | P | | | | | R | | |
| participles as attributes (rec.) | | | | | | | | | | | I | R | | | | | R | |
| impersonal | | | | | | | | | | | | I | | | | P | P | E |
| conditional (politeness, wish) | | | | R | | R | | | | | | | P | | R | | | E |
| quotative + reported speech | | | | | | | | | | | | | I | | | R | | |
| perfect vs simple past | | | | | | | | | | | | | | I | R | | | E |
| completion ära / läbi / valmis | | | | | | | | | | | | | | I | R | | | |
| future, kui … siis | | | | | | | | | | | | | | | I | R | | E |
| jussive (rec., one station) | | | | | | | | | | | | | | | I | | | |

Rule [INF, SR]: an item introduced in module n returns as R or P in at least two later modules, the first within 3
modules; the module check tests its own I and P items, and the next module's check holds ≥ 2 items of the previous one.

### 3.3 What changes vs the current modules (and why)

Current headers read from `b1/module01…18.js` (titles, canDo) on `main` a9824ee.

| Change | Current | Why |
|---|---|---|
| Titles and finals re-anchored to life outcomes | M5 „Lihtminevik ja kogemused”, M14 „Minevik … jutustamine”, M15 „Tulevik …”, M16 „Arvamus …”, M17 „B1 lugemine ja kirjutamine”, M18 „B1 rääkimine ja lõpphindamine” are named by grammar or skill | the learner and teacher must see *what for*; grammar stays in the same slot |
| M5 vs M14 split clearly | both „past and experiences” | M5 = yesterday's events (simple past); M14 = life story and experience (perfect, completion) |
| M13 vs M16 split clearly | both opinion / compromise | M13 = private practical conflicts and institutions (S2); M16 = public topics and news (S1b, media topic the B1 handbook adds [HB]) |
| Offices and e-services get an outcome | spread across 054, 082, 083 | M11 (e-services, safe payment) and M17 (official letters, forms, institutions) — top need for Olga and Sergei |
| Teen variant in every final task | adult contexts only in many finals (insurer, landlord, job) | Artjom: each final has a „Sinu variant” — the same function in a teen context (school, hobby, part-time job) |
| Lessons that do not serve the exit profile are replaced | e.g. a whole lesson for the recognition-only jussive (072 „Olgu peale!”), registering as a „living book” (067), a story evening run with another parent (069), a camp's day plan as the main context of 016 | recognition items get one station, not a lesson; contexts must be ones the personas meet |
| Module check lesson is narrowed | most checks are full-length Harno form at ≥ 80 % | see §5.2: the module's taught format + its final task + its grammar; full form only in 020, 040 (A2 + B1 tasks), 060, 080, 089, 090 |
| Kept as is | M12 pilot (v3 stations), entry test 001, mocks 060 / 080 / 089, final 090, the cast (`COURSE_CAST.md`) | already reviewed or tied to learner data |

---

## 4. Lesson recipe (v3 stations, applied to this course)

The contract is `COURSE_DESIGN_STATIONS.md` §1 and its gates §3 (`st-*`). For this course, every teaching lesson:

**Must contain**
1. One can-do that is a step towards the module's final task (written on the sheet and the teacher page).
2. 4–6 independent stations of 8–15 min with their own small input; the teacher page names the 45-min core path (3
   stations incl. the final one), an alternative and a „short on time” path.
3. A purpose line on every task (who, for whom, what result) that passes „would a real person do this?”.
4. Exactly one final station = a real-life outcome (decide / plan / complain / advise / explain / negotiate /
   present — each kind once a module), on the Kasuta sheet, with a goal-only role card for the learner and hidden
   information + 2–3 obstacles + a success condition on the teacher's card (`st-script`).
5. At least one listening station and one productive station (speaking or writing) per lesson [N4]; the module's Harno
   emphasis format at least once in the module (an „exam corner” = a station).
6. ~12 new active items, ≥ 30 % recycled items from earlier modules (`CEFR_A2_B1_LEARNING_STANDARD.md` §3) and the
   grammar items of §3.2 marked I / P for this module.
7. „Sinu variant”: the final task can be done about the learner's own life (and a teen context exists).
8. Real facts with a source line; invented numbers only inside a cast scene.

**Must never contain** (each is a gate or a review item)
- one long text or audio that the rest of the lesson hangs on (`st-depends`); a text > 120 words outside the topic
  opener and exam corners (`st-input`);
- group tasks or „ask three people” (`st-group`); a pair task without the teacher as the partner;
- the same monologue said again (`st-repeat`); a numbered speaking script on the learner's card (`st-script`);
- answers copyable from the same page; fake information gaps; > 1 closed task per station input (`st-closed`);
- „Mäletad?” as the opener; a self-check in every lesson (`st-selfcheck`: ≤ 1 a module); a home monologue in every
  lesson;
- dictation (none at B1–C1, owner 2026-11-04);
- paradigm tables without a use — form is learned to express a function [HB 9.3.2];
- content that would be silly for an adult or childish for a teen (review item, feedback card §6.4).

**One-to-one by design.** Every interactive station states the teacher's role and its reason (the landlord, the
pharmacist, the Töötukassa counsellor). In a small group the same station runs in pairs while the teacher plays the
institution in turn.

**Homework = 10 + 1.** (a) **10 minutes in „Harjuta”** (`/student/harjuta`: open homework sheets → SRS word cards →
sentence practice of the lesson's grammar ids) on most days; (b) **one real task** per lesson, chosen by the learner
from two options, e.g. read the notice in your own stairwell and say what it asks, write (not necessarily send) the
real message to your child's teacher, listen to one ERR news item and note 3 facts, call a shop's info line with one
question. Nothing that sends personal data anywhere is required. The next lesson starts with 2–3 min „Mis juhtus
päriselt?” on the teacher page (not a sheet station).

---

## 5. Assessment and evidence

### 5.1 Entry (keep a2b1-001)

`a2b1-001` stays (four parts in Harno A2 form + grammar areas, `b1/module01.js`). Routing [INF] — **owner decision 2**:
- < 50 % in two or more parts → A2 course first;
- 50–79 % → start at M1;
- ≥ 80 % in every A2 part and the B1 grammar items ≥ 60 % → **fast track**: start at M5 after one review lesson of
  M1–4 grammar; M1–4 lessons stay open as homework;
- **exam track** (Harno date within 6 months): keep the order, but each module's exam corner moves into the core path
  and the learner does 2 lessons a week.

The entry result is stored as the learner's start point (`progressPoints`, kind `teacher`, label „Algus”), so the level
curve counts only what is learned after it (`PROGRESS_ESTIMATE.md`).

### 5.2 Module check (lesson 5 of each module)

45–60 min, no new words or grammar (`LESSON_QUALITY_CONTRACT.md` §D). It measures three things:

| Part | What | Pass mark |
|---|---|---|
| A. Exam format | the module's Harno emphasis format (§3.1) in full Harno length and time | ≥ 70 % „oskan”; 50–69 % „harjutan”; < 50 % „kordame” |
| B. Final task | the module's real-life outcome in a **new** situation, teacher rubric (Harno-scale rubric from `COURSE_FINAL_SHAPE_B1.md` §2.4 for writing / speaking) | done alone (2) / with help (1) / not yet (0); pass = 2 |
| C. Grammar and words | 8–10 items of the module's I / P grammar + ≥ 2 items of the previous module, inside a short text (R3-like), and 10 module words | ≥ 70 % |

Below the mark in a part → one targeted catch-up (a homework practice set on the weak grammar ids + the final task
redone as the first station of the next lesson). No module is repeated after one miss; two misses in the same skill in a
row → the teacher changes the plan (more of that skill's stations, or the exam track's slower pace).

Checks 020 and 040 stay A2 form + one B1 task per part (comparison with 001). 060, 080, 089 are full timed Harno B1
mocks; 090 is the final. Indicator thresholds for the mocks: `COURSE_FINAL_SHAPE_B1.md` §6.5 (060 ≥ 60 %, 080 ≥ 75 %,
089 ≥ 80 % per part), with the exam-ready rule of §2.1.

### 5.3 What the CRM already records and how we read one learner

| Data (existing) | Where | What it tells us |
|---|---|---|
| Course sheets done and their scores per goal (`g_read`, `g_listen`, `g_vocab`, `g_notice`, `g_use`), due dates, `completedAt` | `worksheetAssignments` (`score.perGoal`) | reading / listening / vocabulary per lesson; homework completion; module check parts A and C |
| Lessons held, absences, which course lesson was taught | `lessons` (`topicLessonId`, `Puudus_*`) | pace, attendance |
| Recorded lessons: checked sentences, analyser errors, Estonian share | `lessonRecordings` (`analysis`), `petLessonStats` | grammar accuracy and speaking (share of Estonian, longest sentence) |
| Word cards and their SRS state | `studentWords` (`srs`, `box`, `dueAt`, `reviews`) | active vocabulary (box ≥ 3 = learned) |
| Practice days and XP | `users/{uid}.practice` (`today`, `xp`, `learnDays`), `lastSeenAt` | daily practice habit |
| Start point, corrections, mock-exam markers | `progressPoints` (`teacher`, `estimate`, `exam`) | level curve „Minu areng”, admin estimate „Teekond sihttasemeni” |
| Teacher homework | `homework` | non-sheet tasks |
| „Bad sentence” flags from the gaps / word-order inspector | `generatorFlags` | only generated sentences — not whole tasks |

**Reading one learner (monthly, admin card):** level curve and „Teekond sihttasemeni” per skill (`PROGRESS_ESTIMATE.md`)
→ last module check (parts A / B / C) → homework completion last 4 weeks → practice days a week → SRS learned share →
mock scores per part when present. A skill below its band two months in a row → the teacher's plan changes.

**Gaps (UI follow-ups, not in this task):** writing / speaking rubric points and per-part Harno scores of a mock are not
confirmed as stored numbers (`harnoScales.js` `harnoResult` exists but is unused in the UI) — needed for §2.1; no
whole-task „mõttetu ülesanne” flag (only `generatorFlags` for sentences); `meta.teacherPage` is not shown in the CRM yet;
no place to store the feedback card (§6.4). Until then the pilot records them as in §6.3.

---

## 6. Verification plan („и потом это проверить”)

### 6.1 Pilot cohort

5–7 real learners, chosen by the owner (**owner decision 3**), covering the personas: 2 adults 1-to-1 online with an exam
goal (Olga), 1–2 teens 1-to-1 (Artjom), 1 small adult group of 3–4 (Sergei), 1 adult 1-to-1 at the school. Two teachers
at least, one of them not the owner.

Which modules first: new and fast-track learners on rebuilt **M1–M2** (or M5); learners now near M12 on the **M12
pilot** then rebuilt **M13**. Each pilot learner does ≥ 1 full rebuilt module (4 lessons + check) before a decision.

### 6.2 Metrics

| Metric | Source | Target (keep) |
|---|---|---|
| Module check part A / B / C | `worksheetAssignments`; teacher rubric (§6.3 until stored) | median ≥ 70 % A and C; B done alone by ≥ 2/3 of learners |
| Harno-format delta | 001 → 020 → 040 (A2 form); 060 → 080 → 089 (B1 form) per part | +10 points a part between mocks; no part falling |
| Homework completion | sheets submitted ≤ 7 days after assignment | ≥ 70 % |
| Practice days | `users.practice.learnDays` | ≥ 3 days a week (median) |
| Real task done | feedback card | ≥ 50 % of lessons |
| Teacher prep time | feedback card | ≤ 10 min a lesson |
| Core path fits | feedback card (real minutes) | 35–50 min in ≥ 80 % of lessons |
| „Stupid task” flags | feedback cards (teacher + learner) | ≤ 1 a lesson, none repeated by two people |
| Learner usefulness | feedback card Q1 | ≥ 4 / 5 median |
| Real exam (end) | Harno result reported by the learner | ≥ 80 % of learners we registered as exam-ready pass |

### 6.3 Cadence

- **After each pilot lesson:** teacher fills the card (§6.4, 1 min) in the lesson note with the tag `#a2b1-pilot`;
  learner answers 3 questions in Russian at the end of the lesson (teacher writes them down).
- **Weekly (Monday, 20 min):** owner + Claude read a table per pilot learner: cards, sheets, practice days, check
  scores; list flagged tasks; fix small things the same week (one PR).
- **Per module (after ≥ 3 pilot learners finished it, or 4 weeks):** apply the decision rules.
- **At 060 / 080:** course-level review of the Harno delta.

### 6.4 Feedback card (3 questions each)

Teacher (ET or RU):
1. Kas tuuma tee mahtus 45 minutisse? (jah / ei — tegelikud minutid; ettevalmistus … min)
2. Milline ülesanne ei töötanud või oli mõttetu, ja miks? (jaama nr)
3. Kas õppija tegi lõpuülesande ise? (2 ise / 1 abiga / 0 ei)

Learner (RU):
1. Что из этого урока ты сможешь сделать в жизни на этой неделе? (и оценка пользы 1–5)
2. Какое задание было лишним, странным или непонятным?
3. Трудность: 1 слишком легко … 3 как надо … 5 слишком трудно.

### 6.5 Decision rules (per module)

| Result | Decision |
|---|---|
| all targets of §6.2 met | **keep**; module becomes the sample for the next ones |
| one target missed, or a task flagged by ≥ 2 people | **fix**: change the named stations / timing in one PR, re-check with the next learner |
| ≥ 2 targets missed, or median check part A or C < 60 %, or ≥ 3 flags a lesson, or core path > 55 min in most lessons | **redo** the module (outcome kept, lessons rewritten) and re-pilot |
| Course level: mock delta < +5 points a part on 060 → 080 for most pilot learners | review the module arc and homework (§3–4) before writing more modules |

---

## 7. Production plan

### 7.1 Order

0. Owner approves this blueprint and the 3 decisions (`docs/review/a2b1-blueprint-ru.md`).
1. **Blueprint as data + gate** (Claude, code PR): `admin/course/b1/blueprint.js` (per module: outcome, functions,
   Harno emphasis, grammar ids with I / P / R from §3.2, recycle list) and a test that a rebuilt module (`design:
   'v3-stations'`) tags its I / P grammar ids and recycles ≥ 2 listed items per lesson.
2. **M1 and M2** rebuilt (reference modules; Claude) → **owner reviews both fully** (reads every teacher page and final
   station, runs one lesson with a real learner).
3. **M13** (for the learners finishing the M12 pilot).
4. **M3–M11** in order, then **M14–M18**; one module per PR, at most 2–3 open PRs (AGENTS.md). After the first two,
   the owner **samples**: one random lesson per module (teacher page + final station + one closed task) against the DoD.
5. Pilot results (§6) feed back: a „fix” or „redo” goes before the next new module.

Who writes: Claude writes M1, M2 and the blueprint gate; later modules by Claude or Codex as the owner assigns
(memory: Codex = content, Claude = UI; the owner may move this). Whoever writes, the other reviews against the DoD before
the owner sees it. Realistic pace [INF]: 1 module in 1–2 working days + review; by 2026-12-04 M1, M2, M13 and 3–5 more
are realistic; the rest in December–January.

### 7.2 Per-module definition of done

1. The module's row of §3.1 is honoured: final task, functions, Harno emphasis taught once, recycle list used.
2. §3.2: its I / P grammar items have notice + practice; ≥ 2 earlier items recycled per lesson; the check tests them.
3. §4 recipe: all `st-*` gates and the other course gates pass; teacher page per lesson; „Sinu variant” and teen
   context in every final; no banned pattern.
4. Ids unchanged (module, lessons, goals); the M12 pilot style and the cast stay consistent.
5. Facts checked with a source line; visual briefs for stations that gain from a picture (`TEXTBOOK_ART_BIBLE.md` §6).
6. `cd crm-v2 && npx vitest run src/features/worksheet-generator` passes.
7. A Russian „было → стало” page `docs/review/b1-mNN.md` for the owner (as `b1-m12-pilot.md`).
8. One `docs/PROJECT_STATE.md` entry; draft PR; the owner (or sampling) says „ok” before the next module of the same
   writer is merged.
