# „Teekond sihttasemeni” — progress estimate to the target level

Owner decision 2026-11-04. An **estimate, not an exam**, shown **only to the administrator** on the student card
(„Ülevaade”, under „Õpilase pilt”). Teachers, students and parents never see it. Nothing is written; it reads only data
the admin already reads elsewhere (`worksheetAssignments`, `lessonRecordings`, `petLessonStats`, `studentWords`,
`curriculum`). No new collection, rule or index.

Code: `crm-v2/src/features/students/skillEstimate.js` (pure, tests in `skillEstimate.test.js`),
card `SkillEstimateCard.jsx`. Change the code and this page together.

## Levels

The card's Estonian track (`enrollments[]` with subject „Eesti keel”, or the only enrollment) gives `level` and
`targetLevel`; else the card's own `level` / `targetLevel`. A missing target means „the next level” (same rule as
„Minu areng”, `levelProgress.js` `coursePath`). The card says when a level or target is missing.

`steps` = number of CEFR levels between level and target (A2 → B1 = 1, A2 → B2 = 2). Level ≥ target → every skill 100 %.

## Formula (three steps)

1. **Measure** each skill from its own recent evidence (0–100).
2. **Band**: `band = clamp((measure − low) / (high − low) × 100, 0, 100)` — `low` is „start of the step”, `high` is
   „ready for the next level” on the material of the course he works on now.
3. **To target**: `pct = round(band / steps)`.

A skill below its minimum data shows „vähe andmeid”, not a number. **Average** = mean of the skills that have a number.

| Skill | Measure | Window | Minimum | low → high |
|---|---|---|---|---|
| Lugemine | right answers / all answers in goal `g_read` of submitted sheets (`score.perGoal`) | newest 8 sheets | 2 sheets, 8 answers | 40 → 85 |
| Grammatika täpsus | 1 − (sentences with an analyser error / checked sentences) in recorded lessons (`analysis.errors` with `source !== 'teacher'`, `analysis.checked`; „Pole viga” marks applied) | newest 6 lessons | 2 lessons, 10 checked sentences | 30 → 80 |
| Kõnelemine | 0.7 × band(average Estonian share of his words, 30 → 90) + 0.3 × band(average longest sentence, 4 → target length) from `petLessonStats` (lessons with ≥ 20 learner words); a lesson without stats uses `analysis.speech` (share only) | newest 6 lessons | 2 lessons | see measure |
| Sõnavara | mean of: band(`g_vocab` right %, 40 → 85) and band(share of word cards learned = Leitner box ≥ 3, 10 → 60); a part without enough data is left out | 8 sheets / all cards | 2 sheets + 8 answers; 20 cards | see measure |
| Kuulamine | right % in goal `g_listen` | newest 8 sheets | 2 sheets, 8 answers | 40 → 85 |

Target sentence length („ready” longest sentence, words): A1 6, A2 8, B1 12, B2 16, C1 20, C2 24.

Measures are rounded to whole percent before banding (the card shows the same numbers it uses).

### Scores that are left out

Sheet scores are re-checked on load (`worksheet-studio/engine/storedScore.js` via `normalizeWorksheetAssignment`). A goal
result is still skipped when `ok > total`, `total ≤ 0`, or the sheet has no own copy to re-check and says 0 right of
many while answers were given (an old broken score). Unsubmitted sheets never count.

## Trend

