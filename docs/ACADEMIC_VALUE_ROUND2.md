# Academic value, round 2: the second pass over the B1 and B2 modules

Round 1 (`docs/ACADEMIC_VALUE_ROUND1.md`) brought every B1 module through the academic-value gates. A learner's-eye
review of the finished B1 course (2026-11-03) found what those gates let through; the standard is
`docs/COURSE_DESIGN_COMMUNICATIVE.md` §13.9, the gates are the round-2 section of `admin/course/academicValue.js`
(thresholds `AV2`). This file is the work order and the per-module contract. Round 1's contract (§2 there) still holds;
this file adds the round-2 gates to it.

## 1. What the review found and the gate for each

| finding (B1, 2026-11-03) | gate | threshold |
|---|---|---|
| ~10 / 36 sampled lessons are an unchanged cast episode + a 50–100-word fact box | `av-boltedon` (lesson) | a cast-free main text of the stage's length (A2+ 80, B1- / B1 120, B1+ 150, B2- / B2 180 words); „Kas teadsid?”, tip, chart, opener and „Ülle” do not count |
| openers read like statistics dumps (30 numbers in 242 words) | `av-opener-numbers` | ≤ 8 numbers in the opener body |
| the same four „Mõtle kaasa” questions everywhere | `av-thinkvary` (module + course) | ≥ 3 question kinds an opener; home question in the same slot ≤ ⅓ of a course's openers; same kind sequence ≤ 3 openers |
| „sinu kodumaa” in 63 lessons | `av-homecountry` | „kodumaa” (any case) ≤ 2 a module |
| Kasuta: phone call 62 / 90, call + letter 44 / 90 | `av-kasuta2` | ≥ half of the Kasuta sheets with no phone task; ≤ half ending with a letter / e-mail |
| retelling 24 (broad 29) vs 18, in other words | `av-retell2` | any repeated retelling ≤ 1 a module |
| one radio host („Ülle”) in 51 lessons | `av-voices` | one recurring voice opens ≤ 2 listening texts; ≥ 1 listening text without a recurring voice |
| the same facts in several modules | `av-fact-dup` (course, B1 + B2) | a key fact (`FACT_KEYS`) or a near-duplicate fact sentence in one module only |

What each gate reads and its word lists are in `academicValue.js` (comment at the top of the round-2 section) and in
§13.9. Question kinds (`thinkType`): `home` (kodumaa, „mõnes teises riigis”, „riigis, mida sa tead” …), `compare`,
`problem` („Mida peaks … tegema?”, „Mida sa teeksid?”), `prediction` („tulevikus”, „20 aasta pärast”), `reaction`
(„Mis sind üllatas?”), `opinion` (round 1's opinion cues), `experience` (the learner's own life).

## 2. Order

1. **B1 modules 1 → 18, second pass** (`admin/course/b1/module01.js` … `module18.js`). Each module already passes round 1;
   the second pass makes it pass round 2 too, without breaking round 1.
2. **B2 modules.** Modules still in round 1 aim for the round-2 gates in the same PR (the B2 agents were told these rules);
   modules whose round-1 PR is merged get a second pass after B1. A B2 round-1 PR that already passes every round-2 gate
   regenerates the round-2 baseline too (§3), so the module leaves it.
3. **Course-level** last: `av-thinkvary` (course) and `av-fact-dup` clear as the modules are rewritten; check them with
   `ACADEMIC_ROUND2_REPORT=summary` after every few modules.

Owner's priority wins: a module being taught right now may jump the queue. Never take a module someone else has an open
PR for (`gh pr list`). At most 2–3 module PRs open at a time.

## 3. Per-module contract (round 1 §2 + round 2)

**Branch and PR:** one module = one branch `agent/av2-<course>-module-NN` from fresh `main` = one PR (English title
„B1 module NN: academic value round 2”), not merged by the agent.

**Allowed and forbidden files:** as round 1 §2, plus `academicValueRound2Baseline.json` (regenerated). The gates and the
engine (`academicValue.js`, `academicTopics.js`, `quality.js`, `blocks.js`) stay forbidden: a gate that looks wrong is
described in the PR, not changed.

**What to write (in this order):**

1. Read both reports for the module (§4).
2. **Opener:** cut it to ≤ 8 numbers — keep the 3–5 that carry the topic, say the rest in words or move them into a
   `B.chart` with its source. Rewrite „Mõtle kaasa” to ≥ 3 kinds and not the course's usual order (e.g. start with a
   prediction or a problem, put the other-country question last or leave it out of this opener). The comparison question
   asks about „mõnes teises riigis” / „riigis, mida sa hästi tead” rather than „sinu kodumaal”.
