# B1 course final shape: exam map, task catalogue, lesson archetypes, rotation and variety rules

Owner goal (2026-10-26): lessons must not repeat the same template lesson after lesson; tasks must not repeat; each
lesson must lead smoothly to its goal; after the B1 course (a2b1-001…090, `admin/course/b1/*.js`) a learner should pass
the Harno B1 exam with **at least 80 %**.

This document is the target („final shape”) for the B1 course. It builds on, and does not replace:
`docs/METHODOLOGY_STANDARD.md` (sources, grammar inventory, B1 grammar placement), `docs/COURSE_DESIGN_COMMUNICATIVE.md`
(design v2, templates v3/v4), `docs/CEFR_A2_B1_LEARNING_STANDARD.md` (stages, §12 variation), `docs/HARNO_LEVEL_REQUIREMENTS.md`
(exam details A2–C1), `docs/LESSON_QUALITY_CONTRACT.md`. Where this file sets a stricter rule, this file wins for B1.

Labels: **[H]** confirmed on harno.ee on 2026-10-26; **[HB]** Harno level handbook; **[R]** research source;
**[INF]** our design decision or inference, not stated by any source. No source text is copied; all is paraphrased.

Status: research and design merged in PR #795. **§9 items 1–4 (infrastructure) are built** on `agent/final-shape-gates`
(2026-10-26): tags, archetypes, the gates V1–V15 with a baseline, the Harno exam blocks and rubrics. The content of
modules 1–18 is not rewritten yet. How to write a lesson that passes the gates: `docs/FINAL_SHAPE_AUTHORING.md`.

---

## 1. Sources and what we take from each

### 1.1 Official Estonian sources

| Id | Source | URL | What we take |
|---|---|---|---|
| H | Harno, „Eesti keele tasemeeksamid”, B1 section (read 2026-10-26) | https://harno.ee/eesti-keele-tasemeeksamid | Exam parts, minutes, item counts, raw → weighted points, pass rule, result bands (§2) |
| H-S | Harno B1 sample tasks per part (2020/2021 PDFs, linked from H) | e.g. https://harno.ee/sites/default/files/documents/2021-06/B1_Lu1_kuulutus.pdf, …/B1_Lu4_fraasid.pdf, …/B1_Ku1_yl_2020.pdf, …/B1_R1_kysimused_kokkulepe.pdf, …/B1_R2_infovahetus.pdf, …/teade.pdf, …/k%C3%BCsimustiku%20t%C3%A4itmine.pdf, …/jutt%20etteantud%20teemal.pdf, …/B1_Ki2B_isiklik-kiri.pdf | Exact task shapes: 9 situations ↔ 6 ads, 3-option MC, phrase bank with extra options, idea card, question card / answer card |
| H-K | Harno B1 consultation booklet („konsultatsioonivihik”) + listening MP3 | https://harno.ee/sites/default/files/documents/2026-01/B1_konsultatsioon_2021.pdf ; audio https://projektid.edu.ee/download/attachments/343705183/B1%20kuulamistest.mp3 | A complete sample test: reading (ads, Estonia opera text, cranberry cloze, Otepää phrase bank), writing (water park questionnaire / note to colleagues; story „Uus tuttav” / letter to a friend), listening (Täheke, „Tagasi kodumaal”, health running T/F), speaking (travel topic + seaside trip agreement). Our mocks copy the *shape*, never the texts |
| H-P | Harno B1 writing performance samples („sooritusnäidis”) | https://harno.ee/sites/default/files/documents/2021-07/B1-taseme-sooritusnaidis.pdf | What „well done” means at B1 writing: on topic, every content point covered, understood, logical whole, errors that do not block meaning (§2.4) |
| H-V | Harno B1 exam video | https://youtu.be/r68sY35ewtc | Speaking procedure, for teachers |
| B12H | Hausenberg et al., „Iseseisev keelekasutaja. B1- ja B2-taseme eesti keele oskus” (2008) | https://harno.ee/sites/default/files/documents/2021-06/Iseseisev-keelekasutaja.pdf | B1 can-do per skill (2.2.1–2.2.6), qualitative aspects of speech (Table 4: range, accuracy, fluency, interaction, coherence), text genres per skill (Appendices 2–4), grammar for function not paradigms (9.3.2), word formation and government over translation (5.1–5.2) |
| A2H | Ilves, „Algaja keelekasutaja. A2-taseme eesti keele oskus” (2008) | https://harno.ee/sites/default/files/documents/2021-06/Algaja-keelekasutaja.-A2-tase.pdf | The A2 floor the course starts from (modules 1–5) |
| R | HTM regulation „Eesti keele tasemeeksamite ülesehitus ja läbiviimise kord” | https://www.riigiteataja.ee/akt/113092012005 | Four skills, 60 % pass with no skill at 0 |
| K | Keeleseadus, lisa 1 (level descriptors) | https://www.riigiteataja.ee/akt/113032019080 | Legal B1 global descriptor |
| CEFR-ET | „Euroopa keeleõppe raamdokument” (ET translation, 2007), linked by Harno | https://harno.ee/sites/default/files/documents/2021-06/euroopa_keele6ppe_raamdokument.pdf | B1 scales Harno uses for rating |

### 1.2 Estonian learning materials (A2–B1)

