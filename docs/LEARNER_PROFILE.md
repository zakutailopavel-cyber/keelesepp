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

**Since agent/ulesanded-path (owner 2026-11-10 „делай Ülesanded как дуалинго”) — „Ülesanded” is a path:**
`homework/LearnerTasksPage.jsx` + the pure model `homework/taskPath.js` (on top of `taskList.js mergeTasks`, data and
actions unchanged). On top ONE „Järgmine samm” (the home's green `.sh-step` card, one big button, „umbes N min”); below
„Sinu tee”: one node per lesson (a lesson's Avasta / Harjuta / Kasuta sheets are one node, 1/3 · 2/3 · 3/3 with a meter,
the teacher's words once per lesson; free homework given in the same Live Classroom lesson — same `invitationId` —
stands in that node; anything else is its own small node). Newest lesson first (lessons given together: course order).
Work whose deadline (else the day it was given) is more than `OLD_DAYS` = 14 days ago folds into „Vanad ülesanded (N)”
— still doable, a gentle „hilinenud” label instead of the red „Tähtaeg oli N päeva tagasi”; done work folds into
„Tehtud (N)” with the teacher's real grade / comment (opens by itself when there is new feedback). The ONE order of open
work is `pathQueue` (started sheet → deadline within 2 days or missed in the last 14 → the monologue → newest lesson,
Avasta first → the rest → old), and `nextStep.js homeworkQueue` uses the same order, so „Täna”, „Harjuta” and
„Ülesanded” name the same next task; their `to` opens that very task (`/homework?ava=<taskKey>` starts the sheet).
Word-card tasks (`isWordTask`: structured `homework.kind|practice === 'words'` if ever written, else the teacher's
words — „sõnakaart…”, „korda / õpi / harjuta … sõn…”, „повтори слова”) get „Ava kaardid” →
`/student/harjuta?kaardid=<homeworkId>` (`students/WordTaskCard.jsx`): the cards of that lesson's words
(`studentWords.invitationId`), else today's queue; the finished session sets the homework to „Tehtud” (the same status
write the student's own „Tehtud” does — no rules change), „Tehtud” / „Lisa vastus” stay as quiet links. Lab:
`/tasks-lab.html` (fake data, `src/test/tasksLab/`).

**Since agent/student-tana (owner 2026-11-09) — the current shape:** the daily practice lives in its own tab
**„Harjuta”** (`/student/harjuta`, `StudentPracticePage.jsx` + `PracticeFlow.jsx`, menu item right after „Täna”; the
cabinet's own Card / Button / Badge look). The home „Täna” keeps its structure and look (one next-step card, the pet,
„Minu õppimine” rows, the timetable); its next step and the words row lead into „Harjuta” when practice is next.
The only decider is `features/students/nextStep.js` (`todaySteps` for Harjuta, `nextStep` for home's card and the walking
pet's hint, `homeSections` for home's rows; `todayPath.js` is gone). Harjuta's steps in order: a lesson now (an
interrupt „Ava tund”, not a step) → teacher homework (`homeworkQueue`: overdue, due soon, the monthly monologue, the
rest) → words (the SRS daily queue of his own words, `FlashcardSession`) → „Laused ja grammatika” (one `PracticeLesson`:
course items of the level he works towards and his current module, `practice/studentPractice.js`, plus up to three of
his own wrong sentences from BOTH sources, `practice/engine/ownSentences.js`) → „Kursus” (self-study cards only).
Empty steps are skipped; a step is ticked by real data (work submitted today, the day's cards answered) or by the
stored tick; „Hiljem” puts one off for the browser session. The pet reacts after each step and thanks at the end.
The monthly monologue now reaches the decider on home and in Harjuta (it was never passed before).
Progress: `users/{uid}.practice.today { date, day, done, xp }`, `practice.xp`, `practice.learnDays`
(`practice/progress.js`, `presence.saveToday`; rules `validPracticeToday`: ≤ 30 XP a day, total only grows by the
day's gain, day never backwards nor > 1 day ahead of the server). XP = right word cards / sentence items from
`announcePractice` (`PracticeRecorder` in AppShell), homework XP stays derived (`petModel.js`). One progress meter: the
pet's level (`petProgress({ practiceXp })`); the streak = days in `learnDays`. The pet asks for nothing any more
(`petRequest` removed); Lemmik keeps care, wardrobe and topic games, „Toida” uses `FlashcardSession` and „Paranda” the
practice lesson. „Minu vead” is the merged list + the same practice lesson; „Sõnad” is the library (no own „Täna”
hero; the daily reminder is in „Seaded” and opens „Täna”).

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