3. **Every teaching lesson:** a real main text from outside the story (§13.9) — not a fact box added to the cast scene.
   A cast scene may stay as the frame when the lesson also reads or hears a real text.
4. **„kodumaa”** ≤ 2 in the module; use the wordings in §13.9.
5. **Retelling** ≤ 1 in any wording; replace the others with a timed opinion, a picture talk, an interview of the partner,
   a ranking, a problem to solve.
6. **Kasuta:** at least half of the sheets with no phone task, at most half ending with a letter; use the §3 task menu
   (negotiation, survey and report, advice column, mini-project, debate, presentation, a plan to choose).
7. **Listening:** one recurring voice („Ülle”, Liis, Sofia …) opens ≤ 2 listening texts; at least one listening text is a
   news item, interview, street poll or expert with no cast name (`tag(…, { voice: 'news' | 'interview' | 'expert' })`).
   New and changed transcripts get new audio (round 1 §2).
8. **Facts:** run `ACADEMIC_ROUND2_REPORT=dups` — no fact in this module may repeat one from another module (B1 or B2).
   Keep the earlier module's fact and choose another one here, or refer back without restating it.
9. Keep stable block ids for kept tasks; new blocks get new ids.

**Done when all hold:**

- `ACADEMIC_REPORT=<module id>` (round 1) and `ACADEMIC_ROUND2_REPORT=<module id>` (round 2) both print `PASS`; after
  `UPDATE_ACADEMIC_ROUND2_BASELINE=1 …` the module's key is gone from `academicValueRound2Baseline.json`, and no
  `av-fact-dup` line names one of its lessons in `course:b1` / `course:b2`.
- Everything round 1 §2 „Done when” lists (course report READY, `npx vitest run src/features/worksheet-generator
  src/features/worksheet-studio`, language check, facts with sources in the PR).

Publishing follows round 1 §3 (the agent does not publish).

## 4. Running the round-2 report

```
cd crm-v2
# one module (or b1 / b2 for a whole course)
ACADEMIC_ROUND2_REPORT=a2b1-module-05 npx vitest run src/features/worksheet-generator/admin/course/academicValueRound2Gate.test.js --silent=false --reporter=verbose
# counts per gate for every module, and the course-level problems
ACADEMIC_ROUND2_REPORT=summary npx vitest run src/features/worksheet-generator/admin/course/academicValueRound2Gate.test.js --silent=false --reporter=verbose
# the repeated facts, with both sentences
ACADEMIC_ROUND2_REPORT=dups npx vitest run src/features/worksheet-generator/admin/course/academicValueRound2Gate.test.js --silent=false --reporter=verbose
# after the rewrite
UPDATE_ACADEMIC_ROUND2_BASELINE=1 npx vitest run src/features/worksheet-generator/admin/course/academicValueRound2Gate.test.js
```

**Baseline rules** (`academicValueRound2Baseline.json`): a problem not in the baseline fails the test; a module with no
round-2 problem left must not be in the baseline; a fixed problem of a module that still has others only prints a warning
(B2 round-1 PRs run in parallel and should not break on it) — regenerate the baseline in every module PR anyway.
Course-level problems sit under `course:b1` / `course:b2`; a repeated fact is listed with the later module's course and
lesson, so a rewrite that adds a fact already used in a later module fails until one of the two changes.

## 5. Status

2026-11-03, when the gates came (main 36aaff7): 0 / 18 B1 and 0 / 18 B2 modules pass every round-2 gate; all 36 modules
and both course groups are in `academicValueRound2Baseline.json`.

Problems per module (counts; `av-thinkvary` per module is the opener check):