| Material | URL | What it offers for variety and progression | What we take |
|---|---|---|---|
| **Keeleklikk** (A1–A2 e-course, RU/EN base, free) | https://www.keeleklikk.ee/ | A video story with recurring characters, each unit = episode → dialogue → grammar → interactive tasks → test | A **storyline with a cast** carries a whole course (we already have `docs/COURSE_CAST.md`) |
| **Keeletee** (B1 e-course, free, launched 2018 by HTM; B2 course after it) | https://www.keeletee.ee/ ; HTM news https://www.hm.ee/uudised/uus-eesti-keele-e-oppe-kursus-keeletee-aitab-saavutada-keeleoskust-b1-tasemel | Interactive tasks, animation, video and tests aimed at the B1 level needed for citizenship | Video/listening-led units; short auto-checked tests after each unit — our „Mäletad?” and module exams |
| **„Tere!” / „Tere jälle!” / „Tere taas!”** (M. Simmul, I. Mangus; Puškini Instituut / Kirjastus Kirjatark) | publisher pages; used by INSA Eesti keele maja https://www.integratsioon.ee/en/estonian-language-house/courses | A1→B1 series with themed units, dialogues and word cards („Sõnakaardid”) | Themed units with dialogue input; word cards for spaced retrieval |
| **„E nagu Eesti”** (M. Pesti, H. Ahi; A1–A2, later editions to B1) | used widely in Estonian schools and courses (e.g. INSA) | Grammar-sequenced A-level course with many controlled drills | The A2 grammar floor; we do **not** copy its drill-heavy shape |
| **„Naljaga pooleks”** (M. Kitsnik, L. Kingisepp; two parts, B1-oriented) | used by INSA and language schools | Humour-based texts, situational dialogues, B1 grammar | Texts with a point (humour, twist) — our „story lesson” archetype |
| **INSA (Integratsiooni Sihtasutus)** self-study list and „Juhend iseseisvaks keeleõppeks” | https://integratsioon.ee/iseseisev-ope-ja-oppematerjalid | A curated list: Keeletee, Käänuk (k44nuk.ee, grammar game B1+), Sõnaveeb learn, ALIAS word game, „Keelekõdi” (Raadio 4), placement tests (web.meis.ee/testest), screening test (viktoriin.meis.ee/soeltest: 75 gaps, 4 options, 15 min) | Homework and self-study links per module; the screening test idea for an entry diagnostic |
| INSA „Keeleõpetaja metoodikavihik” (already cited in `COURSE_DESIGN_COMMUNICATIVE.md` §11) | INSA teacher materials | Three-part lesson: häälestus → põhiosa → kokkuvõte | Every lesson: warm-up (review), core, closure with self-check |
| Language-school B1 curricula (Keeleamet-approved) | e.g. https://multilingua.ee/keeltekool/meist/oppekavad/eesti-b1/ (200 ac. h: 120 contact + 80 self-study, 2 modules); https://b-lingua.ee/?page_id=1492 | Typical B1 exam-prep course: 15 Harno topics, exam practice in the second half | Our course size (90 lessons ≈ 120–135 contact hours) is in the normal range; exam practice grows in the second half |
| **EKI „Eesti keele põhisõnavara sõnastik”** (2014) | https://www.eki.ee/dict/psv/ ; picture sheets https://www.eki.ee/dict/psv/pildilehed.pdf | 5,000 most important words for learners, aimed at **A2 and B1** | The B1 vocabulary reference: module word lists are checked against it (§8 V14) |
| **Sõnaveeb** and its learner and teacher tools | https://sonaveeb.ee/ ; https://sonaveeb.ee/lite ; https://sonaveeb.ee/teacher-tools/#/vocabulary | Forms, government, collocations, examples; topic word lists | Form and government checks; collocation tasks (G08) |
| **„Eesti keele käsiraamat”** (EKI, 2007/2020 web) | https://www.eki.ee/books/ekkr/ | Normative grammar reference | The authority for `errorfix` keys and grammar notices |
| **Frequency list** (Kaalep & Muischnek, „Eesti kirjakeele sagedussõnastik”, 2002) | https://www.cl.ut.ee/ressursid/sagedused/ | Word frequency in written Estonian | Tie-breaker for which words get active practice |

### 1.3 Methodology and research

| Id | Source | What we take |
|---|---|---|
| N4 | Nation, „The four strands”, *Innovation in Language Learning and Teaching* 1(1), 2007 — https://www.wgtn.ac.nz/lals/resources/paul-nations-resources/paul-nations-publications/publications/documents/2007-Four-strands.pdf | Roughly equal time for meaning-focused input, meaning-focused output, language-focused learning and fluency; fluency work uses **known** language under time pressure (e.g. 4/3/2) |
| W96 | Willis, *A Framework for Task-Based Learning* (1996) | Task cycle pre-task → task → planning → report → language focus; six task types: listing, ordering/sorting, comparing, problem solving, sharing experiences, creative |
| E03 | Ellis, *Task-based Language Learning and Teaching* (2003) | A task = meaning focus + a gap + learners' own resources + a clear outcome; focused vs unfocused tasks; input-providing vs output-prompting |
| P87 | Prabhu, *Second Language Pedagogy* (1987) | Information gap, reasoning gap, opinion gap |
| PPP/TTT | Harmer, *The Practice of English Language Teaching* (5th ed. 2015); *How to Teach English* (2007) | PPP (present → practise → produce) and TTT (test → teach → test) as two different lesson routes; **ESA** (Engage–Study–Activate) in straight-arrow, boomerang and patchwork orders — a ready rotation of lesson shapes |
| SR | Cepeda et al., *Psychological Bulletin* 132(3), 2006 — doi:10.1037/0033-2909.132.3.354 | Spaced practice beats massed; the best gap grows with the retention interval |
| RP | Karpicke & Roediger, *Science* 319, 2008 — doi:10.1126/science.1152408 | Retrieval (testing yourself) builds memory more than re-study |
| D13 | Dunlosky et al., *Psychological Science in the Public Interest* 14(1), 2013 — doi:10.1177/1529100612453266 | Practice testing and distributed practice: „high utility”; interleaving: promising |
| IL | Rohrer & Taylor, *Instructional Science* 35, 2007 — doi:10.1007/s11251-007-9015-8 | Interleaving (mixing problem types) helps choosing the right procedure — for us: mixing old and new forms in review |
| DD | Bjork, „desirable difficulties” (1994) | Make retrieval effortful but successful: fade support across a module |
| BL | Anderson & Krathwohl (eds.), *A Taxonomy for Learning, Teaching, and Assessing* (2001) | Cognitive level of a task: remember → understand → apply → analyse → evaluate → create |
| SOLO | Biggs & Collis, *Evaluating the Quality of Learning: the SOLO taxonomy* (1982) | Structure of an answer: one point → several points → related points → extended. Used for writing/speaking difficulty |
| CEFR-CV | Council of Europe, *CEFR Companion Volume* (2020) — https://rm.coe.int/16809ea0d4 (ET: https://rm.coe.int/cefr-cv-2020-estonian/1680b4007f) | B1 descriptors for reception, production, **interaction** (goal-oriented co-operation, information exchange, telephone) and **mediation** (relaying specific information, explaining data, processing text) |
| CoE-T | Council of Europe/ALTE, *Manual for Language Test Development and Examining* (2011) — https://rm.coe.int/manual-for-language-test-development-and-examining-for-use-with-the-ce/1680667a2b | Test specifications, item formats, mock tests used for familiarisation, reporting by skill |
| WB | Alderson & Wall, „Does washback exist?”, *Applied Linguistics* 14(2), 1993 — doi:10.1093/applin/14.2.115; Green, *IELTS Washback in Context* (2007) | Exam formats steer teaching; narrow „teaching to the test” raises format familiarity but not ability. Rule for us: exam formats are trained, but most lesson time builds ability (§7.4) |
| UbD | Wiggins & McTighe, *Understanding by Design* (2005) | Backward design: exam evidence first, then lessons |

---

## 2. Harno B1 exam map [H]

### 2.1 Whole exam

| Part | Minutes | Raw points | Weighted | Tasks |
|---|---|---|---|---|
| 1 Kirjutamine | 35 | 20 (T1 = 8, T2 = 12) | 25 | 2 |
| 2 Kuulamine | 30–35 | 30 (1 per item) | 25 | 4 |
| 3 Lugemine | 50 | 33 (1 per item) | 25 | 4 |
| 4 Rääkimine | ≈ 15 (pair) | 20 | 25 | intro + 2 |

