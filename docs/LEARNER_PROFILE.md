# Learner profile („Õpilase pilt”)

Owner 2026-10-23: „то, что выведет платформу на новый уровень”. One picture of what a student knows, forgets and gets
wrong, which every other part reads: the teacher before a lesson, the daily review, the next worksheet, the parent's view.
Built only from data the CRM already has; it writes nothing of its own.

## Version 1 (agent/learner-snapshot)

`crm-v2/src/features/learner/learnerSnapshot.js` (pure) → `LearnerSnapshotCard.jsx`.

| Part | Source | Rule |
|---|---|---|
| Last own practice | `studentWords.reviewedAt`, `worksheetAssignments.completedAt` (or `updatedAt` while in progress), `homework.submittedAt` of „Tehtud” | newest of them, „täna / eile / N päeva tagasi” |
| This week | the same, last 7 days | words practised, sheets, homework |
| Words | `studentWords` | learned = box ≥ 3; forgotten = box 0 after at least one review; due = `dueAt` passed |
| Sheet errors | `worksheetAssignments` done in 14 days, `errorLog` + `worksheetDoc` | `describeAutoErrors` (engine/errorText.js), 3 lines per sheet, newest 5 sheets |
| Homework | `homework` | open = not „Tehtud/Suletud”; overdue = `due` + 1 day passed |
| Last lesson | lesson journal (`lessons`) | newest held („Toimunud” or no status): date, topic, notes |
| Signals | all of the above | no own practice for 7 days, forgotten words, overdue homework, a sheet under 70 % — else „õpib järjepidevalt” |

Shown in Live Classroom → Tööruum → „Õpilane” (opens first when a student is picked; „Pane kordamine tahvlile” makes a
board page „Kordamine DD.MM” with the forgotten words on a note) and on the student card → „Ülevaade”.
Each source loads on its own; one the user may not read (another teacher's journal) is left out with a note.

## Known gaps

- „Kordamine” (self-study/reviewStore.js) keeps its results in the browser only: invisible here.
- Last sign-in is not in Firestore (Firebase Auth metadata only, admin SDK): needs a small function or a presence write.
- English courses have no lesson word lists yet, so their words come only from what the teacher adds.

## Next steps (in order)

1. Daily 5-minute review from the profile (forgotten + due words, 2–3 new), shown on the student's home „Täna”.
2. Sheet errors become review items (the wrong answer → a word or a sentence card), so an error comes back a week later.
3. The next worksheet gets 2–3 tasks on what this student forgets.
4. Parent view: words known, growth this month, one weak point.