| B1 | boltedon | homecountry | kasuta2 | opener-numbers | retell2 | thinkvary | voices |
|---|---|---|---|---|---|---|---|
| 1 | 0 | 1 | 2 | 1 | 1 | 0 | 1 |
| 2 | 1 | 1 | 1 | 1 | 0 | 0 | 1 |
| 3 | 0 | 1 | 1 | 1 | 1 | 0 | 1 |
| 4 | 0 | 1 | 1 | 1 | 1 | 0 | 2 |
| 5 | 0 | 1 | 0 | 1 | 1 | 1 | 2 |
| 6 | 2 | 1 | 0 | 1 | 1 | 0 | 2 |
| 7 | 2 | 1 | 0 | 0 | 1 | 0 | 1 |
| 8 | 1 | 1 | 0 | 1 | 1 | 0 | 0 |
| 9 | 0 | 0 | 0 | 1 | 1 | 1 | 1 |
| 10 | 0 | 1 | 0 | 1 | 1 | 1 | 1 |
| 11 | 0 | 1 | 0 | 1 | 1 | 0 | 1 |
| 12 | 0 | 1 | 0 | 1 | 1 | 0 | 1 |
| 13 | 0 | 1 | 0 | 0 | 1 | 1 | 0 |
| 14 | 0 | 1 | 0 | 1 | 1 | 0 | 1 |
| 15 | 0 | 1 | 0 | 1 | 1 | 0 | 0 |
| 16 | 1 | 1 | 0 | 1 | 1 | 0 | 1 |
| 17 | 2 | 1 | 0 | 0 | 1 | 0 | 1 |
| 18 | 1 | 1 | 0 | 1 | 1 | 1 | 1 |
| **modules failing** | 7 | 17 | 4 | 15 | 17 | 5 | 15 |

| B2 | boltedon | homecountry | kasuta2 | opener-numbers | retell2 | voices |
|---|---|---|---|---|---|---|
| 1 | 1 | 1 | 1 | 1 | 1 | 0 |
| 2 | 0 | 1 | 2 | 1 | 1 | 0 |
| 3 | 0 | 1 | 0 | 1 | 1 | 0 |
| 4 | 2 | 0 | 2 | 0 | 1 | 0 |
| 5 | 1 | 0 | 1 | 0 | 1 | 0 |
| 6 | 2 | 0 | 0 | 0 | 1 | 0 |
| 7 | 1 | 0 | 1 | 0 | 1 | 0 |
| 8 | 1 | 1 | 1 | 0 | 1 | 1 |
| 9 | 2 | 1 | 1 | 0 | 1 | 1 |
| 10 | 1 | 0 | 1 | 0 | 1 | 0 |
| 11 | 1 | 1 | 2 | 0 | 1 | 0 |
| 12 | 1 | 0 | 2 | 0 | 1 | 0 |
| 13 | 2 | 0 | 1 | 0 | 1 | 1 |
| 14 | 0 | 1 | 1 | 0 | 1 | 0 |
| 15 | 2 | 0 | 1 | 0 | 1 | 2 |
| 16 | 4 | 0 | 0 | 0 | 1 | 1 |
| 17 | 2 | 0 | 1 | 0 | 1 | 1 |
| 18 | 3 | 0 | 1 | 0 | 1 | 0 |
| **modules failing** | 15 | 7 | 15 | 3 | 18 | 6 |

B2 modules 4–18 have no opener yet (round 1 adds it), so `av-opener-numbers` and `av-thinkvary` will show up there as
round 1 lands. Every B2 module has 4–8 repeated retellings (mostly „räägi sama … uuele paarilisele” and „salvesta kaks
korda”).

Course level: B1 `av-thinkvary` — the home question is in slot 2 in 12 of 18 openers (cap 6); 4 openers share the kind
sequence opinion-home-opinion-opinion (cap 3). B2: none yet (3 openers).

Repeated facts (`ACADEMIC_ROUND2_REPORT=dups`):

- ID card + mobile-ID / Smart-ID: B1 3 (`012_p_reg`) → B1 4 `019_p_know`, 9 `041_d_open`, 11 `054_d_forum`, 15
  `073_p_evote`, 17 `081_d_open`, B2 2 `007_p_guide`;
- igaüheõigus: B1 4 (`017_p_nature`, `016_d_open`) → B1 10 `046_d_open`;
- digital signature: B1 11 `054_d_forum` → B1 15 `071_d_open`, B2 12 `058_d_guide`;
- „Teeme ära!”: B1 12 `059_p_know` → B1 17 `085_p_r2text`;
- Mother's / Father's Day dates: B1 2 `006_d_opener` → B1 18 `086_d_open`;
- 15-day answer to a consumer complaint: B1 6 `029_p_rights` → B1 11 `054_t_know`; consumer disputes committee: B1 6 →
  B2 2 `008_p_advice`;
- sleep 7–9 h (Tervise Arengu Instituut): B1 7 `033_t_know` → B1 8 `038_d_article`;
- 11 hours of rest in 24 (work contracts act): B1 4 `018_p_know` → B2 1 `002_t_column`, `005_p_read`;
- time-use survey (who is counted): B1 1 `002_d_open` → B2 1 `005_p_read`.

X-tee appears twice, but only inside B1 module 15 (opener + „Kas teadsid?”), which the cross-module gate allows.