- Pass: ≥ 60 % of 100 and no part at 0. Written part (writing, listening, reading) first, then speaking.
- Result bands per part [H]: 0 % and 1–49 % „ei vasta”; 50–59 % „nõrk”; 60–75 % „rahuldav”; **76–90 % „hea”**;
  91–100 % „väga hea”.
- Candidates aged 65+ applying for citizenship skip writing [H] — not relevant to course design.
- Topics: the 15 shared teemaringid (isikuandmed, maja ja kodu, ümbruskond, igapäevaelu, vaba aeg, reisimine, suhted,
  tervis, haridus, sisseostud, söök ja jook, teenused, kohad, keel, ilm); domains: personal, public, work, education.

**Our target, 80 % [INF]:** writing ≥ 16/20, listening ≥ 24/30, reading ≥ 27/33, speaking ≥ 16/20. We aim for 80 % in
*every* part, not only in total, because one weak part is the usual cause of failing and the „hea” band starts at 76 %.

### 2.2 Task-by-task map (ids used in the rest of this file)

| Id | Part | Format [H] | Items / length | What it really tests |
|---|---|---|---|---|
| **W1a** | Writing T1 | Questionnaire: 10 questions, some ask „Miks?” | 10 short answers | Form filling, giving reasons briefly |
| **W1b** | Writing T1 | Note / short message / invitation / card, 4 given points | ≈ 50 words | Covering every content point; addressee; practical register |
| **W2a** | Writing T2 | Story („jutt”) on a given title, bullet prompts | ≈ 100 words | Narrating in the past, linking, describing feelings |
| **W2b** | Writing T2 | Personal letter, 4–5 bullet prompts | ≈ 100 words | Letter frame, news, experience, opinion, questions to the reader |
| **L1** | Listening T1 | 7 short clips 20–30 s (announcements, dialogues, news, sport), 3 picture/word options | 7 MC | Picking one fact out of everyday speech |
| **L2** | Listening T2 | Monologue 2–3 min (news, radio/TV), 3-option MC | 6 MC | Main points and details of a longer monologue |
| **L3a** | Listening T3 | Dialogue/monologue 3–3.5 min, answer in 1–2 words | 8 | Catching and writing a detail (content scored, minor spelling ignored) |
| **L3b** | Listening T3 | Same, complete gapped sentences with a word or number | 8 | Same, numbers and names |
| **L4** | Listening T4 | Interview 2.5–3 min on public-life topics, true/false | 9 T/F | Following an interview, speaker's statements vs distractors |
| **R1** | Reading T1 | 9 situations ↔ 6 ads/notices (one ad can fit several) | 9 | Scanning, matching needs to offers, paraphrase |
| **R2** | Reading T2 | Newspaper/magazine text 200–300 words, 3-option MC | 6 | Detailed comprehension, paraphrase |
| **R3a** | Reading T3 | Cloze ≤ 200 words, 10 gaps, 3 options (one word) | 10 | Grammar in context: case, verb form, government, linking words |
| **R3b** | Reading T3 (alt.) | Cloze with a word bank | 10 | Same with a bank |
| **R4** | Reading T4 | Text 120–150 words, 8 removed phrases / clause parts, bank with extra options | 8 | Cohesion, clause structure, meaning across the sentence |
| **S0** | Speaking intro | Get-to-know conversation | ≈ 1–2 min | Self-presentation, warm-up |
| **S1a** | Speaking T1 part 1 | Examiner asks topic-sheet questions in turn | ≈ 3 min | Answering with detail and reasons |
| **S1b** | Speaking T1 part 2 | Pair reaches an **agreement or decision** on a situation, idea card with pictures | ≈ 3–4 min | Opinions, wishes, describing options, negotiating; well done only if they agree |
| **S2** | Speaking T2 | **Phone role play**: question card (caller) / answer card (institution employee) | 4–5 min | Asking for and giving information, phone formulas |

### 2.3 Time per item (for timed practice) [INF from H]

Reading 50 min / 33 items ≈ 90 s per item (R2 text needs ≈ 12 min, R1 ≈ 12 min, R3 ≈ 10 min, R4 ≈ 10 min, 6 min check).
Writing 35 min: T1 ≈ 12 min, T2 ≈ 20 min, 3 min check. Listening is paced by the recording (each text twice, preview
pause before each task).

### 2.4 How writing and speaking are judged

- Harno states that tasks are rated for **task fulfilment and language ability** [H], speaking by two independent raters
  from a recording [H]. A B1 text is „well done” when it is on topic and covers **all** content points fully, the
  message gets through, the text is a logical whole that is easy to follow, and errors do not block meaning [H-P].
- The handbook's qualitative aspects of B1 speech: vocabulary range, grammatical accuracy, fluency, interaction,
  coherence (pronunciation understandable, accent allowed) [B12H Table 4, 2.2.3].
- Harno does not publish the internal per-criterion split of the B1 raw points (8 + 12 writing, 20 speaking). For C1 the
  published aspects are task fulfilment, structure and cohesion, language use [H]. **Our rubrics [INF]:**

| Rubric | Criteria (points) | Total |
|---|---|---|
| Writing T1 (W1a / W1b) | content: each of the 4 points covered (4 × 1) · language and form: addressee, register, accuracy, length ±20 % (0–4) | 8 |
| Writing T2 (W2a / W2b) | task fulfilment and content (0–3) · structure and cohesion: frame, paragraphs, linking words (0–3) · vocabulary range and precision (0–3) · grammar and spelling (0–3) | 12 |
| Speaking (whole test) | task fulfilment and interaction: answers developed, agreement reached, all card information exchanged (0–5) · fluency and coherence (0–5) · vocabulary (0–5) · grammar and pronunciation (0–5) | 20 |

These replace the generic „4 criteria × 0–3” of module exams (COURSE_DESIGN_COMMUNICATIVE.md §4) for exam lessons from
module 9 on, so that our module scores are on the same scale as Harno raw points.

---

## 3. Task-type catalogue

61 task types in 5 groups. Columns: **id** · **name (ET)** · **block** (current builder in `admin/course/blocks.js`;
„+” = needs a variant or a new builder) · **trains** · **exam link** (§2.2 ids) · **lvl** (cognitive level 1–4: 1
recognise, 2 controlled reproduction, 3 guided production / apply, 4 free production / negotiate — BL, SOLO) ·
**per module** min–max (over the 4 teaching lessons; exam lessons are counted separately in §6).

### 3.1 Reading (R)

