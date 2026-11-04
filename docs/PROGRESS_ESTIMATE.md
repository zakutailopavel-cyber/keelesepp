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
