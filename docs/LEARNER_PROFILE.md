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

## Where the student sees it

**Since agent/student-tana (owner 2026-11-09, „Täna”) — the current shape:** `/student` is ONE daily flow. The only
decider is `features/students/nextStep.js` (`todaySteps` for the flow, `nextStep` for a single line; `todayPath.js`
and `homeSections` are gone). Steps in order: a lesson now (an interrupt card „Ava tund”, not a step) → teacher homework
(`homeworkQueue`: overdue, due soon, the monthly monologue, the rest) → words (the SRS daily queue of his own words,
`FlashcardSession`) → „Laused ja grammatika” (one `PracticeLesson`: course items of the level he works towards and his
current module, `practice/studentPractice.js`, plus up to three of his own wrong sentences from BOTH sources,
`practice/engine/ownSentences.js`) → „Kursus” (self-study cards only). Empty steps are skipped; a step is ticked by real
data (work submitted today, the day's cards answered) or by the stored tick. `TodayPanel.jsx` runs them with one button
„Alusta tänast”; the pet reacts after each step and thanks at the end. First screen: the „Täna” card, today's lesson
time, the pet card; teacher feedback / announcements / an unpaid invoice only as quiet lines below.
Progress: `users/{uid}.practice.today { date, day, done, xp }`, `practice.xp`, `practice.learnDays`
(`practice/progress.js`, `presence.saveToday`; rules `validPracticeToday`: ≤ 30 XP a day, total only grows by the
day's gain, day never backwards nor > 1 day ahead of the server). XP = right word cards / sentence items from
`announcePractice` (`PracticeRecorder` in AppShell), homework XP stays derived (`petModel.js`). One progress meter: the
pet's level (`petProgress({ practiceXp })`); the streak = days in `learnDays`. The pet asks for nothing any more
(`petRequest` removed); Lemmik keeps care, wardrobe and topic games, „Toida” uses `FlashcardSession` and „Paranda” the
practice lesson. „Minu vead” is the merged list + the same practice lesson; „Sõnad” is the library (no „Täna” hero; the
daily reminder is in „Seaded”). Menu: Täna · Ülesanded · Suhtlus · Rohkem (Sõnad, Minu vead, Kursus, Lemmik, Minu
areng, Tahvel).

Earlier history:

Since agent/student-home (owner 2026-11-01): the home page `/student` shows only today (`features/students/nextStep.js`: one next
step, the next lesson, at most three checks, a line only when there is news). „Minu areng”, „Minu sõnad ja vead”, „Kuu sammud”, „Tunni
kokkuvõtted”, „Millal sulle tund sobib?” and „Teated” moved whole to `/student/areng` (`StudentProgressPage.jsx`).

Since agent/clear-tasks: the teacher's feedback is read on „Ülesanded” (`homework/LearnerTasksPage.jsx`, group „Õpetaja vaatas üle”); „Minu areng” links there. „Kuu sammud” and task cards show a learner only what is said to him: `meta.canDo` in place of a goal written for the teacher.

The pet reads the same data and writes only its play time: `features/pet/petLoop.js` (one request a day from the lowest need, using his own words and corrected sentences; a daily line from his own numbers). Nothing it does gives XP.

## Known gaps

- „Kordamine” (self-study/reviewStore.js) keeps its results in the browser only: invisible here.
- Last sign-in is not in Firestore (Firebase Auth metadata only, admin SDK): needs a small function or a presence write.
- English courses have no lesson word lists yet, so their words come only from what the teacher adds.

## Next steps (in order)

1. Done (#742): „Päeva 5 minutit” on the student's home „Täna”.
2. Done (agent/sheet-error-cards): a submitted sheet's wrong sentences become „Sinu lause” cards.
3. Done (agent/personal-sheet-errors): „Isiklik tööleht” takes his unlearned wrong sentences.
4. Done (agent/progress-stats): words learned, new this month and mistakes fixed for the student and the family.
5. Done (agent/month-steps): „Kuu sammud” — the month's lesson goals and how well each is mastered.