| id | name (ET) | block | trains | exam | lvl | per module |
|---|---|---|---|---|---|---|
| R01 | Olukorrad ja kuulutused | manymatch | scanning, matching needs to offers, paraphrase | R1 | 2 | 0–1 |
| R02 | Artikkel + valikvastused | reading + choice | detailed comprehension, paraphrased options | R2 | 2 | 0–1 |
| R03 | Valikvastustega lünktekst | cloze | grammar in context (case, form, linking) | R3a | 2 | 0–1 |
| R04 | Sõnapangaga lünktekst | gaps (bank, in a text) | same with a bank, vocabulary in context | R3b | 2 | 0–1 |
| R05 | Fraasipank tekstis | insertion (+ clause-part bank) | cohesion, clause structure | R4 | 3 | 0–1 |
| R06 | Õige, vale või ei selgu | truefalse (+ „ei selgu”) | careful reading, distractors | L4 prep | 2 | 0–1 |
| R07 | Sildid ja teated | manymatch / choice | everyday notices, signs, short public texts | R1 | 1 | 0–1 |
| R08 | Sõiduplaan, hinnakiri, tabel | table / chart | reading data, finding numbers | R1, L3b | 2 | 0–1 |
| R09 | Pealkiri lõigule | match | gist per paragraph | R2 | 2 | 0–1 |
| R10 | Lõigud õiges järjekorras | wordorder (+ paragraph mode) | text structure, reference words | R4, W2 | 3 | 0–1 |
| R11 | Profiilid ja valik | profiles | comparing people/offers against criteria | R1, S1b | 3 | 0–1 |
| R12 | Sõnumilõim | dialogue / reading (chat form) | informal written interaction | W1b | 2 | 0–1 |
| R13 | Ennusta ja kontrolli | choice (before) + reading (after) | prediction strategy, activating knowledge | R2 | 2 | 0–1 |

### 3.2 Listening (L)

| id | name (ET) | block | trains | exam | lvl | per module |
|---|---|---|---|---|---|---|
| L01 | Lühikesed klipid + pilt/sõna | listening + choice (+ picture options) | one fact from short everyday speech | L1 | 1 | 0–1 |
| L02 | Raadiolugu + valikvastused | listening + choice | main points of a 2–3-min monologue | L2 | 2 | 0–1 |
| L03 | Lühivastus 1–2 sõnaga | listening (short answer) | catching and writing a detail | L3a | 2 | 0–1 |
| L04 | Lünklaused kuulamise järgi | listening (gaps) | numbers, names, details | L3b | 2 | 0–1 |
| L05 | Intervjuu: õige või vale | listening + truefalse | following an interview | L4 | 2 | 0–1 |
| L06 | Teadaanne → tegevus | listening + table / map | instructions, announcements → what to do | L1, L3 | 2 | 0–1 |
| L07 | Telefonisõnum → märge | listening + writing (short) | note-taking from a voicemail | L3a, S2, W1b | 3 | 0–1 |
| L08 | Dikteerimine / taastamine | dictation (dictogloss variant +) | spelling, chunks, reconstruction | L3 | 2 | 0–2 (module cap 2) |
| L09 | Kuula ja järjesta | listening + match / wordorder | sequence of events | L2 | 2 | 0–1 |
| L10 | Numbrid, ajad, hinnad | listening (gaps) | numbers and times by ear | L1, L3b | 1 | 0–1 |

### 3.3 Writing (W)

| id | name (ET) | block | trains | exam | lvl | per module |
|---|---|---|---|---|---|---|
| W01 | Küsimustik (10 vastust, osa „Miks?”) | table / writing (+ questionnaire) | brief answers with reasons | W1a | 3 | 0–1 |
| W02 | Teade / sõnum (≈ 50 sõna, 4 punkti) | letter | content points, addressee | W1b | 3 | 0–1 |
| W03 | Kutse või kaart | letter | invitation, wishes, practical details | W1b | 3 | 0–1 |
| W04 | Isiklik kiri (≈ 100 sõna) | letter | letter frame, news, opinion, questions | W2b | 4 | 0–1 |
| W05 | Jutt etteantud pealkirjaga | writing | narrative, past tenses, feelings | W2a | 4 | 0–1 |
| W06 | Lugu piltide järgi | writing (+ picture strip) | narrative with a given plot | W2a | 3 | 0–1 |
| W07 | Blankett / vorm | table | personal data, forms | W1a | 2 | 0–1 |
| W08 | Vastus kirjale või kuulutusele | letter | answering what was asked, asking back | W2b, W1b | 3 | 0–1 |
| W09 | Lausete ühendamine | transformation | sest, kuna, et, kui, kes, mis, aga, siis | W2, R4 | 2 | 0–1 |
| W10 | Toimeta oma teksti | rubric + errorfix (own draft) | self/peer editing against the rubric | W2 | 3 | 0–1 |
| W11 | Plaan enne kirjutamist | planning | ideas → order → linking words | W2 | 3 | 0–1 |
| W12 | Teisele adressaadile ümber | transformation / letter | register shift (sina → teie), mediation | W1b, CEFR mediation | 3 | 0–1 |

### 3.4 Speaking (S)

| id | name (ET) | block | trains | exam | lvl | per module |
|---|---|---|---|---|---|---|
| S01 | Tutvustav vestlus | speaking | self-presentation, follow-up questions | S0 | 3 | 0–1 |
| S02 | Teemaküsimused | speaking (question list) | answers with detail and reason | S1a | 3 | 1–2 |
| S03 | Kokkulepe ideekaardiga | rolecards / profiles + speaking | proposing, agreeing, deciding | S1b | 4 | 1–2 |
| S04 | Telefonikõne asutusse | rolecards (question card / answer card) | asking for and giving information by phone | S2 | 4 | 1–2 |
| S05 | Infolünk | rolecards (A/B data) | exchanging missing information | S2 | 3 | 0–1 |
| S06 | Pildi kirjeldus ja võrdlus | speaking (+ picture) | describing, comparing, guessing | S1a | 3 | 0–1 |
| S07 | Jutusta, mis juhtus | speaking | 1–2-min narrative | S1a, W2a | 3 | 0–1 |
| S08 | 4-3-2 kordus | speaking (timed repeats) | fluency with known language | all S | 3 | 0–1 |
| S09 | Küsitle ja anna ülevaade | table + speaking | asking, recording, reporting | S1a, W1a | 3 | 0–1 |
| S10 | Kaebus või probleem teenindajaga | rolecards | complaint, request, solution | S2 | 4 | 0–1 |
| S11 | Arvamus ja põhjendus | speaking | stating and supporting an opinion | S1a, S1b | 3 | 0–1 |
| S12 | Järjesta ja vali | categorize + speaking | ranking options together (Willis „ordering”) | S1b | 4 | 0–1 |
| S13 | Seleta sõbrale | speaking (mediation) | relaying a notice/table in own words | S2, CEFR mediation | 3 | 0–1 |

### 3.5 Language: grammar and vocabulary (G)