The same estimate computed with only the data dated at least 28 days ago (sheets by `completedAt`, lessons by
`startedAt`, stats by `date`). Shown as „4 nädalaga +N p” when both numbers exist. Sõnavara's trend uses the sheet part
only (a card's box 4 weeks ago is not stored).

## Course position

Lessons done / all lessons of the course of the step he works on (A2 learner → „B1” course; English cards → „English
B1”). Done = all three sheets submitted, or the lesson held with the teacher (`lessons.topicLessonId`). Same rule as
„Minu areng”.

## Example (unit-test fixture)

A2 → B1, reading 85–100 % (36/40), 5 lessons with 90 checked sentences of which 40 had an error, Estonian share 29–76 %
(average 52 %, longest ~8 words), 9 of 30 cards learned:
Lugemine 100 %, Grammatika 52 %, Kõnelemine 41 %, Sõnavara 40 %, Kuulamine „vähe andmeid”, average 58 %.
Grammar trend +12 (4 weeks ago 50 % of sentences had an error → 40 %).

## Limits

- Bands are a first calibration, not validated against level tests; adjust `ESTIMATE_RULES` with the owner.
- `g_listen` (2026-11-04, agent/listening-goal): the scored listening tasks of 200 lessons (A2 88, B1 63, B2 37, C1 12) report
  under it; a lesson with only one listening task, the oral supplements and lessons without listening do not. The tags
  are in the code: a lesson's published sheets (Õppevara) carry them only after the admin publishes the lesson again in
  „Kursuse tootmine”, and sheets assigned before keep their own copy (listening there counted as `g_read`). So Kuulamine
  fills up only from sheets assigned after re-publishing. English courses are not tagged yet.
- Grammar and speaking need lessons recorded and analysed by the school Mac.
- Writing (Kirjutamine) is not estimated: no automatic evidence.

# „Keeleoskus” — the level curve parents and students see (owner 2026-11-04)

Not the admin estimate above: a separate, simpler number, shown to the student and the linked parents („Minu pere” →
„Areng”) and on the student card („Keeleoskus tasemele”). Code: `crm-v2/src/features/progress-points/levelCurve.js`.
**The level comes from the coursework; a mock exam only confirms it.**

- **Course** = the course that leads to the card's target level (enrollment `targetLevel`, Estonian track first):
  A2 → `a2/lessonGoals.js`, B1 → `b1/lessonGoals.js` (a2b1), B2 → `b2`, C1 → `c1`. Its goals = every lesson's sub-goals
  (`lessonId|g_vocab`, `|g_read`, `|g_listen`, `|g_notice`, `|g_use`); B1 has 413.
- **„Oskan”** for one goal on a day: up to that day ≥ 2 submitted sheets of that lesson scored it automatically
  (`score.perGoal[goal].total > 0`; the lesson from the sheet id `ws_<lessonId>_<phase>`) and together they have
  ≥ 70 % right (`READY`). „≥ 2 tasks” is read as ≥ 2 sheets: the stored `perGoal` is per sheet, not per task.
- **Without a start point:** level % = Oskan goals / all course goals × 100.
- **Start point and corrections** = a stored `progressPoints` entry of kind `teacher` (label „Algus” for the start) or
  `estimate` (the admin's „Salvesta punkt” from „Teekond sihttasemeni”). From the newest such point A on or before the day:
  level % = A % + (100 − A %) × (Oskan goals now − Oskan goals on A's day) / (all goals − Oskan goals on A's day).
  So the start counts what the learner already knew; only goals mastered after it move the curve; never above 100 %.
  A later teacher point restarts the curve from its value (a correction).
- **Mock exam** (`kind: 'exam'`) is a marker on the chart only; it never changes the curve. The admin sees a warning on
  the student card when an exam differs from the curve (its value in that week) by more than 15 points.
- **Points:** every 7 days from the first start point or the first counted sheet, plus the start/correction days and
  today; computed in the browser from data the reader already may read (the learner's `worksheetAssignments`, the
  course goal list in the code, `progressPoints`). Nothing is stored by a writer.

Example (demo page `parent-lab.html`): start 43 % on 11.07.2026; by 3.11 he masters 138 of 413 B1 goals →
43 + 57 × 138 / 413 = 62 %; mock exam 64 % on 23.10 shown beside the curve (difference ≤ 15 → no warning).

Limits: goals scored only by the teacher (most `g_use`: writing / speaking with a rubric) have no automatic score, so
without teacher points the computed share of a course stays well below 100 % (B1: about 78 % at most). A per-goal teacher
mark („õpetaja hinnang” per goal) does not exist yet; until then the teacher corrects the curve with a `teacher` point.
Sheets without `score.perGoal` (old ones) and sheets not built from the course (no `ws_<lessonId>_` id or course
`lessonId`) do not count.

**One meaning of „Oskan” for the family and the learner** (owner 2026-11-04): the parent's „Mida õpime praegu” and the
student's „Kuu sammud” on „Minu areng” use one shared helper (`learner/goalLights.js` `monthGoalSteps` / `goalLight` /
`STEP_LIGHT`) with the same rule as the curve — Oskan = ≥ 2 sheets with an automatic result and ≥ 70 % right together;
Harjutan = a result that is not yet Oskan and ≥ 50 % (also ≥ 70 % from one sheet only); Kordame = under 50 %; Veel
tegemata = no result yet. Both show only the lights (a dot and the word), no percentages. The month = the lessons with a
sheet in the last 30 days (all sheets of those lessons count). Difference left: these cards group by the learner's
promise text (a lesson whose goals are written for the teacher shows one „Ma oskan …” step for the lesson), the curve
counts each course goal apart. Staff views keep the percentages and the older 80 % / 50 % thresholds of
`learner/monthSteps.js` (`LearnerSnapshotCard`, the admin's monthly parent report).

**Where it is shown:** the parent („Minu pere” → „Areng”, heading „<child's first name> B1 keeleoskus”) and the student
(„Minu areng”, top, „Sinu B1 keeleoskus”) see the same component (`progress-points/ProficiencyCard.jsx`); only the
wording differs. Staff see it on the student card („Keeleoskus tasemele”).
