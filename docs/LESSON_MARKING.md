# Lesson marking („Märkimata tunnid”, fast marking)

Owner goal (plan until 2026-12-04): a teacher marks a past lesson in ~10 seconds on a phone; fewer than 20 lessons stay
unmarked. This file is the contract for what „unmarked” means and for every path that writes a mark.

## One definition of „unmarked”

Code: `crm-v2/src/features/calendar/unmarkedLessons.js` — `markingSplit` (and its thin wrapper `unmarkedLessons`).
Every count and list uses it: the calendar header badge and the phone button „Märgi tunnid (N)”, the page
`/calendar/markimata`, the dashboard tile / card / attention line / teacher nudge and the phone button, the bell
reminder, the admin's menu badge (`unmarkedLessonsService.count`), „Õpetajate koormus” (`teacherLoad`). The weekly
e-mail digest (another branch) must use the same function.

- **Window**: from `MARKING_START` (= `'2026-11-01'`, owner decision 2026-11-09) up to **yesterday**. Today never
  counts. Lessons before the start are not changed or deleted — only not counted. The admin sees them under the small
  link „Vanemad (enne 1.11): N” on the page (`?vanemad=1`, the 60 days before the start: `olderWindow`). Changing the
  start is one constant (later possibly an admin setting).
- **Counted**: a past planned 1:1 occurrence (one-off or weekly series; group lessons never) without a journal record
  (`findUnmarkedLessons`: a `lessons` record for that schedule id and date, the entry's `lessonEntryId`, or a record of
  that student and teacher at about that time).
- **Excluded** (never counted, never shown to a teacher; the admin sees them in „Vajab admini” with the reason):
  | reason | when | fix on the page |
  |---|---|---|
  | `no-teacher` | the entry has no `teacherUid` | „Määra õpetaja” (patches `teacherUid` + `teacher` on the entry; a series as a whole) |
  | `teacher-gone` | the `teacherUid` is not an active admin/teacher account (disabled, in the trash, removed) — admin view only, needs the staff list | „Lõpeta sari” (series) / „Määra õpetaja” |
  | `student-archived` | the student card is archived (`active: false`) or in the trash | „Lõpeta sari” (series) / „Tühista” (one-off) |
  | `period-closed` | the day is in `financialLockedDates` | none here — corrections go through Finantsid |
  Only known facts exclude: without a staff list nobody is „gone”; a card not in the archive list counts.
- A teacher's view (`teacherUid` passed) lists exactly his entries: an entry without a teacher is never shown to every
  teacher (it was before).
- „Lõpeta sari” sets `endDate` = the day before the first listed occurrence of that series; it keeps the old value in
  `seriesEndedPreviousEndDate` (+ `seriesEndedAt`, `seriesEndedBy`) and offers a 5-second undo
  (`unmarkedLessonsService.restoreSeriesEnd`). Nothing is deleted; marks are not touched.

Loading (`crm-v2/src/services/firebase/unmarkedLessons.js`): the admin reads every weekly series
(`recurring == true`) plus one-off entries from the start of the „Vanemad” window (`date >=`) instead of the whole
schedule, the marks by `date >=`, and the context (`context()`: archived cards, staff accounts, `financialLockedDates`
from the window start; shared in flight). A teacher reads his own entries and marks (the rules need the `teacherUid`
filter). The page shows the rows first, then adds the Live Classroom evidence (`withEvidence`).

## Marking paths (all write the same record)

Every mark is `lessons/schedule_<scheduleId>_<date>_<studentId>` with `accountingSource: 'crm_v2'` (→
`syncLessonTokens`, invoices, payroll), written in one transaction with the one-off entry's status and an
`activityLog` entry, refused by the rules in a closed period (`financialDateOpen`), reversible with „Paranda märge”.
„Puudus, ei teatanud” (`Puudus_eta`, billable) is never a default anywhere.

1. Calendar lesson panel / side drawer: `lessonActions.markOccurrence` → `lessons.completeFromSchedule`.
2. Phone calendar agenda (≤ 760 px): past planned 1:1 rows have `Toimus ✓` and `Puudus ▾` (teatas ette → `Puudus_p`,
   ei teatanud → `Puudus_eta`) inline, ≥ 44 px (`QuickMarkButtons.jsx`); a 5-second undo (`lessons.removeMark`). Past
   group rows have „Kohalolu”, which opens the panel on the attendance sheet (groups stay manual).
3. „Märkimata tunnid”: oldest first, grouped by day, the same buttons, the 5-second undo, „Märgi kõik selle päeva
   tunnid toimunuks” (a confirm list, then one `completeFromSchedule` after another; stops at the first refusal). The
   admin also has „Märgi Live-tunnid toimunuks (N)” for the rows with Live evidence (same confirm + sequence).
4. Live Classroom → **server** (`functions/live-auto-mark.js`, trigger `autoMarkLiveLesson` on
   `liveLessonInvitations/{id}` update): when a 1:1 room goes `accepted → closed` with `endMark: 'held'` (the end
   panel's „Märgi tund kalendris toimunuks” ticked and the student not „Puudub”), the server finds the calendar
   occurrence — the invitation's `scheduleId` + `occurrenceDate` (set by the calendar's „Alusta tundi”), else the
   student's single planned lesson with that teacher within ±3 h of the start — and writes the same record
   (`live-auto-mark-core.js lessonRecord`: status „Toimunud”, the summary's note, `liveAutoMarked: true`,
   `liveInvitationId`), one-off schedule status, activityLog. It skips: a group room (`roomKey` ≠ invitation id), a
   group entry, no or several candidates, a cancelled / excluded occurrence, an existing record (same id, or a record
   of that student that day for this lesson), a closed day, an archived card, `endMark` missing or `'skip'`. The result
   is written back to the invitation as `autoMark { status, reason, lessonId?, at }`. The old localStorage handoff
   (`lessonHandoff.js`) stays as the fallback; when the calendar then finds the server's record it only adds the
   worksheet topic and the note (`updateDetails`).

## Rules (deploy with the functions)

- `financialLockedDates`: read by staff (was admin only) — teachers' lists leave a closed day out.
- `liveLessonInvitations` create: optional `scheduleId` (string ≤ 200) and `occurrenceDate` (`YYYY-MM-DD`).
- `liveLessonInvitations` update: `endMark` (`'held' | 'skip'`) only together with `accepted → closed`.