| id | name (ET) | block | trains | exam | lvl | per module |
|---|---|---|---|---|---|---|
| G01 | Märka | notice | noticing form–meaning in the input | all | 1 | 2–4 |
| G02 | Leia reegel | table / categorize / diagram (timeline) | inducing the rule from examples | R3 | 2 | 1–2 |
| G03 | Vormid tekstis | formtext | the right form in a running text | R3, W | 2 | 0–2 |
| G04 | Sorteeri | categorize | grouping by form or meaning | R3, R4 | 2 | 0–2 |
| G05 | Teisenda | transformation | changing tense, person, voice, mood | W | 2 | 0–2 |
| G06 | Paranda viga | errorfix | real L1-interference errors only (EKI check) | W2 | 2 | 0–2 (module cap 2) |
| G07 | Sõnajärg | wordorder | V2 order, kui/et clauses | W, S | 2 | 0–1 |
| G08 | Rektsioon ja ühendid | match / gaps | verb + case/postposition, collocations | R3, R4 | 2 | 0–2 |
| G09 | Sõnamoodustus | wordforms | -line, -lik, -kas, -tu, eba-, -mine, -ja | R3 | 2 | 0–1 |
| G10 | Tõlgi mõte | translation | meaning, false friends (RU → ET) | — | 2 | 0–1 (module cap 1) |
| G11 | Ristsõna / sõnamäng | crossword | spelling and retrieval of module words | — | 1 | 0–1 |
| G12 | Mäletad? | review | spaced retrieval of earlier lessons and modules | all | 2 | every lesson (not counted as a task) |
| G13 | Vali õige vorm | choice | form choice in context (3 options) | R3a | 1 | 0–2 |

Notes:
- Ids are **didactic** types. One block type can host several catalogue types (`listening` → L02–L05), so the variety
  rules in §8 count catalogue ids, not block types. A block gets its id from an explicit tag (§9); without a tag a
  default per block type applies.
- Caps already in force (v4): error correction ≤ 2, translation ≤ 1, dictation ≤ 2 a module (exam lessons not counted).

---

## 4. Lesson archetypes

The three sheets (Avasta → Harjuta → Kasuta) stay. An **archetype** decides what leads the lesson: the input, the route
through the phases and the outcome. Ten archetypes (8 for teaching lessons, 2 for assessment):

| Code | Archetype (ET) | Route (source) | Avasta input | Harjuta | Kasuta outcome | Harno tasks it naturally carries |
|---|---|---|---|---|---|---|
| **LUGU** | Loo tund | PPP via a story, ESA straight arrow (Harmer) | episode with the cast (reading or picture story), cliffhanger | form ladder on the story's language | continue/retell the story (W05, W06, S07) | W2a, L2, R2 |
| **PROB** | Probleemi tund | TBLT task cycle (Willis): task → report → language focus | a problem (complaint, broken plan, conflict) in a message or call | language focus **after** a first attempt | solve it: S10 / S03 / W08, then a second, better attempt | S1b, S2, W1b |
| **KUUL** | Kuulamise tund | input-led (N4 strand 1) | 2 listening texts of different genre (clips + longer) | listening-based tasks (L03, L04, L08), notice from transcript | act on what was heard (L07 → W02, S13) | L1–L4 |
| **LUGE** | Lugemise tund | input-led, reading strategies | a 200–300-word text or a set of ads/notices | R03/R04/R05 on the text, G08 | use the information: choose, recommend, reply (R11 → S03, W08) | R1–R4 |
| **RÄÄK** | Rääkimise tund | output-led, fluency (N4 strand 4) | a short provocation: opinions, a survey, pictures | phrases for agreeing, 4-3-2 (S08) | a negotiation or interview with a decision (S03, S12, S09) | S1a, S1b |
| **KIRJ** | Kirjutamise töötuba | process writing: model → plan → draft → edit | a model text to analyse (genre, frame, linking) | W09, W11, G-tasks on linking and form | write, self-edit with the rubric (W10), rewrite (W04/W05/W02) | W1, W2 |
| **AVAS** | Avastamise tund (TTT) | test → teach → test (Harmer), discovery | a short test or situation the learner tries **first** | find the rule (G02), contrast pairs, targeted practice | the same situation again, now with the new form | R3, R4 |
| **PROJ** | Projektitund | mini-project, module product (v4 storyline) | brief of the product (contest entry, guide, plan) | gather language and information | produce and present the module product | W2, S1a |
| *EKS* | Mooduli eksam | Harno format, minimal support | — | — | — | per §6 |
| *PROOV* | Proovieksam | full timed Harno B1 mock | — | — | — | all |

Each teaching archetype has a **lead input skill** (L or R) and a **lead output skill** (S or W):

| Archetype | Input | Output |
|---|---|---|
| LUGU | R (or picture + L) | W or S |
| PROB | L or R | S |
| KUUL | **L** | S or W |
| LUGE | **R** | S or W |
| RÄÄK | L or R | **S** |
| KIRJ | R | **W** |
| AVAS | R or L | S or W |
| PROJ | R or L | W + S |

The lesson declares both in its data (`archetype`, `lead: { input, output }`, §9) so the rules can be checked.

### 4.1 Rotation rules (teaching lessons)

1. **Different archetype each lesson:** two consecutive teaching lessons never share an archetype, also across a module
   boundary (lesson 4 of module m and lesson 1 of module m+1).
2. **Four different archetypes in a module:** the 4 teaching lessons of a module use 4 different archetypes.
3. **All four input → output pairs in a module:** across the 4 teaching lessons the (input, output) pairs are
   L→S, L→W, R→S, R→W, each once. This gives every module two listening-led and two reading-led lessons, two speaking
   and two writing outcomes (fixes the „listening in 42 % of B1 lessons” gap in METHODOLOGY_STANDARD.md §6.3).
4. **Archetype spread over the course:** over the 67 teaching lessons of modules 2–18 no archetype appears more than
   12 times; LUGU, PROB, KUUL, LUGE, RÄÄK, KIRJ and AVAS at least 7 times each; PROJ at least 3 times.
5. **Module opener rotates:** lesson 1 of consecutive modules uses different archetypes (lesson 1 is still the most
   supported lesson — support depends on the position, the archetype on the rotation).
6. **The grammar of the module decides where AVAS goes** (the lesson that introduces the module's grammar item is AVAS
   or LUGU), otherwise the default plan in §6.2 applies.

### 4.2 Inside a lesson: phase routes rotate too

The order of task families inside each phase follows the archetype (PPP-like in LUGU, task-first in PROB, test-first
in AVAS, input-first in KUUL/LUGE, model-first in KIRJ). ESA's three orders — straight arrow (E-S-A), boomerang
(E-A-S-A) and patchwork (E-A-S-A-S-A) — are the three allowed macro routes; consecutive lessons use different routes.
The phase contract of v4 still holds (Avasta: input → notice → rule → talk; Harjuta: a ladder, types once a sheet;
Kasuta: a real situation with a partner and a result, no drills).

---

## 5. Module arc (5 lessons)

| Lesson | Position job | Support | Typical archetypes | Ends with |
|---|---|---|---|---|
| 1 | **Open:** hook into the module storyline, the module goal and product named, topic words, first look at the grammar item | high: phrase bank, model, vocab box, RU glosses | LUGU, AVAS, KUUL, LUGE | first own use of the topic language |
| 2 | **Form in focus:** the module grammar item noticed, contrasted, practised to accuracy | high → medium | AVAS, LUGE, KIRJ | a guided text or dialogue with the form |
| 3 | **Extend:** new genre or skill on the same topic, mixed retrieval with earlier modules (interleaving) | medium | KUUL, RÄÄK, LUGE, KIRJ | an interaction or text in a new situation |
| 4 | **Transfer:** a problem or project; the module product made; least support | low: no model before production | PROB, PROJ, RÄÄK, KIRJ | the module product + its rubric + „Ma oskan…” |
| 5 | **Module exam** in Harno form at the module's stage (§6) | none (exam conditions) | EKS / PROOV | per-skill score, the module's can-do checked |

Further rules:
- Every lesson opens with „Mäletad?” (G12): 2–3 items from the previous lesson **and** at least one from a module 2–4
  modules back (spacing and interleaving: SR, IL, D13).
- Every module states its can-do list on lesson 1 and checks it in lesson 5; each lesson's can-do is one step towards
  the module goal (the lesson goals are the module goal's mini-steps — `learning-roadmap` decision).
- Support fades across the module (DD): phrase banks in lessons 1–2, idea cards only in 3, no model text before
  production in lesson 4.
- From module 6 each teaching lesson carries **one „Eksaminurk”** (exam corner): one Harno-format task (R1–R4, L1–L4,
  W1, S1b or S2) on the lesson's own text and topic, 8–12 minutes, scored like the exam. It counts towards §7.2.

---

## 6. Course arc and mock exams

### 6.1 Stages (consistent with COURSE_DESIGN_COMMUNICATIVE.md §10)

| Stage | Modules (lessons) | Level | Exam lessons | Harno formats |
|---|---|---|---|---|
| 0 Entry | 1 (001–005) | A2 → A2+ | 001 entry diagnostic (Harno A2 short form + 1 B1 task per skill as a preview, untimed); 005 module exam A2 | — |
| 1 Consolidate | 2–5 (006–025) | A2+ | module exams in Harno A2 form; **from module 4: one B1 task per skill added** | B1 formats introduced one by one (§6.3) |
| 2 Build | 6–10 (026–050) | B1- | 030, 035, 040 in A2 form + B1 tasks; 045, 050 in B1 form at reduced length | all B1 formats met by module 10 |
| 3 B1 | 11–14 (051–070) | B1 | B1 form, full item counts; 060 = **Mock 1** (full, timed) | all, at full length |
| 4 Exam-ready | 15–18 (071–090) | B1, B1+ | 075, 085 B1 form; 080 = **Mock 2**; 089 = **Mock 3**; 090 = **Final** (Lõpphindamine, Mock 4) | all, timed, strategies |

### 6.2 Default archetype plan (modules 2–18, teaching lessons 1–4) [INF]

Satisfies §4.1 rules 1–5 (L→S, L→W, R→S, R→W once per module; no archetype twice in a row; openers rotate). The
content author may swap two lessons inside a module if the grammar needs it, as long as the rules still pass.

| Module | Theme | L1 | L2 | L3 | L4 | L5 |
|---|---|---|---|---|---|---|
| 2 | Pere ja suhted | LUGU R→W | KUUL L→S | AVAS R→S | PROJ L→W | EKS A2 |
| 3 | Kodu ja linn | KUUL L→S | LUGE R→W | RÄÄK L→W* | PROB R→S | EKS A2 |
| 4 | Aeg ja plaanid | AVAS R→S | KUUL L→W | LUGE R→W* | PROB L→S | Vahehindamine 1 (A2) |
| 5 | Lihtminevik | LUGU R→W | AVAS L→S | RÄÄK R→S* | KIRJ L→W* | EKS A2 + B1 tasks |
| 6 | Toit ja teenindus | LUGE R→W | KUUL L→S | AVAS R→S | PROB L→W | EKS A2 + B1 tasks |
| 7 | Tervis | KUUL L→W | LUGU R→S | AVAS L→S | KIRJ R→W | EKS A2 + B1 tasks |
| 8 | Õppimine | AVAS R→S | KUUL L→W | LUGE R→W | RÄÄK L→S | Vahehindamine 2 (A2 + B1 R/L) |
| 9 | Töö | LUGU R→W | AVAS L→S | KIRJ L→W* | PROB R→S | EKS B1 (reduced) |
| 10 | Reisimine | KUUL L→S | LUGE R→W | RÄÄK R→S | PROJ L→W | EKS B1 (reduced) |
| 11 | Raha ja ostlemine | LUGE R→S | AVAS L→W | KIRJ R→W | PROB L→S | EKS B1 |
| 12 | Ilm ja loodus | KUUL L→W | LUGU R→W | AVAS R→S | RÄÄK L→S | **Mock 1** |
| 13 | Suhtlemine | AVAS R→W | KUUL L→S | LUGE R→S | KIRJ L→W | EKS B1 |
| 14 | Minevik ja kogemused | LUGU R→W | AVAS L→S | KUUL L→W | RÄÄK R→S | EKS B1 |
| 15 | Tulevik ja plaanid | LUGE R→S | KUUL L→W | LUGU R→W | PROJ L→S | EKS B1 |
| 16 | Arvamus | RÄÄK L→S | LUGE R→W | KIRJ L→W | PROB R→S | **Mock 2** |
| 17 | Lugemine ja kirjutamine | KUUL L→S | LUGE R→W | AVAS R→S | KIRJ L→W | Kontroll (B1 R + W, timed) |
| 18 | Monoloog ja dialoog | PROB L→S | KIRJ R→W | RÄÄK R→S | — | Mock 3 (089) + Final (090) |

`*` RÄÄK / KIRJ with the „other” input is allowed (input of RÄÄK can be L or R; KIRJ's model text may be heard). In
module 18 lesson 089 is a mock, so the module has 3 teaching lessons; rule 3 is relaxed there (3 of 4 pairs).

Counts over modules 2–18 (67 teaching lessons): AVAS 12, KUUL 12, LUGE 10, RÄÄK 8, KIRJ 8, LUGU 7, PROB 7, PROJ 3.
PROJ is rarer on purpose (a project lesson is long). The test (§8 V5) uses rule 4 as written in §4.1.

### 6.3 Introduction schedule of the B1 exam formats [INF]

A format is first **taught** (strategy, a worked example, untimed) in a teaching lesson, then **practised** in
„Eksaminurk” corners, then **tested** in exam lessons.

| Module | Formats introduced (taught first in a teaching lesson) |
|---|---|
| 4 | W1b note (4 points) · S2 phone role play |
| 5 | W2a story on a title · L1 short clips |
| 6 | R1 situations ↔ ads · S1a topic questions with reasons |
| 7 | L3a short answer · W1a questionnaire with „Miks?” |
| 8 | R2 article MC · L2 radio monologue |
| 9 | R3a MC cloze · S1b agreement with an idea card |
| 10 | R4 phrase bank · L4 interview T/F · W2b personal letter |
| 11 | R3b word-bank cloze · L3b gapped sentences |

### 6.4 How often each Harno format is practised before the final exam (K)

Counted from its introduction to lesson 089 (the final 090 not counted). „Exam” = in an exam or mock lesson in Harno
form; „corner” = Eksaminurk in a teaching lesson.

| Format | Min. in exam lessons | Min. in corners | Min. total | Max. gap between two practices |
|---|---|---|---|---|
| R1, R2, R3 (a or b), R4 | 6 | 4 | **10** each | 3 modules |
| L1, L2, L3 (a or b), L4 | 6 | 4 | **10** each | 3 modules |
| W1 (a or b) | 6 | 3 | **9** | 3 modules |
| W2 (a or b) | 6 | 4 | **10** | 3 modules |
| S1a, S1b | 6 | 5 | **11** each | 2 modules |
| S2 | 6 | 5 | **11** | 2 modules |
| Variants W1a, W1b, W2a, W2b, L3a, L3b, R3a, R3b | — | — | **≥ 3 each** | — |
| Full timed mock | 3 (060, 080, 089) + final 090 | | | |

Why these numbers [R + INF]: retrieval and spaced practice make formats automatic (RP, SR, D13); ≥ 3 full mocks is
common exam-prep practice for familiarisation and timing (CoE-T recommends trialling and familiarisation, not a number;
the number is ours). The washback limit (§7.4) keeps exam work from taking over the lessons.

### 6.5 Performance indicators and the ≥ 80 % target

Tracked per learner per skill (the sheet's score → „Minu areng”, teacher report). Raw scores are on the Harno scale
(§2.1) so a module exam and the real exam read the same way.

| Checkpoint | Writing /20 | Listening /30 | Reading /33 | Speaking /20 | Decision |
|---|---|---|---|---|---|
| Mock 1 (060) | ≥ 12 (60 %) | ≥ 18 | ≥ 20 | ≥ 12 | below in a skill → that skill's catch-up plan (extra corners, homework) for modules 13–15 |
| Mock 2 (080) | ≥ 15 (75 %) | ≥ 23 | ≥ 25 | ≥ 15 | below → teacher review before module 17 |
| Mock 3 (089) | ≥ 16 (80 %) | ≥ 24 | ≥ 27 | ≥ 16 | **exam-ready**: register for the next Harno date |
| Final (090) | ≥ 16 | ≥ 24 | ≥ 27 | ≥ 16 | certificate of the course; otherwise a repeat plan by skill |

Process indicators (what the teacher looks at when a score is low):

| Skill | Indicator | Target at Mock 3 |
|---|---|---|
| Reading | score per task R1–R4; time used vs 50 min | each task ≥ 75 %; finished within 50 min |
| Reading | R3/R4 errors by kind (case, verb form, government, linking) | no kind > 30 % of errors |
| Listening | score per task L1–L4; L3 answers lost to spelling that hides meaning | each task ≥ 75 %; ≤ 1 item lost to spelling |
| Writing | content points covered (T1 4/4, T2 all bullets) | 100 % |
| Writing | length within ±20 % of 50 / 100 words | yes |
| Writing | linking words used in T2 (ja, aga, sest/kuna, et, kui, siis, pärast seda, lõpuks …) | ≥ 5 different |
| Writing | errors that block meaning per 100 words | ≤ 2 |
| Speaking | S1b ends in an explicit agreement; S2 all card items asked and answered | always |
| Speaking | S1a answers: reason or example given | ≥ 3 of 4 answers |
| Speaking | fluency: a 60-s answer without a breakdown | yes |
| Vocabulary | „Mäletad?” recall of earlier module words | ≥ 80 % |
| Grammar | B1 grammar items (METHODOLOGY_STANDARD.md §7) correct in exam R3/R4 and writing | ≥ 70 % per item |

---

## 7. Balance rules

### 7.1 Four strands per lesson (N4)
Over the three sheets of a teaching lesson (minutes from `timeEstimate.js`): meaning-focused input ≥ 20 %,
meaning-focused output ≥ 25 %, language-focused ≤ 40 %, fluency ≥ 10 % (S08, timed re-telling, speed reading of
known text). Fluency tasks are tagged so they can be counted.

### 7.2 Exam corner
From module 6 every teaching lesson has exactly one Eksaminurk (one Harno format, 8–12 min), and the format differs from
the previous lesson's corner.

### 7.3 Difficulty ladder (BL, SOLO)
In Harjuta the first task is level ≤ 2 and the last is level ≥ 3; Kasuta's main task is level 4. Avasta has at least
one level-1 (noticing) and one level-3 task.

### 7.4 Washback limit (WB)
In teaching lessons Harno-format tasks (corner + any other exam-shaped task) take ≤ 25 % of the lesson minutes. Exam
lessons are exempt. The rest of the time builds ability (input, output, fluency, language focus) — that is what moves
a learner from 60 % to 80 %; format practice alone does not.

---

## 8. Measurable variety and alignment rules (for a test)

Inputs: `MODULE` and `LESSONS` from `admin/course/b1/moduleNN.js` (each lesson: `canDo`, `goals`, `discover`,
`practice`, `transfer`; each block: `type`, `goal`, `data.instruction`, `data.title`) plus the new tags in §9.
„Task” = a block that is not `text`, `tip`, `vocab`, `phrasebank`, `review`, `rubric`, `selfcheck`, `notice`
(notice counts as G01 only for V3). „Teaching lesson” = not `assessment`.

| Id | Rule | Exact check | Scope |
|---|---|---|---|
| **V1** | No two consecutive lessons with the same ordered sequence of task types | for consecutive teaching lessons (also across modules), the ordered list of catalogue ids per phase differs in **every** phase; and the normalised edit distance of the whole-lesson sequences ≥ 0.4 | course |
| **V2** | Phases open differently | consecutive teaching lessons do not open the same phase with the same catalogue id (after `review`, `text`, `tip`, `vocab`) | course |
| **V3** | Each module uses many task types | the 4 teaching lessons of a module use ≥ 20 distinct catalogue ids, with ≥ 3 from each of R, L, W, S and ≥ 4 from G | module |
| **V4** | Nothing dominates | no catalogue id > 12 % of a module's tasks; no block type > 20 % | module |
| **V5** | Archetype rotation | §4.1 rules 1–4 (consecutive differ; 4 distinct a module; the 4 input→output pairs once a module, module 18 relaxed; course counts per §6.2) | module, course |
| **V6** | Harno format coverage | per §6.4: totals, variant minimums, max gap; formats counted from exam lessons (by the block's `tag.harno`) and corners; exam lessons from module 9 time every part (`exampart`), mocks have all four parts | course |
| **V7** | No instruction text repeated | normalise `data.instruction` (lowercase, collapse spaces, strip digits, quoted words and text in brackets); no normalised instruction appears in two different lessons. **Exempt:** the official Harno instruction of an exam task in exam lessons (one fixed wording per format, kept in a whitelist) | course |
| **V8** | No exercise item repeated | no item sentence (choice question, gap sentence, T/F statement, transformation row) appears verbatim in two lessons, except inside `review` blocks (planned retrieval) | course |
| **V9** | Tasks map to the lesson's can-do | every task has `goal` ∈ the lesson's `goals`; every goal has ≥ 2 tasks; the main Kasuta task's goal is the can-do goal; the can-do's verb matches the main Kasuta task's skill (verb map: *räägin, lepin kokku, küsin, selgitan suuliselt* → S; *kirjutan, vastan kirjale, täidan* → W; *saan aru (kuuldust)* → L; *loen, leian tekstist* → R) | lesson |
| **V10** | Smooth path to the goal | each phase has ≥ 1 task whose goal is the can-do goal; Harjuta ladder per §7.3 (first ≤ 2, last ≥ 3); Kasuta has no task of level ≤ 2 | lesson |
| **V11** | Four strands | §7.1 minute shares | lesson |
| **V12** | Exam corner and washback | §7.2 and §7.4 | lesson (modules 6–18) |
| **V13** | Spaced retrieval | `review` present in Avasta; ≥ 1 review item from the previous lesson and ≥ 1 from a module 2–4 back (tag `from: 'a2b1-0NN'`) | lesson |
| **V14** | Vocabulary level | ≥ 90 % of a module's vocab-box words are in EKI's põhisõnavara (PSV) list or in an earlier module's list; others are marked as topic words. *Built against the EKI etLex A1–B1 lists (CC BY, already in the repo) — PSV is not available as an offline list* | module |
| **V15** | Caps (existing v4) | errorfix ≤ 2, translation ≤ 1, dictation ≤ 2 a module; a form/sentence drill at most once a lesson in Kasuta = 0 | module |

V1–V5, V7–V9, V13, V15 can be checked from data alone. V6, V10–V12 need the new tags (§9). V14 uses the EKI etLex A1–B1
word forms (`worksheet-studio/didactics/levelForms.{A1,A2,B1}.json`, CC BY) as the stand-in for PSV, plus the
course's own cumulative vocab boxes.

As built (`worksheet-studio/didactics/finalShape.js`): every rule is split into named checks (`V5-pairs`, `V12-corner`,
`V13-spaced` …) so the baseline and the summary show what exactly is missing. Choices made where §8 was open: the can-do
goal is `g_use` unless a lesson sets `canDoGoal`; the main Kasuta task is the one tagged `main`, else the last S/W task of
Kasuta; „exam-shaped” time for washback (V12) counts only `harno`-tagged tasks; V10 also checks §7.3 (Avasta level 1 and
3, Kasuta main task level 4); V15 counts any G task in Kasuta as a drill; §4.1 rule 6 (AVAS where the module's grammar
comes in) is not automated.

---

## 9. What has to change in code

Status 2026-10-26 (`agent/final-shape-gates`): items 1–4 built, 5–6 open.

| Item | Status | Where |
|---|---|---|
| 1 Tags | built: `tag(block, { task, harno, level, fluency, main, topic })` on `block.tag`; review items `[text, from]` | `admin/course/blocks.js`, catalogue `worksheet-studio/didactics/taskCatalogue.js` |
| 2 Lesson fields | built: `archetype`, `lead`; `shape()`, `withShapes()`; carried into sheet meta | `blocks.js`, `registry.js` |
| 3 Gates | built: V1–V15 in `didactics/finalShape.js`; baseline `admin/course/finalShapeBaseline.json` (1359 known problems, new ones fail); `admin/course/finalShape.test.js`; summary `npm run course:final-shape` | |
| 4 Rubrics and exam formats | built: `B.rubricW1/W2/Speaking` (8/12/20, 80 % target), `B.examPart` (minutes per part, timer), `B.adsmatch` (R1), `B.examListen` (L1/L2/L4), `B.bankText` (R3b/R4), `B.examWriting` (W1a/W1b/W2a/W2b card), `B.ideaCard` (S1b), `B.phoneCards` (S2) — blocks in `engine/blocks/harno.jsx`. Per-skill raw scores into the learner's progress: **not yet** | |
| — | the author's block order is kept: `registry.js lessonOrder` moves only the rubric and the self-check to the end (audit problem 1; measured: the built order changes on 41 of 255 B1 sheets, so most of the „speak → write” endings are in the content itself) | `registry.js` |
| 5 Content | open | content agents, module by module |
| 6 Audio | the audio tool now also builds `examlisten` recordings | `tools/listening-audio/plan.mjs` |

Original list:

1. **Tags on blocks** (builders in `admin/course/blocks.js`): `task: 'R03'` (catalogue id; a default per block type
   when missing), `harno: 'R3a'` on exam-format tasks, `level: 1–4` (default per catalogue id), `fluency: true`,
   review items `from`. Helper `tag(block, { task, harno, level })` like `why()` and `teach()`.
2. **Lesson fields:** `archetype` (LUGU…PROJ, EKS, PROOV), `lead: { input: 'L'|'R', output: 'S'|'W' }`.
3. **Gates:** a new `didactics/finalShape.js` (or `quality.js` `finalShapeProblems`) with V1–V15, first in the quality
   baseline (known problems shown, new ones blocked), like the earlier gates; a test in `course.test.js`.
4. **Rubrics:** the exam-scale rubrics of §2.4 as builders (`B.rubricW1`, `B.rubricW2`, `B.rubricSpeaking`) and the
   per-skill raw scores into the learner's progress.
5. **Content (Codex / content agent):** B1 module 1 (001–005, entry diagnostic), then modules 2–18 against §6.2–6.4;
   mocks 060, 080, 089 and final 090 as full timed Harno B1 forms with new texts.
6. **Audio:** every listening exam task needs a recording of the right length (L2 2–3 min, L3 3–3.5 min, L4
   2.5–3 min) via `tools/listening-audio/build.mjs`.

## 10. Owner decisions and open questions

- **Decided 2026-10-26:** the course certificate (lesson 090) requires **≥ 80 % in every exam part** (the strict rule);
  the exam blocks show this target (`PASS_SHARE` in `engine/blocks/harnoScales.js`).
- **Decided 2026-10-26:** module 1 (001–005) = entry diagnostic + A2 consolidation. Built in `b1/module01.js`
  (`agent/b1-m01-diagnostic`): 001 EKS entry test (A2 short form + one B1 preview task per skill, timed, profile by
  skill and grammar area), 002 AVAS R→W, 003 RÄÄK L→S, 004 PROB R→S, 005 EKS module check (A2). Module 1 has three
  teaching lessons, so V5 asks for three archetypes and three lead pairs there.
- Exact Harno raw-point split for B1 writing and speaking criteria is not public; our rubrics in §2.4 are an inference
  and can be adjusted after the owner's or a Harno-trained rater's review.
