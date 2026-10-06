## 2026-10-06 — B1 Avasta 001–030 quality upgrade — branch `agent/avasta-b1-module1`

Checked `origin/main` `0b5ae77`. Owner: expand the existing B1 `Avasta` sheets 001–015 and continue with 016–030 without duplicating lessons or touching `Harjuta` / `Kasuta`.
- Scope: `curriculumLessons/a2b1-001…030/worksheets/discover`, grouped as modules 001–005, 006–010, 011–015, 016–020, 021–025 and 026–030. For 001–015 the upgrade reads the existing published/manual sheet first, preserves its blocks, and adds only missing didactic stages: contextual vocabulary, general comprehension, language noticing and first controlled use. For 016–030 it does the same when Avasta exists; if Avasta is missing, it creates a complete 8–9 block worksheet with warm-up, contextual vocabulary, a 100–180 word reading, general/detail comprehension, language noticing, controlled first use, production and self-check. It refuses to exceed 9 blocks or continue after a stale-editor conflict.
- Metadata: each upgraded sheet is normalised to `Tase: B1`, module `A2 lähtepunkt ja igapäevaelu`, a concrete `Ma oskan…` statement and four measurable goals. New checkable blocks carry answer keys through existing Worksheet Studio block contracts.
- UI: admin-only maintenance page `/library/worksheet-generator/avasta-module-1` previews before/after block counts for all 30 sheets, grouped by module, and publishes each module only after explicit confirmation. Õppevara shows an admin action `Avasta 001–030 kvaliteet`.
- Safety: no new Firestore collection/rules/function. Existing `lessonWorksheetsService.publish` performs the versioned transaction and updates `worksheetPhases.discover`; `Harjuta`, `Kasuta`, assignments and curriculum source data are untouched. Production data has NOT been changed by this branch.
- Checks added: module-specific tests for 001–005, 006–010, 011–015, 016–020, 021–025 and 026–030 verify 5→9 block augmentation, preservation of existing blocks, self-check last, B1/module metadata and idempotence; module 1 also verifies fail-closed behaviour for an overlong sheet.
- Known gate: after merge/deploy, admin must open the maintenance page, review the real 001–030 previews, publish modules one by one, then open every published `Õpilase vaade` and visually check page breaks. A module is reported complete only after that visual gate.
- Next safe step: CI on the draft PR; owner merges after review, then run the admin preview/publish gate in production.

# KeeleSepp Project State

## 2026-10-06 — Student and calendar teacher choice lists real staff accounts — branch `agent/teacher-options`

Checked `origin/main` `0fa3afe`. Owner: the new teacher (Jegor) is missing from „Õpetaja” in „Muuda õpilast”.
- Cause: student pages offered only the hard-coded `LEGACY_TEACHERS` (4 names) plus names already on students.
- Fix: `students/useTeacherNames.js` — `useTeacherNames` loads `teachersService.list()` (users with role admin/teacher,
  disabled left out; admins only) and `teacherChoices` merges them with the legacy names (canonical, deduped, sorted).
  Used in `StudentsPage` (form, enrollments, filter) and `StudentProfilePage` (edit form). Groups/parents already used
  the staff list. No data or rules change.
- Calendar: the admin's „Filtreeri õpetaja järgi” listed only teachers who already had lessons; it now also lists
  active staff accounts (deduped by uid/canonical name), so a new teacher's calendar and green/yellow/red windows
  can be opened. The „Uus tund” teacher select already used the staff list; a student assigned to the teacher gets
  `teacherUid` by name (`resolveTeacherUid`), so planned lessons go to that teacher.
- Checks: students tests 49/49 (new hook test); calendar tests: new „new teacher without lessons” test passes, only
  the known Node 26 `localStorage` failure („Alusta tundi”); `npx eslint .` clean; build OK.
- Note: a teacher appears only after the account is approved with role „teacher” (Uued kontod / Õpetajad).
- Next safe step: owner merges the draft PR.

## 2026-10-06 — Õppevara: Avasta / Harjuta / Kasuta on the lesson card — branch `agent/library-phases`

Checked `origin/main` `da425fe`. Owner/handoff: teachers could not see which lesson sheets exist, which are published
and what they are called; the sheets were behind „Töölehed”.
- Data: `lessonWorksheetsService.persist` now also writes `curriculumLessons/{id}.worksheetPhases.{discover|practice|transfer}`
  = `{ title, status, version, publishedVersion, updatedAt }` (merge, same transaction; focus sheets are not
  summarised). `syncPhases(lessons)` (admin button „Uuenda töölehtede olek”) fills it for sheets saved earlier. No
  rules change (staff already write `curriculumLessons`).
- UI (`LibraryPage`, `libraryModel`): roadmap lessons show three chips — green ✓ published, yellow ● draft, grey +
  missing — with the sheet title; tooltip/aria „«title» · Avaldatud · versioon N”. Published opens
  `/library/lessons/:id/worksheets/:phase?vaade=opilane` (student view via new `initialMode` of
  `WorksheetStudioPage`), draft/missing opens the constructor. „N/3 valmis” per lesson, module heading
  „Avasta x/n · Harjuta x/n · Kasuta x/n”, filter „Töölehed” (`?lehed=none|drafts|partial|ready`). The separate
  „Töölehed” button on those rows is gone (Vaata / Muuda / Määra stay); „Viimati muudetud” also counts sheet edits.
- Checks: library tests 28/28 (new card/filter test, model test); `lessonWorksheets` service 9/9; studio+generator
  308/308 with `--maxWorkers=2`; full suite 931 passed, 15 failed = 10 known Node 26 `localStorage` + 5 studio tests
  that time out only under full parallel load (pass alone); `npx eslint .` clean; build OK.
- Manual gate after deploy: an admin clicks „Uuenda töölehtede olek” once in Õppevara (writes the summary for the 15
  existing B1 Avasta sheets), then checks B1 filter, statuses and the student view.
- Next safe step: owner merges the draft PR.

## 2026-10-06 — Live Classroom on phones: camera/mic fallback and tap-to-play — branch `agent/mobile-call`

Checked `origin/main` `19ae77c`. Teacher bug: a student on a phone could not share camera/mic and did not see/hear the
teacher.
- Likely causes (not reproducible here, no device test): in-app browsers (Telegram, Instagram, Facebook, WhatsApp,
  Android WebView) without `mediaDevices`; mobile autoplay blocks remote video with sound until a tap; strict
  constraints failed with no fallback; `ontrack` without `streams` left the remote video empty.
- Fix: new `live-classroom/mobileMedia.js` (`inAppBrowser`, `mediaErrorMessage`, `openMedia`: preferred constraints →
  plain camera+mic → microphone only; a refused permission is not retried). `useLiveCall` and `useGroupCall` use it;
  `useLiveCall` builds a `MediaStream` from `event.track` when needed, returns `needsPlay`, `resumePlayback`,
  `audioOnly`. LiveRoom, LiveLessonCallPanel and GroupRoom show „▶ Puuduta, et näha ja kuulda / Нажмите…” when the
  browser blocked playback; own caption says „ainult heli” when only the mic opened. Error texts (ET + RU) tell
  in-app browser users to open the link in Chrome/Safari.
- Checks: `mobileMedia.test.js` 3/3; live-classroom suite 54 passed, 9 failed = known Node 26 `localStorage`
  failures (lessonLink, LiveClassroomPage, useLiveCall.channel/devices); `npx eslint .` clean; `npm run build` OK.
- Limit: not verified on a real phone. Manual gate: owner/teacher tests a lesson link on iPhone Safari and Android
  Chrome after deploy.
- Next safe step: owner merges the draft PR, then tests on a phone.
## 2026-10-06 — Calendar lesson panel: the teacher chooses the module and/or lesson, also after marking — branch `agent/lesson-topic-edit`

Checked `origin/main` `19ae77c`. Owner: in the lesson panel the teacher must be able to choose the module and/or the
lesson that was done.
- `lessonTopic.js`: `topicFromPick(catalog, { level, module, lessonId }, note)` — a lesson, or a module only
  (`topic` = module title, `topicLessonId` ''), or nothing („Individuaalne tund”); `pickFromRecord` reads a stored record
  back into the picker; `topicLine` shows a module-only topic once.
- `LessonPanel`: before marking, a module without a lesson is accepted; a marked lesson has „Muuda teemat või märkust”
  (Tase → Teema → Tund + Märkus, preview of what the student/parent see) → `lessonsService.updateDetails` (replaces
  `updateNotes` from #316; writes topic, topicLevel, topicModule, topicLessonId, notes, updatedAt/By; no billing field).
- Tests: `lessonTopic.test.js` (3), calendar test for changing a marked lesson to a module-only topic with a note.
- Next safe step: owner merges the draft PR (Vercel deploys the CRM).

## 2026-10-06 — Calendar lesson panel: the note is no longer lost — branch `agent/lesson-notes-draft`

Checked `origin/main` `42d96fb`. Teacher report (Oleksiy Skoryk): „Märkus” in the lesson panel („Mida tunnis tehti?”)
disappears when the panel/tab is closed.
- Cause: `LessonPanel` kept note, topic and homework only in component state; they were written only by „Tund toimus”
  / „Puudus”. Closing the panel (or switching lesson) dropped them. A marked lesson's note could not be edited at all.
- Fix: draft per lesson occurrence in `localStorage` (`ks-lesson-draft:<occurrenceId>`: notes, picked topic, homework),
  restored when the panel opens again, removed after a successful mark (`markDone` now returns true/false); hint
  „Mustand on selles brauseris alles…”. Marked lessons: „Muuda märkust / Lisa märkus” → `lessonsService.updateNotes`
  (notes ≤ 1000, `updatedAt/By`; not a billing field, existing rules allow the lesson's teacher and admins).
- Limit: the draft lives in the teacher's browser (another device does not see it until the lesson is marked).
- Tests: calendar tests for the draft (close/reopen/send/cleared) and for editing a marked lesson's note.
- Next safe step: owner merges the draft PR (Vercel deploys the CRM).

## 2026-10-06 — Student card „Tööd”: worksheets given but not handed in, live — branch `agent/student-works-live`

Checked `origin/main` `a4ef5b2`. Owner: a worksheet given to a student must be visible in the student's profile in its
current state, also before it is handed in.
- `StudentWorksPanel` also loads `listWorksheetAssignmentsByStudentIds`; section „Määratud, veel esitamata” lists
  assignments not `done` and not reviewed: title, given date, due date, „Alustamata / Pooleli · X/Y vastust”
  (`answerProgress`), „hilinenud” after the due date. A click opens „<title> · praegune seis” with the existing
  `LiveWorksheetView` (live subscription to the assignment: answers as the student's player autosaves them, marks only on
  answered fields, the teacher can point at a task and add notes). Handed-in works stay below and open the check window.
- No rules or data change (staff already read `worksheetAssignments`).
- Tests: StudentProfilePage (new live test) 47/47 students; ESLint clean; build OK.
- Next safe step: owner merges the draft PR (Vercel deploys the CRM).
## 2026-10-06 — Calendar: yellow windows for online lessons only — branch `agent/online-windows`

Checked `origin/main` `a4ef5b2` (after #313). Owner: green windows can also be made yellow — for online lessons only.
- `teacherAvailability` slots get a third `kind: 'online'` (yellow). `availabilityAt` → busy / online / free / open
  (red wins over yellow, yellow over green); `windowProblem(windows, lesson, teacher)` explains why a lesson cannot go
  there (red: never; yellow: only when `lesson.online`).
- Lessons get `online: true|false` (`schedule.online`; form checkbox „Veebitund (online)”, kept on edit; „· veeb” on the
  block). Creating, editing or dragging a non-online lesson into a yellow window is refused with a message; online
  lessons are allowed. Paint bar: Vaba / Ainult veebitunnid / Hõivatud; legend shows all three.
- No rules change (`slots` is a list ≤ 200; kinds are not checked by the rules). Existing lessons have no `online` flag
  (treated as not online) — mark them online when needed.
- Tests: availability model (yellow), calendar test (yellow refuses a normal lesson, takes an online one); calendar
  Vitest green except the known local Node 26 test; ESLint clean; build OK.
- Next safe step: owner merges the draft PR; the CRM deploys through Vercel (no Firebase deploy needed).

## 2026-10-05 — Calendar: students without a lesson ahead — branch `agent/unplanned-students`

Owner: make it easy for teachers to see which of their students are not in the calendar, so nobody is forgotten.
- `calendar/unplannedStudents.js`: active students (teacher's own; admin all, or the filtered teacher) with no lesson
  ahead — no non-cancelled weekly series that has not ended, no one-off lesson today or later, no group series —
  longest-waiting first (last past lesson date), paused ones left out.
- Calendar: chip „N õpilast ilma tulevase tunnita” → list with „Lisa tund” (form opens with the student) and
  „Paus…” (2 weeks / 1 month / 3 months → `students.planningPausedUntil`, new writable field). `?unplanned=1` opens it.
- Ülevaade „Vajab tegutsemist”: „N õpilast ilma tulevase tunnita” → `/calendar?unplanned=1` (dashboard now also loads
  groups so group students count as planned).
- Tests: `unplannedStudents.test.js` (2), calendar list/pause/add test; build OK.

## 2026-10-05 — Contact phone +372 5434 4155 everywhere — branch `agent/contact-phone`

Owner: the public contact number is now +372 5434 4155 instead of +372 5374 0753, everywhere.
- Replaced in `index.html`, `ru/index.html` (JSON-LD `telephone`, FAQ, contact block, footer, WhatsApp `wa.me/37254344155`),
  `kutse`, `kutse.html`, `tingimused.html`, `haldus-calendar-v3.html`, CRM `PendingApprovalPage`, e-mail footers in
  `functions/account-approval-core.js` and `functions/homework-mail-core.js`. No other occurrence left.
- Functions with those e-mails redeployed (`notifyHomeworkCreated`, `notifyPendingAccount`, `staffOperationsApi`).

## 2026-10-05 — Calendar: several students at the same time / overlapping lessons allowed — branch `agent/calendar-overlaps`

Owner: it must be possible to put several students on the same time, or let their times overlap.
- `CalendarPage`: creating, editing and dragging a lesson no longer refuses „juba teine tund” for the same teacher.
  The lesson form shows „Samal ajal on ka: 09:00 Mari … Tunnid toimuvad paralleelselt.” (`scheduleOverlaps` in
  `services/firebase/schedule.js`). The teacher's red windows (#309) still block. Overlaps are drawn side by side,
  3+ as one list card in the week view (#306).
- Tests: calendar tests updated (move onto another lesson allowed; second student at the same time with the hint).

## 2026-10-05 — Calendar: teachers mark green (free) and red (busy) windows — branch `agent/teacher-availability`

Owner: teachers mark their windows green/red so the admin plans lessons into green ones and sees that red ones are
impossible.
- Data `teacherAvailability/{teacherUid}`: `teacherUid, teacherName, slots[{ id, kind: 'free'|'busy', day: Mon…Sun |
  date: YYYY-MM-DD, start, end }] (≤ 200), updatedAt, updatedBy`. Service `teacherAvailabilityService`.
- `firestore.rules`: read staff; write admin, or the teacher for their own doc; fixed keys; `updatedBy == uid`.
  Emulator test `functions/teacher-availability-emulator.integration.js` (in `test:emulator`).
- `calendar/availabilityModel.js`: `availabilityAt` → busy / free / open (red wins), `bandsOn`, `paintSlot` (a new window
  replaces overlapping ones of the same weekday or date).
- Calendar: „Minu ajad” (teacher) / „Õpetaja ajad” (admin, with a teacher chosen in the filter) opens a bar: Vaba /
  Hõivatud, „Kordub iga nädal” (off = only that date), drag in the grid to paint, click a window to remove it. The
  teacher's windows are drawn behind the lessons (green hatched / red striped, one-day windows with a dashed edge),
  with a legend. Admin day view without a filter: teachers with windows that day get their own column.
- Rule: creating or moving a lesson into the teacher's red window is refused („<teacher> ei ole … saadaval (punane
  aeg)”); green and unmarked time are allowed. Existing lessons inside red stay as they are.
- Tests: `availabilityModel.test.js` (2), calendar page tests for the red-window block and painting; checked in
  headless Chrome. Calendar Vitest green except the known local Node 26 test.
- **Needs the owner:** `firestore:rules` deploy after merge.
## 2026-10-05 — Google Calendar: KeeleSepp → Google only — branch `agent/calendar-one-way`

Owner: lessons go from the site to Google, not back.
- `functions/index.js` `GOOGLE_IMPORT_ENABLED = false`: the hourly `syncAllCalendars`, `POST /gcal/sync` and the OAuth
  callback no longer run `syncTeacherCalendar` (no new lessons from Google events, no deletions because an event was
  removed in Google). Push (outbox, backfill, groups, `syncScheduleToGoogle`) is unchanged.
- Lessons imported earlier (`source: 'gcal'`) are KeeleSepp lessons now: `importedLessonGoogleAction(…, { importEnabled:
  false })` returns „push” when date/time/duration/repetition/student change in the CRM, so their Google event is
  patched (then `source` becomes `keelesepp`); unchanged ones are not re-written by the backfill. Delete/cancel still
  remove the Google event. `/gcal/disconnect` no longer deletes former Google lessons from the CRM.
- CRM: `isGoogleOwned` → false (move/cancel/time edit allowed), label „Algselt Google Calendarist”; Seaded Google card
  text explains the one-way sync, the „Google → KeeleSepp” row is gone.
- Tests: functions 233/233 (new core test); google-calendar/calendar Vitest green except the known local Node 26 test.
- **Needs the owner:** Cloud Functions deploy (`syncAllCalendars`, `gcalApi`, `syncScheduleToGoogle`) after merge.

## 2026-10-05 — Admin data cleanup in Seaded; homework „Suletud”; bell counts only new — branch `agent/data-cleanup`

Owner approved cleaning: students without a teacher, „Uus tööleht” topics, old homework, test conversations and the
30 notifications. Done as a tool so the admin sees the exact rows first and only ticked rows change.
- Seaded (admin) → „Andmete korrastus” (`DataCleanupPanel`, logic `cleanupModel.js`, writes `maintenanceService`):
  - active students without a teacher (record + enrollments): teacher suggested from their calendar lessons, choose
    from staff otherwise → `studentsService.update({ teacher })` (resolves `teacherUid` as before);
  - lessons whose topic is the placeholder „Uus tööleht” → topic emptied;
  - open homework with a due date over 30 days ago → status „Suletud” (`closedAt`, `closedBy`);
  - conversations with „test / smoke / outbound” in the name or a message → their `messages` deleted (admin rule).
  Every action asks for confirmation and writes an `activityLog` entry (`maintenance.*`).
- `features/homework/homeworkStatus.js` `isHomeworkOpen`: „Tehtud” and „Suletud” are closed — used by Ülevaade,
  Kodutööd, student/parent dashboards and the pet.
- Notification bell: counts only items not seen since the panel was last opened (per user, `localStorage`
  `ks-notifications-seen:<uid>`); a grey dot when only already-seen items remain. The panel lists everything as before.
- Tests: `DataCleanupPanel.test.jsx` (2); related suites 139/139; ESLint clean; build OK. No rules change.
- **Needs the owner (after merge):** open Seaded → „Andmete korrastus”, review the lists, apply.
## 2026-10-05 — Calendar week view: crowded hours readable — branch `agent/calendar-parallel`

From the live diagnostics: 3+ parallel lessons in a week column became slivers („Ars…”, „Ge…”).
- `layoutColumn` now returns the overlap `cluster` id. `TimeGrid`: in views with several columns, a cluster of 3+
  lanes is drawn as one card („N tundi korraga”) with a row per lesson (time, student, done/absent mark, teacher
  colour); a row opens the lesson panel (moving is done from there). Day view keeps side-by-side blocks. Every block
  has a hover title „time · student · teacher”.
- Tests: `TimeGrid.test.jsx` (2); calendar Vitest green except the known local Node 26 `localStorage` test.
## 2026-10-05 — Compact work-page headers and a grouped side menu — branch `agent/compact-headers-menu`

From the live diagnostics: large stat banners pushed the work lists below the fold (Kodutööd, Suhtlus, Finantsid) and
the 15-item menu hid „Õpetajad” behind „Seaded” on a 1200×655 screen.
- `PeopleOverview` (Kodutööd, Grupid, Õpetajad, Lapsevanemad, Seaded, parent/student dashboards): one light row of
  number chips instead of the dark banner (intro text kept for screen readers).
- `PageHeader compact` (smaller title) on Kodutööd, Suhtlus, Finantsid; Suhtlus' four tiles became chips.
- Menu (`app/navigation.js` `group`, `AppShell` group titles, `appShell.css`): Ülevaade / own pages, then „Õppetöö”
  (Kalender, Live Classroom, Kodutööd, Õppevara, Tahvel, Ülesanded), „Inimesed” (Õpilased, Lapsevanemad, Grupid,
  Õpetajad, Uued kontod), „Suhtlus ja raha” (Suhtlus, Päringud, Finantsid); tighter items and a fade at the bottom on
  screens under 760 px high so it is clear the menu scrolls.
- Checked in headless Chrome at 1200×655 and 1440×900 with the real shell. Tests: components/app/messages/homework/
  finance/dashboard Vitest 142/142; build OK.
## 2026-10-05 — Worksheet constructor: full-window focus mode — branch `agent/constructor-focus`

From the live diagnostics: inside the CRM shell the sheet was ~330 px wide on a 1200×655 screen.
- `WorksheetStudioPage`: focus mode (default on, remembered in `localStorage` `ks-studio-focus`) — the studio is
  `position: fixed; inset: 0` over the CRM menu and top bar; toolbar button „Näita menüüd / Täisekraan”. Modals
  (z-index 100) stay above it; print unaffected.
- Tests: worksheet Vitest 307/307; ESLint clean.
## 2026-10-05 — Skill map is staff-only — branch `agent/skillmap-staff-only`

From the live diagnostics: the student-own update rule on `students` allowed `skillMap`, `skillMapUpdatedAt`,
`skillMapLastUpdated`, so a student or parent could raise their own skills; since #299 teacher grades move the map.
- `firestore.rules`: removed the three keys from the linked student/parent branch (contact fields stay).
- Side effect: the old v1 student page (`haldus.html`, AI worksheets with `skillsToUpdate`) can no longer auto-raise
  skills from the student's browser; that call is already wrapped in try/catch, the worksheet submit is unaffected.
  Skills now move only through staff (check window „Oskused”, Live Classroom v1 lesson goals, haldus-skillmap).
- Emulator test `functions/student-skillmap-emulator.integration.js` (in `test:emulator`) passed with the words test.
- **Needs the owner:** `firestore:rules` deploy after merge.
## 2026-10-05 — Ülevaade numbers match the pages — branch `agent/dashboard-numbers`

From the live diagnostics: 114 active students on Ülevaade vs 113 in Õpilased; „3 tundi täna” while the calendar had
~15; 16 homework vs 15 „pooleli” in Kodutööd.
- Students: counted as people with `groupStudentPeople` (like Õpilased), not card records.
- Lessons: „Tunnid täna” uses the calendar's `occurrencesForDates`, so weekly lessons count (before only one-off lessons
  with today's date did); meta „N veel ees · kõik õpetajad / minu”, list „Järgmised tunnid täna” = the rest of today
  (up to 6, „+ veel N”), empty state says when today's lessons are over. Group lessons are still not on Ülevaade.
- Homework: „Kodutööd pooleli” only for students in scope (like Kodutööd), not homework of removed cards.
- Tests: dashboard counting test (fake date); Vitest dashboard 3/3.
## 2026-10-05 — Readable auto-check errors in the check window — branch `agent/readable-auto-errors`

From the live diagnostics: „Automaatselt tuvastatud vead” showed raw keys (`key: b_muqwusk4j:0.0 · answer: öppin`).
- `worksheet-studio/engine/errorText.js` `describeAutoErrors(doc, errorLog)`: „Ülesanne 3 · <title> — lause 1, lünk 1”,
  the student's answer (struck through) → the right answer (gaps/diagram `answers()`, rows/items `answer`). Works
  without a sheet fall back to the old text.
- Checked on the real „B1 test” (Aleksandr Smirnov, 8 %): the auto-score is correct — a conditional-mood gap task
  answered in the present tense; speaking blocks are not scored. No scoring change.
- Tests: `errorText.test.js`; homework/students/worksheet Vitest 150/150.
## 2026-10-05 — Every curriculum lesson gets a lesson plan in its description — branch `agent/lesson-plan-descriptions`

Checked `origin/main` `234d9cf`. Owner: check all curricula and write into each lesson's description what to do and
what to teach, so building a lesson is easier.
- Check of `data/`: A2 100, A2→B1 90, B1→B2 90, C1 100 lessons; numbering 1…N, no duplicate ids, no empty fields.
  Before: A2→B1 and B1→B2 descriptions were empty, A2 and C1 carried only the module goal/description.
- `crm-v2/src/features/curriculum/lessonPlans.js`: plan text (Russian, like the source fields) from goal, focus,
  practice, success and the lesson type (diagnostic, assessment, grammar, vocabulary, reading, listening, writing,
  speaking, argument, integrated; C1 theme/grammar/assessment): „Цель урока / Что учить / Ход урока (60 мин, C1
  90 мин) with timed steps / Результат / На что обратить внимание в модуле”. Practice items are split into the drill
  and the „use it yourself” part; diagnostics sort items into oral / understanding / writing.
- `scripts/build-lesson-plans.mjs` → `lessonPlanData.json` (380 plans, lazy chunk ~64 kB gzip). Rebuild after editing
  `data/` or the plan text.
- Õppevara (admin): „Lisa tunniplaanid (N)” → `curriculumInstallerService.refreshLessonPlans` writes the plan into
  installed lessons (`description`, `descriptionSource: 'lesson-plan-v1'`, `descriptionUpdatedAt/By`); a description a
  teacher wrote by hand is kept (only empty ones, the old module text and earlier plans are replaced). The A2 installer
  writes the plan directly. Lesson details show the plan with its lines; the preview header shows its first line.
- Old installers (`haldus-a2-roadmap`, `haldus-a2-b1-roadmap`, `haldus-b1-b2-roadmap`, `haldus-c1-curriculum`) no
  longer write `description`, so a re-install does not wipe the plans.
- Tests: `lessonPlans.test.js` (4), library admin button test; root curriculum tests 10/10; ESLint clean; build OK.
- **Needs the owner (after merge):** Õppevara → „Lisa tunniplaanid” once (admin).

## 2026-10-05 — Checking works: large check window, skill grades → skill map; student card „Tööd” — branch `agent/work-review-skills`

Checked `origin/main` `253fd50`. Owner: see the worksheets a student did and grade them so the grades move the skills
and the development map; in „Kodutööd” the work was hard to see (sheet cut off in a small modal).
- `SubmissionReviewModal` (used by „Kodutööd” and the student card): window up to 1440 px × 94vh, the student's sheet
  with answers on the left fitted to the width (annotations as before), on the right score, self-assessment, auto-found
  errors, grade 1–5, **Oskused** (Lugemine, Kuulamine, Kirjutamine, Rääkimine, Grammatika, Sõnavara + skills the map
  already has; skills the sheet's block types train are highlighted), comment. Phone: one column.
- Skill grades (`features/homework/skillGrades.js`): grade → percent (1→20 … 5→95) → the methodology rule of
  `skillmap-updater.js` (+5/+3/+1/0/−3); a skill the student does not have starts at that percent. Stored on the work
  (`skillGrades`, `skillDeltas`, `skillCreated`); `homeworkService.reviewSubmission({ …, skillGrades })` writes the
  work and `students.skillMap` (+ `skillMapUpdatedAt`) in one transaction; a re-check first takes back the previous
  check of the same work (skills it created are removed). „Areng” shows up to 12 skills.
- Student card tab **Tööd** (`StudentWorksPanel`): the student's handed-in worksheets and exercises (pending first
  count), grade and skill grades in the row, click → the check window; saving updates „Areng” at once.
- No rules change (staff already update works and their students' cards). Tests: `skillGrades.test.js` (3),
  Kodutööd review test with a skill grade, student card works test; homework+students Vitest 76/76; ESLint clean;
  build OK. Layout checked in headless Chrome at 1440 px and ~500 px with a sample sheet.

## 2026-10-05 — Student card „Tunnid”: every held lesson opens on its own — branch `agent/student-lesson-detail`

Checked `origin/main` `a32e73f`. Owner: in the lesson list each lesson should open separately.
- A held lesson row in „Tunnid” is a button → `LessonDetailModal` „Tund <date> · <time>”: mark (incl. „kontrollis …”),
  teacher, subject, duration, topic, notes, and from the same day: lesson summary, homework (`date` or `createdAt`),
  new words, and the Live Classroom recording/analysis + board page rows (`LessonsCard` filtered to that day).
  Nothing found → one line says so. The admin status select stays in the list.
- Read-only; no rules or data change. Tests: `LessonDetailModal.test.jsx` (2); ESLint clean; build OK.

## 2026-10-05 — Suhtlus: long conversations scroll again — branch `agent/messages-scroll`

Checked `origin/main` `b4bad01`. Owner: Mariam's conversation cannot be scrolled.
- Cause: `.messages-shell` is a fixed-height grid with an implicit `auto` row; the chat panel's content-based minimum
  height made the row as tall as all messages (4722 px for 40 messages vs a 658 px shell), the shell clipped it
  (`overflow: hidden`) and `.message-stream` never got a height to scroll in. Short threads were not affected.
- Fix (`messagesWorkspace.css`): `grid-template-rows: minmax(0, 1fr)` on the shell, `min-height: 0` on the chat panel
  and the conversation list. Measured in headless Chrome on a model page with the real CSS: stream 487 px, scrolls.
- No logic change; not yet seen on the live page.
## 2026-10-05 — Student card: Facebook and Instagram contact for the admin — branch `agent/student-social`

Checked `origin/main` `b4bad01`. Owner: fields for Facebook and Instagram on the student card so the admin can
contact the student there.
- `students.facebook`, `students.instagram` (username or pasted profile link; validated in the form). Admin-only in
  the form („Muuda andmeid”) and on „Ülevaade → Põhiandmed”: profile link + „Kirjuta” (Facebook `m.me/<name>` or
  `facebook.com/messages/t/<id>`, Instagram `ig.me/m/<name>`). Helpers `utils/socialLinks.js`.
- `firestore.rules` (students update, teacher branch): a teacher cannot change `facebook` / `instagram`; students'
  own-card edits already exclude them. Rules compile (emulator run of the student words test).
- Not linked to Suhtlus' Facebook/Instagram threads (those are keyed by Meta ids, not by these names).
- Tests: `socialLinks.test.js` (2), StudentProfilePage (2 new); build OK.
- **Needs the owner:** `firestore:rules` deploy after merge (the fields work before it; the rule only stops teachers).
## 2026-10-05 — Student card: one „Tunnid” tab; admin changes lesson marks, „Toimunud ja kontrollitud” — branch `agent/student-lessons-tab`

Checked `origin/main` `b4bad01`. Owner: merge „Tunniplaan” and „Õppetöö”, let admins change a lesson's status, add
„проведён и проверен”.
- Tabs: Ülevaade · **Tunnid** (`StudentLessonsPanel`: upcoming planned lessons + a note how many past one-off lessons
  are unmarked, and the held/absent journal) · **Areng** (skills + recordings, was „Õppetöö”) · Esmane hindamine ·
  Finantsid.
- Admin: each held lesson has a status select: Toimunud / Toimunud ja kontrollitud / Puudus (teatas ette) / Puudus
  (ei teatanud) / Eemalda märge. Uses the calendar's `changeMark` / `removeMark` (invoiced lessons are refused there:
  „paranda Finantsides”) and new `lessonsService.setVerified`. Teachers see the marks read-only.
- „Kontrollitud” is a flag, not a new status: `lessons.verified, verifiedAt, verifiedByUid, verifiedByName`; the status
  stays „Toimunud”, so billing, payroll, reports and the pet count it exactly as before. A changed mark clears the
  flag. activityLog `lesson.verified` / `lesson.unverified`.
- `firestore.rules` (lessons update): only an admin changes the verified fields. Emulator test
  `functions/lessons-verified-emulator.integration.js` (in `test:emulator`) passed locally.
- Tests: StudentProfilePage (8, 2 new); ESLint clean; build OK.
- **Needs the owner:** `firestore:rules` deploy after merge (until then an admin can still mark — admins pass the rule
  already; the new rule only stops teachers).
## 2026-10-05 — Constructor: own templates, lesson words, free photo search — branch `agent/constructor-library`

Stacked on `agent/constructor-tools` (#294). Proposals 10–12 (last of the owner's list).
- Templates: toolbar „Mall” saves the selected block (name asked) to `worksheetBlockTemplates/{id}`
  (`title, block, ownerUid, ownerName, createdAt`), shared with all staff; „Mallid” group at the top of the block
  list inserts one (new id); the author or an admin removes it. Service `worksheetTemplatesService`.
- `firestore.rules`: `worksheetBlockTemplates` read staff; create staff, own `ownerUid`, fixed keys, title 1–120;
  no update; delete author or admin. Emulator test `functions/worksheet-templates-emulator.integration.js` (added to
  `test:emulator`) passed locally with the worksheet studio test (Java 21).
- Lesson strip „Tunni sõnad ▾”: „Sõnavara kast” (all active vocabulary words) or „Ühenda: sõna – tõlge” (up to 8
  pairs) from the lesson's generator profile.
- Photo blocks: „Otsi pilti internetist” searches Openverse (free, no key; only the search words are sent), the
  chosen photo is downloaded (`/thumb/?full_size=true`, CORS open), uploaded to our Storage and the caption gets
  „Foto: <author> · CC …”; full attribution and source link are stored in `data.credit` / `data.creditSource`.
- Tests: ImageSearch (2), templates studio test, lesson words test; Vitest worksheet+library 333/333; ESLint clean;
  build OK.
- **Needs the owner:** `firestore:rules` deploy after merge — until then templates do not load/save (the constructor
  works without them and says so on save).

## 2026-10-05 — Constructor: clickable quality issues, restore one task from a version, assign from the constructor — branch `agent/constructor-tools`

Stacked on `agent/constructor-generator-ux` (#292). Proposals 13–15.
- Quality list items are buttons: a block issue selects that block and scrolls it into view (sheet issues open the
  sheet data).
- „Versioonid ja taastamine…”: a version button now opens a comparison („Muudetud / Kustutatud: <task>”) with
  „Too see ülesanne tagasi” per task (a deleted task returns at its old place) and „Taasta kogu leht”.
- A published, saved sheet shows „Määra õpilastele” → `/library?assign=<lesson id>`; Õppevara opens the assignment
  dialog for that material and removes the parameter.
- Tests: studio issue/version test, library `?assign=` test; worksheet+library Vitest 329/329; ESLint clean; build OK.

## 2026-10-05 — Constructor: task variants on the sheet, per-task difficulty, „Ainult see leht” preview — branch `agent/constructor-generator-ux`

Stacked on `agent/constructor-ux` (#291). Proposals 6–9.
- „Uus variant” (toolbar above a generated task) makes 3 different variants (`regenerateTaskOptions`, `salt` +
  `difficulty` options of `regenerateTask`); the toolbar flips them „‹ Variant 2/3 ›”, „Algne” brings the old task
  back, a difficulty select (Support/Core/Challenge) regenerates this task only at that level.
- Lesson strip: „Ainult see leht” generates only the open core sheet (`previewCoreSheet`) and shows it in the editor
  unsaved (Ctrl+Z / „Võta tagasi” returns the previous one); saving stores it with its new `generation` meta (the
  lesson constructor adapter now forwards `generation` on save).
- Tests: worksheet Vitest 302/302 (existing regeneration test covers the variant flow); ESLint clean; build OK.

## 2026-10-05 — Constructor: block toolbar on the sheet, „+” insert, keys, autosave — branch `agent/constructor-ux`

Stacked on `agent/lesson-constructor-generator` (#290, not merged yet). Owner chose to do all proposed constructor
improvements; this is the first batch (proposals 1–5).
- Selected block shows a dark toolbar above it on the sheet: ↑ ↓, „Kopeeri”, „Uus variant” (generated tasks),
  delete. A round „+” under each block selects it and focuses the block search; the chosen block goes right after it.
- Keys (outside text fields): Ctrl/Cmd+S save, Ctrl/Cmd+D copy, Alt+↑/↓ move, ↑/↓ select previous/next, Delete,
  Esc deselect (plus the old Ctrl+Z / Ctrl+Shift+Z). Listed under the block search.
- Autosave: a draft sheet (not a published one) is saved to the database 15 s after the last change; the title line
  shows „salvestan… / salvestamata / salvestatud 10:42”. A failed autosave keeps the browser draft and says so.
- Tests: studio toolbar/keys/insert test and autosave test (fake timers); worksheet Vitest 30 files / 302 tests.

## 2026-10-05 — „Loo tööleht” opens the lesson constructor; the generator lives in its top strip — branch `agent/lesson-constructor-generator`

Checked `origin/main` `b4bad01`. Owner: „Loo tööleht” opened the generator page (three cards + focus form); they want
the constructor itself, with generating on top, without extra pages/tabs.
- Roadmap lessons („Töölehed”, „Tunni töölehed”, „Loo tööleht”/„Muuda töölehte” in Õppevara, the old
  `/library/worksheets/:id` redirect) now open `/library/lessons/:id/worksheets/discover` — the worksheet studio.
- `LessonGeneratorBar` (strip under the studio bar): lesson title, sheet links „1 Avasta · 2 Harjuta · 3 Kasuta” and
  the focus sheets (missing ones dashed), difficulty, „Genereeri 3 töölehte” / „Genereeri 3 lehte uuesti”,
  „Fookuse leht ▾” (focus + stage), „Seaded” → the old generator page (content pack, coverage) which stays as is.
  Generating asks first when the sheet has unsaved changes; after it the open sheet reloads (or opens the new sheet).
- A core sheet that does not exist yet opens empty in the constructor; saving it stores a `source: 'manual'` sheet
  with the right role/slot. Studio drafts in this browser are now kept per sheet (`<lessonId>:<worksheetId>`), not per
  lesson. Back link from the lesson constructor goes to Õppevara.
- Generation logic moved to `worksheet-generator/ui/lessonGeneration.js` (shared by the bar and the old page).
- Tests: new lesson-constructor test (missing sheet opens, tabs, generate saves 3 drafts, reload); redirect test
  updated. Worksheet/library Vitest 31 files / 322 tests; ESLint clean; build OK. Full CRM suite locally: 10 failures
  in Live Classroom/calendar tests that use `localStorage` — Node 26 on this Mac (`localStorage` undefined); files not touched here.
- No rules or functions change. Owner liked the preview layout.
- Follow-up after the owner's preview (same PR): constructor restyled to the CRM look (white panels, soft grey canvas,
  green `#087e6b` accent, DM Sans/Manrope, focus rings; the beige 2000s palette is gone; the printed sheet is unchanged).
  Text can be edited on the sheet: double-click a text → edit in place, Enter/click away saves, Esc cancels
  (`engine/inlineEdit.js` maps the text back to the one data string it came from; ambiguous or formatted text stays
  inspector-only). Suhtlus: channel tabs „Kõik · KeeleSepp · Facebook · Instagram” were squeezed to a sliver in the
  fixed-height list — header, search, tabs and „Alusta uut vestlust” no longer shrink, tabs wrap.
- Tests: `inlineEdit.test.js` (2), studio inline edit test (title + task title, Esc cancels, Enter saves). Full CRM
  Vitest 888/898 locally (same 10 Node 26 `localStorage` failures); ESLint clean; build OK.
## 2026-10-05 — Release of #276–#288 (rules + five functions): RELEASED

Checked `origin/main` `b4bad01` (after #288). Deployed from `~/keelesepp-release` with `firebase-tools@15.22.3`,
project `keelesepp-5136b`; functions `npm test` 232/232 before the deploy.
- `firestore:rules` released (covers #276, #277, #278, #280, #282, #286 and #288 `studentWords.forms/formItems`).
- Functions: `syncScheduleToGoogle`, `syncAllCalendars`, `staffOperationsApi` updated; `notifyHomeworkCreated`
  created (ACTIVE, secret `SMTP_PASS`). Real homework e-mails are sent from now on. No errors in the logs after it.
- CRM (Vercel `keelesepp-crm-v2`, crm.epkoolitus.ee): production is `b4bad01`.
- Checked in the real CRM: „Uued kontod” calls `/accounts/reviews` (200), no open reviews; Polina Lysenko is in
  „Õpilased”.
- `languageApi` (#288) deployed after the others, first with `EKILEX_API_KEY` = `none`; later the same day the owner
  set the real Ekilex key (secret version 2) and redeployed it, so word forms are on (not yet tried in a lesson).
  With `none` it was:
  translation (TartuNLP) works, word forms answer `available: false`. Anonymous call → 401. When the owner gets the
  key: `functions:secrets:set EKILEX_API_KEY` (in the terminal, never in the chat), then redeploy
  `functions:languageApi` so it picks up the new version.
- Still for the owner: lessons deleted before the calendar deploy may have come back from Google — delete them once
  more; one real 1:1 lesson to try „Leia tõlge ja vormid” on „kass”, pointer/follow, „Sõnad”, „Anna kodutöö”, „Lõpeta tund”, pet in the room.

## 2026-10-04 — Word tools: translation (TartuNLP) and Estonian word forms (EKI Ekilex) — branch `claude/affectionate-ritchie-dh2x9j`

Checked `origin/main` `12dfffd` (after #287). Owner approved the external services (free; only the word itself is
sent, no student data).
- Cloud Function `languageApi` (staff only, secret `EKILEX_API_KEY`): `/translate` (TartuNLP Neurotõlge
  `POST https://api.tartunlp.ai/translation/v2`, `x-api-key: public`), `/forms` (Ekilex `GET /api/word/search/{word}/eki`
  → `GET /api/paradigm/details/{wordId}`, header `ekilex-api-key`), `/word` (both; each may fail alone). 8 s timeout,
  clean 502 on failure, answers cached in the server-only collection `languageCache` (no client rule → denied).
  Without a valid 32-hex key the forms answer `available: false` and nothing is called.
- Pure helpers `functions/language-core.js`: request validation, key forms (SgN, SgG, SgP, PlP; Sup, Inf, IndPrSg3,
  IndIpfSg3) with Estonian labels, headword pick, cache keys.
- CRM: `services/firebase/languageTools.js`; „Sõnad” drawer: „Leia tõlge ja vormid” (also on leaving the word field
  when translation/forms are empty), editable „Vormid” field, notice when the key is missing; English lessons
  translate only. Words store `forms` (line ≤ 200) and `formItems` (≤ 8). Flashcards: every other review of a word
  with forms asks one form („kass — ainsuse omastav?”, typed answer, listed variants accepted). Forms shown in the
  word lists and lesson summaries.
- `firestore.rules`: `studentWords` allow `forms`, `formItems` (staff create/edit only; students still only practice
  fields).
- Tests: functions `language-core.test.js` (3), `language-api.test.js` (3, fake fetch + cache); emulator
  `student-words-emulator.integration.js` extended (forms allowed, > 8 forms 403, student cannot edit forms) 1/1;
  vocabulary tests (4 new). CRM Vitest 142 files / 894 tests; ESLint clean; build OK; functions `npm test` 232/232.
- The real services were not called from here (the sandbox network blocks them); request shapes follow their public
  docs/clients. First real check: after deploy, „Leia tõlge ja vormid” on „kass”.
- **Needs the owner:** 1) Ekilex API key from the Ekilex user profile page (ekilex.ee), then
  `firebase functions:secrets:set EKILEX_API_KEY` (paste the key in the terminal prompt, never in the chat; type
  `none` to start with translation only); 2) deploy `functions:languageApi` and `firestore:rules`.

## 2026-10-04 — The student's pet in the lesson room — branch `claude/affectionate-ritchie-dh2x9j`

Checked `origin/main` `1c85f49` (after #286, pet growth/outfits/visibility). Fourth of the owner's pet wishes.
- `RoomPet` (student side of `LiveRoom`, bottom-left of the board): the student's own pet with its outfit says hello,
  cheers for a new word of this lesson („Uus sõna: …!” + Russian with the translation) and for homework given in this
  lesson; the bubble hides after 5 s or on a click. Nothing is written; no pet / opted out / hidden → nothing shown.
- `homeworkService.subscribeForLesson({ studentId, invitationId })` (live; existing homework read rule).
- Tests: LiveRoom pet tests (2). CRM Vitest 142 files / 890 tests; ESLint clean; build OK.
- No rules or functions change. Not tried in a real lesson.

### Pending owner actions (all merged in main)
Released on 2026-10-05 (see „Release of #276–#288” above).

## 2026-10-04 — Pet: grows from words, homework and streaks; outfits for stars; teacher and parents see it — branch `claude/affectionate-ritchie-dh2x9j`

Checked `origin/main` `10d2d74` (after #285, homework e-mail). Owner chose all four pet improvements; this PR has
three of them (the pet in the lesson room follows separately).
- Growth (`petModel.petProgress`): + homework marked done (10 xp), learned words (box ≥ 3, 2 xp), learning streak
  (days in a row with a lesson, work, homework or word practice; 3 xp/day, capped at 30); new `learningStreak`;
  `stars = floor(xp / 5)`. Card shows streak, stars, learned words, homework.
- Outfits (`petItems.js`, `PetWardrobe` „Riidekapp”): 11 items in 4 slots (background, hat, glasses, neck), bought with
  stars, one per slot, put on/taken off; drawn in `petArt.petSvg(kind, mood, stage, wearing)` from constants.
  Stored on `users/{uid}.pet`: `owned`, `wearing`, `spentStars`.
- Teacher and parents: the student's client writes the public copy `petProfiles/{uid}` (`uid, studentId, kind, name,
  wearing, updatedAt`); `PetOverview` on the staff student card („Ülevaade”) and the parent dashboard (growth from the
  data those pages already have + words). A pet chosen before this release appears after the student opens their
  dashboard once.
- `firestore.rules`: pet keys `owned` (list ≤ 40), `wearing` (known slots), `spentStars` (int, never decreases),
  `owned` never shrinks; `petProfiles`: read staff/self/`ownsStudent`, write only self for the own card, fixed keys.
- Tests: pet model/outfit/overview tests (22); emulator `student-pet-emulator.integration.js` extended (outfit rules,
  public copy: own card only, parent/teacher read, stranger 403) — with whiteboard and approval tests 10/10. CRM
  Vitest 142 files / 888 tests; ESLint clean; build OK. Visual check of all species with outfits (Playwright).
- **Needs the owner:** `firestore:rules` deploy (with the other pending rules).

## 2026-10-04 — New homework is e-mailed to the student and the parent — branch `claude/affectionate-ritchie-dh2x9j`

Checked `origin/main` `4309fe8` (after #284, link reviews). Owner: when homework is added, the student and (if linked)
the parent get an e-mail.
- Cloud Function `notifyHomeworkCreated` (`homework/{id}` onCreate, secret `SMTP_PASS`, existing `deliverEmail`):
  one e-mail to the student addresses (card `email` + linked student accounts), one to the parent addresses (card
  `parentEmail`/`guardianEmail` + linked parent accounts), deduplicated; Estonian + Russian; task, due date, board page
  and worksheet names, button to `/homework`. Writes `notifiedAt`, `notifiedCount` on the homework.
- Pure helpers `functions/homework-mail-core.js`: `shouldAnnounceHomework` (only homework given now: `createdAt` within
  1 h, otherwise `date` = today; `notify: false` and done homework stay silent — imports and migrations do not mail),
  `homeworkRecipients` (student card `homeworkEmailOptOut: true` silences it), `composeHomeworkEmail` (HTML escaped).
- Covers CRM „Kodutööd”, Live Classroom „Anna kodutöö”, lesson completion homework and library assignments.
- Tests: `homework-mail-core.test.js` (3); functions `npm test` 226/226; full emulator suite with the functions
  emulator 52/52 + link review 1/1 (the trigger runs there without breaking other tests).
- **Needs the owner:** Cloud Functions deploy (`notifyHomeworkCreated`). Real e-mails are sent after the deploy.

## 2026-10-04 — „Vajab otsust”: registrations stopped on a possible duplicate card — branch `claude/affectionate-ritchie-dh2x9j`

Checked `origin/main` `a63f813` (after #283, calendar). Owner: a student (Polina) registered and was approved, but is
not in „Õpilased”; the duplicate handling is unclear.
- Cause: the server bootstrap (`bootstrapCurrentAccount`) writes `accountLinkReviews/{id}` (status `pending`) instead of
  creating/linking a card when it finds a possible duplicate (e.g. same e-mail on an existing card but the account
  e-mail is not verified, several cards with the same e-mail, a similar child name). These reviews were shown nowhere in
  CRM v2, so such people stayed without a card.
- `staffOperationsApi` (admin): `/accounts/reviews` (pending reviews with candidates and an Estonian reason),
  `/accounts/reviews/create-card` (new card `self_<uid>` / `parent_<uid>_<key>` with the same fields as the automatic
  bootstrap — extracted to `bootstrapStudentCardData` — link, review `resolved`, audit), `/accounts/reviews/dismiss`.
  Linking to an existing card uses the existing `/accounts/link` (which already resolves the review). The approval
  response now carries `reviewCount`.
- CRM „Uued kontod”: card „Vajab otsust: võimalik topeltkaart” (`LinkReviewsCard`): who, why, candidate cards with
  „Seo selle kaardiga”, „Loo uus kaart”, „Jäta vahele”; the approval notice points there when a review was created.
- Tests: emulator `functions/account-link-review-emulator.integration.js` 1/1 (teacher 403, list, create card,
  resolved, 409 on second decision, dismiss; added to the CI emulator command); AccountsPage tests (2 new, 9/9);
  functions `npm test` 223/223; ESLint clean.
- **Needs the owner:** Cloud Functions deploy (`staffOperationsApi`). Then open „Uued kontod” — Polina should be
  under „Vajab otsust”.

## 2026-10-04 — Calendar: a lesson deleted in KeeleSepp leaves Google Calendar too — branch `claude/affectionate-ritchie-dh2x9j`

Checked `origin/main` `ec5db0b` (after #282). Owner: „если я удалил урок, то и из Гугла бы ушёл”.
- Cause: lessons imported from the teacher's Google Calendar (`source: "gcal"`, id `gcal_<eventId>`) were skipped
  by the push (`syncScheduleRecordToGoogle`), so a delete or cancel in KeeleSepp never reached Google, and the hourly
  import re-created the lesson. KeeleSepp-made lessons (`source: "keelesepp"`) already worked.
- `calendar-sync-core.importedLessonGoogleAction(before, after)`: delete → delete the Google event (same path and
  outbox retry as managed lessons); cancel → delete the Google event, keep the CRM record with
  `gcalImportSuppressed: true` (import skips it, Google tombstones no longer delete it); a suppressed lesson planned
  again → pushed as a KeeleSepp event (`source` becomes `keelesepp`, suppression cleared); anything else unchanged.
- Without write consent a cancelled imported lesson is queued in `calendarSyncOutbox` and kept cancelled; the import
  skips Google events that have a pending deletion in the outbox (no re-import after a delete).
- CRM `scheduleService.restore` (undo of a delete) of an imported lesson: `gcalImportSuppressed`, Google link fields
  dropped → re-created as a KeeleSepp event.
- Tests: core (1) and behaviour (4) tests; functions `npm test` 223/223; CRM calendar/services Vitest 180/180.
- **Needs the owner:** Cloud Functions deploy (`syncScheduleToGoogle`, `syncAllCalendars`); no rules change.
  Lessons deleted before the deploy may already have come back from Google: delete them once more after the deploy.

## 2026-10-04 — Lesson summary for the student and parents — branch `claude/affectionate-ritchie-dh2x9j`

Checked `origin/main` `00c13bd` (after #281, homework from the lesson). Last of the four owner-chosen follow-ups
(#279 pointer/follow, #280 vocabulary, #281 homework, this).
- Live Classroom: „Rohkem” → „Lõpeta tund” now opens the drawer „Tunni lõpp” (`LessonEndPanel`): board lesson pages
  the teacher opened in this lesson, the lesson's new words and homework (live), optional „Sõnum õpilasele”;
  „Saada kokkuvõte ja lõpeta tund” saves the summary and ends the lesson as before (calendar opens to mark it held);
  „Lõpeta ilma kokkuvõtteta” ends without it; a failed save does not end the lesson. `LiveClassroomPage.onEndLesson
  ({ confirmed })` skips the old confirm when the drawer already asked.
- Data `lessonSummaries/{invitationId}`: `invitationId, studentId, teacherUid, teacherName, title, subject, startedAt,
  endedAt, note ≤2000, pages [{id,title}] ≤40, updatedAt`. Words and homework are not copied: read by `invitationId`.
- `firestore.rules`: create/update only by staff who is the invitation's teacher, for the invitation's student, fixed
  keys; read staff + `ownsStudent` (student, parent); delete admin.
- Student and parent dashboards: card „Tunni kokkuvõtted” (`LessonSummariesCard`, newest 5, newest opened: note,
  board page links `/board?page=`, words, homework). Parent dashboard also shows „Minu sõnad” (read-only, no practice).
- Tests: emulator `functions/lesson-summary-emulator.integration.js` 1/1 (added to the CI emulator command; with the
  words test 2/2); LiveRoom end tests (2), `LessonSummariesCard.test.jsx` (2), LiveClassroomPage end tests updated.
  CRM Vitest 142 files / 880 tests; ESLint clean; build OK; functions `npm test` 218/218.
- Limits: 1:1 lessons only (group room keeps its own end); not tried with real accounts.
- **Needs the owner:** one `firestore:rules` deploy now covers #276 (byStaff), #277 (group chat), #278 (transcriber
  heartbeat), #280 (`studentWords`) and this (`lessonSummaries`). Exactly one next safe step: owner deploys the rules
  and runs one real lesson: pointer/follow, „Sõnad”, „Anna kodutöö”, „Lõpeta tund” → summary on the student dashboard.

## 2026-10-04 — Homework straight from the lesson — branch `claude/affectionate-ritchie-dh2x9j`

Checked `origin/main` `1da39e3` (after #280, lesson vocabulary). Third of the four owner-chosen follow-ups.
- Live Classroom, teacher: „Rohkem” → „Anna kodutöö” opens the drawer `LessonHomeworkPanel`: task (quick chips: repeat
  the lesson words, finish the worksheet, look at the board page), due date (default +7 days), tick „Lisa tahvlileht”
  (the open lesson page) and „Tööleht … kodutööks” (the room's worksheet gets the same `dueDate`); lists homework given
  in this lesson.
- `homeworkService.createFromLesson` writes a normal `homework` doc (existing fields + `invitationId, teacherUid,
  teacherName, source 'live-classroom', createdAt`, optional `boardPageId/boardPageTitle`,
  `worksheetAssignmentId/worksheetTitle`); `listForLesson`. No rules change (staff create homework and update
  worksheet assignments under the existing rules).
- `HomeworkPage`: „Tunnist” marker, link „Ava tahvlileht „…”” (`/board?page=` for the student, `/board/:id?page=` for
  staff), worksheet hint; multi-line task text kept.
- `StudentBoard.onPageChange(pageId, title)` now also passes the page title.
- Tests: LiveRoom homework test, HomeworkPage lesson-homework test, board test updated. CRM Vitest 141 files /
  876 tests; ESLint clean (0 errors); build OK.
- No rules deploy needed for this PR.

## 2026-10-04 — Lesson vocabulary: words from the lesson into the student's own list — branch `claude/affectionate-ritchie-dh2x9j`

Checked `origin/main` `d2236ca` (after #279, pointer/follow). Second of the four owner-chosen follow-ups.
- Data `studentWords/{id}`: `studentId, invitationId ('' outside a lesson), word ≤120, translation ≤200, example ≤400,
  createdByUid, createdByName, createdAt, updatedAt, box 0–5, dueAt` + practice `reviewedAt, reviews`.
- `firestore.rules`: staff create (author = me, box 0, student exists, no extra keys), staff edit text, staff delete;
  student or linked parent (`ownsStudent`) reads and updates only `box, dueAt, reviewedAt, reviews`.
- Model `features/vocabulary/wordsModel.js` (Leitner boxes, days 0/1/3/7/14/30; „Ei teadnud” → box 0, due now).
  Service `services/firebase/studentWords.js`.
- UI: Live Classroom „Sõnad” drawer (`LessonWordsPanel`: teacher form word/translation/example, duplicate hint, this
  lesson's words with delete; student sees the list). Student dashboard card „Minu sõnad” (`MyWordsCard`: due count,
  „Harjuta” flashcards `WordPractice`, all words; no practice in the admin preview).
- Tests: emulator `functions/student-words-emulator.integration.js` 1/1 (added to the financial-core CI command);
  `vocabulary.test.jsx` (6), LiveRoom words test. CRM Vitest 141 files / 874 tests; ESLint clean; build OK;
  functions `npm test` 218/218.
- Not yet: words on the parent dashboard and the staff student card (planned with the lesson summary).
- **Needs the owner:** `firestore:rules` deploy (together with #276–#278).

## 2026-10-04 — Lesson room: pointer and „follow the teacher” — branch `claude/affectionate-ritchie-dh2x9j`

Checked `origin/main` `32cb8d1` (after #278). First of four owner-chosen follow-ups (pointer/follow, lesson vocabulary,
homework from the lesson, lesson summary — one PR each, in that order).
- `useLiveCall`: a WebRTC data channel `room` — the teacher creates it with every offer (before `createOffer`), the
  student receives it (`ondatachannel`); closed with the peer. Exposes `roomChannelOpen`, `sendRoom(message)` (JSON,
  false when not open), `onRoomMessage(listener)`. Peers without data channels still call. Nothing is stored; no rules.
- Messages: `{ t: 'page', pageId }` ('' = main board) whenever the teacher's open page changes or the channel opens;
  `{ t: 'ptr', x, y, pageId }` (≤ 20/s) or `{ t: 'ptr', off: true }`.
- `StudentBoard`: `onPageChange(pageId)`, teacher tool „Osuti” (only with `onPointer`; nothing saved, put away on leave
  or tool change), `pointer` prop draws a red dot on the matching page only.
- `LiveRoom` (1:1): the student follows the teacher's page by default („Ära jälgi õpetaja lehte” / „Jälgi õpetaja
  lehte” in „Rohkem”); pill „Mine õpetaja lehele” when on another page; the pointer hides after 4 s without updates.
- Tests: `useLiveCall.channel.test.jsx` (2), `LiveRoom.follow.test.jsx` (3), board pointer/page tests (2). CRM Vitest
  140 files / 867 tests; ESLint clean; build OK.
- Limits: works only during a call (no call → no channel); group lessons not yet (mesh would need one channel per
  peer). Not tried with real browsers.
- No rules deploy needed.

## 2026-10-04 — Transcriber on the Mac starts by itself; the lesson room shows whether it runs — branch `claude/affectionate-ritchie-dh2x9j`

Checked `origin/main` `d120950` (after #277). Owner: keep transcription on the school Mac (free, best Estonian), but it
must run whenever a lesson is held. A web page cannot start a Mac program, so the worker runs from Mac login instead and
the room reports its state.
- `tools/lesson-transcriber/install-mac.sh` (new): one command after the owner saved the service account key —
  Homebrew whisper-cpp/ffmpeg/node if missing, 3 models, `npm install`, launchd agent (RunAtLoad + KeepAlive, explicit
  `WHISPER_BIN`/`FFMPEG_BIN`). Re-run after `git pull` to restart.
- Worker: heartbeat `transcriberStatus/{workerId(host)}` at start, every minute and around each transcription
  (`state idle|transcribing`); `caffeinate -i` while transcribing. Helpers `workerId`, `heartbeat` in `lib.js`.
- `firestore.rules`: `transcriberStatus/{workerId}` staff read, no browser writes.
- CRM: `lessonRecordingsService.subscribeTranscribers`; `features/lesson-recording/transcriberStatus.js`
  (`transcriberState`, 3-minute freshness, `useTranscriberStatus`, `transcriberLabel`). LiveRoom: status line in the
  recording drawer, pill „Mac ei transkribeeri” while recording without a fresh heartbeat; GroupRoom: same pill.
- Tests: worker `npm test` 5/5; emulator `lesson-recording-emulator.integration.js` 2/2 (teacher reads heartbeat 200,
  student 403, browser write 403); CRM Vitest 138 files / 860 tests; ESLint clean on changed files.
- Not verified on a real Mac (script syntax checked with `bash -n` only).
- **Needs the owner:** `firestore:rules` deploy (with #276/#277), then on the Mac: save the key, run `install-mac.sh`,
  set Energy → prevent automatic sleeping when the display is off.

## 2026-10-04 — Group lessons: chat and per-student recording — branch `claude/affectionate-ritchie-dh2x9j`

Checked `origin/main` `d73c043` (after #276). Closes the two gaps of #274.
- Chat: `liveGroupRooms/{roomId}/messages` (fromUid = me, text 1–2000, createdAt = request.time; participants of an
  open room write, participants read also after the lesson; no edits/deletes). `liveGroupRoomsService.subscribeMessages`
  / `sendMessage`; `GroupRoom` „Vestlus” drawer with unread badge.
- Recording: in a group lesson the teacher's browser records one recording per student (teacher microphone + that
  student's incoming audio) on the student's own accepted invitation, with the student card's consent — the existing
  `lessonRecordings` rules and transcriber apply unchanged, and each student gets their own „Tunni analüüs” on the
  card. `useGroupCall` exposes `localStream`; `GroupRoom` mounts one auto `RoomRecorder` per accepted invitation
  (hidden), pill „Salvestan (n)”; students see „Tundi salvestatakse” (`RecordingIndicator` on their invitation).
- Tests: emulator group test extended (member writes 200, forged sender 403, outsider 403/read 403, no writes after
  close, chat readable after close) — 2/2; page test (chat read + send); `GroupRoom.test.jsx` (one recording for the
  student with consent, none for the one without). CRM Vitest 137 files / 857 tests; ESLint clean; build OK.
- Limit: each recording also holds the teacher's voice, so the teacher's track is transcribed once per student.
- **Needs the owner:** `firestore:rules` deploy (chat rules; also #276).

## 2026-10-04 — Board: the teacher's drawing and writing are safe from the student's eraser — branch `claude/affectionate-ritchie-dh2x9j`

Checked `origin/main` `6b872d9` (after #275). Follow-up to #266 (which protected images/PDFs only).
- Every element a teacher/admin creates in CRM v2 carries `byStaff: true` (`StudentBoard.add`, kept on redo).
  `firestore.rules`: `byStaff` allowed on every element type; only staff may create it
  (`whiteboardElementCreateValid`); it can never change on update; staff-only move/change/delete now covers
  `byStaff` elements as well as images/PDFs (student boards, lesson pages, group boards).
- Expression limit: the teacher's update path hit Firestore's 1000-expression limit after the extra checks;
  `whiteboardElementUpdateValid(before, after, staff)` now gets `staff` computed once (`let` in
  `whiteboardElementUpdateAllowed`; inline at the lesson-page and group-board callers).
- Client: a student's eraser/drag skip teacher content; the text tool / double click do not open the teacher's text
  („Õpetaja teksti saab muuta ainult õpetaja.”).
- Tests: emulator new case (teacher note with mark 200; student forging the mark 403; student erase/move 403; the mark
  cannot be dropped 403; teacher move/delete 200); full `test:emulator` 52/52. Board test (teacher's note carries the
  mark; student cannot erase a marked stroke or edit marked text). CRM Vitest, ESLint, build — see PR.
- Limits: elements drawn before this change carry no mark and stay erasable; CRM v1 board does not set the mark and,
  when it rewrites a marked element without the field, the write is denied (v1 is being retired).
- **Needs the owner:** `firestore:rules` deploy.

## 2026-10-04 — Release of the Live Classroom wish list (#266–#274): RELEASED

Owner deployed `firestore:rules` from `~/keelesepp-release` at main `cd7fa9c` („uploading rules … released rules …
Deploy complete!”, screenshot). Client changes were already live through Vercel. All nine wish-list items are in
production: teacher materials protected (#266), teacher-only lesson analysis (#267), text fonts/editing (#268), sheet
with edges + new/renamed sheets (#269), worksheet on the board (#270), teacher workspace (#271), student's own board
(#272), constructor schemes/look/joined blocks (#273), group lessons (#274).
Not yet verified by people: real one-to-one and group calls with cameras; the owner's checklist in the chat
(board protection, text, sheets, workspace, worksheet on board, student board, lesson analysis, group lesson,
constructor). Known gaps: group lessons have no recording/chat; teacher strokes/notes are still erasable by students.
Exactly one next safe step: owner runs one real lesson with the checklist and reports what feels wrong.

## 2026-10-04 — Group lessons: up to 4 students, mesh video, group board — branch `claude/affectionate-ritchie-dh2x9j`

Checked `origin/main` `9ffad8e` (after #273). Wish-list item 8, owner's decision: up to 4 students, peer-to-peer
video, a separate group board (each student keeps their own board).
- Data (`firestore.rules`): `liveGroupRooms/{roomId}` { teacherUid, teacherName, title, memberUids (1–4), members,
  status open/closed, createdAt, closedAt } — teacher creates/updates/closes, members read; `signals` (fromUid = me,
  toUid = another participant; mesh) and `presence/{uid}` (role checked against the room) for participants of an open
  room; `groupBoards/{roomId}` (+ `elements`, `lessonPages`, page elements) for participants, teacher materials
  staff-only, readable after the lesson. Invitations: `roomKey` may now be a group room of this teacher in which the
  student is a member (otherwise still the invitation's own id).
- Services: `liveGroupRooms.js` (create room + one invitation per student with `roomKey`, subscribe, open rooms of a
  teacher, close, signals, presence); `liveLessonInvitations.create` accepts `roomKey`; `studentBoard.js` is now
  `createBoardService(root)` → `studentBoardService` (whiteboards) and `groupBoardService` (groupBoards).
- Call: `useGroupCall.js` — one RTCPeerConnection per pair; the smaller uid offers; offers wait until the other
  turns the camera on; failed connections re-offered up to 3 times; TURN through any accepted invitation of the person.
- UI: `TeacherWorkspace` „Üks õpilane / Grupitund”: tick up to 4 students → „Kutsu grupp tundi (n/4)”, „Tagasi
  grupitundi: …” for open rooms; `GroupRoom.jsx`: group board (all tools, sheets, materials for the teacher), video
  column (self + up to 4), mic/camera/hang-up, „Lõpeta tund” closes the room (board stays). `LiveClassroomPage`:
  `?group=<roomId>` for the teacher; a student's accepted invitation with a group roomKey opens the group room; group
  invitations are kept out of the one-to-one flow.
- Checks: emulator `live-group-rooms-emulator.integration.js` (2 tests: ≤4 members, member-only invitations, read
  scope; presence/signals/board/close) — full `npm run test:emulator` 51/51; hook test (offer waits for the student's
  camera, answer, remote stream, hang-up); page tests (teacher invites 2 → group room; student lands in it); browser
  harness 1280 px. CRM Vitest 136 files / 854 tests; ESLint clean; build OK. Not tried with real cameras.
- Limits: no recording/transcript and no chat in group lessons yet; a teacher-chosen member list is trusted (each
  invitation still checks teacher scope and the student's account); mesh is meant for ≤5 people.
- **Needs the owner (final release):** `firestore:rules` deploy, then a real group lesson with 2 students.

## 2026-10-04 — Worksheet constructor: schemes, block look, joined blocks — branch `claude/affectionate-ritchie-dh2x9j`

Checked `origin/main` `127c231` (after #272). Wish-list item 9, owner's choice: diagrams, combining blocks, block
styling (tables later). Side-by-side placement already existed (12-column spans ¼…full) and stays.
- New block „Skeem / diagramm” (`engine/blocks/diagram.jsx`, `diagramModel.js`): mind map (centre + up to 12 boxes),
  chain (snake rows of four with arrows), tree (top box + row). A box written `[answer|other]` is a gap scored like
  the gap task (keys `c`, `n<i>`); quality check: a scheme needs boxes. Registered in `BLOCKS` (33 types).
- Block look (`engine/look.js`, Inspector „Raam”, „Pealkirja ja raami värv”, „Ikoon”): frame none/line/bold/dashed,
  heading/frame/number colour from the brand tones, a small icon (räägi, kuula, loe, kirjuta, mõtle, tähtis, aeg,
  kontrolli) before the task title or in the corner of a content block. Stored as `block.look`; old sheets unchanged.
- Joined blocks: „Seo eelmise plokiga” sets `block.joined`; joined blocks are drawn as one card (no gap, divider) and
  move together (↑/↓ and drag: `moveRun`, `dropRun`).
- Checks: browser harness (temporary) with mind map, chain, tree, framed/coloured/icon blocks and a joined pair —
  first shot showed too much empty space and an invisible diagonal step in the chain → compacted, snake layout with
  arrows. Tests: look/groups 4, diagram 4, registry count 33. CRM Vitest 135 files / 850 tests; ESLint; build OK.
- Client only (worksheet documents are stored as they are; new fields are optional). PDF export uses the same HTML
  print path; not separately checked on paper.

## 2026-10-04 — Student's own board always in Live Classroom — branch `claude/affectionate-ritchie-dh2x9j`

Wish-list item 7. `StudentWorkspace.jsx`: outside a lesson the student's Live Classroom is their own board (room
frame, all tools, sheets — „Uus leht” and renaming work for students after the #269 rules deploy), „Tagasi tundi” when
a lesson runs, subject choice when the account has several cards; incoming invitations still appear through the
global invitation overlay. `LiveClassroomPage` student branch uses it (was an empty „Aktiivset tundi ei ole” card).
Tests: new „without a lesson the student has their own board”; „leave the room” now lands on „Minu tahvel”. CRM
Vitest 133 files / 842 tests; ESLint clean; build OK. Client only.

## 2026-10-04 — Live Classroom opens as the teacher's workspace — branch `claude/affectionate-ritchie-dh2x9j`

Checked `origin/main` `00e19e3` (after #270). Wish-list item 6 (prepare in advance, invite from the workspace).
- `TeacherWorkspace.jsx`: the teacher's Live Classroom start is now a full-screen workspace in the room's frame:
  student search + select („Õpilane”), the chosen student's board opens at once (room variant: sheets, materials
  drawer, undo/redo, all board tools) so a lesson can be prepared before inviting; lesson title + „Kutsu õpilane
  tundi”; while the invitation is pending the same board stays open with „Kutse saadetud — ootan: …” and „Tühista
  kutse”; „Tagasi tundi” for a running lesson; back arrow to the CRM. When the student accepts, the existing lesson
  room opens on the same board, so everything prepared is there.
- `MaterialsPanel.jsx` and `roomMaterials.js` (`fileKind`) moved out of `LiveRoom.jsx` (shared by room and workspace).
- `LiveClassroomPage.jsx`: the old start card replaced; the selection is kept after inviting.
- Checks: browser harness (temporary) 1280 px and 390 px: board fills the width, no page errors. Tests: new
  „opens as the teacher workspace …” (choose student → board, Materjalid, sheet tabs); two start-screen tests now
  assert the workspace instead of the old card text. CRM Vitest 133 files / 841 tests; ESLint clean; build OK.
- Limit: a worksheet can be opened only once the lesson runs (it is tied to the room key); prepared sheets and
  materials are on the student's board. Only students with a linked account are listed (invitations need it).

## 2026-10-04 — Live Classroom: the worksheet lies on the board — branch `claude/affectionate-ritchie-dh2x9j`

Checked `origin/main` `3609528` (after #269). Wish-list item 5 („рабочий лист — это и есть урок”).
- Before: an open worksheet covered the board as a separate overlay („Ülesanded”).
- Now the room's worksheet is a page of the student's board „Tööleht: <title>”: the teacher's browser creates it once
  when the worksheet is opened (`addPage`), both switch to it; the worksheet (teacher: live answers, student: fill in;
  `RoomWorksheetContent`) lies in an HTML layer under the drawing layer, 1000 board units wide, and pans/zooms with the
  board (`.sb-underlay`, `fitWidth`). Tool „Täida töölehte” (default on that page) lets clicks reach the worksheet; all
  other tools draw/write/annotate on top; annotations are stored on that lesson page and stay after the lesson.
- „Ülesanded” is now a side drawer (teacher: pick and open a worksheet; „Ava tööleht tahvlil”); the student's button
  jumps to the worksheet page. `RoomWorksheetPanel` has `showSheet` (false in the room) and exports `RoomWorksheetContent`.
- Fix found in a browser check: board CSS `.sb-stage svg` also stretched the worksheet's own icons over the page;
  scoped to `.sb-stage > svg`.
- Checks: browser (temporary harness, not committed) 1280 px and 390 px with a sample worksheet: renders, no page
  errors; on a phone the A4 worksheet shows at ~32 % (zoom buttons), like the old overlay. Tests: room 2 rewritten
  (teacher creates „Tööleht: Minevik” page and both land on it with „Täida”; student switches when it appears, never
  creates). CRM Vitest 133 files / 840 tests; ESLint clean; build OK.
- Limit: annotations are positioned against the worksheet layout at 1000 units; if a worksheet's content changes
  height later (feedback blocks), marks drawn below may shift relative to it.

## 2026-10-04 — Board: a sheet with edges, new sheets for everyone, renaming — branch `claude/affectionate-ritchie-dh2x9j`

Checked `origin/main` `fa8da3e` (after #268). Wish-list item 4. Owner 2026-10-04: „делаем все до конца и потом одним
большим обновлением все зальем” — agent merges each item after green CI; the owner deploys rules once at the end.
- `boardModel.js`: `PAGE` 1600×1000, `pageBounds` (sheet grows only around older content outside it, so nothing is
  hidden), `fitPage`, `clampView` (pan/zoom keep ≥80 px of the sheet on screen), `clampPoint` (new strokes, shapes,
  notes, text and moves stay on the sheet).
- `StudentBoard.jsx`: white sheet with shadow on a grey desk (dots only on the sheet); every page fitted once on open
  (content if any, else the whole sheet); „Sobita” fits the sheet. Page tabs shared by room and page variant: „Uus
  leht” for everyone (default title „Leht N”; the teacher's room menu still makes „Tund dd.mm.yyyy”), rename by double
  clicking a tab or the pencil next to the open page (`studentBoardService.renamePage`).
- `firestore.rules` `lessonPages`: create by anyone with board access (students/parents only non-snapshot sheets);
  update adds a title-only rename branch for active non-snapshot sheets (signed). Delete stays staff-only.
- Tests: board 2 new (student new sheet + rename; sheet maths); emulator „student adds and renames ordinary sheets but
  not snapshots, order or status”; whiteboard rules 6/6. CRM Vitest 133 files / 839 tests; ESLint clean; build OK.
  Not checked visually in a browser.
- Before the rules deploy: students' „Uus leht” and renaming show a permission error; staff work as before.

## 2026-10-04 — Board text: font choice and editing existing text — branch `claude/affectionate-ritchie-dh2x9j`

Checked `origin/main` `175c13b` (after #267, merged with the owner's permission). Wish-list item 3.
- Owner: no font choice for text and written text could not be edited. Cause of the second: the double click sat on
  the text's `foreignObject`, but the select tool captures the pointer on the svg, so the double click never reached
  it (and with other tools nothing opened the text).
- `boardModel.js`: `FONTS` (sans „Tavaline”, serif „Raamat”, hand „Käsikiri”, mono „Kirjutusmasin”), `fontCss`,
  `textBox` (box grows with the text), `textAt` (topmost text/note under a point).
- `StudentBoard.jsx`: double click anywhere on a text/note (svg level, hit test) and the text tool on an existing
  text/note open it for editing; while a text is open, font, S/M/L/XL and colour change that text; new text uses the
  chosen font (`fontFamily` stored only when not the default, so text keeps working before the rules deploy);
  font buttons in the room style panel and in the page toolbar (text tool / editing). Saved text resizes its box.
- `firestore.rules`: text elements may carry `fontFamily` in `['sans','serif','hand','mono']`.
- Tests: board 2 new (edit via text tool + double click, font/size apply, box grows; new text font), emulator
  „board text may carry one of the four fonts” (plain 200, hand 200, other 403); whiteboard rules 5/5.
  CRM Vitest 133 files / 837 tests; ESLint clean; build OK.
- **Needs the owner:** `firestore:rules` deploy (also covers #266, #267). Before it, choosing a non-default font
  shows a save error; default text works.
- Exactly one next safe step: deploy rules; in a lesson write a text, double-click it, change the font.

## 2026-10-04 — Lesson analysis for the teacher only; lesson rows open analysis or board — branch `claude/affectionate-ritchie-dh2x9j`

Checked `origin/main` `cb06b68` (after #266, merged with the owner's permission; its rules still need a deploy).
Wish-list item 2.
- `firestore.rules` `lessonRecordings` read: the student only while `status == 'recording'` (room indicator); finished
  recordings/transcripts → teacher of the recording and admins. `subscribeForStudent` adds `status == 'recording'`.
- Student card → Õppetöö → „Tunnid” (`TranscriptView.jsx` `LessonsCard`, `lessonTimeline.js`): rows per recording + board
  pages of days without one; „Tunni analüüs” (share of speaking time, words/minutes, answers, longest sentence,
  questions + dialogue; waiting text before transcription) and „Tahvel” → `/board/:studentId?page=…`
  (`BoardPage` reads `?page`, `StudentBoard initialPageId`).
- Tests: timeline/analysis 2, panel 2 (analysis + board link; waiting text), board initial page 1, emulator: student
  reads running 200, finished 403, teacher 200. CRM Vitest, ESLint, build — see PR.
- Limit: the analysis is counting only (no AI); text appears only after the school Mac worker transcribed it.
- **Needs the owner:** `firestore:rules` deploy after merge (also covers #266).
- Exactly one next safe step: deploy rules; open a student → Õppetöö → Tunnid → Tunni analüüs / Tahvel.

## 2026-10-04 — Board: only staff move or delete teacher materials — branch `claude/affectionate-ritchie-dh2x9j`

Checked `origin/main` `f68d46f` (after #265). Owner: a student could erase the file the teacher added with the eraser.
- `firestore.rules`: new `whiteboardMaterialStaffOnly(data)` (image/pdf → admin or teacher only) in element update
  (`whiteboardElementUpdateValid`, checked on `before`) and delete (board elements and live lesson-page elements).
  Students still create/erase their own strokes, notes, text and shapes; locked/snapshot rules unchanged.
- `StudentBoard.jsx` / `boardModel.teacherMaterial`: a student's eraser on an image/PDF shows „Õpetaja lisatud
  materjali saab kustutada ainult õpetaja.” and drag does not move it.
- Tests: emulator `whiteboard-rules-emulator.integration.js` new case (student delete/move image + lesson-page PDF
  403, own note delete 200, teacher move/delete 200) — passes on the new rules, **fails on the old rules** (checked);
  board UI test (student eraser blocked, teacher erases). CRM Vitest, ESLint, build — see the PR.
- Not covered: strokes/notes the teacher drew are still erasable by the student (elements carry no creator field,
  only the last editor); would need a `createdByUid` field + migration if wanted.
- **Needs the owner:** `firestore:rules` deploy after merge.

### Owner's Live Classroom wish list (2026-10-04), planned as separate PRs in this order
1. Teacher materials protected from the student's eraser — #266 (merged).
2. Transcript visible only to the teacher/admin (rules: student read removed); in the student profile each lesson
   opens a choice „Tunni analüüs” (transcript, status while transcribing) or „Tahvel” (that lesson's board page).
3. Board text: font choice and editing existing text.
4. Board with edges (fixed page size) instead of infinite canvas; „Uus leht” for a separate explanation; every page
   can be renamed (owner, 2026-10-04).
5. Interactive worksheet on the board (not a separate overlay) — the worksheet is the lesson.
6. Live Classroom opens as the teacher's workspace; invite students from there; prepare a lesson in advance.
7. The student always has their own board in Live Classroom (homework, self-study) even without a lesson.
8. Group lessons (several students in one room — needs an SFU/mesh decision).
9. Worksheet constructor flexibility (diagrams, combining blocks, …) — separate track.
Owner decisions 2026-10-04: item 8 — up to 4 students, peer-to-peer video (no paid server), a separate group board
seen by all participants (each student keeps their own board); item 9 — first diagrams/schemes, combining blocks
(side by side / grouped), block styling (frame, background, heading colour, icon). Tables later.

## 2026-10-04 — Live Classroom: camera/microphone choice + recording file-number fix — branch `claude/affectionate-ritchie-dh2x9j`

Checked `origin/main` `18de8a7` (after #264), no open PRs. Owner: „занимаемся сейчас разработкой” (Live Classroom).
- **Bug fixed (recording):** `RoomRecorder` numbered files per `TrackRecorder` instance, so a student reconnect (more
  frequent since auto-recovery #261) restarted at `student_000` and overwrote uploaded audio. Numbers now continue
  per track for the whole recording; the teacher track also restarts (continuing numbers) when the local stream
  changes (microphone switch).
- **Device choice:** `useLiveCall` lists cameras/microphones (`enumerateDevices`, refreshed on `devicechange`),
  `switchDevice(kind, id)` swaps the track on the running connection via `replaceTrack` (no new offer), keeps mute,
  stops the old track, reports a new local stream (recording follows); a camera change during screen sharing applies
  when sharing stops. Choice remembered in this browser (`localStorage keelesepp.liveDevices`) and preferred
  (`ideal`, never blocks) on the next call. Room: Rohkem → „Kaamera ja mikrofon” (teacher and student) with two
  selects and a microphone level bar.
- Tests: `useLiveCall.devices.test.jsx` 3 (constraints, mic switch mid-call, camera vs screen share), recorder 1
  (numbers 0,1,2 student / 0,1 teacher across reconnect + mic switch; an older test now reuses one local stream as the
  app does), LiveRoom 1. CRM Vitest 132 files / 830 tests; ESLint clean; build OK. Not tried in a real browser with
  two devices.
- Client only; no rules/Functions change.
- Exactly one next safe step: in a lesson, switch the microphone (e.g. to headphones) from Rohkem → Kaamera ja
  mikrofon and check that the student keeps hearing you and the recording continues.

## 2026-10-04 — Release: recording consent rules (#263) — RELEASED

Owner deployed `firestore:rules` from `~/keelesepp-release` at main `b5ee4e7`: „uploading rules firestore.rules” →
„released rules … Deploy complete!” (screenshot). An earlier run before the merge reported „already up to date”, which
also confirms the `lessonRecordings` rules were already live, so auto-recording (#262) works for cards with consent.
Housekeeping: `firestore-debug.log` (emulator log, committed by accident in #263 and earlier) removed from git and
ignored (`*-debug.log`). Merged by the agent with the owner's permission after green CI: #261, #262, #263.
Exactly one next safe step: log in as a test student → answer „Tunni salvestamine” → then a teacher call shows
„Salvestan”.

## 2026-10-04 — One-time recording consent on first login — branch `claude/affectionate-ritchie-dh2x9j`

Checked `origin/main` `bbdc0e7` (after #262, auto-recording; merged by the agent with the owner's permission after
green CI). Owner: „а можно разово сделать когда первый раз заходишь на платформу” — consent asked once at first login.
- **Policy change (owner's decision):** before, only staff could set consent; now the student or linked parent answers
  themselves. `firestore.rules` `students` update: new branch for `ownsStudent` limited to the four consent fields,
  boolean value, `recordingConsentByUid == uid()`.
- `features/lesson-recording/RecordingConsentPrompt.jsx` + `consentModel.js`: modal „Tunni salvestamine · Запись урока”
  (et + ru, who sees it, 60-day audio deletion) with „Nõustun” / „Ei nõustu”; on `StudentDashboardPage` (not in staff
  preview) and `ParentDashboardPage` (one child after another). Cards with a parent account are the parent's question.
  `lessonRecordingsService.answerConsent`.
- Tests: prompt 4 (who is asked, student yes, parent no+yes, error keeps it open); emulator
  `lesson-recording-emulator.integration.js` now checks own signed answer 200, withdraw 200, unsigned / other uid /
  extra field / non-boolean / someone else's card 403 (ran locally: pass). CRM Vitest 131 files / 825 tests; ESLint
  clean; build OK.
- **Needs the owner:** `npx -y firebase-tools@15.22.3 deploy --only firestore:rules --project keelesepp-5136b` from a
  clean main checkout. Until then answers fail with a permission error (shown in the window; nothing else breaks).
- Exactly one next safe step: owner deploys the rules, logs in as a test student and answers the question.

## 2026-10-04 — Live Classroom: lessons are recorded automatically — branch `claude/affectionate-ritchie-dh2x9j`

Checked `origin/main` `837e8f1` (after #261, merged by the agent with the owner's permission after green CI).
Owner held 2 lessons today and found no recording or transcript: recording was manual (Rohkem → Tunni salvestamine →
Alusta salvestamist), so nothing was recorded; those lessons cannot be recovered. Owner: consent always exists, the
recordings are for analysing students.
- `features/lesson-recording/RoomRecorder.jsx`: `auto` mode — starts when the teacher's microphone stream exists and
  the card has `recordingConsent === true`; when the call ends it closes the files and sets `uploaded`; the next call
  starts a new recording; a manual „Lõpeta salvestamine” is respected until the call ends; unmounting (leave room /
  Lõpeta tund) now finishes the recording instead of leaving it `recording` for the worker's 3-hour hand-over.
  `onStateChange` reports `{ recording, error }`.
- `features/live-classroom/LiveRoom.jsx` + `liveRoom.css`: recorder runs in auto mode; top-bar pill „Salvestan” (red,
  opens the recording drawer) or „Ei salvesta” when the call is on and the card has no consent.
- Not done (blocked in the agent session as personal-data handling): automatically setting `recordingConsent` on
  student cards. Consent is still set per student by staff (card → Õppetöö → Tunnisalvestised → „Märgi nõusolek
  saadud”); without it nothing is recorded (rules unchanged).
- Tests: `lessonRecording.test.jsx` +4 (auto start/stop/restart, manual stop respected, no consent → no start, unmount
  finishes). CRM Vitest 130 files / 821 tests; ESLint clean; build OK. Client only; no rules/Functions change.
- Transcripts still need the worker on the school Mac (`tools/lesson-transcriber`, `docs/LESSON_RECORDING.md`); no
  record in this file that it was ever set up, nor of the `lessonRecordings` Firestore/Storage rules release.
- Exactly one next safe step: owner marks consent on the cards of current students and checks that the rules are
  released (a lesson shows „Salvestan” and appears under Tunnisalvestised as „uploaded”).

## 2026-10-04 — Live Classroom: automatic call recovery — branch `claude/affectionate-ritchie-dh2x9j`

Checked `origin/main` `467ceac` (after #260), no open PRs. Owner: „продолжаем развивать наш live classroom”; the owner
also allowed merging to main directly after green CI („сливать все в мэйн сразу”, 2026-10-04).
Before: when a call dropped the teacher had to press „Taasta ühendus” by hand; a student page reload left the call dead.
- `crm-v2/src/features/live-classroom/useLiveCall.js` (client only): the teacher side re-offers on a fresh session by
  itself — `failed` after 1.5 s, `disconnected` after an 8 s grace period (it often heals on its own; no re-offer if it
  does), at most 3 automatic tries in a row (counter resets on „Ühendatud”, a manual reconnect or hang-up); then the
  status is „Ühendus ebaõnnestus” and the manual button stays. The counter also resets and a try starts when the
  student's presence comes back online or the teacher's browser fires `online`. The student already answered every
  new offer automatically while the camera is on, so no student change. Same signal types → no rules/Functions change.
- Tests (`LiveLessonCallPanel.test.jsx` +4): re-offer after the grace period with a new session id; no re-offer when
  the call heals; stop after three tries with the manual button left; student answers a second session without a new
  camera prompt. CRM Vitest 130 files / 817 tests; ESLint clean; build OK.
- Not verified in a real two-device call from the agent sandbox.
- Production: client only (Vercel builds main). No Firestore/rules/Functions deploy.
- Exactly one next safe step: in a real lesson, turn the student's Wi-Fi off and on (or reload the student page and
  press „Liitu kõnega”) and check that the call returns to „Ühendatud” without pressing „Taasta ühendus”.

## 2026-10-04 — TURN relay released

Owner set secrets `CLOUDFLARE_TURN_KEY_ID` and `CLOUDFLARE_TURN_API_TOKEN` (Secret Manager; access granted to
`keelesepp-5136b@appspot.gserviceaccount.com`) and deployed `functions:liveTurnApi` from main `1b424d9`:
„Successful create operation”, URL `https://us-central1-keelesepp-5136b.cloudfunctions.net/liveTurnApi`. The CRM part
is in the Vercel build of main. Not verified from the agent sandbox (its network cannot reach cloudfunctions.net).
Exactly one next safe step: one real call, student on mobile data (Wi-Fi off) → „Ühendatud” with video both ways.

## 2026-10-04 — Live Classroom TURN relay (Cloudflare Realtime TURN) — branch `agent/live-turn`

Owner chose Cloudflare Realtime TURN (1 000 GB/month free, then $0.05/GB; Twilio $0.40/GB; Metered free 500 MB) and
created the TURN app „keelesepp”, Turn Token ID `8f87297ce0e9fac7a5d53a04bec0b83a` (not secret). The API token is kept
by the owner only.
- `functions/live-turn-core.js` + `liveTurnApi` (POST `/ice` { invitationId }): Firebase ID token required; only the
  teacher or the student of an **accepted** invitation (403/409 otherwise); calls Cloudflare
  `generate-ice-servers` with a 4-hour TTL; returns only Cloudflare STUN/TURN urls + short-lived credentials
  (sanitised); without secrets → `{ configured: false, iceServers: [] }`. Secrets: `CLOUDFLARE_TURN_KEY_ID`,
  `CLOUDFLARE_TURN_API_TOKEN` (Secret Manager).
- CRM: `services/firebase/liveTurn.js`; `useLiveCall` fetches TURN as soon as the room is open, waits for it at most
  3 s in parallel with the camera prompt, refreshes after half the TTL, and always keeps STUN; any failure → STUN only
  (the previous behaviour).
- Tests: functions 218 (incl. 4 new: access, sanitising, request, fallback); CRM 130 files / 813 (incl. 3 call tests,
  2 service tests); ESLint; build.
- **Needs the owner** (from `~/keelesepp-release` at current main): set the two secrets and deploy
  `functions:liveTurnApi`; then one call over mobile data to confirm.
- Exactly one next safe step: owner sets the secrets and deploys `liveTurnApi`.

## 2026-10-04 — Generator: gap tasks with 2–4 sentences — branch `agent/generator-more-gaps`

Owner checked the live A2-003 sheets (crm.epkoolitus.ee, release of main `5968c13`): Avasta, Harjuta and Kasuta render
correctly, translation hints no longer leak answers. Weak spot seen there: „Täienda laused” had one sentence for a
13-word bank. `engine/content.js` now takes `closedItemCount` gappable sentences (support 2 / core 3 / challenge 4),
consuming only sentences that really get a gap. All 49 ready lessons × 3 modes × 3 seeds: no error diagnostics; gap
blocks 2–4 sentences (average 2.7). New test; CRM Vitest 129 files / 808 tests; ESLint; build. Saved sheets unchanged.
Exactly one next safe step: owner generates one lesson again and checks the gap task.

## 2026-10-04 — Rule-based generator step 4: 8 new grammar points, 50/100 A2 lessons ready — branch `agent/generator-grammar-2`

Checked `origin/main` `4ca291b` (after #256). New pattern grammar points: imperative, modal verbs, want/start +
infinitive, meeldima, mul on / mul valutab, simple past, present for the future, comparison (+ numeral shop pattern).
`LESSON_GRAMMAR_POINTS` now maps 35 lessons (A2-016…021, 023, 025, 026, 027, 030, 032, 033, 035, 037, 040, 042, 045,
047, 050, 052, 055, 059, 060, 062, 064, 065, 068, 070, 072, 076, 077, 080, 081, 085); with 15 hand-written packs 50 of
100 lessons are ready. Fixes: sentence-initial gaps keep the capital letter in answer/options (imperative lessons
otherwise lost their answer key); „kuhu” prefers the long illative when the short one equals the base form (Tartusse).
Comparatives are curated in `lexicon/source.json` (21 adjectives). Checks: every mapped lesson ready and error-free on
5 seeds; 48 hand-checked pattern sentences; CRM Vitest 129 files / 807 tests; ESLint; build; `build_forms.py --check`.
No Firestore/rules/Functions change. Details: `docs/GENERATOR_LEXICON.md`.
Exactly one next safe step: owner reviews a few generated lessons (e.g. A2-023, A2-042, A2-059) in Õppevara.

## 2026-10-04 — Rule-based generator step 3: 8 more lessons generated from patterns — branch `agent/generator-pattern-lessons`

Stacked on #255. `patterns/profileFromPatterns.js` turns grammar points into a full ready profile; `factory.js`
`LESSON_GRAMMAR_POINTS` (hand-written pack → patterns → keywords) makes A2-016…A2-021, A2-026, A2-027 ready without
hand-written sentences; static coverage is now 23 of 100 A2 lessons. New grammar points `local-inner` (sees) and
`surface-local` (peal). `engine/content.js` uses pattern answers for gaps/choices (bank = forms of the same word);
role-card and true/false label wording fixed for all lessons. Generator routes are lazy (main bundle 300 → 257 kB gzip).
Checks: generator Vitest 179 (incl. 12 new: every pattern lesson ready on 4 seeds, one-answer choices, one-word error
pairs, „sees” inner-only, „peal” surface forms, pack precedence); CRM Vitest 129 files / 755 tests; ESLint; build.
Browser on emulators (admin): /library/lessons/a2-017/worksheets → „Genereeri 3 töölehte” saved three drafts; the
Harjuta sheet shows „Toomas on pärit ___” with Eestisse / Eestis / Eestist, error repair „Maksim tuleb kontoris”, choice
teatris / teatrist / teatrisse, status „Avaldamiseks valmis”. No Firestore/rules/Functions change.
Exactly one next safe step: owner opens A2-017 and A2-027 in Õppevara, generates and reviews the sheets.

## 2026-10-04 — Rule-based generator step 2: grammar sentence patterns — branch `agent/generator-patterns`

Checked `origin/main` `d68261f` (after #254, lexicon). `worksheet-generator/patterns/`: 21 sentence frames for six
grammar points (olema/present, genitive, local cases, partitive object, adjective agreement, numeral + partitive),
filled from the Vabamorf lexicon; about 3 250 distinct valid sentences, each with an exact answer and same-word wrong
options. Combinations without two different wrong options are skipped. Lexicon fix: Venemaa/Saksamaa use outer local
cases. Checks: patterns Vitest 28 (23 hand-checked sentences + invariants over 3 seeds per grammar point); CRM Vitest
128 files / 743 tests; ESLint; build; `build_forms.py --check` up to date. Not yet wired into the worksheet engine
(no app behaviour change). Details: `docs/GENERATOR_LEXICON.md`.
Exactly one next safe step: step 3 — use pattern sentences in gap/choice/error-repair tasks for lessons whose
roadmap focus maps to a grammar point.

## 2026-10-04 — Rule-based generator step 1: Estonian form lexicon (Vabamorf, offline) — branch `agent/generator-lexicon`

Checked `origin/main` `dca0479`. Owner chose a real generator without AI instead of hand-writing every module. Step 1:
`worksheet-generator/lexicon/` (`source.json` 314 words with tags/translations/local-case class, generated
`forms.json`, `index.js` API) and `tools/lexicon/build_forms.py` (EstNLTK 1.7.5 Vabamorf, run offline; `--check` for
staleness). The build refuses ambiguity: 11 words needed a genitive hint, 4 needed pinned variants (lähevad not
lähvad, pidi not pidas, joosta, tee → teesid). Details and next steps: `docs/GENERATOR_LEXICON.md`.
Checks: `build_forms.py --check` up to date; lexicon Vitest 58 (all entries complete + 53 hand-verified forms);
CRM Vitest 127 files / 715 tests; ESLint; build OK. The lexicon is not yet used by the app (no bundle or behaviour
change); no Firestore/rules/Functions change. CI does not run the Python build (needs EstNLTK); the JS tests guard
the committed JSON.
Exactly one next safe step: step 2 — sentence patterns with typed slots filled from this lexicon.

## 2026-10-04 — Worksheet generator (no API): A2 modules 2 and 3 complete, A2-007…A2-015 — branch `agent/a2-factory-next`

**Module 3 (Library v4)** in the same PR: `daily-routine` (A2-011 Minu päev; contexts with times, so clock practice
fits), `clock-time` (A2-012: kell, pool/veerand/kolmveerand, alates kella …-st kuni kella …-ni, enne/pärast, kestab),
`frequency` (A2-013: alati…mitte kunagi, kord nädalas, „Kui tihti?”; frequency phrases typed as adverbs so they are
never offered as wrong options for one another), `week-plan` (A2-014: weekdays, siis/pärast seda/aga/ja; 70–90-word
text), A2-015 Kontroll 3 = all four. More fixes found by reading the output: translation blocks showed the accepted
`alternatives` as the learner-visible hint (an answer leak) — `engine/content.js` now leaves the hint empty; two
vocabulary meanings that overlapped („kuni” до / „enne” перед / до) made a meaning choice ambiguous — fixed, and a test
requires unique translations per pack. CRM Vitest 126 files / 655 tests (generator 81), ESLint, build OK.
Next safe step after merge: module 4 packs (A2-016…A2-020).


Checked `origin/main` `35d618f`. Owner: continue worksheet generation without an external API. Static ready coverage
was A2-001…A2-006; now A2-001…A2-010 (modules 1 and 2). Content Library v3:
- `possession-genitive` (A2-007 „Kelle oma? Genitiiv”): minu/sinu/tema/meie/teie/nende, kelle, oma, venna, õe; three
  contexts (pere asjad, kadunud asjade kast, nimesildid), 10 sentences, dialogue, 3 error pairs, 2 translations.
- `appearance-character` (A2-008 „Välimus ja iseloom”): 15 words/phrases incl. väga/üsna/natuke patterns, comparison.
- `people-profiles` (A2-009 „Minu inimesed”, reading): three short profiles (Kati, Sergei, Liisa) as fact sentences.
- A2-010 Kontroll 2 combines the four module-2 packs. Clock tasks are kept out of A2-007…A2-009 (contexts have no
  times); A2-010 can show one because `family-relations` has times (as A2-006).
- **Quality fixes found by reading the output:** (1) gap/choice items need a vocabulary word in the exact surface form;
  10 sentences in older packs (A2-002…A2-006) had none, giving an empty answer key on some seeds — vocabulary
  extended (e.g. `oleme`, `elab`, `räägime`, `kehtib`, `kell`, `sugulased`, `kolm last`); a test now checks every
  sentence of every pack. (2) `engine/content.js` context choice took distractors from the whole word list, so
  „___ isa töötab haiglas: tema / sinu” had two right answers; distractors now come from another part of speech first.
- Tests: factory 9 lessons ready + 5-task bundles; A2-007…A2-010 error-free across 6 seeds; sentence-coverage for all
  packs; one-correct-answer test over 30 seeds; true/false names the situation. CRM Vitest 126 files / 642 tests, ESLint, build OK.
- No Firestore/rules/Functions change; nothing is saved automatically (teacher still saves a draft explicitly).
  (3) „Kas lause sobib olukorraga?” marked a sentence from another context as false but never named the situation;
  the instruction now reads „Olukord: <context label>. Märgi Õ, kui lause sobib …, ja V, kui ei sobi.”

## 2026-10-04 — Release of #247–#251: RELEASED

Owner deployed from `~/keelesepp-release` at main `234c53f` (2026-10-04): `firestore:rules` (#247; the second run
reported "already up to date", so the first run had released them) and `functions:gcalApi,functions:syncAllCalendars`
(#248, both "Successful update operation"). Vercel production deployment for `234c53f` succeeded; `crm.epkoolitus.ee`
serves `index-DqP7EBPE.js` / `index-Z8w5gXzU.css`, which contains the Esmane hindamine styles (#250) — #249 is in the
same build. Not yet done: the owner's three manual checks (shared-student teacher dashboard; calendar → Alusta tundi →
Lõpeta tund → Toimunud; one real Esmane hindamine).
Exactly one next safe step: those three manual checks.

## 2026-10-04 — Development vector: what is done, what waits for the owner, what is next

Checked `origin/main` `e5d2d32` (after #250).
Owner asked to plan the further direction for unfinished functions and finish them („наметь дальнейший вектор
развития … и доведи их до конца”). Finished in code and merged today: #247 (teacher reads via `teacherUids`),
#248 (calendar seven-day deletion window + held lessons protected), #249 (Live Classroom „Lõpeta tund” → calendar
lesson), #250 (Esmane hindamine in v2). Codex drafts #234, #235, #230 closed as superseded.

**A. Waits for the owner (commands on the Mac, from a clean `origin/main` checkout):**
1. Rules for #247: `npx -y firebase-tools@15.22.3 deploy --only firestore:rules --project keelesepp-5136b`.
2. Functions for #248: `cd functions && npm ci && cd .. && npx -y firebase-tools@15.22.3 deploy --only
   functions:gcalApi,functions:syncAllCalendars --project keelesepp-5136b`.
3. CRM: Vercel builds `main` automatically (#249, #250 are client-only).
4. Manual checks: teacher with a shared student opens Ülevaade; a calendar lesson → Alusta tundi → Lõpeta tund →
   Toimunud; one real „Esmane hindamine”.

**B. Parked by the owner (not touched without his word):** TURN server for video on strict networks; Storage CORS
(`storage.cors.json`) for photo cutting; 54 unmatched Google events; `APP_BASE_URL` → crm.epkoolitus.ee in e-mails;
„Minu tööpäev”; redoing the parent study-terms gate (#226); Instagram outbound; Vercel paid plan.

**C. Next in code, in this order (each its own PR):**
1. Role smoke support: a short checklist page in docs for the owner's 30-minute run (gate 5 of
   `docs/CRM_V2_READINESS.md`), then fix whatever it finds — this is what unblocks switching v1 off.
2. Admin tools in v2 only when asked: first „Tegevused” (read-only `activityLog` viewer) — smallest and useful for
   checking teachers' work.
3. Live Classroom: scheduled cleanup of expired invitations (needs a Functions deploy; low value until there are many).
4. Adaptive lesson mode: owner decision needed — keep v1 delivery or rebuild on studio worksheets.
5. Retire v1 after 2–3 weeks of daily work in v2 with no return to v1 (`docs/CRM_V2_MIGRATION_PLAN.md` step 6).

Exactly one next safe step: owner runs A.1 and A.2.

## 2026-10-04 — Esmane hindamine (initial assessment) in CRM v2 — branch `agent/initial-assessment-v2`

Checked `origin/main` `60f3419`. Item 3 of the remaining v1 functions (`docs/CRM_V2_MIGRATION_PLAN.md`, "initial level
test"): the public website level test `tasemetest.html` already works (leads → `websiteLeadApi`); what was missing in
CRM v2 is v1's student-card "Esmane hindamine" baseline. Ported on the **same** document and rules, no schema change:
- `features/initial-assessment/assessmentModel.js` (ESM port of `initial-assessment-core.js`: 20 grammar topics,
  15 vocabulary areas, 6 skills, statuses/priorities; `assessmentPayload` writes exactly the 18 keys
  `validInitialAssessment` requires; creation fields kept on update; 0 % stays a result, empty = Hindamata; percentages
  never set the CEFR level), `services/firebase/initialAssessments.js` (`get`, `save` → `setDoc`
  `studentInitialAssessments/{studentId}`).
- `InitialAssessmentPanel.jsx` + css: new profile tab „Esmane hindamine” — empty state „Loo esmane hindamine”, view
  (levels, overall status, grammar/vocabulary averages, "Esimesena harjutada" = weakest topics, tables, notes) and edit
  (score → suggested status, priority, comment, add/remove topics, strengths/development areas one per line, focus).
- Tests: model 5, panel 2; new emulator test `functions/initial-assessment-rules-emulator.integration.js` (in
  `test:emulator`) writes the exact v2 document: the student's teacher creates/updates OK; forged `createdByUid`,
  extra key and the student → 403; another teacher → 403 once `teacherScopeReadEnforced` is on (legacy mode lets any
  teacher read/write any student, existing behaviour).
- Checks: emulator `test:emulator` 46/46; CRM Vitest 125 files / 624 tests; ESLint clean; build OK. Browser on local
  emulators as teacher: create → save → reload shows it; Firestore document as expected; 1440 px and 390 px without
  horizontal scroll (a first 390 px run overflowed to 654 px — fixed with `minmax(0,1fr)` on the card).
- Production: client only (Vercel). No rules/Functions deploy needed.
- Exactly one next safe step: the owner opens a student → „Esmane hindamine” and saves one real baseline.
## 2026-10-04 — Live Classroom → calendar lesson: „Lõpeta tund” opens the lesson to mark it held — branch `agent/live-room-lesson-link`

Checked `origin/main` `60f3419` (after #247). Closes the open Live Classroom item "lesson completion integration".
- `features/live-classroom/lessonLink.js`: „Alusta tundi” in the calendar lesson panel remembers which lesson
  (`<occurrenceId>|<date>`) the room belongs to — in the teacher's browser (`localStorage`
  `keelesepp.liveLessonLinks`, last 20), so the invitation document, rules and Firestore stay unchanged.
- `LiveClassroomPage`: after the teacher ends the room, the CRM opens `/calendar?lesson=…` (that lesson's panel,
  the usual „Toimunud” form with topic and homework — no automatic attendance or invoice). Without a link (room
  started from Live Classroom directly, other device) it opens `/calendar?student=<id>`. The student side is unchanged.
- `CalendarPage`: `?lesson=<occurrenceId>|<date>` sets the date and opens the panel; malformed values are ignored.
- Tests: `lessonLink.test.js` (3), CalendarPage +2, LiveClassroomPage +1. Full CRM Vitest 124 files / 622 tests,
  ESLint clean, build OK.
- Not done (deliberately): server-side cleanup of expired invitations — the client already treats them as expired;
  a cleanup needs a new scheduled Function and a deploy, low value.
- Exactly one next safe step: in a real lesson, start from the calendar → Lõpeta tund → mark Toimunud.

## 2026-10-04 — Calendar: seven-day deletion window in main + held lessons protected (replaces draft #234) — branch `agent/calendar-tombstone-window`

Checked `origin/main` `3802f0b`. Draft #234 had conflicts; its worksheet part is already in main in another form
(`.ws-fix__prompt`). Its Functions part was deployed to production (`gcalApi`, `syncAllCalendars`) but was not in
main, so a Functions deploy from main would have undone it. Ported here:
- `functions/index.js` `syncTeacherCalendar`: `syncWindowStart = nativeWindowStart` (the seven-day tombstone lookback)
  instead of "today", so a lesson deleted in Google after it happened is removed from KeeleSepp too.
- **New safety guard** (`calendar-sync-core.js` `hasRecordedLessonResult`): with the window reaching into the past,
  a schedule that already has a result (status Toimunud/Puudus_p/Puudus_eta, `lessonEntryId`, `attendance`, or an
  `occurrenceStatuses` entry) is never deleted/cancelled by the reconcile. The deployed #234 version lacked this:
  a held lesson deleted in Google within seven days would have lost its schedule record.
- Tests: `functions/calendar-sync-core.test.js` +2. Functions `node --test` 214/214.
- **Needs the owner:** `cd functions && npm ci && cd .. && npx -y firebase-tools@15.22.3 deploy --only
  functions:gcalApi,functions:syncAllCalendars --project keelesepp-5136b` to put the guard into production.
- Exactly one next safe step: owner deploys those two functions.
## 2026-10-04 — Teacher dashboard for secondary assignments (replaces draft #235) — branch `agent/teacher-shared-read`

Checked `origin/main` `3802f0b`. Owner asked to finish the open work („доведи до конца”). Codex draft #235 had
conflicts and, taken as a whole file, would have removed the `curriculumLessons/{id}/worksheets` rules that main
added later; only its rule hunk and tests were ported.
- `firestore.rules` `teacherCanRead(data)`: with `teacherScopeReadEnforced()` on, a teacher reads a document when
  `teacherUid == uid()` **or** `teacherUids` contains the uid (secondary/active enrolment). Before, the CRM's second
  query (`teacherUids array-contains`) was denied and the whole Ülevaade/student load failed for such teachers.
  Unscoped teacher collection reads stay denied.
- Tests: `functions/finance-emulator.integration.js` (shared student readable via `teacherUids`, broad query still
  403); `crm-v2/src/services/firebase/students.pagination.test.js` (both queries merged).
- Checks: emulator `npm run test:emulator` 45/45; lesson-drafts 14/14 and interactive-lesson 13/13 (run separately,
  as in CI — run together in one process they disturb each other's "collections unchanged" checks); students
  pagination Vitest 5/5.
- **Needs the owner:** `npx -y firebase-tools@15.22.3 deploy --only firestore:rules --project keelesepp-5136b` after
  the merge. No data change, no Functions change.
- Exactly one next safe step: owner deploys the rules and opens Ülevaade as a teacher with a shared student.

## 2026-10-04 — Current state check: production, open PRs, documentation

Checked `origin/main` `9730042` (2026-10-03 11:09 +0300).
- **Production CRM v2 = latest main.** GitHub deployment record: Vercel Production for `9730042` succeeded
  (2026-10-03 08:13 UTC). `crm.epkoolitus.ee` serves bundle `index-8l3yrDXg.js` / `index-DorkPUH9.css`; the live CSS
  contains the generator Factory UI (`.content-pack-factory-panel`), the Live Classroom room (`.lr-top`, `.sb-dock`),
  tasks and the notification centre, and no `study-terms-gate`. Git-driven Vercel production deployments do reach the
  custom domain; only the CLI deploy of 2026-10-02 needed a manual `vercel alias set`.
- **Released 2026-10-02 by the owner** (main `3517dd8`): #227, #228, #229, #231, #232; `staffOperationsApi` and
  `firestore:rules` deployed with `npx -y firebase-tools@15.22.3 … --project keelesepp-5136b` (`npm ci` in
  `functions/` first; plain `npx firebase` is not installed on the owner's Mac).
- **Open PRs needing a decision:**
  - #235 (draft) — teacher read rule also accepts `teacherUids` (secondary assignment). Verified here: its emulator
    test passes with the PR rules and fails with main's rules, i.e. when `teacherScopeReadEnforced()` is on, a teacher
    whose students use `teacherUids` gets permission-denied for the whole Ülevaade/student load. Needs merge + rules
    deploy (owner).
  - #234 (draft, conflicts with main) — its Functions part (calendar tombstone reconcile window = the seven-day
    lookback) is **already deployed** (`gcalApi`, `syncAllCalendars`) but is **not in main**: a Functions deploy of
    those functions from main would undo it. Its worksheet part is already in main (`93e68c7`). Port the
    `functions/index.js` change to main.
  - #230 (draft) — superseded by this record (release was done on 2026-10-02).
- Exactly one next safe step: owner decides on #235 (merge + `firestore:rules` deploy) and porting #234's Functions
  change into main.

## 2026-10-03 — A2-006 family Content Pack — in main `9730042`, Vercel production READY

Checked fresh `origin/main` `c55390c5b6587fc1db0dc3ff70c21869ea9078c6`; open PRs #230, #233, #234 and
#235 do not own A2-006 or Content Library sources. This bounded slice adds Content Library v2 pack
`family-relations` and the explicit A2-006 blueprint for `Pere ja lähedased`. The curated source contains one checked
focus, 12 family words, three independent contexts (family tree, photo and visit), ten controlled sentences, a
dialogue, two error pairs, two translations, two speaking prompts, one writing prompt and an Estonian success
criterion. `kelle?`, possessive forms and the learner outcome of describing at least four people are covered directly.

A2-006 is registered as a static ready fallback through the existing Factory/profile registry. It generates the same
three five-task Avasta/Harjuta/Kasuta drafts as other supported lessons and remains only an unsaved preview until the
teacher explicitly saves. No worksheet, assignment, Firestore, rule, Function, finance, calendar or student-profile
contract changed; no production data write or automatic worksheet/profile publication is introduced.

Changed product files: `factory/contentLibrary.js`, `factory/factory.js`, `factory/factory.test.js`,
`profiles/index.js` and `profiles/authoring.test.js`. Architecture, generator and A2 curriculum documentation now
record Content Library v2 and A2-001…A2-006 coverage. Local verification passed: focused Factory/profile Vitest 2
files / 19 tests; full CRM Vitest 123 files / 616 tests; ESLint; production build; the existing large-chunk warning
remains. GitHub main workflows, matching Vercel production READY state and authenticated browser smoke check remain
release gates.

Exactly one next safe step: deliver the verified A2-006 slice to the authorized `main`, wait for all main checks and
the matching Vercel production deployment, then verify the A2-006 Factory preview without saving it.

## 2026-10-03 — A2 module 1 gold standard + Content Pack Factory v1 — shipped to `main` (#245)

Checked fresh `origin/main` `2bf73086d504bcd8047d504ab53a3a504e27f441`; open PRs #230, #233, #234 and
#235 do not own the generator Factory or first-module content packs. This slice validates A2-001 as the gold-standard
diagnostic pack, adds independent ready curated profiles for A2-002…A2-005 and introduces a single-lesson Content
Pack Factory preview/edit/save workflow. The versioned Content Library contains six reusable curated packs; it never
constructs natural Estonian by random word mixing. Unsupported lessons report missing sources. Factory drafts remain
local until an explicit teacher save and cannot silently replace an embedded profile.

Generated learner metadata no longer copies Russian roadmap goal, success or module strings. Titles come from the
curated profile, subtitles are phase-specific Estonian text and `canDo` comes only from checked Content Pack criteria.
The production A2-001 page was inspected before the fix: errorfix displayed the wrong sentence normally with a blank
correction field and kept the answer hidden, while the Russian goal was visibly leaking into the subtitle. Existing
Worksheet Studio editing, standalone focus generation, task regeneration, child-sheet persistence and draft/version
contracts are reused unchanged; no worksheet, assignment, finance, portal, Firestore rule or Function contract was
changed.

The CEFR adapter now reads `eesti_soned.json` through authenticated Firebase Storage `getBytes()` with a 10 MiB
limit. The old adapter obtained a download URL and then used a second cross-origin browser fetch, which surfaced as
`Failed to fetch`. Lexicon loading now runs independently of lesson and worksheet loading: a slow or unavailable
shared lexicon never blocks the authoring workspace, and generation falls back to the curated lesson vocabulary.

Final code verification on `43834f5e335190dd58d7cc0cdbabcea8ab5ad122`: local CRM Vitest 123 files / 613
tests, ESLint, production build and `git diff --check` passed; the build retains the existing large-chunk warning.
GitHub `CRM v2` run 37107710590 passed verify plus the Java 21 Auth/Firestore/Functions security-regression job;
independent `CRM v2 CI` run 37107710604 and `Financial Core emulator` run 37107710597 passed. The local emulator
attempt itself could not start because this Mac has no Java runtime, so security evidence comes from the successful
GitHub jobs. Vercel production deployment `dpl_4SEtLL5NyotZSfvXMEv32QGm2QUv` for the same code head is READY.
Authenticated production smoke testing confirmed that A2-001 opens without waiting for the lexicon, and A2-002
shows a Ready Factory preview with `introduction · basic-questions`; no draft was saved or published during the check.

Exactly one next safe step: curate and verify the source packs for A2-006 before extending Factory coverage beyond
the completed first five lessons.

## 2026-10-02 — A2 Curriculum v1 + CRM v2 installer — direct main delivery

Owner explicitly authorized direct `main` delivery and Vercel pickup for this session. Starting main before the A2
slice was `e2c07a7d50acdaada43d73fd1d848387a5501a6e`. Unrelated open PRs #230, #233, #234 and #235 were inspected;
none owns the A2 roadmap data, CRM v2 installer or LibraryPage integration.

Implemented `est-a2-curriculum-v1`: 20 modules, 100 stable one-student A2 lessons (`a2-001`…`a2-100`) and one
formative assessment every fifth lesson. Five canonical JSON shards plus a manifest store the curriculum source.
CRM v2 contains a generated mirror at `crm-v2/src/features/curriculum/a2Roadmap.json`; the pure
`a2Curriculum.js` validator/projector enforces the 20/100 identity, mandatory lesson fields, unique IDs/source keys
and the every-fifth assessment contract.

The active installation path is now CRM v2 Õppevara. Until all 100 records are present, staff sees
`Paigalda A2 õppekava`. `curriculumInstallerService.installA2()` writes exactly 100 stable
`curriculumLessons/{lessonId}` documents in one Firestore batch with `merge:true`. Its payload contains only
curriculum/roadmap metadata plus update audit fields; it does not contain `worksheetDoc`, `generatorProfile`,
published worksheet snapshots or child-sheet data. Re-running the installer therefore updates the same lesson IDs
without creating duplicates or intentionally overwriting authored worksheet/generator content. Legacy
`haldus-a2-roadmap/` uses the same stable identity and remains only a compatibility fallback.

No new Firestore collection, rule, Function, worksheet schema, assignment schema or AI/provider dependency was added.
No production Firestore installation was triggered by the agent; installing the 100 records remains an explicit
authenticated staff action in Õppevara.

Verification on code head `4f1dc392754c38cb0c080270daa670260635f586`:
- GitHub `CRM v2` run 37063050428: SUCCESS — lint, production build, 121 Vitest files / 595 tests and the
  Auth/Firestore/Functions security-regression emulator suite all passed.
- GitHub `CRM v2 CI` run 37063050353: SUCCESS — tests, lint and production build passed independently.
- GitHub `Financial Core emulator` run 37063050360: SUCCESS.
- Earlier red runs were test-only: one A2 test used an ESLint-unknown `structuredClone` global, and an older
  Coverage Dashboard assertion incorrectly required exactly 5 eligible activities per phase although the readiness
  contract is at least 5. Both tests were corrected without changing product behavior or weakening readiness.
- Vercel Git status for the verified code head is blocked by the account `build-rate-limit`, not by a code/build
  error. The last automatic production deployment therefore does not yet contain the CRM v2 installer.

Documentation: `docs/A2_CURRICULUM_100.md` defines volume, outcomes, thematic coverage, methodology, grammar
progression, assessment and the CRM v2 installation/data contract. Root `a2-roadmap.test.js`, CRM v2
`a2Curriculum.test.js`, `curriculumInstaller.test.js` and the LibraryPage test cover the data and installation
boundaries.

Known manual gates: (1) get the current main through Vercel once the build-rate gate permits a build; (2) click
`Paigalda A2 õppekava` once as authenticated staff; (3) inspect the resulting 100 lessons and Lesson Engine Coverage
Dashboard before starting Content Pack authoring.

Exactly one next safe step: publish the verified current main to the `keelesepp-crm-v2` production project, then
perform the explicit staff A2 installation.

## 2026-10-02 — Lesson-embedded Generator Content Pack authoring — MERGED (#244)

Stacked on #243. Generator readiness can now come from a validated `generatorProfile` stored directly on the existing
`curriculumLessons/{lessonId}` document. Staff can open `Generaatori sisu` from the lesson worksheet page and edit
focuses, target vocabulary, contexts, sentence templates/slots, error pairs, translations, speaking/writing prompts,
success criteria and the advanced dialogue bank. Roadmap metadata scaffolds new drafts, but language content remains
curated; the engine does not fabricate natural Estonian from a title.

The authoring model has bounded arrays/strings, discards unknown top-level data and uses the real Activity Catalog +
Didactic Planner for 5/5/5 readiness. Incomplete profiles can be saved as drafts. Ready embedded profiles override
the code registry; an incomplete embedded draft leaves a verified static fallback active. Persistence is a transaction
on the curriculum lesson with revision, updated-at/by metadata and stale-editor conflict protection. No new collection,
Firestore rule, worksheet schema, Function or AI/provider dependency was added.

Verification: final code head `61d8b52e2faca3c65912bbc5df5ce446aa87832d` passed GitHub `CRM v2` run 336
(lint, production build, 118 Vitest files / 585 tests and security-regression Auth/Firestore/Functions emulator
suite) and `CRM v2 CI` run 265 (118 files / 585 tests, lint and build). Vercel preview
`dpl_4SLM4dZJH362UsXwicB8Mmzu92Eq` is READY. The only prior red check was a test assertion that expected the scaffold
focus label to be the entire textarea value; it was corrected to assert the structured row content without changing
product behavior. No production deployment was triggered. No authenticated visual-browser claim is made because the
required local `agent-browser` executable is unavailable in this runtime.

Exactly one next safe step: add a staff coverage dashboard over curriculumLessons so content-pack rollout across the
roadmap can be managed by readiness status instead of opening lessons one by one.

## 2026-10-02 — Shared Estonian CEFR lexicon — in main via the stack merged with #244 (#243 closed)

Stacked on #242. CRM v2 now reuses the existing authenticated Firebase Storage object `eesti_soned.json` through a
small adapter instead of duplicating the vocabulary dataset. The adapter validates the legacy level/type JSON shape,
caches successful loads and retries after failures. It passes plain data into the existing pure generator; no Firebase
or network dependency was introduced into generator engine modules.

Lesson-specific active vocabulary remains the thematic source of truth. The shared lexicon is used as a level-safe
reserve and for warning-only CEFR audit: words known only above the lesson ceiling produce `VOCAB_ABOVE_LEVEL`, while
unknown words and temporary Storage failures do not block a complete curated profile. Generation trace stores only
the lexicon source and word count outside `worksheetDoc`.

Verification: code head `79f35f6d582001ee5057915af63915755b6df31d` passed GitHub `CRM v2` run 330
(lint, production build, 117 Vitest files / 579 tests and security-regression Auth/Firestore/Functions emulator
suite) and `CRM v2 CI` run 259 (117 files / 579 tests, lint and build). Vercel preview
`dpl_Csq3k6qWWBa1QuTQnA82pCR6yvBL` is READY. No production deployment was triggered. No authenticated visual-browser
claim is made because the required local `agent-browser` executable is unavailable in this runtime.

Exactly one next safe step: move generator readiness from a code-only static registry to validated lesson-embedded
curated content packs in `curriculumLessons`, without changing worksheet or assignment contracts.

## 2026-10-02 — Standalone focus worksheet UI — in main via the stack merged with #244 (#242 closed)

Stacked on #241. This slice exposes the already-pure focus generator to teachers: select one curated lesson focus,
select Avasta/Harjuta/Kasuta/Täistööleht and generate an independent child sheet using the current difficulty mode.
Focus sheets use stable `focus-*` IDs and `role: focus`; they never overwrite the three core worksheet IDs and keep
their own draft/version/publish history in the existing child-sheet transaction model.

Generation of an existing focus sheet creates another deterministic variant, passes its previous activity IDs as
planner cooldown history and persists phase/focus/context/Activity Catalog/Lesson DNA/difficulty/variant trace
metadata outside `worksheetDoc`. Focus cards open in the same Worksheet Studio. No Firestore rule/schema, Function,
AI/provider dependency or production write/deploy path changed.

Verification: code head `0aacae4c95258c6bacecb9279d018c0dddbdffd6` passed GitHub `CRM v2` run 327
(lint, production build, 115 Vitest files / 572 tests and security-regression emulator suite) and `CRM v2 CI` run 256
(115 files / 572 tests, lint and build). Vercel preview `dpl_BAuoGrFn3qaGZaWgDLWhMFmhehWw` is READY. No production
deployment was triggered. No authenticated visual-browser claim is made because the required local `agent-browser`
executable is unavailable in this runtime.

Exactly one next safe step: connect the existing signed-in Firebase Storage level lexicon `eesti_soned.json` through
a CRM v2 adapter while keeping lesson-specific vocabulary curated and generator-core network-free.

## 2026-10-02 — Per-task worksheet regeneration — in main via the stack merged with #244 (#241 closed)

Stacked on #240. This slice adds deterministic regeneration of one selected generated task inside the existing
Worksheet Studio. It keeps the shared worksheet renderer/editor, child-sheet persistence model and
`keelesepp.worksheet/2` document contract unchanged. No Firestore rule, Function, production data or AI/provider
dependency was added.

The replacement planner prefers another compatible activity with the same skill while preserving required didactic
tags, falling back to fresh content of the current activity only when necessary. Block identity and layout are
preserved, exact duplicates and invalid scored output are rejected, and unsupported/manual blocks fail closed.
Regeneration uses ordinary editor history, is undoable, and does not write Firestore until the teacher presses Save.
`contextId` is now stored for new generated child sheets; old sheets derive it from their deterministic seed.

Verification: final code head `433ad9a6775ddf7244a33c1652fdc8fc67742b3e` passed GitHub `CRM v2` run 324
(lint, production build, 114 Vitest files / 568 tests and security-regression emulator suite) and separate `CRM v2 CI`
run 253 (114 files / 568 tests, lint and build). Vercel preview deployment
`dpl_8g2rzeJ4qMf8f18CE6E4nrAMSWxo` is READY. No production deployment was triggered. No authenticated visual-browser
claim is made because the required local `agent-browser` executable is unavailable in this runtime.

Exactly one next safe step: review #241 after #240; the teacher UI for standalone focus worksheets is kept in a
separate stacked slice.

## 2026-10-02 — Lesson DNA + difficulty engine — in main via the stack merged with #244 (#240 closed)

Stacked on the verified didactic-planner PR #239 and synchronized with its current head. This bounded slice adds the
generator profile registry, canonical `keelesepp.lesson-dna/1`, deterministic Support/Core/Challenge difficulty,
difficulty-aware materialization, teacher difficulty control and trace metadata. It does not change Firestore rules,
Functions, the `keelesepp.worksheet/2` schema, production data or deployment targets.

`Lesson DNA` records profile/lesson identity, normalized level and lesson kind, focus IDs, target/recycled vocabulary
identity, priority skills, duration, difficulty, variant and seed. The difficulty engine changes cognitive-load
preference and bounded scaffolding parameters (word bank, distractors/item counts, speaking duration, planning space
and writing length) while the same five-task didactic phase requirements and quality gate remain mandatory. The
teacher UI now resolves generator profiles through one registry and persists DNA/difficulty next to the child sheet,
not inside its worksheet document.

Verification: GitHub `CRM v2` run 318 passed lint, production build and the full CRM Vitest suite (112 files / 563
tests); its security-regression Auth/Firestore/Functions emulator job passed. Separate `CRM v2 CI` run 247 also passed
the same 112 files / 563 tests, lint and production build. Vercel deployment
`dpl_Gz5LRpxMXS9M7r6wkXDAjtAewbGw` for commit `cab1f99a2aa7a996570d85bf30002cd62e7f9589` is READY. No production
deployment was triggered. No authenticated visual-browser claim is made because the required local `agent-browser`
executable is unavailable in this runtime.

Exactly one next safe step: review stacked PR #240 after #239; per-task regeneration remains a separate later slice.

## 2026-10-02 — Didactic Lesson Planner v1 — MERGED (#239)

Checked fresh `main` `53bf62c0447dfdbd916be83ac05cf031f74449d8` and open PRs #230, #233, #234 and
#235 before starting. This bounded slice changes only the deterministic worksheet generator, its teacher generation
metadata/UI wiring, tests and generator/architecture documentation. It does not change Firestore rules, Functions,
production data, assignment schema or the shared `keelesepp.worksheet/2` document contract.

Added a versioned Activity Catalog and seeded Didactic Planner. Activities now declare phase, Worksheet Studio block
type, family, CEFR range, compatible lesson kinds, skills, production mode, cognitive load, didactic tags and curated
source requirements. The planner builds five-task Avasta / Harjuta / Kasuta plans, enforces phase requirements,
prefers family diversity and uses previous activity IDs as a cooldown history. `content.js` materializes those planned
activities through the existing Worksheet Studio registry; `quality.js` verifies plan-to-block consistency and
discover → practice → transfer progression. Cross-bank sentence reuse is blocked, including answers from `errorPairs`.

Teacher regeneration is now a real deterministic variant: it increments the variant seed instead of always using
`...:0`, feeds prior activity IDs back as cooldown history, and persists `activityIds`, Activity Catalog version,
didactic-plan version and variant outside `worksheetDoc`. Unsupported source banks still fail closed; there is no AI
or external content-generation dependency.

Verification: GitHub `CRM v2` run 315 passed lint, production build and the complete CRM Vitest suite (111 files /
560 tests). Its `security-regression` job also passed the existing Auth/Firestore/Functions emulator suite. The
separate `CRM v2 CI` run 244 passed. Vercel created a READY preview for commit
`d4c446b81cdff1c7a9befb9590301ea1b3986c79`; no production deployment was triggered. A local visual browser claim is
not made because the required `agent-browser` executable is unavailable in this runtime; the Vercel/GitHub preview
status was verified only.

Exactly one next safe step: review PR #239 and its preview before merge; subsequent Lesson DNA/difficulty work stays
in a separate stacked branch/PR.

## 2026-10-02 — Generator teacher UI — MERGED (#238)

Checked fresh `origin/main` `a5a11f4aa320337aebc3a80a183c8ef050bf46a5` after PR #237 was merged and its
Firestore rules and Vercel production release were verified. This third bounded slice adds the teacher generation UI
and shared child-sheet editor route only; assignment traceability, student profile history and additional lesson
profiles remain later work.

The Õppevara lesson dialog now opens `Tunni töölehed`. The reference lesson `a2b1-016` can generate exactly three
deterministic draft records (`discover`, `practice`, `transfer`) and shows Avasta/Harjuta/Kasuta cards with lifecycle,
block count, version and update time. Re-generation requires explicit confirmation and saves a new draft version while
the persistence layer keeps any published snapshot. Unsupported lessons fail closed with a clear message. Each card
opens the existing Worksheet Studio through a child-sheet repository adapter; save, publish and immutable history are
scoped to that exact child record. The legacy `/library/worksheets/:lessonId` route remains unchanged.

Verification so far: focused UI/service/studio Vitest 3 files / 22 tests; full CRM Vitest 110 files / 557 tests;
ESLint and production build passed (existing large-chunk warning). React review: independent lesson/sheet reads run in
parallel, static card metadata is module-scoped, the adapter is memoized by primitive route IDs, no editor/renderer is
duplicated, and unsupported content is not fetched or generated. No production action or external generation service
was used. The local Vite server started, but the required `agent-browser` executable is unavailable on this host, so
no authenticated desktop/mobile browser claim is made. Exactly one next safe step: open a draft PR and use its Vercel
preview for the pending visual verification.

## 2026-10-02 — Generator child-sheet persistence — MERGED (#237)

Checked fresh `origin/main` `4be6e0fd76b11cc128c344489ba1734a2348fba6` after PR #236 was merged and
released to Vercel production. Open PRs #230, #233, #234 and #235 remain separate. This slice implements only the
second generator milestone: child-sheet persistence, rules and tests; it adds no generator UI, route, assignment
change, migration or production Firebase action.

Added `lessonWorksheetsService` for `curriculumLessons/{lessonId}/worksheets/{worksheetId}`. Stable core IDs
`discover`, `practice` and `transfer` persist independently. Save/publish uses one Firestore transaction, verifies the
parent lesson, rejects stale `worksheetDocUpdatedAt`, increments the child version, and appends immutable
`worksheetVersions/{lessonId}_{worksheetId}_studio_v{version}` history. Publishing snapshots the exact current v2
document; a later draft preserves that published snapshot. Generation metadata remains outside `worksheetDoc`.
The service never writes the legacy root `curriculumLessons.worksheetDoc` fields.

Rules now explicitly allow signed-in reads and staff-only create/update/delete for the child collection; top-level
version records remain create-only for staff and immutable. New emulator coverage verifies teacher access, learner
read-only access, anonymous denial, immutable versions and unchanged legacy lesson data.

Checks: focused service Vitest 8/8; full CRM Vitest 109 files / 554 tests; Functions unit tests 212/212; production
build passed with the existing large-chunk warning; ESLint and `git diff --check` passed. The focused Auth/Firestore
emulator test passed 5/5, and the complete rules/Functions emulator command passed 45/45 including finance, learning,
Live Classroom and whiteboard regression coverage. Emulator startup emitted the existing local SMTP secret warning;
the suite still passed without using a production secret. No production database, rules or external service was
changed in this slice. Exactly one next safe step: open the draft PR for review before any UI integration or Firebase
rules deployment.

## 2026-10-02 — Deterministic Worksheet Generator core — MERGED (#236)

Checked fresh `origin/main` `3517dd8866425e70aad87dd7e2e5a56de4769cd9` and open PRs #230, #233, #234 and
#235. PR #234 overlaps Worksheet Studio presentation and shared documentation, so this slice does not edit its block
implementation or CSS. Goal: the first bounded generator slice only — pure deterministic generation, tests and one
reference profile; no Firestore, rules, routes, UI, migration or production action.

Implemented `crm-v2/src/features/worksheet-generator/engine/`: seeded PRNG/shuffle/sample, lesson-kind and CEFR
normalization, structured/legacy focus resolution, level-safe vocabulary selection, phase recipes, materialization
through the current Worksheet Studio registry, shared bundle diversity and stable quality diagnostics. Public APIs
are `generateLessonBundle()` and `generateFocusWorksheet()`. The supplied `a2b1-016` profile is stored unchanged as
the reference fixture. Same inputs, seed and generator version produce identical valid `keelesepp.worksheet/2`
documents; generator metadata remains outside the document. Missing sources return diagnostics rather than invented
language. The core makes no AI, external API or persistence call.

Owner acceptance added during implementation: teachers must watch generated assignments live, enter an active learner
session, point to a task, see current errors and find all worksheet work in the learner profile. Existing
`worksheetAssignments`, `LiveWorksheetView`, `liveFocus.blockId`, `DocWorksheetPlayer` and `RoomWorksheetPanel`
already provide live answers, marks, guidance and Live Classroom reuse. `StudentProfilePage` does not currently load
worksheet assignments; the profile work-history section is explicitly required in the later UI/assignment slice.
See `docs/WORKSHEET_GENERATOR_V1.md`.

Final verification: focused generator Vitest 7/7, full CRM Vitest 108 files / 546 tests, ESLint clean, production
build passed with the existing large-chunk warning, and `git diff --check` passed. The reference profile is
byte-identical to the supplied package example. No production or external service was used. Exactly one next safe
step: review and merge draft PR #236 before starting child-sheet persistence.

## 2026-10-02 — Known test failures fixed, Kontrolltöö label — MERGED (#232, 3517dd8), RELEASED 2026-10-02

Checked against main `240e09c`. Owner asked to fix the remaining known problems (not the items they parked: TURN,
Storage CORS, 54 unmatched Google events, APP_BASE_URL, „Minu tööpäev”, parent study terms).
- The 3–4 "flaky" tests were test problems, not product bugs: `FinancePage.test.jsx` asserted a single `role="status"`
  while a panel's LoadingState (also `status`) was still on screen → `findNotice(text)` waits for the notice with the
  expected text; `StudentProfilePage.test.jsx` read lessons/invoices right after the tabs appeared, before the data had
  loaded → waits for the content (4 s). Both files pin the clock to 2026-10-01 (`vi.useFakeTimers({ toFake: ['Date'] })`,
  real timers) so fixtures dated October 2026 do not turn "overdue" later. Full suite 534/534 four runs in a row.
- `libraryModel.curriculumType`: a Kontrolltöö with a constructor worksheet is labelled „Kontrolltöö” again (since #228
  it showed „Tööleht”); `library.assign` sends any record with a `worksheetDoc` as an interactive worksheet, so the
  assignment behaviour is unchanged. Tests added.
- Section headings below updated: #219–#225 released; #227, #228, #229, #231 merged, waiting for the release.

## 2026-10-02 — Live Classroom: full-screen lesson room (owner's design photo) + board rules fix — MERGED (#231, 297e79e), RELEASED 2026-10-02 (rules + CRM)

Checked against main `240e09c`. Owner sent a photo of how the lesson must look: top bar (back, menu, "Tund — date",
undo/redo, subject, timer + signal, mic/camera/screen/hang-up, more, participants, chat, Materjalid, Ülesanded), a
large board with the worksheet and handwriting on it, the student's video tile on the right, a floating tool dock at
the bottom, a colour/size panel on the right and the zoom at the bottom left. Built that:

- `features/live-classroom/LiveRoom.jsx` + `liveRoom.css`: the accepted room is now a full-screen layer (both roles).
  Call controls live in the top bar; timer from `respondedAt`; signal bars from the call state; video tiles on the right
  (remote large with initial + name, self small). Drawers: Vestlus (the same internal `messages` as Suhtlus, live via
  new `messagesService.subscribeByStudent`; badge counts messages that arrive during the lesson), Osalejad, Materjalid
  (teacher: image/PDF files of Õppevara materials → "Tahvlile"), Tunni salvestamine (RoomRecorder, kept mounted).
  "Ülesanded" opens the existing RoomWorksheetPanel over the board; it opens by itself for the student when the teacher
  opens a worksheet (`onCurrentChange`). "Rohkem": new lesson page "Tund dd.mm.yyyy", recording, leave, Lõpeta tund.
  Leaving keeps the lesson; the start page shows "Tagasi tundi" for an accepted room of the last 6 h (teacher+student).
- `features/live-classroom/useLiveCall.js`: the WebRTC logic moved out of LiveLessonCallPanel unchanged (panel kept).
- The room board is the student's own board (`StudentBoard` `variant="room"`, `whiteboards/{studentId}` = CRM
  „Tahvel” and v1 board): everything stays after the lesson. New: dock (select, hand, shapes menu, pen, eraser, text,
  note, image upload for staff via `libraryService.uploadFile`), 12 colours, width slider, S/M/L/XL, undo/redo of own
  actions (exposed to the top bar), insert material (image/PDF as a board element, PDF rendered as a page), new lesson
  page (`studentBoardService.addPage`, v1 lessonPages shape), each page fitted to content once.
  The old per-invitation `LiveLessonWhiteboard` (strokes only) is no longer used and was removed.
- **Firestore rules fix (needs a rules deploy):** a teacher (not admin) could not add images/PDFs to a student board and
  could not write anything on a lesson page — board access was evaluated 2–3 times per write and hit Firestore's
  1000-expression limit (permission-denied; also in CRM v1). Access is now checked once; semantics unchanged
  (`whiteboardElementCreateValid`, `whiteboardElementUpdateValid`, `lessonPageLive`, `snapshotPageActive`). New
  emulator test `functions/whiteboard-rules-emulator.integration.js` (in `npm run test:emulator`): teacher image/PDF on
  board + lesson page + snapshot copy OK; student note OK, student image denied, snapshot write denied, locked delete
  denied, completed snapshot immutable. Against the old rules the teacher test failed with the 1000-expression error.
- Checks: `npx eslint src` clean; vitest 538 tests, only the 4 known date-dependent Finance/StudentProfile tests fail
  (same as main); new `LiveRoom.test.jsx` (8). `npm run build` OK. Functions `node --test` 212/212; emulator rules tests
  10/10 (whiteboard + invitations). Browser, two users on local emulators with fake camera/mic: teacher invites,
  student joins; teacher puts a material on the board, draws, adds a note; both "Ühendatud"; chat badge 1; undo/redo;
  new lesson page visible to the student with the teacher's note; 1440 px and 390 px without horizontal scroll.
- Release: merge + `firebase deploy --only firestore:rules` (for materials and lesson pages) + Vercel `keelesepp-crm-v2`.
- Limits: no pinch-zoom on phones (buttons instead); chat is the Suhtlus conversation; TURN server still missing.

## 2026-10-01 — Worksheet draft regression repair — MERGED (#228, a71b66b), RELEASED 2026-10-02

Fresh main: `9fda4b9df487696b59cbe1847ab3ce08e1bed7c6` (2026-10-01). PR #227 was merged with the owner's explicit
permission; GitHub confirmed merged=true. No open PRs before this task. Task 1 is isolated in draft PR #228: https://github.com/zakutailopavel-cyber/keelesepp/pull/228.

Completed: draft saves of legacy/published constructor documents without a published snapshot preserve the old
`worksheetDoc`, version and update timestamp in `publishedWorksheetDoc*` in the same batch. Subsequent drafts do not
replace that snapshot. Every constructor document is classified as Tööleht. Preview uses the published snapshot or
labels a never-published draft Mustand. Assignment rejects never-published drafts with a typed publication error;
the UI explains why and offers “Ava konstruktoris ja avalda” at `/library/worksheets/:id`.
Listening without audio and placeholder worksheet titles are publication warnings. Content/tasks, task titles and
checked answer keys still block publication. Already broken drafts are not automatically published or migrated.

Files: `crm-v2/src/services/firebase/{worksheetDocs.js,worksheetDocs.test.js,library.js}`;
`crm-v2/src/features/library/{libraryModel.js,LibraryPage.jsx,LibraryPage.test.jsx,MaterialPreview.jsx}`;
`crm-v2/src/features/worksheet-studio/{quality.js,quality.test.js}`; `ARCHITECTURE.md`,
`docs/WORKSHEET_STUDIO_PDF_COVERAGE.md`, this state file. Existing curriculumLessons published snapshot fields and
worksheetVersions are reused; no collection, rule, migration, Function or production data changes.

Executed checks: focused Vitest 5 files / 58 tests passed; full CRM Vitest 106 files / 522 tests passed;
ESLint passed; production build passed (existing >600 kB chunk warning); git diff --check passed.
Browser: actual Vite app with VITE_FIREBASE_EMULATORS=1, Auth/Firestore on demo-keelesepp, existing Firestore rules:
- old worksheet v3 -> edit title -> Salvesta: still Tööleht; preview shows old title; assignment succeeds and stored
  worksheetAssignments snapshot has the old content, while curriculumLessons holds the new draft;
- new listening worksheet -> Salvesta: Tööleht, preview Mustand; assignment has the constructor/publish link and no
  assign button; constructor Avalda is enabled despite absent audio;
- follow that link -> Avalda -> assign: assignment stores new published v2;
- pre-existing broken draft without published snapshot -> Avalda succeeds with listening audio absent;
- constructor, library, draft preview and assignment dialog at 390x844: documentElement.scrollWidth=390;
  no page errors reported by agent-browser. Screenshots saved locally in /tmp/worksheet-*.png.

Limits: no production migration repairs historical drafts automatically; staff publishes them through the constructor.
No deploy executed. No new PR merged. Unfinished implementation work: none for Task 1.
Exactly one next safe step: owner reviews the Task 1 draft PR.

## 2026-10-01 — access hotfix after PR #226 — MERGED (#227, 9fda4b9), RELEASED 2026-10-02

Owner reported that the parent study-terms release caused parent login errors and that approving a newly registered
student surfaced a raw browser `Failed to fetch`. Verified current GitHub `main` = `36abfd6` (merge #226) and
Vercel production deployment `dpl_AGUKe8X8SC1mHFX1GCpX7uximU6P` still serves that exact commit on
`crm.epkoolitus.ee`; the attempted rollback had not changed GitHub main or the active production aliases when checked.

Hotfix scope is intentionally narrow:
- revert the full #226 parent-study-terms gate back to the pre-#226 tree `c76f69f`; no parent is blocked by a new
  first-login condition and no `studyTermsAcceptedAt/studyTermsVersion` browser write is required;
- keep registration/approval data unchanged;
- allow the protected Firebase HTTP APIs to answer CORS requests from exact configured origins plus the KeeleSepp CRM
  Vercel project aliases under `*-zakutailopavel-cybers-projects.vercel.app`; authentication and admin checks remain
  mandatory, so CORS does not grant data access;
- replace the raw account-approval `Failed to fetch` text with an actionable message pointing staff back to the
  canonical `https://crm.epkoolitus.ee` address.

Why the student symptom is separate from registration: `authService.register()` creates a pending Firebase account
and profile without calling `staffOperationsApi`; the server fetch is skipped while approvalStatus is pending.
The request to `staffOperationsApi/accounts/approval` happens when staff approves the account, and
`accounts/bootstrap` runs only after approval. A browser-level `Failed to fetch` therefore points to network/CORS
before a normal JSON 4xx/5xx response can be handled.

Changed in this hotfix: CRM v2 auth/settings files are reverted to pre-#226 state; `firestore.rules` is reverted to
the pre-#226 source; `functions/index.js` now uses the tested origin matcher; new
`functions/cors-origin-core.js` + test; `accountApprovals.js` has the recovery message. No data migration and no
production mutation performed by the agent. The CORS fix only becomes live when `staffOperationsApi` is explicitly
deployed; Vercel deploy alone cannot update Firebase Functions.

Checks on code HEAD `d628ae5`: CRM v2 106 test files / 515 tests passed; ESLint passed; production build passed.
GitHub `security-regression` and `financial-core` emulator workflows passed. Vercel preview
`dpl_qHvPozXyX1A3qAa6c1rJ1HUiNTuG` is READY and Vercel reports no unresolved preview feedback. This
PROJECT_STATE update is documentation-only; production remains unchanged.

Next safe step: owner manually merges PR #227. Release must include the Vercel CRM update plus an explicit
`staffOperationsApi` Firebase Functions deploy for the CORS repair; until that Function is deployed, the CORS
change is not live.


## 2026-10-01 — Approval SMTP response repair — MERGED (#229, 240e09c), RELEASED 2026-10-02 (staffOperationsApi deployed)

**Correction 2026-10-02 (owner asked Claude to finish it):** sending the e-mail after `res.json` was replaced. On
Cloud Functions an instance may be stopped right after the response, so the approval e-mail could be silently lost.
Now the e-mail is sent before the response, bounded by `APPROVAL_MAIL_LIMIT_MS` = 30 s (`Promise.race`; timeout or
error → `console.error`, `mailed:false`), and `staffOperationsApi` runs with `timeoutSeconds: 120`. `mailed:true` only
when delivery finished; `mailPending` is always `false`. Tests rewritten: stalled SMTP → response after the limit with
mailed=false and CORS; normal → order profile, bootstrap, audit, mail, response; failure → logged, one response.
Checks: Functions `node --test` 212/212; CRM accounts 16/16. The paragraphs below describe the earlier draft
("SMTP starts after the response", "post-response mail is best effort") and are superseded by this correction.

Checked fresh main `9fda4b9df487696b59cbe1847ab3ce08e1bed7c6` on 2026-10-01 (#227 merged with explicit owner
permission). Open Task 1 draft PR #228 is separate; none of its implementation is included in this branch.
Task 2 draft PR #229: https://github.com/zakutailopavel-cyber/keelesepp/pull/229. No parent study-terms work is included.

Completed: `deliverEmail` configures nodemailer connectionTimeout=10000, greetingTimeout=10000,
socketTimeout=20000. `/accounts/approval` writes profile, performs bootstrap and writes audit before replying;
SMTP starts after the successful JSON response. SMTP errors are caught/logged and do not send a second response.
The immediate response carries mailed=false (delivery unconfirmed), with additive mailPending=true when an attempt
is planned; AccountsPage never claims mail was sent while pending. Existing emailQueue records retain delivery
status/error. Already approved accounts and rejections do not send a repeated approval e-mail.
On a fetch/body network failure the CRM uses getDocFromServer for users/{uid}; an explicit approved status recovers
as a success notice: “Konto kinnitati, kuid vastust ei saadud. E-kiri võis jääda saatmata.” Missing, unreadable,
pending/rejected or fieldless profiles retain the network error. HTTP API errors are not masked; no automatic retry
or duplicate approval is sent. The new accounts list refreshes after recovery.

Files: `functions/index.js`, `functions/account-approval-response.test.js`;
`crm-v2/src/services/firebase/{accountApprovals.js,accountApprovals.test.js}`;
`crm-v2/src/features/accounts/{AccountsPage.jsx,AccountsPage.test.jsx}`; `ARCHITECTURE.md`, this file.
No rules, collections, profile-schema change or migration. The API adds mailPending and the client service adds
responseLost for local reconciliation. Existing approvalStatus/linking/audit meanings are preserved.

Executed checks: focused CRM 2 files / 16 tests passed; full CRM 107 files / 527 tests passed;
Functions node --test 211/211 passed, including a stalled delivery with response-before-SMTP, CORS, failure logging,
no duplicate mail, actual transporter options and persisted delivery failure. ESLint passed; build passed with existing
chunk warning; git diff --check passed. Browser: actual CRM at 390x844 with VITE_FIREBASE_EMULATORS=1 and demo-keelesepp
Auth/Firestore. A local test-only endpoint wrote approved to the emulator and deliberately dropped the HTTP response;
real accountApprovals service reread the profile, AccountsPage showed the exact recovery notice, removed the pending
row, and had scrollWidth=390. This is a network fault injection, not a real SMTP/production Functions smoke.

Limits: post-response mail is best effort; Firebase can suspend execution after sending the HTTP response. No durable
worker/retry infrastructure is added. The HTTP response cannot report a future mail outcome; mailed=false remains
accurate at response time and mailPending avoids claiming delivery. Real production SMTP delivery was not exercised.
No deploy and no production-data operations were performed. No new PR merged. Unfinished implementation: none.
Required owner release after review/merge: `firebase deploy --only functions:staffOperationsApi`, plus CRM v2 release.
Exactly one next safe step: owner reviews the Task 2 draft PR and the best-effort mail limitation.

## 2026-10-01 — Worksheet Studio PDF coverage and author reliability — MERGED (#225, c76f69f), RELEASED with #226

Checked against fresh `origin/main` `a3e9f88`; no open PRs at start. Rendered and reviewed all local generated
worksheet PDFs (one-page and textbook `Minu päev`, plus the two-page `Kiri linnavalitsusele`). Worksheet Studio now
has 32 structured blocks: the former 21 plus word forms, error correction, dictation, translation, word search,
crossword, role cards, writing plan, phrase bank, guided long letter and rubric. A built-in formal-letter template
recreates the PDF workflow as editable/interactive/print content.

Author safety: browser autosave/recovery, conflict rejection for stale editors, immutable `worksheetVersions`,
restore as a new version, draft/published lifecycle, publication quality gate, assignment from last published snapshot,
whole-sheet copy, searchable palette, JSON replacement confirmation, manual page break and improved 390 px authoring.
No migration, Function, rule, external API or production action. Existing `worksheetVersions` create-only staff rule
is reused. Focused tests: 16 files / 98 tests passed; ESLint clean; production build passed. Browser harness: all 31
palette entries visible, formal-letter template paginated to two pages, 9 interactive inputs enabled, and 390×844
layout had no horizontal page overflow. Full suite: 511/515 passed; the four unrelated failures are the same current
main timing issues in FinancePage (3) and StudentProfilePage (1), while all worksheet/library tests passed.

Next safe step: review the branch diff and browser evidence, then open a draft PR; deployment remains owner-gated.

## 2026-10-01 — Õppevara: worksheet of a material visible and reachable — MERGED (#224, a3e9f88), RELEASED

Checked against main `0628691` (#223 merged and released). Owner: a worksheet made in the Töölehe konstruktor was not
visible in the preview, and a lesson plan had no clear "create / change the worksheet" action. The worksheet lives on
the same `curriculumLessons` record as `worksheetDoc` (unchanged). Now:
- `MaterialPreview.jsx` renders the constructor worksheet exactly as printed (`StudioSheetPreview.jsx`, lazy-loaded
  `Sheet` in print mode) next to the lesson plan phases, with "Muuda töölehte" / "Loo tööleht" in the footer.
- `MaterialEditor.jsx` has a "Tööleht" box at the top for existing materials: status, "Vaata töölehte",
  "Muuda töölehte" or "Loo tööleht" (opens `/library/worksheets/:id`; saving there attaches the worksheet to the
  same material, as before).
- `LibraryPage.jsx`: every row has "Vaata" again (preview now shows constructor worksheets); the detail window says
  "Muuda töölehte" / "Loo tööleht" instead of "Ava konstruktoris".
- No data, rule or assignment change. Checks: library tests 22/22 (+2), `npx eslint src` clean, build OK; full suite
  506/510 — the 4 failures are the known date-dependent finance/profile tests that also fail on main. Browser on
  local emulators: lesson plan → "Loo tööleht" opens the builder; plan with a constructor worksheet → preview shows
  the sheet, "Muuda töölehte" opens the builder; 1440/390 px without horizontal scroll, no page errors.
- Next safe step: owner merges, then Vercel `keelesepp-crm-v2` release.

## 2026-10-01 — Õppevara: visible "Muuda" on every row — MERGED (#223, 0628691), RELEASED

Checked against main `950a0d1` (2026-10-01; #219–#222 merged and released to `keelesepp-crm-v2` by the owner).
Owner could not find how to edit a worksheet. Before: structured worksheets had only an "Ava" button, old image/PDF
worksheets only "Vaata"; editing was hidden behind clicking the title. Now every row in `LibraryPage.jsx` has
"Muuda": worksheets (structured, or `type: 'worksheet'` with only files, which the library lists as Tunnikava) open
in the Töölehe konstruktor, exercises in the exercise editor, other materials in the material editor. "Vaata" stays
for items without a structured worksheet. No data, type classification or assignment change.
Checks: library tests 20/20 (2 new), `npx eslint src` clean; browser on local emulators: both worksheet kinds open in
the builder from "Muuda", 1440/390 px without horizontal scroll. Next safe step: owner merges, then Vercel
`keelesepp-crm-v2` release.

## 2026-10-01 — Team tasks (Ülesanded) and notification centre in CRM v2 — MERGED (#222, 950a0d1), RELEASED

Checked against main `e014ea6` (2026-10-01). Goal: staff work with team tasks and see what needs attention in CRM v2,
so v1 is not needed for it. Same `tasks` collection and field meanings as v1 (both CRMs show the same tasks); no rule,
index, function or migration change (`tasks` is already read/write for staff).

- `services/firebase/tasks.js`: live subscribe, create, update (status change sets/clears `doneAt/doneBy*` like v1),
  reply (bounded to 30, `lastReply*`), markSeen (`lastReplySeenBy`, `openedByUids` via arrayUnion), remove. Every
  change except markSeen writes an `activityLog` entry (`task.created/updated/done/reopened/reply/deleted`), as v1.
- Additive optional fields: `assignedToUid` (hint; the name `assignedTo` stays authoritative), `openedByUids`.
- `features/tasks/`: `taskModel.js` (v1 scope: admin sees all, teacher sees assigned/created; filters Avatud, Minu
  ülesanded, Tähtaeg möödas, Minu loodud, Valmis, Kõik; Kiire first), `TasksPage.jsx` (`/tasks`, staff, menu
  "Ülesanded"): quick add, board Uus/Töös/Valmis (Valmis shows the last 7 days under "Avatud") and list, search,
  tick done, task window via `?task=id` with all fields, discussion, delete for admin/creator. `useTasks.js`, `tasks.css`.
- Notification centre: bell in the top bar for admin/teacher/finance (`components/layout/NotificationCenter.jsx`,
  `features/notifications/`). Items are derived, not stored: new task for me (last 14 days, not opened), new task
  reply, overdue task (assignee; admin sees all), task due today, unread messages per conversation, homework awaiting
  review, overdue invoices (admin/finance). Category tabs, refresh; each item opens its page.
- Checks: `npx eslint src` clean; `npx vitest run` 104 files / 494 tests pass (8 new in `tasks.test.jsx`);
  `npm run build` OK. Browser run on local emulators (`demo-keelesepp`, no production): teacher bell 3 items (overdue v1
  task, new task, unread message) → task opens from bell, status Töös + reply saved in v1 format, bell drops to 2;
  admin sees "Uus vastus" and creates a task for Elena → stored with v1 fields + activityLog; teacher bell shows it
  live; 1440 and 390 px without horizontal scroll; no rule errors.
- Limits: messages/homework/invoices in the bell refresh on page load and when the bell is opened (tasks are live);
  no e-mail/push; no drag-and-drop between columns; v1 has no `openedByUids`, so opening a task in v1 does not clear
  "Uus ülesanne sulle" in v2.
- Release = merge + Vercel `keelesepp-crm-v2`; no functions/rules deploy.
- Next safe step: owner reviews and merges the draft PR, then releases `keelesepp-crm-v2`.
## 2026-10-01 — Student board outside the lesson (CRM v2 `/board`) — MERGED (#221, 04fc1a6), RELEASED

Checked against main `e014ea6` (2026-10-01). Goal: the student's own board (v1 "Tahvel") works in CRM v2 so v1 can be
retired. Same data as v1, no new collections, no rule or schema change: `whiteboards/{studentId}/elements` and lesson
pages `whiteboards/{studentId}/lessonPages/{pageId}/elements` (snapshot pages hidden). Everything drawn in v1 shows up
in v2 and both stay in sync live.

- `services/firebase/studentBoard.js`: live subscribe of elements/pages, add/update (v1 meta: `updatedAt`,
  `updatedByUid`, `updatedByName`, `lastClientId`, `revision`), remove, teacher "Tühjenda" (keeps locked elements).
- `features/board/`: `boardModel.js` (pure geometry: pan/zoom 20–300 %, fit, shapes, arrows), `StudentBoard.jsx`
  (tools: select/move, pen, sticky note, text, rect, ellipse, arrow, eraser, hand; colours; zoom; page tabs "Tahvel" +
  v1 lesson pages; renders v1 stroke/shape/note/text/image/pdf), `BoardPage.jsx`, `board.css`, `board.test.jsx` (7).
- Routes: `/board` for student/parent (menu item "Tahvel", picks the card when there are several), `/board/:studentId`
  for staff, opened with "Ava tahvel" on the student card. `ACCESS.BOARD` in `app/accessPolicy.js`.
- Limits as in the rules: only staff can add image/pdf (v2 does not upload yet — use the Live Classroom or v1 for
  that); locked elements cannot be erased or moved; strokes cannot be moved.
- Checks: `npx eslint src` clean; `npx vitest run` 104 files / 493 tests pass; `npm run build` OK. Browser run on local
  emulators (`demo-keelesepp`, no production): teacher opens the board from the card and sees v1 elements, student has
  "Tahvel" in the menu, teacher's stroke appears live for the student and the student's note for the teacher, moving a
  v1 note works, lesson page text shows, no rule errors; 1440 px and 390 px without horizontal scroll.
- Not done: image/PDF upload from v2, undo. Release = merge + Vercel `keelesepp-crm-v2`; no functions/rules deploy.
- Next safe step: owner reviews and merges the draft PR, then releases `keelesepp-crm-v2`.
## 2026-10-01 — Finish CRM v1 interactive lessons in CRM v2 — MERGED (#220, 84de98a), RELEASED

Owner item 7 (issued v1 content must be finishable in v2). v1 exercises assigned as homework already open in v2
(`ExercisePlayer`); what was missing were the v1 **interactive lessons** (`interactiveAssignments`, server-only, e.g.
the A2 lesson with many activities), which only opened on www.epkoolitus.ee/interactive-lesson/ with a separate login.
Now "Kodutööd" shows a card "Interaktiivsed tunnid" (students: all their v1 interactive lessons; teachers: the ones
waiting for feedback). `InteractiveLessonPlayer` uses the existing `interactiveLessonApi` (list/get/save/submit/review)
— same rules as v1: answers per activity (short/long text, single/multiple choice, gaps incl. inline "___"), local
draft backup, required answers checked before "Saada õpetajale", revision conflict message; teachers see the student's
answer next to the expected answer / teacher instruction and send feedback. Nothing new is assigned from v2; the card
disappears when the old lessons are done. No server, rule or data change (the API already allows crm.epkoolitus.ee).
Files: `crm-v2/src/services/firebase/interactiveAssignments.js` (+index), `crm-v2/src/features/homework/
{InteractiveLessonPlayer.jsx,interactiveLessonModel.js,interactiveLesson.css,HomeworkPage.jsx,HomeworkPage.test.jsx}`.
Checks: homework vitest 26/26 (2 new), ESLint clean; browser on emulators **with the real functions emulator**: a
lesson created and assigned through lessonDraftsApi/interactiveLessonApi; student answered, saved, sent; teacher saw
answer + expected and sent feedback; student saw "Tubli, Mari!". Needs only a Vercel release of crm-v2.
## 2026-10-01 — "Alusta tundi" from the calendar — MERGED (#219, 0a5a5e5), RELEASED

Owner chose items 1, 7, 8, 9 of the teacher-work list (item 6 "Minu tööpäev" is dropped for good; the rest waits).
This is item 1. The calendar lesson panel shows "Alusta tundi" for an individual lesson on its day that is not yet
marked: it creates a `liveLessonInvitations` invitation with the existing service (title "<subject> · <time>") and
opens `/live-classroom?invitation=<id>`. A student card without a linked account shows the button disabled with
"Õpilasel pole veel sisselogimiskontot…". No rule, data or function change.
Files: `crm-v2/src/features/calendar/{CalendarPage.jsx,LessonPanel.jsx,calendarV2.css,CalendarPage.test.jsx}`.
Checks: calendar vitest 44/44 (3 new), ESLint clean; browser on emulators: teacher clicks "Alusta tundi" → room opens
("Ootab vastust"), student cabinet shows "Jelena kutsub sind tundi" → "Liitu tunniga" → teacher sees "Mari Maas võttis
kutse vastu".
Next: item 7 (finish issued v1 assignments in v2), then 8 (student board), 9 (team tasks + notifications), each its own PR.

## 2026-10-01 — Website header fix (www.epkoolitus.ee, ET and RU)

Owner screenshot: the header was crooked — logo glued to "Kursused", the ET/RU switch cut off, "Logi sisse" on two
lines. Cause (older than #215, made worse by its new menu item "Õppematerjalid"): the header sat in the 1120 px content
column and every item was allowed to shrink. Fix in `index.html` and `ru/index.html`: the header row is up to 1320 px
wide with a 28 px gap, logo/buttons/language switch/menu items never shrink or wrap, menu gap 20 px below 1400 px, the
☰ menu from 1240 px down (was 1080 px), tighter spacing below 560 px. Checked with Playwright at 360–1920 px in both
languages: no overlap, no horizontal scroll. Needs a Vercel release of the `keelesepp` project.

## 2026-10-01 — Release of #214, #215, #216 (main `adabd67`) — DEPLOYED

The owner ran the release on his Mac from a clean worktree of `origin/main` (`~/keelesepp-release`), guided step by step:
- Firebase (`keelesepp-5136b`): Firestore rules released; functions `gcalApi`, `syncAllCalendars`, `websiteLeadApi`
  updated and `syncGroupToGoogleCalendar` created — "Deploy complete!".
- Vercel: `keelesepp-crm-v2` → crm.epkoolitus.ee and `keelesepp` → www.epkoolitus.ee, both "Ready" and aliased.
- Checked from outside: crm.epkoolitus.ee serves a new bundle; www.epkoolitus.ee/oppematerjalid/ is live; the live
  tasemetest page contains both review fixes (`diagnosticId: attemptId`, language "Eesti keel"/"Inglise keel").
Not yet done (owner): connect Google Calendar for one teacher in Seaded and check one individual and one group lesson
in Google; send one real level-test result and see it in CRM "Päringud". Known: some FinancePage/StudentProfilePage
tests fail on the 1st of the month on main too (suggested as a separate task), not a production issue.
Exactly one next safe step: the owner's two live checks above.

## 2026-09-30 — Public growth platform v1 — MERGED (#215, adabd67)

**Review fixes (2026-09-30, before merge).** A browser run of `tasemetest.html` with the lead request intercepted
(never sent to production) found that no level-test result could be delivered: (1) the submit handler read an undefined
`diagnosticCode` and threw before sending; it now uses `attemptId`; (2) it sent the track label ("Eesti suund" /
"English track") as `language`, which `websiteLeadApi` rejects with 400; it now sends "Eesti keel" / "Inglise keel".
After the fix the captured payload passes `normalizeWebsiteLead` (language, level, source `level-test`, bounded
assessment) and the visitor sees "Tulemus on saadetud". The four `/oppematerjalid/` pages and their CSS load (200) and
link only to existing paths. Remaining gates unchanged: `websiteLeadApi` + Firestore rules deploy with the owner's word,
then one real end-to-end lead.


Last verified main: `9e2ae40` after `git fetch origin --prune`. Active branch: `agent/public-growth-platform-v1`.
PR: not opened. Goal: one cohesive public funnel rather than a series of small Vercel-triggering commits.

Implemented locally: the adaptive level test now describes its real 6-15 question path and submits the result through
`websiteLeadApi`; the normalized `websiteLeads` record can contain bounded diagnostic score/skill data and its source;
CRM v2 has a staff-only `Päringud` queue with status transitions; Firestore permits staff reads and four-field workflow
updates only; the new `/oppematerjalid/` hub contains the first three indexable topic pages and is linked from the
homepage and sitemap. Full contract and release gates: `docs/PUBLIC_GROWTH_V1.md`.

Checks: Functions full suite 188/188; CRM v2 ESLint clean, production build OK, Vitest 102 files / 452 tests;
Firestore rules dry-run compiled successfully; level-test inline JavaScript syntax OK; sitemap XML parses;
`git diff --check` clean. The in-app browser verified
the current production homepage and test before implementation, but could not reach the isolated local HTTP server,
so visual verification of the new public pages remains pending. No production service, data, function, rules or Vercel
deployment was changed.

Known gates: `websiteLeadApi` and Firestore rules need separate owner-approved Firebase deploys; merging/pushing would
trigger Vercel and has intentionally not been done. Exactly one next safe step: perform a local visual review using a
browser that can reach the worktree server, then make one commit and open one draft PR for the complete block.
## Worksheet Studio (Töölehe konstruktor) browser audit — MERGED (#216, 048757a)

Last verified against main: 2026-09-30, `9e2ae40` (#213). Owner 2026-09-30: test the lesson builder the same way as the
calendar. Separate from the calendar PR #214 (AGENTS.md: learning content and calendar changes are not mixed).
Full scenario list, findings and fixes: `docs/WORKSHEET_STUDIO_V1.md` → "Browser audit 2026-09-30".
Fixed: unsaved work lost on in-app navigation; undo/redo + Delete key; choice block not selectable by its options;
invalid JSON import crash; sample sheet overwrite without asking; default-title first save; Kodutööd hid the submit
result and could overwrite newer answers after a reload; Kodutööd counters ignored worksheets; started sheet shown as
"Alustamata".
Files: `crm-v2/src/features/worksheet-studio/{WorksheetStudioPage.jsx,editorHistory.js,engine/sheet.css}` (+test),
`crm-v2/src/features/homework/HomeworkPage.jsx` (+test). No data, rule, Function or schema change.
Checks: crm-v2 vitest 457/459 — the 2 failures are `FinancePage.test.jsx` (a "Loen tunniplaani…" spinner still on
screen when the test looks for the status message); they fail identically on clean `main`, not touched here. ESLint
clean, build OK. Browser re-run of every fixed scenario: OK.
Exactly one next safe step: owner reviews and merges the PR, then a Vercel release.
## Google Calendar in CRM v2 (connect, status, groups) — MERGED (#214, e323ace)

Last verified against main: 2026-09-30, `9e2ae40` (#213). Owner request 2026-09-30: "полноценную и удобную синхронизацию
с Гугл календарем". The server sync already existed (hourly import, push of individual lessons, outbox, dedupe); v2 had
no screen and the OAuth return landed in v1.

Done:
- **Seaded → Google Calendar** (teachers and admins, not in support preview): connect, grant write access for old
  import-only connections, state (two-way / import only / error), last import and push time, "Sünkrooni kohe",
  switch "Näita minu grupitunde Google Calendaris", disconnect with a two-click confirmation.
- **Calendar toolbar chip**: Google state + time of last sync + sync button; not connected → link to Seaded. Opening the
  calendar syncs by itself when the last sync is older than 15 minutes (light sync, never while an error is shown).
- **Lesson panel**: "Google Calendaris" / "Ootab…" / "Google'isse ei jõudnud: <error>" for KeeleSepp lessons. Lessons
  imported from Google (`source: gcal`) show "Google Calendarist", cannot be dragged, and have no "Muuda aega" /
  "Tühista tund" (the next import would undo the change); "Tund toimus" still works.
- **Server (`functions/index.js`)**: `/gcal/auth-url` takes `returnTo` (allowed CRM origins only, stored in
  `oauthStates`), callback returns there with `?gcal=connected|error` (v1 unchanged: fallback `APP_BASE_URL`);
  `/gcal/sync` takes `force: false` (v2: push only changed/failed lessons; v1 sends nothing and keeps the full re-push);
  new `/gcal/settings { uid, syncGroups }`; status adds `syncGroups`, `lastGroupPushAt`, `lastGroupPushError`;
  disconnect keeps imported one-off lessons dated before today (history) and returns `{ removed, kept }`.
- **Group lessons → Google**: new trigger `syncGroupToGoogleCalendar` (groups/{id}) and the hourly job / manual sync push
  each group lesson as its own private event (origin `keelesepp-group`) into the group teacher's primary calendar.
  Links in the new server-only collection `calendarGroupEventLinks/{groupId}__{lessonId}` ({ groupId, lessonId,
  teacherUid, eventId, anchorDate, hash, status, error }). Attendance marks do not trigger a push. Removed/cancelled
  lessons, inactive groups, switching the setting off and handing a group to another teacher delete the event. The
  import skips group events. Series without a start date use `anchorDate` = the day of the first push.
- Firestore rule: `calendarGroupEventLinks` read/write false.
- **"Kustuta" in the lesson panel** (owner 2026-09-30: a lesson put in by mistake, wrong student or wrong day, could not
  be deleted). Next to "Tühista tund" (lesson does not take place) the panel has "Kustuta" with a confirmation: a one-off
  lesson is removed (`schedule` doc deleted → the trigger deletes its Google event); a weekly lesson asks "Ainult see
  tund" (date into `excludedDates`) or "See ja kõik järgmised" (`endDate` = day before; the whole record is deleted only
  from its first date and when it has no `lessons` records). Undo toast restores the same record under the same id
  (`scheduleService.restore`, Google link fields stripped so a fresh event is created). Not offered for held/absent
  lessons, group lessons or lessons imported from Google. Pure planner `planDelete` in `calendarGrid.js`.

**Calendar scenario audit (owner 2026-09-30: "проверь все сценарии использования календаря").** Walked through in a
real browser (Playwright) on the Firestore/Auth emulators with seeded admin, teacher, students, one-off, weekly, group,
Google-imported, 07:30 and 21:00 lessons. Found and fixed:
- Lessons before 08:00 or from 21:00 were **not shown at all** in week/day view (grid filtered them out while the
  counter included them). The grid now widens to whole hours around the earliest/latest lesson (`gridRange`).
- A wrong mark could not be fixed. Done/absent lessons now have "Märkisid valesti? Paranda": another status, or
  "Eemalda märge" (planned again). CRM v2 marks are changed in Firestore (`lessonsService.changeMark/removeMark`,
  activity log); older marks are removed through the server journal (`financeApi.deleteLessonJournal`, reverses
  package/counter bookkeeping). Invoiced lessons / closed periods are refused with a pointer to Finantsid.
- Future lessons could be marked "Tund toimus". Before the lesson day only "Puudus (teatas ette)" is offered.
- "Tühista kogu sari" in the edit dialog set the whole series to cancelled, which also hid every past occurrence from
  the calendar. Replaced by "Lõpeta või kustuta…" (only this date / this and all following; history stays).
- Cancelling a one-off lesson had no undo; now the toast offers "Tühista".
- A group lesson could not be cancelled for one date from the calendar: admin gets "Tühista see grupitund" (date into
  the lesson's `excludedDates`, with undo).
- Admin can pick the teacher when creating/editing a lesson (substitution); default is the student's teacher. Editing
  no longer silently resets the teacher to the student's teacher.
- "Eelmine kord" showed the lesson's own mark instead of the previous lesson.
- Resize toast shows the new length.
Verified OK in the browser: week/day/month/mobile agenda, create one-off and weekly, conflict refusal, drag + undo,
resize, delete (one-off, one date, series from its first date), teacher sees only own lessons and no teacher picker,
group attendance, Google-imported lesson locked, `?student=` filter. `VITE_FIREBASE_EMULATORS=1` (off by default)
connects the v2 client to local emulators; how-to in `crm-v2/README.md`.
Not covered: Live Classroom start from a lesson (not in the calendar panel), mobile drag (agenda has no drag by design).

Checks (2026-09-30): functions `npm test` 201/201 (new `calendar-group-sync-core.test.js`,
`calendar-group-sync-behavior.test.js`); crm-v2 vitest 479/479, ESLint clean, `vite build` OK. Not run: emulator
suite, a real Google account, visual check in a browser.

Needs with the merge (owner's word): deploy functions `gcalApi`, `syncAllCalendars`, `syncGroupToGoogleCalendar` (new)
and Firestore rules. Until then v2 "Ühenda" still works but returns to v1, and group lessons are not pushed. No Google
Cloud Console change: the redirect URI is unchanged.

Risks: teachers who already typed group lessons into Google by hand will see them twice — they can switch groups off in
Seaded or delete their own copies. If the Google OAuth app is in "Testing" mode, refresh tokens expire after 7 days.
Conflicts are still last-synchronized-write-wins; sync is hourly + on calendar open (no Google push channel yet).

Exactly one next safe step: owner deploys `gcalApi`, `syncAllCalendars`, `syncGroupToGoogleCalendar` and the rules,
then connects one teacher in crm.epkoolitus.ee → Seaded → Google Calendar and checks one individual and one group lesson
in Google.

## 2026-09-29 — crm.epkoolitus.ee now serves CRM v2

`crm.epkoolitus.ee` points at the `keelesepp-crm-v2` Vercel project. v2 has self-registration (`/registreeru`),
password reset and new-Google-account onboarding; old v1 paths (`/haldus…`, `/tasemetest`, `/kutse`, …) redirect (307)
to `www.epkoolitus.ee`, which still serves the school website and v1. Details, rollback and remaining items:
`docs/CRM_V2_MIGRATION_PLAN.md` ("Domain switch").

## CRM v2 bug: students and parents landed on "Ligipääs puudub" — PR

Reported by the owner 2026-09-29 with a screenshot of a student's browser (`/forbidden`). After sign-in everyone opens
`/`, which was wrapped in the staff-only DASHBOARD guard, so students and parents never reached `HomePage`, which
already redirects them to `/student` and `/parent`; "Tagasi avalehele" looped back. Fix: `/` is no longer guarded;
`HomePage` routes by role. Regression test `src/app/routes.home.test.jsx` (fails on the old routes). Direct links
meanwhile: `/student`, `/parent`.

## Lesson recording and free transcription — PR

Owner 2026-09-29: "3 пункт делаем но без квен пока". Live Classroom records a lesson (teacher + student tracks,
5-minute files) with the student's consent from the student card; a worker on the school Mac transcribes it for free
with whisper.cpp; staff read the dialogue on the student card. No AI analysis yet. Details: `docs/LESSON_RECORDING.md`.
New: `crm-v2/src/features/lesson-recording/*`, `crm-v2/src/services/firebase/lessonRecordings.js`,
`LiveLessonCallPanel` `onMediaStreams`, room/student-card wiring, `tools/lesson-transcriber/*`, Firestore rule
`lessonRecordings`, Storage rule `lessonRecordings/*`, emulator test and CI steps.
Needs: Firestore **and Storage** rules deploy with the merge; owner creates a service account key; whisper model
download on the Mac; launchd agent. Checks: vitest 390/390, ESLint clean, build OK, transcriber lib tests 3/3, rules
compile.

## Student cabinet pet (KeeleSepp sõbrad) — PR #195

Owner idea 2026-09-29: every student is greeted by a personal pet; the student chooses it. On "Minu õpingud" a student
picks one of four pets (Siil, Rebane, Kakk, Draakon) and names it; the pet then shows mood and growth derived only from
existing data: held lessons (+10), submitted worksheets/exercises (+15), fully reached lesson goals in `score.perGoal`
(+5); stages Beebi / Noor (scarf, from 100) / Täiskasvanu (cap, from 300); moods proud (goal in 3 days), happy (lesson
or work in 2 days), asleep (no activity 14+ days; never sick or dying), calm. It greets in the language being learned
(Estonian, English for English learners) with a Russian hint: today's lesson, homework count, praise.
Files: `crm-v2/src/features/pet/{petArt.js,petModel.js,PetCard.jsx,pet.css,pet.test.jsx}`,
`crm-v2/src/services/firebase/pets.js` (+ index export), `StudentDashboardPage.jsx`, `firestore.rules`
(`safeSelfUserFields` + `validPet`), `functions/student-pet-emulator.integration.js` (+ emulator workflow).
Data contract: `users/{uid}.pet = { kind: siil|rebane|kakk|draakon, name ≤ 24, chosenAt }`, written by the user only.
Growth is never stored. Staff preview shows the pet read-only and nothing when none is chosen.
Walking companion (`PetCompanion`, mounted in `AppShell`, students only, never in staff preview): the pet walks along
the bottom of every page (click → a hint; "Peida mind" docks it in the corner), gives a first-visit tour of the menu
(`data-tour` on nav links; steps whose target is off screen are skipped), and reacts by itself to a lesson invitation
(runs to the invitation card: "… kutsub sind tundi! Vajuta „Liitu tunniga”"), a lesson starting within 15 minutes, and
late or due-today homework (`companionModel.js`). Uses existing reads only (invitations, own schedule, homework).
Owner decisions 2026-09-29 (design page https://claude.ai/artifact/N3EKq3c3LQxRRjLoni7wph): offered to every student with
"Ei, aitäh" (opt-out, switch in "Seaded" → "Minu sõber"); the five pre-deploy items are done in this PR: opt-out,
silence while a worksheet is open (`petQuiet`) and in the lesson room, tour/hidden/opt-out stored on the account
(`pet.tourDoneAt`, `pet.hidden`, `pet.optedOut`), celebration after "Esita tööleht" (`petCelebrate`, +15 and +5 per
reached goal), one-time hints on Kodutööd and Live Classroom. Estonian phrases are corrected after deploy. Stage 2 for
now: only motivational lines (no wardrobe, parent view or speech yet).
Pre-deploy review fixes: absences ('Puudus_eta', 'Puudus_p') and cancellations no longer feed the pet (only
'Toimunud' or an older record without status) and no longer count in "Läbitud tunnid"; on phones the tour points at the
menu button and the pet stands above the full-width invitation card; exercises also quiet the pet and celebrate;
keyboard focus moves into the tour card.
**Needs a Firestore rules deploy** together with the merge (`validPet` allows kind, name, chosenAt, tourDoneAt, hidden,
optedOut); until then saving fails with a permission error.
Checks: vitest 373/373, ESLint clean, build OK, rules compile (dry run).
## Production deploy status (2026-09-29)

Vercel's free plan hit its build rate limit several times on 2026-09-29, so some merges were not deployed. The last
production build of `keelesepp-crm-v2` before this note was `cf97557` (#190); #183 (Live Classroom with worksheet),
#193 (camera/microphone header) and #194 (dialog focus) were merged but not built. This docs-only merge triggers a new
production build of main. How to check: GitHub deployments API (`Production – keelesepp-crm-v2`) or the response header
`permissions-policy` of the v2 site (must contain `camera=(self)`).

## CRM v2 bug: typing in any dialog lost focus after the first key — PR

Reported by the owner on 2026-09-29 with a screen video of "Uus tund" (calendar): after typing the first letter of the
student name the suggestion list closed and focus jumped to the dialog's close button. Cause: the shared `Modal`
focus effect depended on `onClose`, which callers pass as a new function on every render, so each keystroke that
re-rendered the parent re-ran the effect (restore previous focus, then focus the first button). Affects every dialog
with a form. Fix: `onClose` kept in a ref, the effect runs only when the dialog opens. Regression tests in
`src/components/ui/ui.test.jsx` fail on the old code and pass now.

## CRM v2 production blocker: camera and microphone were forbidden — PR

Found 2026-09-29 while planning the switch of all users to v2: `crm-v2/vercel.json` sent
`Permissions-Policy: camera=(), microphone=()`, so on the production v2 site (`keelesepp-crm-v2.vercel.app`) the Live
Classroom video call, screen sharing and worksheet voice answers could not start (tests do not see hosting headers).
Fix: `camera=(self), microphone=(self), display-capture=(self)`; guard test `src/app/hostingHeaders.test.js`.
Checks: vitest 366/366, ESLint clean, build OK. Takes effect with the next Vercel production deploy of main.

## CRM v2 migration plan — DECIDED 2026-09-29

Owner decision: **Worksheet Studio is the only authoring tool**; v1 Lesson Builder ("Valmista tund"), v1 Worksheet
Builder, the v1 exercise builder and the v2 "Loo materjal" worksheet blocks / "Loo harjutus" are not ported or
developed further. Existing content stays usable (legacy adapter, "Üleviimine", issued assignments playable until
finished). Plan and order of remaining work: `docs/CRM_V2_MIGRATION_PLAN.md`.
Exactly one next safe step: step 1 of the plan (freeze old builders in the UI, no data change).

## CRM v2 Live Classroom (invitations, video call, presence, screen share, board, worksheet) — MERGED (#183, 62eaa29), RULES DEPLOYED

Updated 2026-09-29 (Claude, owner: «Довести и смёржить #183»): branch merged with main `cf97557` (Worksheet Studio),
and the lesson room now shows a structured worksheet (`RoomWorksheetPanel`): the teacher picks a studio worksheet,
it is assigned to the invited student (normal `worksheetAssignments` doc, note "Live Classroom: …") and tagged
`liveRoomKey = roomKey`, `liveOpenedAt`; the teacher sees answers live and points at tasks (`LiveWorksheetView`,
also used by `/library/worksheets/live/:id`); the student fills it inline (`DocWorksheetPlayer inline`, autosave).
Student query: `worksheetAssignments where studentId == … and liveRoomKey == …` (existing read rule, checked in
`functions/worksheet-studio-emulator.integration.js`). No rule change for the worksheet part.
Checks: vitest 365/365, ESLint clean, build OK, emulator job green. **Firestore rules deployed 2026-09-29** from main
`62eaa29` (`firebase deploy --only firestore:rules --project keelesepp-5136b`, dry run compiled first; owner-approved).


Last verified against main: 2026-09-28, Europe/Tallinn.
Verified main: `8e8bd65` (branch was 0 commits behind `origin/main` at commit time).
Implementation branch: `agent/live-classroom-invitations-v2`.
Pull request: draft, opened 2026-09-28 (see GitHub; not merged by the agent).

Scope is deliberately limited to inviting a student and the invitation lifecycle up to entering one shared waiting
room. Video, whiteboard and lesson materials are NOT part of this PR. A teacher (or admin) opens Live Classroom,
chooses only a student that has a real student account, and sends an invitation. The student sees the invitation as an
overlay on any page of the student cabinet (`LessonInvitationOverlay` in `AppShell`) and can accept or decline; the
teacher can cancel; invitations expire after at most 5 minutes. Accepting brings both into the same waiting room
(`roomKey` = invitation ID). Student and teacher IDs stored on the invitation are immutable after creation.

Changed files: `crm-v2/src/app/accessPolicy.js` (+ test; new `ACCESS.LIVE_CLASSROOM` = admin, teacher, student),
`crm-v2/src/app/navigation.js`, `crm-v2/src/app/routes.jsx`, `crm-v2/src/components/layout/AppShell.jsx`,
`crm-v2/src/features/live-classroom/LiveClassroomPage.jsx` (+ new test), new
`crm-v2/src/features/live-classroom/invitationModel.js` (+ test), new `liveClassroom.css`, new
`crm-v2/src/components/layout/LessonInvitationOverlay.jsx` (+ test), new
`crm-v2/src/services/firebase/liveLessonInvitations.js`, `crm-v2/src/services/firebase/index.js`, `firestore.rules`.

Data contract: new collection `liveLessonInvitations/{invitationId}` with fields `teacherUid, teacherName, studentId,
studentUid, studentName, title, status (pending|accepted|declined|cancelled|closed), roomKey, createdAt, createdAtIso,
expiresAt, respondedAt, cancelledAt, closedAt`. Rules: create only by staff for themselves (`teacherUid == uid()`), only for a
student the teacher may invite (`teacherCanInviteStudent`), and only if `studentUid` is that student's own account
(`studentAccountOwns`: document ID, `linkedUserId`, `studentUid` or `linkedUserIds`). Parent/guardian fields
(`parentUid`, `linkedParentId(s)`, `guardianUid`) are intentionally NOT accepted, so a parent UID cannot be invited as
the student; the client (`studentAccountUid`) resolves the target from the same student-only fields. Update: only
`status/respondedAt/cancelledAt` may change, only from `pending`; the student may accept/decline before `expiresAt`;
teacher/admin may cancel a pending invitation; the inviting teacher/admin may close an accepted waiting room. Delete: admin only.

Validation before the corrective follow-up: full CRM v2 suite 75 files / 308 tests, focused live-classroom/overlay/access suites 4 files / 19 tests, ESLint and production build PASS. The corrective commit adds dedicated Firestore emulator coverage for parent/student identity, expiry, teacher scope and accepted-room closing; GitHub CI is the verification gate for that added coverage.
No production deployment, rules deploy, index change or data migration was performed.

Known limits and manual gates: `firestore.rules` changes take effect only after an explicit owner-approved rules
deploy; expiry is enforced by rules on accept and by the client display, there is no server-side cleanup of expired
invitations yet; the waiting room is the existing Live Classroom page keyed by `roomKey`, without video.

Follow-up in the same draft PR: accepted rooms now contain an opt-in browser WebRTC audio/video panel. Signaling is stored only in the invitation's `signals` subcollection, is readable/writable only by that invitation's teacher and student while status is `accepted`, and each fresh call uses a new session ID. Camera/microphone access happens only after the user presses the start/join button. A hangup signal stops both peers and local tracks. Current ICE configuration uses public STUN only; TURN fallback is intentionally still pending for restrictive NAT/firewall networks.

Presence/reconnect/floating follow-up in the same draft PR: accepted participants now heartbeat into an invitation-scoped `presence` subcollection; the UI shows whether the other participant is currently fresh/online, refreshes on tab visibility, and marks itself offline on cleanup when possible. A disconnected/failed teacher peer can issue a fresh WebRTC offer without closing the room, while a student with local media already enabled automatically answers a new offer. The call card can be switched into a compact fixed floating mode within Live Classroom. Firestore rules restrict presence writes to each participant's own UID/role and keep parents/outsiders out.

Screen sharing follow-up in the same draft PR: the teacher can share a browser-selected screen/window/tab only after the call has started. The implementation uses WebRTC `RTCRtpSender.replaceTrack`, so audio/microphone state is preserved and no separate signaling or Firestore collection is needed. The local preview switches to the shared surface; stopping from KeeleSepp or the browser's native “Stop sharing” control restores the camera track. Reconnect creates the next peer with the active screen track when sharing is still in progress.

Shared whiteboard follow-up in the same draft PR: accepted teacher/student pairs now get an invitation-scoped realtime SVG board with pen, four colors, eraser and teacher-only clear. Every stroke is stored as its own document under `liveLessonInvitations/{invitationId}/whiteboardElements`, reusing the established per-element collaboration model without exposing the general student whiteboard collection. This is intentional: the existing persistent whiteboard grants linked parents access, while a live lesson room must remain private to the invited student and teacher. Firestore rules allow both participants to add strokes, students to erase only their own strokes, and the inviting teacher to erase/clear any stroke; parents and outsiders cannot read or write the live board.

Unfinished: TURN fallback (needs an external TURN provider and credentials: owner decision), server-side cleanup of expired invitations (needs a Cloud Functions deploy), lesson completion integration (linking the room to the lesson record). Done: floating call window, board, worksheet inside the room.
Exactly one next safe step: after the rules deploy, one real teacher + student lesson: invite, accept, start the call, open a worksheet in the room.
## Worksheet Studio fixes from the visual check — MERGED (#190, cf97557)

Last verified against main: 2026-09-29, Europe/Tallinn. Verified main: `cd9a81f` (merged #189).
Branch: `agent/worksheet-studio-live-polish`. Found by clicking through the real components in a local harness
(in-memory data, teacher and student tabs synced; not committed):
1. `useFitScale` attached only on mount, so pages that first show a loading state (book, live view) never scaled and
   the A4 sheet overflowed the screen. The hook now returns a callback ref (`const [ref, scale] = useFitScale()`).
2. The live view marked untouched fields red while the learner was still working; now only answered fields get ✓/✗
   until the assignment is submitted.
3. Printing: a 381.86 mm page zoomed to exactly 297 mm only fits on A4 with zero margins, but A4 was set only for the
   named `worksheet` page, so with the browser's default paper (Letter) or margins every page split onto two sheets
   and the CRM background printed. Now the builder and the book set `@page { size: A4; margin: 0 }` for the whole job
   while they are open (`printPage.js`), the print zoom is .7776 (296.9 mm), and the page background is white.
   Checked with headless Chrome: a 1-sheet book prints as 4 A4 pages (cover, contents, sheet pages 3 and 4).
Verified visually: student player with photos and handwriting font, autosave, teacher live view (answer appears,
task highlight followed by the student's sheet), original panel with photo cutting (same-origin image), book cover,
contents and page numbers. Checks: vitest 335/335, ESLint clean, build OK.
Exactly one next safe step: merge after checks.

## Worksheet Studio end-to-end rules check — MERGED (#189, cd9a81f)

Last verified against main: 2026-09-29, Europe/Tallinn. Verified main: `2c72234` (merged #188).
Branch: `agent/worksheet-studio-e2e`. Adds `functions/worksheet-studio-emulator.integration.js` and runs it in
`.github/workflows/financial-core-emulator.yml`. Covers the whole worksheet path against the real Firestore rules
(see `docs/WORKSHEET_STUDIO_V1.md`). Storage is not covered: the CI Storage emulator denied every rules-checked upload,
even the super admin's; worth a separate look by whoever owns the emulator setup. No product code, rule or data change.
Exactly one next safe step: merge after the emulator job is green.

## Worksheet Studio slice 5 (live worksheet in a lesson) — MERGED (#188, 2c72234)

Last verified against main: 2026-09-29, Europe/Tallinn. Verified main: `005c44c` (merged #187).
Branch: `agent/worksheet-studio-live`. Claude merges its own PRs after all checks pass (owner, 2026-09-29).

What: the student player autosaves structured-worksheet answers; `/library/worksheets/live/:assignmentId` (staff) shows
them live with marks, progress and per-goal evidence; the teacher clicks a task to highlight it on the student's sheet
(`worksheetAssignments.liveFocus`). Entry: links "Jälgi tunnis otse" after assigning in Õppevara.
Changed files: `crm-v2/src/features/worksheet-studio/{LiveWorksheetPage.jsx,LiveWorksheetPage.test.jsx}` (new),
`DocWorksheetPlayer.jsx`, `engine/{Sheet.jsx,registry.js,sheet.css}`, `worksheetStudio.css`,
`crm-v2/src/services/firebase/{homework,library}.js` (+ tests), `crm-v2/src/features/library/LibraryPage.jsx`,
`crm-v2/src/app/{routes.jsx,accessPolicy.js}`, `docs/WORKSHEET_STUDIO_V1.md`, this file.
Data contract: optional `worksheetAssignments.liveFocus = { blockId, at }` (staff update, existing rule); student
autosave writes the already allowed `status/answers/updatedAt`. No rule, index, Function, migration or deploy.
Validation: `npx vitest run` 335/335; `npx eslint .` clean; `npx vite build` OK; `git diff --check` OK.
Risks: not tried with two real browsers against Firebase; autosave adds one small write per pause while typing.
Unfinished (other track): embedding the live view in the v2 lesson room (after #183 and the room PR).
Exactly one next safe step: owner assigns one studio worksheet to a test student, opens "Jälgi tunnis otse" and fills
the sheet as the student in a second browser.

## Worksheet Studio slice 4 (textbook export) — MERGED (#187, 005c44c)

Last verified against main: 2026-09-29, Europe/Tallinn. Verified main: `69865b8` (merged #186).
Branch: `agent/worksheet-studio-book`. Claude merges its own PRs after all checks pass (owner, 2026-09-29).

What: `/library/worksheets/book` (staff, button "Õpik" in Õppevara) composes a textbook from structured worksheets:
title/subtitle/level/publisher, order, cover, contents with page numbers, sheets with running book page numbers;
"PDF / Prindi" prints the whole book as A4. The plan is kept in the teacher's browser (`localStorage`), nothing new in
Firestore.
Changed files: `crm-v2/src/features/worksheet-studio/{BookPage.jsx,BookPage.test.jsx}` (new), `engine/Sheet.jsx`
(`startPage`, `onPageCount`), `worksheetStudio.css`, `crm-v2/src/app/{routes.jsx,accessPolicy.js}`,
`crm-v2/src/features/library/LibraryPage.jsx`, `docs/WORKSHEET_STUDIO_V1.md`, this file.
Data contract: none. No rule, index, Function, migration or deploy.
Validation: `npx vitest run` 332/332; `npx eslint .` clean; `npx vite build` OK; `git diff --check` OK.
Risks: the printed book was not checked on paper or as a browser PDF with real photos; the contents page assumes one
page (about 30 worksheets); photos ≤ 1600 px suit office printing, not 300 dpi offset.
Unfinished: Live Classroom worksheet scene (needs the v2 lesson room from the Live Classroom track).
Exactly one next safe step: owner builds a 3-sheet book in "Õpik" and saves it as PDF from the print dialog.

## Worksheet Studio slice 3 (moving image worksheets to the structured format) — MERGED (#186, 69865b8)

Last verified against main: 2026-09-29, Europe/Tallinn. Verified main: `0aacb7c` (merged #185).
Branch: `agent/worksheet-studio-conversion`. Owner instruction (2026-09-29): Claude merges its own PRs after all checks pass.

What: `/library/worksheets/convert` (staff, button "Üleviimine" in Õppevara) lists every worksheet-like material by
migration status (only image/PDF → v1 structured → done), with progress and filters. The studio opens a material
that has original images with an "Originaal" tab next to the sheet; the teacher drags a frame over a photo and cuts
it into the selected block or a new photo block (normal upload path). Text is retyped as blocks.
Changed files: `crm-v2/src/features/worksheet-studio/{conversion.js,ConversionQueuePage.jsx,OriginalPanel.jsx,
conversion.test.jsx}` (new), `WorksheetStudioPage.jsx` (+ test), `engine/image.js` (`cropToFile`, `nearestAspect`),
`worksheetStudio.css`, `crm-v2/src/app/{routes.jsx,accessPolicy.js}`, `crm-v2/src/features/library/LibraryPage.jsx`,
`storage.cors.json` (new, not applied), `docs/WORKSHEET_STUDIO_V1.md`, this file.
Data contract: none new. No rule, index, Function, migration or deploy.
Validation: `npx vitest run` 331/331; `npx eslint .` clean; `npx vite build` OK; `git diff --check` OK.
Risks: cutting photos from originals needs Storage CORS for GET; until the owner runs
`gsutil cors set storage.cors.json gs://<bucket>` the studio shows a message and photos are uploaded as files.
Unfinished: Live Classroom worksheet scene; textbook export.
Exactly one next safe step: owner applies `storage.cors.json` to the Storage bucket (read-only GET), then converts
one image worksheet through "Üleviimine".

## Worksheet Studio slice 2 (assign structured worksheets, student player, teacher review) — MERGED (#185, 0aacb7c)

Last verified against main: 2026-09-29, Europe/Tallinn. Verified main: `8e8bd65`.
Implementation branch: `agent/worksheet-studio-assignments`, stacked on `agent/worksheet-studio-v1` (PR #184).
Pull request: draft, base `agent/worksheet-studio-v1` (not merged by the agent). Merge #184 first.

What it does: a worksheet built in the studio counts as a worksheet in Õppevara and is assigned with the existing
"Määra" flow; each `worksheetAssignments` document gets a snapshot `worksheetDoc` (v1 `worksheetData`/`files` kept).
The student opens it in the same A4 design (`DocWorksheetPlayer`), answers, records voice answers (uploaded to
`homework/{studentId}/ws_rec_*` before draft/submit), submits; the score is `{ correct, total, pct, perGoal }`.
After submission the student and the teacher see the sheet read-only with ok/bad marks, recordings and the result per
lesson goal; the teacher review dialog in Homework shows the same (`DocWorksheetSubmissionPreview`). Assignments
without `worksheetDoc` keep the v1 player unchanged.

Changed files: `crm-v2/src/features/worksheet-studio/{DocWorksheetPlayer.jsx,GoalEvidence.jsx,useFitScale.js}` (new,
+ test), `engine/registry.js` (`checkDocument`), `engine/Sheet.jsx` (`ctx.review`), `engine/ui.jsx`,
`engine/blocks/{tasks,productive}.jsx`, `engine/sheet.css`, `worksheetStudio.css`, `WorksheetStudioPage.jsx`
(uses `checkDocument` + `GoalEvidence`), `crm-v2/src/features/homework/{WorksheetPlayer,HomeworkPage}.jsx`,
`crm-v2/src/services/firebase/{homework,library}.js` (+ tests), `crm-v2/src/features/library/libraryModel.js`
(+ test), `docs/WORKSHEET_STUDIO_V1.md`, this file.
Data contract: optional `worksheetAssignments.worksheetDoc` (created by staff; existing create rule has no field list);
student updates only `status, answers, score, errorLog, completedAt, seenByTeacher, updatedAt, selfAssessment` (already
allowed). Storage: `homework/{studentId}/ws_rec_<assignment>_<block>_<ts>.(webm|m4a|ogg)` (existing rule: staff or
owning student/parent, audio allowed, < 20 MB). No rule, index, Function, migration or deploy.
A batch refuses assigning a structured worksheet when copies would exceed ~9 MB (message tells the max student count).

Validation (2026-09-29): `npx vitest run` 326/327 passed (1 pre-existing date-dependent failure in
`TeachersPage.test.jsx`, same as on main); `npx eslint .` clean; `npx vite build` OK; `git diff --check` OK.
Risks: not yet clicked through in a browser against real Firebase (player layout at phone width, MediaRecorder on
iOS Safari produces `audio/mp4`, handled as `.m4a`); many-to-many and open answers are counted as "teacher sees".
Unfinished: Live Classroom worksheet scene; image→structure conversion queue; textbook export.
Exactly one next safe step: owner merges #184, then opens this PR's Vercel preview, assigns one studio worksheet to a
test student and completes it as that student.

## Worksheet Studio v1 (structured branded worksheets + builder) — MERGED (#184, 93815fa)

Last verified against main: 2026-09-29, Europe/Tallinn. Verified main: `8e8bd65`.
Implementation branch: `agent/worksheet-studio-v1`. Pull request: draft (see GitHub; not merged by the agent).
Owner of this area: Claude (didactic core). Codex continues the rest of CRM v2; please avoid
`crm-v2/src/features/worksheet-studio/**` and `crm-v2/src/services/firebase/worksheetDocs*.js` without coordination.

Goal (owner, 2026-09-28): replace uneditable generated worksheet images with structured worksheets in the approved
KeeleSepp style, assembled by teachers from blocks, reusable for homework, Live Classroom and a printed textbook.
Result: `/library/worksheets/:lessonId` builder with 21 block types, fixed brand palette, photo slots with focal point,
automatic A4 pagination, student view with per-goal checking, print/PDF; v1 structured worksheets open converted.
Details and data contract: `docs/WORKSHEET_STUDIO_V1.md`.

Changed files: new `crm-v2/src/features/worksheet-studio/**`, new `crm-v2/src/services/firebase/worksheetDocs.js`
(+ test), `crm-v2/src/services/firebase/index.js` (export), `crm-v2/src/app/routes.jsx` (route),
`crm-v2/src/app/accessPolicy.js` (route access: staff), `crm-v2/src/features/library/LibraryPage.jsx`
(two entry buttons), `docs/WORKSHEET_STUDIO_V1.md`, this file.
Data contract: optional `curriculumLessons.worksheetDoc` (+ `worksheetDocSchema`, `worksheetDocUpdatedAt`);
`activityLog` types `worksheet_doc.created|updated`; Storage objects `curriculum/ws_*`. v1 `worksheetData` untouched.
No Firestore/Storage rule, index, Function, migration or deploy.

Validation: see the PR description for exact numbers (vitest full suite, ESLint, vite build).
Known pre-existing failure on 2026-09-29: `src/features/teachers/TeachersPage.test.jsx › summarises active
teachers…` fails on unchanged main as well (date-dependent); not related to this slice.
Known limits: photos in the built-in sample are omitted; print quality depends on uploaded photo resolution;
Google Fonts (Nunito, Nunito Sans, Caveat; OFL) are loaded by the worksheet stylesheet.
Unfinished: homework assignment + student player/review for `worksheetDoc`; Live Classroom scene; image→structure
conversion queue; textbook export.
Exactly one next safe step: owner opens the Vercel preview, builds one worksheet in `/library/worksheets/new`, and
reviews/merges this draft PR; then the homework/student-player slice starts.

## CRM v2 student identity and lifecycle — IN PROGRESS

Last verified against main: 2026-09-28, Europe/Tallinn.
Verified main: `77645f7` (merged PR #182).
Implementation branch: `feature/edit-student-enrollments-20260928`.
Pull request: #181.

PR #181 now keeps one displayed child across multiple learning directions and adds complete lifecycle handling. Archive
and restore update every physical `students` document represented by the person card in one Firestore batch, while
preserving IDs, enrollments and history. Parent/student-owned lists no longer return archived or parent-converted
student records. The already existing parent directory remains the admin workflow for manually linking or reassigning
an existing student to a parent.

Administrators can request the existing server-owned data-quality duplicate scan from the student directory. A merge
requires choosing the surviving primary ID, reviewing the server preview and confirming separately. The existing
Financial Core merge moves supported dependent references, preserves aliases/profile snapshots and archives secondary
records with an audit trail; no browser-side partial merge or production data migration is added.

Changed files: `crm-v2/src/features/students/StudentsPage.jsx`, its focused test,
`crm-v2/src/services/firebase/students.js`, `crm-v2/src/services/firebase/financeApi.js`, `ARCHITECTURE.md` and this
state file. Data contracts reused: `students`, parent links, the existing `/data-quality/preview`,
`/students/merge/preview` and `/students/merge` endpoints, and existing merge audit records.

Validation so far: PASS — focused student/parent suites 43/43, student pagination plus serial finance suites 23/23,
server duplicate-merge core 7/7, ESLint, production build and `git diff --check`. The full parallel CRM suite reached
296/298; its only two failures were unrelated five-second finance test timeouts, and that complete finance file passed
19/19 when rerun outside the saturated full-suite process. No production
deployment, Firebase rules/index change or production record mutation was performed. The merge remains admin-only and
requires an explicit preview plus confirmation. Exactly one next safe step: push the updated #181 branch and wait for
GitHub CI before owner review and merge.

## CRM v2 final readiness — IN PROGRESS

Last verified against main: 2026-09-28, Europe/Tallinn.
Verified main: `fcded22`.
Implementation branch: `codex/v2-final-readiness`.
Implementation PR: https://github.com/zakutailopavel-cyber/keelesepp/pull/182.

The final UX/readiness pass brings Homework and Settings into the shared v2 workspace language. Homework now has a
role-aware operational overview for total, open, overdue and unreviewed work; Settings has a concise account, role,
Firebase and support-access summary. Remaining cards use the same elevation and responsive treatment, long homework
and submission lists use browser rendering containment, and interactive rows retain visible keyboard focus.

Every CRM v2 navigation route now resolves to an implemented feature; `PlaceholderPage` is not used by the router.
`docs/CRM_V2_READINESS.md` records the code, verification and controlled-transition gates. Existing business logic,
roles, Firebase contracts, finance APIs, v1 and production data are unchanged. No deploy or migration is included.

Validation: PASS — Homework and Settings 7/7, ESLint, production build and `git diff --check`. The full parallel suite
reached 288/295; all seven five-second timeouts then passed in a serial rerun covering the five affected files, 35/35.
GitHub `verify`, security regression and both Vercel preview checks pass. Exactly one next safe step: owner review and
merge of PR #182.

## CRM v2 finance experience — MERGED

Last verified against main: 2026-09-28, Europe/Tallinn.
Implementation PR: #175 — merged.

Finance and expenses now use the CRM v2 workspace visual language while preserving the existing trusted finance APIs, roles, Firebase contracts and business rules. The finance page has clearer workflow navigation, an overdue attention state and improved responsive hierarchy; the expenses register now matches the same v2 presentation. v1 is unchanged.

This documentation update also intentionally creates a fresh `main` commit after reconnecting the Vercel Git integration so the current CRM v2 production project can deploy the latest main head.

## CRM v2 people experience — IN PROGRESS

Last verified against main: 2026-09-28, Europe/Tallinn.
Verified main: `3a69994`.
Implementation branch: `codex/v2-people-experience`.
Draft PR: https://github.com/zakutailopavel-cyber/keelesepp/pull/174.

The groups, teachers and parents directories, teacher profile, student dashboard and parent dashboard now share one
responsive operational overview component. Each surface presents its role-appropriate counts and workload context
before the detailed cards, while directories have a consistent toolbar and elevated card treatment. Large parent and
group card collections use browser rendering containment, and keyboard focus remains visible on teacher cards.

Existing group membership and schedule mutations, teacher workload records, parent/student linking, duplicate review,
finance visibility, role scope, Firebase services and route contracts are unchanged. v1 is unchanged. No production
data, rules or deployment are included.

Validation: PASS — focused people and dashboard suites 15/15, ESLint, production build, React structure/accessibility
review and `git diff --check`. Exactly one next safe step: wait for GitHub CI, then owner review of PR #174.

## CRM v2 calendar experience — IN PROGRESS

Last verified against main: 2026-09-28, Europe/Tallinn.
Verified main: `d0f15d5`.
Implementation branch: `codex/v2-calendar-experience`.
Draft PR: https://github.com/zakutailopavel-cyber/keelesepp/pull/173.

The calendar now opens with a responsive operational overview for the selected period: total lessons, today's lessons,
group lessons and completed lessons. The current period has a stronger visual hierarchy, today's column is clearly
identified, lesson cards have improved interaction and keyboard-focus states, and the overview collapses cleanly on
smaller screens. Existing day, week and month views, filters, conflict detection, lesson creation and editing, quick
completion, group attendance, teacher scoping and Firebase contracts remain unchanged. v1 is unchanged.

Validation: PASS — focused calendar suites 11/11, ESLint, production build, `git diff --check`, GitHub `verify`,
`security-regression` and Vercel preview checks. No production deployment is included. Exactly one next safe step:
owner review of PR #173.

## CRM v2 student experience — IN PROGRESS

Last verified against main: 2026-09-28, Europe/Tallinn.
Verified main: `0ddb977`.
Implementation branch: `codex/v2-student-experience`.
Draft PR: https://github.com/zakutailopavel-cyber/keelesepp/pull/172.

The first feature-level refinement after the shared visual foundation improves the existing student directory and
student 360 profile without changing their data contracts. The directory adds a compact loaded-result summary,
recognisable initial avatars and clearer desktop/mobile identity hierarchy. The profile adds a dedicated identity hero,
status, learning context and role-scoped counts for lessons, schedule entries and invoices. Existing filters, URL state,
pagination, editing, archive confirmation, teacher scope, finance scope and profile tabs remain intact. v1 is unchanged.

Validation: PASS — focused student suites 18/18, ESLint, production build and React structure/accessibility review.
GitHub CI remains the merge gate. Exactly one next safe step: owner review of PR #172.

## CRM v2 visual foundation — IN PROGRESS

Last verified against main: 2026-09-28, Europe/Tallinn.
Verified main: `e9bbacf`.
Implementation branch: `codex/v2-visual-foundation`.
Draft PR: https://github.com/zakutailopavel-cyber/keelesepp/pull/171.

CRM v2 is receiving a shared visual foundation while v1 remains fully operational. The shared layer changes design
tokens, application shell, navigation, typography, cards, controls, tables, dialogs, state views and responsive
behavior. The dashboard is now a deliberate daily command centre with a contextual welcome surface, role-scoped quick
actions, readable metrics, today's teaching agenda and an attention queue. The direction is a calm modern school
workspace with a deep navy frame, KeeleSepp green actions, warm restrained highlights and dense but readable working
surfaces. Existing routes, roles, Firebase data, business logic and v1 files are unchanged.

Validation: PASS for ESLint, production build, focused authentication and shell tests (2/2), the four files affected by
parallel host-load timeouts rerun serially (31/31), and desktop browser review of the redesigned login surface. The full
parallel suite reached 282/290; its eight failures were five-second timeouts without assertion failures. No production
deployment is included. Exactly one next safe step: owner review of PR #171 before expanding the system to feature-level
layout refinements.

## Didaktika raamatukogu v1 — LOCAL IMPLEMENTATION

Last verified against main: 2026-09-27, Europe/Tallinn.
Verified main: `820c952`.
Implementation branch: `codex/didactics-library-v1`.
Draft PR: https://github.com/zakutailopavel-cyber/keelesepp/pull/169.

Õppevara now has a separate `Didaktika` workspace for books, teacher guides, methodology, worksheets, games, cards,
assessment resources and other reusable staff reference material. Teachers can search title, author, description,
tags, subject, level and original file name; combine category, subject and language filters; open or download files;
and edit metadata without mixing reference books into curriculum lesson counts. Large result sets render 60 cards at
a time.

Batch upload accepts up to 50 PDF, EPUB, Word, PowerPoint, text or image files in one selection, with shared category,
subject, level, language and tag metadata. Each file may be up to 100 MB. Titles are derived from filenames and remain
editable. Exact same-name and same-size files already in the collection are rejected. Upload progress is visible; if
Firestore metadata creation fails after a blob upload, that blob is removed instead of becoming an orphan.

Data contract: metadata uses the new staff-only `didacticLibrary` collection; files use the staff-only
`didactics/<staffUid>/...` Storage prefix. Changed files: `didactics-library-core.js`, its tests,
`haldus-exercises/index.html`, `firestore.rules`, `storage.rules`, `ARCHITECTURE.md`, the existing Õppevara tab contract
test and this state file. No production data, rules or deployment are changed by this branch.

Validation: PASS — focused Õppevara and Didaktika suites, 28/28 tests; `git diff --check`; local Chrome verification
of the three sample book cards, combined search, four filters, batch-upload modal, metadata fields and responsive
layout; no browser console errors. Production use is blocked until the owner explicitly approves deployment of both
Firestore and Storage rules after merge.

Exactly one next safe step: finish focused tests and browser QA, then open a draft PR for authenticated owner review.

## Õppevara usability and readiness guardrails — PRODUCTION VERIFIED

Last verified against main: 2026-09-27, Europe/Tallinn.
Verified main: `820c952`.
Implementation PR: #168 — merged.

The existing Õppevara interface now distinguishes available curricula from empty planned subjects and levels. Empty
cards are disabled and labelled `Pole veel valmis`, so teachers cannot mistake English, mathematics or an empty
language level for a usable course. Curriculum navigation writes recoverable same-page history and restores its
subject, level and topic from the URL on browser Back. Standalone loading waits for the first curriculum snapshot
instead of briefly presenting zero records as real content.

A small pure readiness checker reviews curriculum materials and exercises before presentation. It flags missing
titles or learning content, the observed test-copy patterns, missing worksheet questions and exercise-type-specific
required data. Cards show `Valmis kasutamiseks`, `Kontrollitud`, `Mustand` or `Vajab kontrolli`, including the exact
reason. Exercise filters can isolate those states, and the topic badge is explicitly prefixed with `Teema:` so it is
not confused with the exercise type. Destructive lesson and exercise actions are moved behind `Rohkem toiminguid`;
the existing confirmation remains and exercise confirmation now names the record and states that deletion cannot be
undone.

Changed files: `oppevara-usability-core.js`, its unit test, `oppevara-usability-ui.test.js`,
`haldus-exercises/index.html` and this state file. No Firestore documents, rules, indexes, Functions, finance data or
production deployment are changed.

Validation: PASS — focused readiness, UI, visual-navigation and deduplication suites, 20/20 tests; `git diff --check`;
local Chrome verification of subject and level navigation, readiness labels, overflow actions and browser Back.
The separate pre-existing `curriculum-ui.test.js` still fails on clean `origin/main` because `haldus.html` does not
contain its expected `Õppekava teema` string; this branch does not modify that surface.

Known limitation: readiness is a presentation guardrail, not an automatic correction of production content. Existing
misnamed topics and incomplete records stay intact and are surfaced for human review; no production record was
silently renamed or deleted.

Production verification: the authenticated embedded Õppevara shows the readiness labels, overflow actions and
recoverable curriculum navigation against the real 327 library records and 21 exercises without browser console
errors. No production record was changed during verification.

Exactly one next safe step: use the readiness filter to review the records flagged by the presentation guardrail;
rename or delete content only through a separate owner-approved content-cleanup task.

## Communication Hub v1 Meta adapter — PRODUCTION GATE PARTIAL

Last verified against main: 2026-09-27, Europe/Tallinn
Verified main: `40547500dd21b7a8cb46b2e2bbb6665b1da542c9`.
Implementation PR: #162 — merged.

CRM v2's existing `Sõnumid` workflow is converted into a channel-neutral `Kommunikatsioon` surface without
replacing the working `messages` collection. Conversation identity uses stable IDs only: explicit
`conversationId`, then channel-qualified external thread identity, while legacy internal conversations keep the
exact `studentId`. Array position and current sort order are presentation-only.

New internal sends remain legacy-compatible and add `channel: internal` plus `conversationId: studentId`.
The server-only `metaMessagingApi` verifies webhook challenges and HMAC-SHA256 signatures and stores inbound Meta
messages with deterministic IDs so retries cannot duplicate them. Administrators may reply to external conversations;
teachers and parents cannot send through the external adapter.

Outbound Meta replies now fail closed. Before any provider call, the Function verifies that channel,
`conversationId` and recipient match an existing inbound message created by the signed Meta webhook. Facebook uses
`https://graph.facebook.com/v26.0/<page-id>/messages` with `META_PAGE_ACCESS_TOKEN`. Instagram uses
`https://graph.facebook.com/v26.0/<instagram-account-id>/messages` with
`META_INSTAGRAM_ACCESS_TOKEN`. Sender assets are pinned to Facebook Page `571647362697524` and Instagram account
`17841474277841669`, with non-secret environment overrides available.

Changed files: `functions/meta-messaging-core.js` and its test, `functions/index.js`,
`crm-v2/src/features/messages/MessagesPage.jsx` and its focused test,
`crm-v2/src/services/firebase/messages.js`, `crm-v2/src/features/messages/messagesModel.js` and its test,
`crm-v2/src/app/navigation.js`, `ARCHITECTURE.md`, `docs/COMMUNICATION_HUB_V1.md` and this state file.
No Firestore migration, rules/index change, or production data rewrite is included.

Production activation as of 2026-09-27: Meta app `KeeleSepp CRM` (`2016847882342152`) remains restricted to
Facebook Page `571647362697524` and Instagram account `17841474277841669`. Firebase Function secrets
`META_VERIFY_TOKEN`, `META_APP_SECRET`, `META_PAGE_ACCESS_TOKEN` and `META_INSTAGRAM_ACCESS_TOKEN` are configured.
Only `metaMessagingApi` was deployed in project `keelesepp-5136b`; no Firestore rules, indexes, migrations or other
Functions were deployed. The active endpoint is
`https://us-central1-keelesepp-5136b.cloudfunctions.net/metaMessagingApi`, and the GET `/webhook` challenge returns
the exact challenge with HTTP 200. Facebook and Instagram are subscribed to the `messages` webhook field.

Validation: PASS on code/docs head `cc074b1d0e4188d1417143ff58cca83c0b525062` — GitHub CRM v2 workflow
#36173652514 PASS; Financial Core emulator #36173652527 PASS; CRM v2 CI #36173652562 PASS including tests, lint and
production build; Vercel preview READY. Additional focused Meta core run: 6/6 PASS. Branch is not behind main and the
PR changes only the 12 communication/documentation files listed by the compare check.

Production smoke: Facebook inbound PASS and Facebook outbound PASS through the deployed `/reply` route. Instagram
tester `pa6an4ik` was explicitly authorized, and two real Instagram inbound messages reached the signed webhook and
were stored in `messages`, so Instagram inbound is PASS. PR #166 is merged in main and the corrected Function was
selectively deployed with only `metaMessagingApi`; the post-deploy GET `/webhook` challenge returned HTTP 200 with
the exact challenge. A newly generated permanent Page token was saved as enabled
`META_INSTAGRAM_ACCESS_TOKEN` version 4. Meta token diagnostics report it as valid, non-expiring, scoped to app
`2016847882342152`, Page `571647362697524` and Instagram account `17841474277841669`, including
`instagram_basic` and `instagram_manage_messages`.

Instagram outbound through `/reply` remains NOT PASSED. The confirmed CRM smoke message on 2026-09-27 returned
HTTP 502 because Meta rejected the provider request. A read-only conversation diagnostic with the same valid token
returned Meta OAuth error `(#3) Application does not have the capability to make this API call`. This isolates the
remaining blocker to Meta application capability/access, not the send endpoint, Firebase secret, webhook, or deploy.

Known production blocker: Meta keeps the app in development access until App Review is completed. In this state,
Facebook/Instagram messaging is limited to app administrators, developers or testers whose eligible accounts are
connected as Meta requires. Do not describe the Instagram channel as outbound-ready or public-production ready until
Meta grants the messaging capability and both public-account inbound/outbound smokes pass.

Exactly one next safe step: obtain owner approval to begin Meta App Review for Instagram messaging permissions;
after approval, repeat one Instagram inbound/outbound smoke from a non-role account.

## One-click lesson completion

Last verified: 2026-09-23, Europe/Tallinn
Verified main: `d5c20ce`.
Implementation branch: `codex/one-click-lesson-completion`.

The single-student lesson modal now has one primary `Lõpeta tund ühe klõpsuga` action. The teacher confirms the
prefilled attendance, lesson topic and result, optional homework due date, automatically suggested next curriculum
step and optional internal follow-up. One authenticated lesson-journal request then commits the completed lesson,
schedule attendance, stable homework, student curriculum pointer and linked task in the same Firestore transaction.
Existing stable lesson IDs and request IDs make retries idempotent and prevent duplicate homework or follow-up tasks.

The same modal now includes a school-curriculum picker backed by the existing `curriculumLessons` collection, with
subject and CEFR-level filters and lessons grouped by curriculum topic. This keeps the full managed C1 roadmap from
`Õppevara → Õppekavad` authoritative, while retaining the built-in curriculum as a fallback. Selecting a lesson
prefills the diary topic, vocabulary, goal and next assignment and makes one-click completion advance from that exact
position. The picker remains available when the student's subject or level is missing instead of silently disappearing.

Changed files: `haldus.html`, `haldus.css`, `functions/index.js`, `functions/lesson-record-core.js`,
`functions/lesson-record-core.test.js`, `lesson-one-click-completion.test.js`, `ARCHITECTURE.md` and this state file.
The existing `lessons`, `schedule`, `students`, `homework`, `tasks` and `lessonJournalRequests` stores are reused;
no migration, new collection, rules change or production write is included.

Validation: PASS — Functions unit suite 167/167; focused lesson/UI contracts 16/16; Node syntax check and
`git diff --check`. GitHub CI run 35883603985 passed the full Financial Core emulator suite, including the new
one-click transaction and its retry/idempotency checks. The automatic Vercel preview is ready. Local emulator
startup remains unavailable on this host because Java is not installed; authenticated visual owner review is still
required before production deployment.

Known limitation: v1 applies to individual scheduled lessons. Group lessons keep their existing per-student
attendance workflow because one group click must preserve distinct attendance and package outcomes for each student.

Exactly one next safe step: verify one real-looking scheduled lesson in the authenticated hosted preview before
owner review/merge.

## Unified notification centre v1

Last verified: 2026-09-23, Europe/Tallinn
Verified main: `6f491da`.
Implementation branch: `codex/notification-center-v1`.

A global bell now opens one notification drawer across the CRM. It combines unread messages, unseen completed
worksheets, overdue scoped tasks and invoices, and administrator-only parent-link, calendar and work-time alerts.
Filters show each source category, severity controls ordering and colour, and every item routes to its source student
or workflow. Notifications resolve with their source data rather than being copied to a second collection.

Changed files: `haldus.html`, `haldus.css`, `notification-center-ui.test.js`, `ARCHITECTURE.md` and this state file.
No Firestore rules, Functions, indexes, notification collection, email/push delivery or production data are changed.

Validation: focused notification, Student 360 and task workspace contract tests pass; `git diff --check` passes.
Authenticated visual owner review is required on the hosted preview.

Known limitation: v1 is an in-app centre and does not persist arbitrary dismissals or send email/push notifications.
A signal disappears when its source is handled, for example when a message is read or an invoice is paid.

Exactly one next safe step: review the bell, category filters and source navigation with real scoped data on the
hosted preview, then merge the draft PR if the routing is correct for administrator and teacher roles.

## Student 360 working hub v1

Last verified: 2026-09-23, Europe/Tallinn
Verified main: `2b6f881`.
Implementation branch: `codex/student-360-v1`.

The existing student profile now starts with a compact operational hub. It surfaces unpaid balance, pending
homework, unread messages, low package balance and missing curriculum planning, and provides direct navigation to
the existing learning path, worksheets, messages, homework, lesson journal and finance sections. The profile keeps
the detailed existing tools intact and derives the summary from their current records; it adds no parallel store,
migration or browser write path.

Changed files: `haldus.html`, `haldus.css`, `student-360-ui.test.js`, `ARCHITECTURE.md` and this state file.
No Firestore rules, Functions, indexes, financial records or production data are changed.

Validation: focused Student 360 contract tests and existing task workspace tests pass; `git diff --check` passes.
Authenticated visual owner review is required on the hosted preview.

Known limitation: v1 improves overview and navigation but keeps the existing long detail sections. Upcoming phases
can introduce attendance workflows, linked internal tasks and a unified notification centre without changing this
projection contract.

Exactly one next safe step: review the Student 360 hub with a real student on the hosted preview, then merge the
draft PR if the attention signals and navigation match daily staff work.

## Ülesanded team workspace — Asana-like v1

Last verified: 2026-09-23, Europe/Tallinn
Verified main: `bc9ada0`.
Implementation branch: `codex/asana-tasks-v1`.

The existing staff `Ülesanded` view now provides list and kanban projections, with `Uus`, `Töös` and `Valmis`
columns, search and the existing status/category filters. A task opens in a focused side drawer where staff can
rename it, move its status, reassign it, change its deadline, priority and category, and continue the existing
discussion. Task creation is collapsed into a compact quick-add panel. Existing `open` and `done` records remain
valid; `in_progress` is additive and all edits use merge writes to the existing `tasks` collection.

Changed files: `haldus.html`, `haldus.css`, `task-workspace-ui.test.js`, `ARCHITECTURE.md` and this state file.
No Firestore rules, Functions, indexes, schema migration, production data or deployment is included.

Validation: focused task workspace contract tests and staff assistant task tests pass; `git diff --check` passes.
The local application booted to the sign-in screen without a runtime boot error. Authenticated visual owner review
will use the hosted preview because browser authentication is origin-specific.

Known limitation: v1 changes stages through the detail drawer rather than drag-and-drop. Subtasks, dependencies
and notifications are not part of this bounded slice.

Exactly one next safe step: review the hosted preview as an authenticated administrator, then merge the draft PR
if the board, list and detail drawer match the daily workflow.

## Õppevara duplicate prevention, worksheet opening and naming

Last verified: 2026-09-23, Europe/Tallinn
Verified main: `5d66ec40647a69d5ec639e4c4b8a953f992b127d`.
Implementation branch: `codex/oppevara-dedup-rename`.
Draft PR: https://github.com/zakutailopavel-cyber/keelesepp/pull/156.

The production `curriculumLessons` collection was audited read-only before implementation: 306 records, with no
duplicate stable source keys and no exact duplicate subject/level/topic/title groups. No production documents were
deleted or modified. The reproducible risk was in worksheet saving: a known curriculum `lessonId` could temporarily
fall through to the new-record mode while the topic picker was still loading. The save target is now locked to that
immutable lesson ID and a missing original fails closed instead of creating a replacement document.

`LearningLibraryCore` now collapses repeated stable-source or exact semantic records before both Õppekavad and
Raamatukogu render them, keeping the richer/newer worksheet. Worksheet cards have explicit `Ava tööleht` / `Ava
kirje` actions, clickable titles and Escape-to-close preview. Teachers also get a visible `Nimeta` action. Manual
renaming updates the curriculum record and current worksheet title without rewriting immutable published-version
history.

The worksheet save dialog now shows a document-name field and enables automatic naming from the selected existing
lesson or destination topic. Opening a worksheet from a curriculum lesson visibly confirms that it will save back to
the same entry and will not create a duplicate.

Changed files: `learning-library-core.js`, `learning-library-core.test.js`, `worksheet-workflow-core.js`,
`worksheet-workflow-core.test.js`, `haldus-exercises/index.html`, `haldus-worksheet/index.html`,
`oppevara-dedup-rename.test.js`, `ARCHITECTURE.md` and this state file. No Firestore rules, Functions, indexes,
financial data or production records are changed.

Validation: PASS — focused Õppevara, C1 and worksheet suites, 56/56 tests; `git diff --check`; local desktop browser
verification of title-to-preview opening, Escape close, explicit rename/open controls, curriculum-to-builder handoff,
locked existing-record save message and automatic document-name control.

Deployment status: Vercel preview is ready and PR #156 checks are green. No production deployment or write was run.

Known limitation: production UI verification waits for PR review/merge and deployment. Existing near-duplicates with
different titles or topics are intentionally not guessed or deleted.

Exactly one next safe step: owner review/merge PR #156, then repeat the same save action twice in production and
confirm that the original lesson receives new versions while the curriculum record count stays unchanged.

## C1 curriculum 240 academic hours — implementation

Last verified: 2026-09-21, Europe/Tallinn
Verified main: `3046881f61bbe18fae1b0dbeaa3d540595b5bf8c`.
Implementation branch: `codex/c1-curriculum-100-lessons`.
Draft PR: https://github.com/zakutailopavel-cyber/keelesepp/pull/155.

The attached `KeeleSepp_C1_oppekava_240ak_tundi.docx` is now represented as a source-derived C1 roadmap for
the existing `Õppevara → Õppekavad` flow. It contains 10 ordered modules and 100 ordered two-hour lessons:
70 thematic lessons, 20 separate grammar lessons and 10 progress checks. Every lesson keeps the exact focus
and its own full worksheet prompt from the DOCX. The C1 installer reuses `curriculumLessons`; stable IDs and
merge writes make it idempotent. It does not create a second curriculum store.

The current `CurriculumView`, `TopicView` and `WorksheetPreviewModal` show the C1 type, objective, focus and
full prompt. `Kasuta prompti` fills the existing `ws_prefill` contract and opens the existing worksheet AI
workspace. B1/B2 data and flows are unchanged. The C1 level card reports 240 academic hours, 100 lessons and
10 modules.

Changed files: C1 manifest plus 10 module shards, DOCX extraction script, C1 authenticated installer,
`haldus-exercises/index.html`, `c1-curriculum.test.js`, `ARCHITECTURE.md`, this state file and
`docs/C1_CURRICULUM_240.md`. No Functions, rules, indexes, schema migrations, student records, finance, CRM or
schedule data are changed by the code patch.

Validation: PASS — focused C1 and existing Õppevara/worksheet suites, 37/37 tests; `git diff --check`;
desktop browser verification of all 10 modules and the thematic, grammar and progress-check lesson flows;
existing worksheet-builder handoff with the complete prompt; mobile verification at 390 × 844 with no horizontal
overflow. The complete root Node suite has the same six pre-existing failures on this branch and on clean
`origin/main` (branch 484/490, baseline 480/486); the four added C1 tests pass and introduce no regression.

Deployment status: Vercel hosted preview is ready and CI is green. The preview requires a separate KeeleSepp
sign-in on its own origin, so the complete visual flow was verified locally with the same commit. Production data
has not been installed.

Known gate: repository policy forbids the agent from merging its own PR. Production publication therefore
requires owner review/merge after the branch and preview are verified.

Exactly one next safe step: owner review/merge PR #155; after the production deployment, open the live C1 view
once as an authenticated teacher or administrator to run the idempotent installer and verify all 100 records.

## CRM v2 CI recovery — ready for review

Last verified: 2026-09-15, Europe/Tallinn
Verified main: `d3a5501adfd0792dbfda8fb11fd54cf0097f1ddb`.
Implementation branch: `agent/crm-v2-ci-repair-20260915`.

The CRM v2 suite on current main had 29 failing tests. The failures came from
outdated tests after the Finance workspace navigation and responsive layouts
were introduced, date-dependent invoice expectations, and form labels whose
controls had no generated ID. `Input` and `Select` now generate stable React
IDs when callers do not supply one, restoring label-to-control accessibility.
The affected tests now follow the visible Finance section navigation and assert
the current invoice, calendar, student-filter, profile and search behaviour.

Changed files: CRM v2 shared `Input`/`Select`, and focused test suites for
finance, calendar, student profile/list and global search. No Firebase rules,
Functions, schema, migrations, production data, deployment or external service
calls are included.

Validation: PASS — `npm test` (71 files, 285 tests); `npm run build`; `npm run lint`; `git diff --check`.

Known limitation: no production deployment or live-data check was run.

Exactly one next safe step: review the CI-repair branch and open a draft PR;
after it merges, confirm the remote CRM v2 CI is green.

Last verified: 2026-09-15, Europe/Tallinn
Repository: `zakutailopavel-cyber/keelesepp`
Verified main: `de9a9f31cb16fd3493da130a5ee0ee7893cdacf3` — page-aware PDF worksheet overlays (#152)
Current implementation branch: `agent/popup-answer-hotspots-20260915`
Current draft PR: https://github.com/zakutailopavel-cyber/keelesepp/pull/154
PRs [#103](https://github.com/zakutailopavel-cyber/keelesepp/pull/103) through [#116](https://github.com/zakutailopavel-cyber/keelesepp/pull/116) are merged.


## Interactive PDF Worksheet v1 — DRAFT

This slice replaces the temporary workflow-based PDF experiment from #144 with ordinary application code.
`haldus-exercises` loads each PDF page through PDF.js into a canvas, provides page navigation, and places
teacher-authored interactive fields only on their matching page. Image worksheet behaviour is unchanged.
The new `modal` field is a small click target: the teacher clicks once beside a question, configures its title
and instruction, and the student writes the answer in a popup rather than in a precisely positioned page field.
The marker now starts as a text button and can be moved by dragging it or resized by dragging visible edge and
corner handles; the editor no longer requires width and height number entry for this element type.

Changed files: `haldus-exercises/index.html`, `interactive-worksheet-pdf-v1.test.js`, `ARCHITECTURE.md`, and
this state document. Changed data contract: `interactiveOverlay.elements[].page` is an optional one-based page
number; legacy elements without it render on page 1. There is no Firestore rule, Function, index, migration,
production deployment, or document upload in this slice. PDF.js is loaded in the browser from the existing
CDN-style client dependency model; the PDF content is not sent to an AI service.

Validation: PASS — `node --test interactive-worksheet-v1.test.js interactive-worksheet-pdf-v1.test.js
visual-worksheet-student-v1.test.js` (8/8); `git diff --check`.

Known limitation: browser verification could reach the production sign-in page but had no authenticated teacher
session, so a real multi-page PDF authoring and student-review path has not been manually exercised. Rendering
also depends on the configured PDF.js CDN being available.

Exactly one next safe step: use a non-sensitive multi-page PDF in the PR preview while signed in, verify field
placement on two pages, and then review the saved assignment and student response without altering real student data.


## Student Visual Worksheet v1 — DRAFT

This slice connects the already-merged manual image overlay authoring from #143 to the student assignment flow.
A curriculum image with answerable `interactiveOverlay` fields is classified as a worksheet; assignment creation
snapshots the image pages and bounded overlay metadata into `worksheetAssignments`. The student `WorksheetPlayer`
renders the original page image unchanged and places short answer, long answer, choice and checkbox controls at
the authored percentage coordinates. Answers use the existing assignment `answers` map and existing
`submitWorksheet` write boundary. Open responses are required for completion but are not auto-scored unless the
teacher explicitly configured `correctAnswer`; word-translation hotspots remain informational. Students can
explicitly save an `in_progress` draft, and teacher review re-renders the same worksheet page with submitted
answers positioned over the original image.

Changed data contract: optional `worksheetAssignments.files[]` snapshot with optional
`interactiveOverlay: {version:1,elements:[]}`. Existing assignments without `files` are unchanged. No Firestore
rule, Function, index, migration, financial data, curriculum skill credit or production deployment is included.
The open PDF overlay PR #144 remains separate; this slice intentionally implements the current PNG/JPG workflow
without modifying PDF.js authoring.

Validation: PASS — root library/interactive/visual worksheet Node contracts; focused CRM worksheet/homework Vitest; `crm-v2` production build; `git diff --check`.

Known limitation: visual field placement depends on the teacher-authored overlay coordinates; this slice does not
perform OCR/AI field detection. PDF student rendering remains a follow-up after #144 is reconciled.

Exactly one next safe step: review one real two-page image worksheet in the Vercel preview from teacher assignment
through student completion and teacher submission view before merge.


## Õppevara Visual Navigation v1 — DRAFT

This bounded client-side slice makes `Õppekavad` the first/default Õppevara destination while preserving
explicit `?tab=library` deep links. Subject cards are compact and preview real curriculum topics; level cards
show their own real topic examples and navigate using the selected level's first topic. Topic names wrap in
the left rail. B1/B2 lesson cards show a clickable mini material preview: real `worksheetData.blocks` report
their block count and a safe learner-facing fragment, while lessons without worksheet data are explicitly
labelled as a source task rather than a finished worksheet. The click reuses the existing
`WorksheetPreviewModal` and stays in the current KeeleSepp workspace.
Attached image/PDF worksheets are also treated as documents rather than small attachments: image files render as full-size pages and PDFs receive a full-width embedded preview.

Changed files: `haldus-exercises/index.html`, `oppevara-visual-navigation-v1.test.js`,
`docs/PROJECT_STATE.md`, `ARCHITECTURE.md`, and `docs/HANDOFF_OPPEVARA_VISUAL_NAVIGATION_V1.md`.
No Firebase Function, rule, index, schema, migration, production data or paid external API is changed.

Validation:
- focused Node suite: PASS — required 5-file Node suite
- `git diff --check`: PASS
- localhost `LOCAL_LIBRARY_PREVIEW` visual smoke and browser console: PASS — localhost ?preview=library; default Õppekavad, explicit library deep link, B1/B2 mini-preview → WorksheetPreviewModal, no actionable console errors

Known limitation: the runner cannot inspect Pavel's uncommitted Mac working tree, so the described CSS work
was reproduced as a bounded override layer on the exact `cc8e80f8...` base instead of copying an unavailable
local diff. Review should therefore compare the automatic Vercel preview with the owner's local visual state.

Exactly one next safe step: review the draft Vercel preview through `Õppekavad → Eesti keel → B1/B2 → teema → töölehe eelvaade` and merge only if the visual result matches the intended local design.

## Current objective

Curriculum Document Upload & Preview v1 is the current bounded workstream. It upgrades the existing
`Õppevara → Õppekavad` material flow with pre-upload validation, explicit type/size guidance, filename and
percentage progress, safe Storage names, readable attachment metadata and same-page previews. PDF, image and
TXT files render inside KeeleSepp; Word and PowerPoint show a clear download card without sending authenticated
file URLs to a third-party viewer. Existing topics, materials and attachments remain compatible.

The existing Storage boundary remains authoritative: authenticated reads, staff-only writes, safe content and
files below 20 MB. No Function, Firestore rule, Storage rule, index, schema, migration, student record or
production-data change is included. See [CURRICULUM_DOCUMENT_UPLOAD_PREVIEW_V1.md](CURRICULUM_DOCUMENT_UPLOAD_PREVIEW_V1.md).

Exactly one next safe step: review the automatic Vercel preview with one non-sensitive PDF and one image,
confirm same-page preview and download, then merge the draft PR if the visual flow is accepted.

Historical Google Calendar Sync Clarity is merged and production-accepted. Past one-time KeeleSepp
lessons whose original Google push failed are shown as neutral `G–` records. An exact imported Google
mirror for the same student, teacher and interval is collapsed from presentation and no longer creates a
false self-conflict. Current and future sync failures remain actionable `G!` records.

Production smoke on main `28195c052758efe2153c30eead0ee592132889e7` confirmed the visible week retains
five completed lessons after a full reload. Deniss Lazarev and the historical Martin lesson show `G–`;
the duplicate Martin mirror and `Martin ↔ Martin` conflict are absent. The genuine
`Anna Krupenya ↔ Dema` overlap remains. No lesson, schedule, billing or Google Calendar record was
created or changed during the smoke.

Historical Calendar Completion Reconciliation is merged and production-accepted. Existing lesson-journal
results remain visible even when an older schedule record was already reverted to `Planeeritud` before
the #124 protection reached production.

The #124 import boundary prevents future reversion. #125 derives the displayed status from an existing
final lesson-journal record using exact `scheduleId + date` identity. Production reload retained five
completed lessons in the visible week. No lesson, billing or Google Calendar record was created or changed
during the smoke.

Production contains a genuine immutable A2 assignment for Elena Polischuk, assignment
`8f3cb3b6-9965-4637-9a4d-dd0032550008`, with 32 activities. Post-#112 production smoke confirmed the
teacher list, assignment open, all 32 activity steps, current status, CORS and Function requests without
creating answers or evidence.

The merged path is:

`real curriculum -> Teacher Home -> est-b1-school-learning-01 -> adaptive Lesson Mode -> evidence/handoff -> Learning Profile / Teacher Home`.

PR #94 switched Teacher Home to the real curriculum source. PR #95 then bound the first real school curriculum lesson (`est-b1-01:0`) to its own trusted adaptive lesson blueprint. PR #96 reconciled repository state after #95.

## Verified repository state

Current remote `main` is `31256ea0ec049973e8fd913b0699861be28b51b2`.

Merged on current `main`:

- #94 `fix(learning): use real curriculum in Teacher Home`;
- #95 `Real Curriculum Lesson Mode v1: school lesson to evidence and handoff`;
- #96 `docs: reconcile project state after PR 95 merge`;
- #97 `docs: accept real curriculum production teaching loop`;
- #98 `Lesson Builder v1 — Normalized Activity Contract` — merged, COMPLETED;
- #99 `Lesson Builder v1 — Authoring & Validation UI` — merged;
- #100 `Lesson Builder Ultimate Teacher UX` — merged / **COMPLETED**;
- #101 post-merge reconciliation — merged.
- #102 Cloud Draft Library v1 — merged; owner-reported selective Firebase rollout completed.
- #103 Interactive Lesson v1 — merged; CI and automatic Vercel Preview passed;
- #104 Interactive Lesson recovery and revoked-account protection — merged;
- #105 production rollout reconciliation — merged.
- #106 ready fillable Lesson Builder templates — merged.
- #107 bulk worksheet composer — merged; Vercel production deployment READY.
- #108 worksheet-composer rollout reconciliation — merged; documentation aligned with production.
- #109 Image Block v1 — merged; Vercel production READY and selective Functions rollout complete.
- #110 Image Block v1 reconciliation — merged.
- #111 production CRM Functions CORS — merged; selective `gcalApi` deployment and smoke PASS.
- #112 student assignment delivery reliability — merged; selective `interactiveLessonApi` deployment
  and read-only production smoke PASS.
- #113 staff student preview — merged; Vercel production READY, selective `interactiveLessonApi`
  deployment and authenticated Elena preview smoke PASS.
- #114 focused Student Lesson Player — merged; Vercel production READY.
- #115 Legacy Fillable Gaps + In-context Authoring — merged by owner; selective production Function
  rollout and production smoke are still separate gates.
- #116 cost-bounded single-activity AI generation — merged.
- #117 student assignment entry UX — merged.
- #118–#121 AI authoring recovery fixes — merged.
- #122 Quick Questions + Answers — merged; every question creates its own activity and response field.
- #123 Teacher Daily Workflow Reorganization — merged.
- #124 Calendar Completion Persistence — merged; owner deployed `gcalApi` and `syncAllCalendars`.
- #125 Historical Calendar Completion Reconciliation — merged; Vercel production READY and smoke PASS.
- #126 #125 post-merge documentation reconciliation — merged.
- #127 Historical Google Calendar Sync Clarity — merged; Vercel production READY and smoke PASS.
- #128 #127 post-merge documentation reconciliation — merged.
- #129 Teacher Home daily action clarity — merged; Vercel production READY and authenticated smoke PASS.
- #130 Teacher Home Curriculum Preparation Bridge — merged; Vercel production READY and authenticated production smoke PASS.
- #131 #130 post-merge documentation reconciliation — merged.
- #132 Guided Curriculum Starter — merged; focused curriculum/Builder/session and browser suites PASS.
- #133 expired summer course removal — merged; Vercel production rollout is an owner/Vercel gate.
- #134 Unified Teacher Workspace v1 — merged; authenticated production smoke PASS.

## Unified Teacher Workspace v1 — COMPLETED

- `Minu tööpäev` and `Valmista tund` are internal CRM destinations rather than full-page external navigation.
- Both centre surfaces remain mounted for instant return and Builder in-memory state preservation.
- Shared section headers retain title and signed-in profile; embedded pages remove duplicate branding only.
- Curriculum preparation query parameters survive the transition into embedded Builder.
- Focused tests **57/57 PASS**; Builder browser tests **24/24 PASS**; Vercel Preview READY.
- Authenticated production smoke PASS on main `73569786de938948a482b8e52f67a6444071c5b4`.
- The CRM URL and browser tab remain unchanged during daily-work/Builder transitions; sidebar and profile persist.
- Returning to Builder preserves the A2 draft, selected first block and open preview without reloading the surface.
- Student/Teacher and Desktop/Tablet/Mobile preview projections render in place with the non-persistence notice.
- No Firebase, API, schema, student or production-data change.

## Expired Summer Courses Removal — COMPLETED

- Removes the obsolete `Suvekursused 2026` homepage section and its unused responsive styles.
- Removes the seasonal benefit-list line and `Suvekursus lapsele` registration option so the public page no
  longer offers a past-season product through a secondary path.
- Keeps the regular course catalogue, prices, teachers, reviews and registration form unchanged.
- Validation: HTML landmark/content checks PASS; `git diff --check` PASS; local browser smoke PASS.
- Data/security impact: static public-page content only. No Firebase, API, authentication, CRM or production
  data change and no deployment performed.

## Guided Curriculum Starter — COMPLETED

- Reconciled product priorities are in `docs/PRODUCT_ROADMAP.md`: teacher preparation, explicit
  draft-to-student delivery and reliable student completion are P0.
- Curriculum entry presents three choices: recommended 60-minute structure, fillable independent work or
  the full template library.
- Applying any lesson template preserves curriculum title, CEFR, topic, goal and duration. New activities
  receive unique stable IDs; the previous browser draft remains recoverable through the existing Undo flow.
- Validation: focused curriculum/Builder/Teacher Home/session suite **87/87 PASS**; isolated Builder browser
  suite **24/24 PASS**; JavaScript syntax and diff checks PASS; local visual smoke and console PASS.
- Data/security impact: browser-only draft construction. No API, Firebase, student, assignment, evidence,
  calendar, `skillMap`, mastery or curriculum-credit write.
- Known limitation: the generated template content remains a starting point that the teacher reviews; this
  slice does not publish or assign automatically.

## Teacher Home Curriculum Preparation Bridge — COMPLETED

- Unbound real-curriculum lessons receive `Valmista see tund`; a ready or active trusted Lesson Mode keeps
  `Alusta tundi` / `Jätka tundi` unchanged.
- The link contains only `curriculumLessonKey`; Builder does not receive a student id or personal data.
- Builder pre-fills lesson title, CEFR, topic and goal and immediately opens the existing template library.
- Existing local work requires confirmation before replacement and remains available through Undo.
- Validation: focused core/UI/real-curriculum suite **59/59 PASS**; Lesson Builder browser suite **23/23 PASS**;
  JavaScript syntax and diff checks PASS; local and Vercel Preview visual paths PASS for `est-a2-03:0`;
  GitHub/Vercel checks **3/3 PASS**.
- Data/security impact: browser-only preparation flow; no API call, Firebase change, student write or deploy.
- Production smoke: Teacher Home, Vlad A1 and Ilja A2 preparation actions, stable curriculum key, existing-draft confirmation and browser console PASS.
- Known limitation: selecting and tailoring the pedagogical template remains an explicit teacher action.

## Historical Google Calendar Sync Clarity — COMPLETED

The calendar distinguishes an old, non-actionable push failure from a current failure. A past one-time
native lesson with `gcalSyncStatus: error` and no Google event ID renders as `G–`; current and recurring
errors keep the existing actionable `G!` state. When an exact historical imported Google mirror exists
for the same student, teacher and interval, presentation retains the native KeeleSepp lesson and removes
only the duplicate mirror. Genuine overlaps continue to appear in the conflict queue.

Validation before merge: targeted calendar and accounting UI suite **28/28 PASS**; JavaScript syntax and
diff checks PASS; GitHub/Vercel checks PASS. After owner merge, Vercel production for main
`28195c052758efe2153c30eead0ee592132889e7` became READY. Authenticated production smoke confirmed
`G–` for Deniss and historical Martin, no duplicate historical Martin card, no false self-conflict, and
the unchanged genuine Anna Krupenya/Dema conflict. A full reload retained five completed lessons and the
same corrected presentation. No new application runtime or API errors appeared. The console still emits
the known Tailwind CDN, in-browser Babel and oversized inline Babel transformation warnings.

Data/security impact: presentation-only. No Firebase Function, Firestore rule, index, migration, lesson,
schedule, Google Calendar, billing or student data was changed or deployed for #127.

Exactly one next safe step: run a read-only production usability audit of the teacher's daily path and
choose one bounded high-frequency friction point before making another code change.

## Calendar Completion Persistence — COMPLETED

Root cause: the trusted lesson journal correctly stores a final lesson result and patches its schedule
record, but the next Google import regenerated `status: Planeeritud` and merged it into the same document.
That made completed one-time lessons reappear as unfinished. The same boundary could overwrite a native
Google occurrence exception.

Google import now preserves `Toimunud`, `Puudus_p`, `Puudus_eta`, the linked lesson entry and recurring
`occurrenceStatuses`. Planned lessons continue to receive Google changes normally, and completing one date
of a recurring series does not complete future dates.

Validation before merge: calendar sync and lesson identity tests **22/22 PASS**;
calendar/UI/accounting contract tests **32/32 PASS**; complete Functions unit suite **166/166 PASS**;
JavaScript syntax and diff checks PASS. The owner merged #124 and selectively deployed `gcalApi` and
`syncAllCalendars`. A manual production sync returned HTTP 200 and synchronized 77 events without failures.
The subsequent hourly scheduled syncs completed successfully without Function errors.

## Historical Calendar Completion Reconciliation — COMPLETED

Some schedule documents may already have been reverted before #124 was deployed. Calendar rendering now
projects an existing final lesson-journal status (`Toimunud`, `Puudus_p`, or `Puudus_eta`) onto the matching
calendar occurrence using exact `scheduleId + date` identity. A different date or schedule ID cannot match.

This is a read-only presentation reconciliation. It does not update Firestore, create or delete lessons,
change billing, modify Google Calendar, or require Firebase deployment. Targeted calendar and accounting UI
tests **35/35 PASS**; GitHub/Vercel checks **3/3 PASS**. After owner merge, Vercel production for main
`e13ca1918c4884c7247f7be4d37578456cf5d07b` became READY. Real production showed 26 lessons for the visible
week: five completed, twenty planned and one cancelled. A full reload retained the same five completed
results. Google Calendar remained connected. No new application runtime error appeared; only the known
Tailwind CDN and in-browser Babel build warnings remain.

## Staff Student Preview v1 — COMPLETED

- Staff chooses **Kontrolli õpilase vaadet**, then a student in their authorized scope.
- Server returns only that student's assignments and records the preview start in `activityLog`.
- Opening an assignment uses the existing student projection and omits `teacherContent`.
- UI shows a persistent preview banner and provides an explicit exit action.
- Save, submit, feedback and local student recovery are unavailable in preview mode.
- Existing server mutations still require `actor.uid === assignment.studentUid`; preview introduces no
  alternate write path and no student credential/session impersonation.
- No Firestore rules, indexes, schemas, student records or production data are changed.

Validation on branch: targeted interactive lesson suite **11/11 PASS**; Functions suite **163/163 PASS**;
browser and Function JavaScript syntax checks PASS.

Known limitation: this slice verifies assigned interactive lessons. It does not impersonate a Firebase
account and does not reproduce private browser state, parent-only pages or third-party integrations.

## Student Lesson Player v1 — implementation pending review

Production review after #113 exposed a presentation defect: all 32 activity buttons appeared before
the selected activity, pushing the prompt and response below the fold. Staff preview also rendered
`Vastust pole` instead of response controls, so it could not verify fillable interactions.

The bounded player update provides:

- one focused activity card above the fold;
- visible prompt and response control;
- activity number, progress bar and concise `current / total` state;
- previous/next navigation;
- collapsed full lesson outline for direct navigation;
- responsive desktop/mobile presentation;
- interactive staff test answers held only in page memory, with no save/submit/API path.

No Function, Firestore rule, index, schema or production data change is required. Existing student
save, resume, submit, assignment IDs and answer validation remain unchanged.

Validation: targeted interactive lesson suite **12/12 PASS**; Functions suite **163/163 PASS**;
JavaScript syntax and diff checks PASS.

## Legacy Fillable Gaps + In-context Authoring — merged in #115

Production inspection of Elena's immutable A2 v1 showed a legacy activity whose prompt contains two
`___` blanks but whose published content has no `evaluation.response`. The existing renderer therefore
showed `Vastust pole` and supplied no fields.

The compatibility boundary now infers an optional `gaps` response only when an older activity has no
explicit response contract and one or more `___` tokens. IDs are deterministic (`legacy-gap-1`, etc.)
and remain identical across Support/Core/Advanced. The renderer places the inputs directly inside the
sentences. Normal legacy text without blank tokens remains read-only, and every explicit modern response
contract remains authoritative. The inferred response stays optional so an old published lesson does not
gain a new submission requirement; answers entered into the fields are still saved normally.

Teacher/admin view gains **Muuda seda ülesannet**. It opens the full cloud Builder in a same-page dialog,
loads the exact source draft and selects the current stable activity ID. Saving still uses optimistic
draft revisions; publishing creates a new immutable version. The already assigned version is not mutated
or silently repointed.

Data/security impact: no migration or current assignment rewrite. Once deployed, genuine student answers
for inferred gaps use the existing assignment `answers` map and existing save/submit validation. Staff
preview test values remain nonpersistent. The Function change requires a selective `interactiveLessonApi`
deployment after merge; Builder and player assets deploy through Vercel.

Validation for the merged #115 slice before the AI follow-up: interactive contract/UI suite **14/14 PASS**;
Functions suite **163/163 PASS**; syntax and
diff checks PASS.

The same PR adds **Loo üks ülesanne AI-ga** in Builder. The staff-only Vercel endpoint accepts a bounded
topic, CEFR, learning goal and response mode, calls `claude-haiku-4-5-20251001` with `max_tokens: 700`,
and returns exactly one tool-structured activity. It permits 10 requests per staff user per 15-minute
in-memory rate window. The teacher previews the result before inserting it. Insertion creates a new
stable activity ID, participates in Builder Undo/autosave, and remains an ordinary editable draft until
the existing explicit save/publish workflow is used. Generated metadata, text sizes, enums, response
items and gap counts are validated before insertion. No student, evidence, assignment, curriculum or
Firebase data is written by generation.

AI calls are paid external operations initiated only by the explicit **Loo ülesanne** button. No paid
generation was executed during development or tests. The endpoint uses the existing `ANTHROPIC_API_KEY`;
there is no new secret, Firestore rule, index, collection, Function or Firebase deployment.

The Single Activity AI slice was merged in #116. Its Vercel check passed; no paid generation was made by
the agent. The separate #115 selective `interactiveLessonApi` rollout remains an explicit owner-controlled
production gate.

## Student Assignment Entry UX — implementation pending review

The previous staff landing page presented three equal actions and assignment data as one undifferentiated
text row. The revised page leads with **Vaata õpilase pilguga**, explains that test inputs are not saved,
and moves authoring/assignment into secondary controls. Assigned lessons render as cards with the student
name, status and explicit **Ava ülesanded** action. The preview picker labels step one, requires a student,
then presents only that student's lesson cards. Student save/submit behavior and every server contract are
unchanged.

The focused lesson surface now labels **ÕPETAJA VAADE**, **TURVALINE ÕPILASE VAADE** or the genuine
student workspace and includes the student name for staff. Activity type is visible. A legacy activity
without a response contract is described as oral/teacher-led instead of the misleading `Vastust pole`.
Editing is a contextual action on the activity card, and its Builder dialog uses the full viewport. The
lesson header, progress, card hierarchy, navigation and teacher guidance received a responsive visual pass.

Data/security impact: presentation only. No Function, Firebase rule, index, schema, assignment, answer,
evidence or production data change.

Validation: interactive/generation contract and DOM suite **20/20 PASS**; Functions suite **163/163 PASS**;
JavaScript syntax and diff checks PASS.

## Teacher Daily Workflow Reorganization — COMPLETED

Teacher Home now presents the daily workflow as four prominent actions: today's lessons, lesson
preparation, student assignment and answer review. The CRM sidebar keeps the five daily destinations
visible and places infrequent administration tools in a collapsed **Kõik muud tööriistad** section.
The assignment shortcut opens the existing authenticated assignment form directly.

No route, permission or persistence contract is removed. The slice changes static navigation and
presentation only; Functions, Firestore, student records, assignments, answers and evidence are unchanged.

Validation: focused navigation and assignment tests **19/19 PASS**; Lesson Builder browser suite
**23/23 PASS**. The root suite is **429/433 PASS** on this branch. The same four unrelated failures
(three stale Adaptive Lesson UI expectations and the whiteboard browser environment test) reproduce on
clean `main`, where the suite is **426/430 PASS**.

Production navigation confirmed the reorganized daily navigation after #123 merged. Exactly one next safe
step: implement a bounded calendar presentation fix for historical failed pushes and exact self-duplicates,
while retaining real teacher and student overlap warnings.

The read-only production audit found both visible `G!` records were one-time KeeleSepp lessons from
8 September whose push failed on 7 September with `invalid_request` and no Google event ID. Current syncs
are healthy, but past one-time lessons are intentionally excluded from retry. Deniss has no matching imported
Google record. Martin also has a separate successfully imported Google record for the same student, date and
time, which creates a false `Martin ↔ Martin` overlap in the current presentation. No record was changed.

Independent open PRs remain separate and must not be mixed into the learning rollout:

- #83 adaptive lesson desktop density — old draft;
- #78 reliability spinner retry state — old draft;
- #74 Google Calendar sync reliability — open;
- #72 Frappe/ERPNext spike — finance staging;
- #71 finance staging stabilization — open.

Current GitHub `main` is authoritative. Open PR file lists were checked: no changed-file overlap with this authoring UI slice. #83 currently changes only `adaptive-lessons/scenes.js`, which is untouched.

## Real Curriculum Lesson Mode v1

The merged school slice keeps the contracts established in #95:

- exact curriculum/blueprint identity through `functions/curriculum-lesson-bindings.js`;
- stable blueprint `est-b1-school-learning-01` for curriculum lesson key `est-b1-01:0`;
- independent Vocabulary / Grammar / Speaking Support-Core-Advanced routes;
- answer-safe diagnostic and final assessment;
- roleplay and changed transfer context;
- append-only session/evidence persistence through trusted Functions;
- optional `curriculumLessonKey` on new school sessions/evidence;
- resume restores exact word marks and route state;
- blank scores remain absent rather than becoming zero;
- completion creates a handoff but does not rewrite `students.skillMap` or grant curriculum mastery/credit.

Main implementation boundaries remain:

- `functions/curriculum-lesson-bindings.js`;
- `adaptive-lessons/est-b1-school-learning.js`;
- `teacher-home-core.js` and `haldus-teacher-home/index.html`;
- `haldus-adaptive-lesson/index.html` and `lesson-workspace-core.js`;
- `learning-session-store.js` and `functions/learning-session-api.js`;
- `functions/learning-profile-evidence-api.js` and `haldus-learning-profile/index.html`;
- `real-curriculum-lesson.test.js` plus related Teacher Home/Profile/API/emulator coverage;
- `docs/REAL_CURRICULUM_LESSON_MODE_V1.md` and `docs/ADAPTIVE_LESSON_SYSTEM.md`.

## Verification

Verified from PR #95 / its reviewed head:

- CI-selected CRM/learning suite: **223/223 passed**;
- Functions unit tests: **157/157 passed**;
- Auth/Firestore/Functions emulator integration: **25/25 passed**;
- final Teacher Home/curriculum checks: **14/14 passed**;
- local browser smoke covered lesson identity, independent routes, transfer, hidden assessment answers, blank-score summary and Preview handoff behavior.

Known extended-glob noise from #95 remains unchanged: three stale `adaptive-lesson-ui.test.js` assertions reproduce on unchanged main, and one isolated-worktree test required missing `crm-v2/node_modules/jsdom`. These were not represented as passing.

## Production state — current #100 READY; historical teaching baseline below

Last inspected production baseline (post-#98, before #99 merge): Vercel was **READY** for main `b23dabc989be3aad1989de98f4c1234cfdc20e4a`:
`dpl_C6jfXFxJ8DMVfxCfT9Ks6MLpyepA`, primary GitHub-connected `keelesepp` project.

Post-#98 smoke on 2026-09-06:

- authenticated `crm.epkoolitus.ee/haldus-teacher-home/` loaded Robert's correct school lesson and existing handoff;
- nonstudent Lesson Mode loaded `est-b1-school-learning-01`; Next moved between activities;
- browser warning/error logs were empty for both pages;
- Vercel production error/fatal log query returned no matching entries in the inspected
  `12:36:58.432Z–13:36:58.432Z` window; this is bounded log coverage;
- production binding, blueprint, activity contract and workspace scripts matched main byte-for-byte;
- the downloaded client modules correctly resolved saved `currentActivityId=school-d-vocabulary`
  from the existing pre-smoke snapshot. This is an ID compatibility check, **not** a newly created
  or resumed live student session. Robert's accepted session is already completed.

Smoke result: **PASS within this non-mutating scope**. No new student evidence, sessions, handoffs,
Firebase operations or deployment were performed.

Authenticated production source downloads verified both Functions against main after the
2026-09-06 recovery of a stale-source redeployment:

- `learningSessionApi`: version **6**, ACTIVE, updated `2026-09-06T08:11:42.471Z`;
- `learningProfileEvidenceApi`: version **5**, ACTIVE, updated `2026-09-06T08:11:45.569Z`;
- build: `0d26d420-7f52-4672-badb-9434ce0e7e21`;
- source hash: `c208808a2d80bfe88674c62a7f86d2a4c24e113a`.

At that audit both deployed handlers matched the then-current main byte-for-byte. This workstream does not re-deploy or claim a new production revision. That separately authorized selective deployment
is complete; it grants no permission for further Firebase deployment. No new deployment was
performed for this acceptance documentation.

## Production teaching acceptance — ACCEPTED

On 2026-09-06 the owner confirmed that the recorded results belong to a genuine Robert lesson
and accepted the main production teaching loop. Read-only production verification found:

- completed session: `kJkHMe21CzXUqpN5NgrA`;
- status: `completed`; completedAt: `2026-09-06T08:43:12.101Z`;
- curriculumLessonKey: `est-b1-01:0`; lessonBlueprintId: `est-b1-school-learning-01`;
- 14 persisted `teacher_judgement` events and 3 `summary_score` events (17 total);
- summary scores: Vocabulary **50**, Grammar **74**, Speaking **70**;
- persisted routeBySkill: vocabulary **advanced**, grammar **advanced**, speaking **advanced**;
- explicit handoff and teacher note `Väga` persisted;
- the same scored handoff is visible in Learning Profile and Robert's Teacher Home card;
- `learningSessionApi` and `learningProfileEvidenceApi` returned HTTP **200**;
- no Functions errors were found in inspected flow logs;
- the full student document, including `students.skillMap`, is unchanged against the pre-smoke snapshot;
- lesson journal and `curriculumProgressEvents` remain unchanged; no automatic mastery, credit
  or advancement to lesson 2 was created.

Earlier session `dDF13J9b4k4ME3oe01h2` is a separate completed technical attempt with one judgement
and an unscored handoff. It was not reset, overwritten or confused with the genuine scored session.
Active-session refresh/resume and navigation persistence were verified before completion.
The audit did not create synthetic judgements, evidence, handoffs or credit.

### Non-blocking follow-up — NOT OBSERVED

**Production vocabulary_mark interaction not yet observed in a genuine lesson; verify opportunistically during the next real lesson.**

No `vocabulary_mark` event exists in this genuine session. It is unknown whether the word-mark
operation was actually performed; data loss is not established. The current contract supports
word marks and automated tests cover them. This production interaction is **NOT OBSERVED**,
not PASS or FAIL, and the owner explicitly accepted it as a non-blocking follow-up.

The first real curriculum production teaching loop is **ACCEPTED**. This rollout no longer
blocks Lesson Builder. No Firebase or Vercel deployment is needed for this documentation update.

## Normalized Activity Contract v1 — COMPLETED

PR **#98 is merged** on current main and its production Vercel deployment is READY.
The contract pins school task IDs, adapts legacy strings, preserves all three routes and restores
sessions by activity ID before legacy index fallback. Missing saved IDs fail visibly. The exact
contract remains in [NORMALIZED_ACTIVITY_CONTRACT_V1.md](NORMALIZED_ACTIVITY_CONTRACT_V1.md).
The existing real curriculum teaching acceptance above remains ACCEPTED.

## Completed implementation — Lesson Builder Ultimate Teacher UX (#100)

Base: `73d43aa9c5a4226ea2a4472c645795d6370e1ff8` (#99 merged).
Merged PR: [#100](https://github.com/zakutailopavel-cyber/keelesepp/pull/100). Implementation is in current main.

Implemented:

- compact teacher-facing desktop structure/editor/preview columns; laptop two-column mode,
  tablet structure drawer and preview overlay, mobile single-column editor;
- **41 declarative block templates** across nine subject/lesson categories and **9 lesson templates**;
- pointer drag handle, insertion indicator, placeholder, cross-phase move, keyboard Alt+Up/Down
  and Move up/down fallback, preserving stable IDs and variants;
- duplicate/copy/paste below/move-to/delete/reset, destructive confirmations, reference-copy warning;
- 50-snapshot Undo/Redo history with grouped typing and keyboard shortcuts;
- 700 ms local autosave, explicit Save, storage-error and unsaved-change states;
- human phase names/custom phases, skills, durations, lesson settings, hidden read-only technical details;
- teacher-friendly support levels, deterministic copy/simplify/challenge helpers (no AI);
- 450 ms live preview debounce, current activity, route/device/view selection and fullscreen overlay;
- **13 presentation presets** plus existing renderer, safe text-only image/audio placeholders;
- inline errors, separate warnings/tips, readiness metric explicitly unrelated to mastery;
- search/skill/type filters, collapsible phase groups, concise onboarding and JSON backup/restore.

Exact changed files:

- `lesson-block-templates.js`;
- `lesson-builder-ux-core.js`, `lesson-builder-ux-core.test.js`;
- `lesson-authoring-presentation.js`;
- `lesson-authoring-core.js`, `lesson-authoring-core.test.js`;
- `haldus-lesson-builder/index.html`, `haldus-lesson-builder/app.js`,
  `haldus-lesson-builder/style.css`, `haldus-lesson-builder/preview.css`;
- `haldus-adaptive-lesson/index.html`;
- `tests/lesson-builder/package.json`, `tests/lesson-builder/package-lock.json`,
  `tests/lesson-builder/ux.test.cjs`;
- `.github/workflows/financial-core-emulator.yml`;
- `docs/PROJECT_STATE.md`, `docs/LESSON_BUILDER_AUTHORING_UI_V1.md`,
  `docs/LESSON_BUILDER_UX_V2.md`, `docs/ADAPTIVE_LESSON_SYSTEM.md`.

Local validation:

- selected CRM/learning suite: **257/257 PASS** (15 new UX core tests, 10 existing authoring tests);
- isolated browser behavior suite: **11/11 PASS**, with pinned jsdom test dependency;
- unchanged Functions unit suite: **157/157 PASS**;
- existing school/city workspace parity: **123/123 equal**, all 41 activities × three routes;
- actual Chrome local review at **1440×1000, 1180×820, 834×1000 and 390×844**;
- actual pointer drag first→fifth across phases, autosave and preview navigation verified;
- browser syntax and diff checks PASS; final implementation CI: **450 PASS** (257 CRM, 157 Functions, 11 DOM, 25 emulator), run 34091652205.

Second UX/visual pass: replaced unreliable native browser drag with pointer-capture reorder;
removed premature empty-state errors; added inline duration/text errors and prompt counter;
hid teacher controls and the offscreen drawer from student preview; made desktop preview fit the
side panel; verified responsive editor density, focus styling and device layouts.

Contracts/data: no new normalized activity contract. Optional `draft.authoring` contains only
local lesson settings, keyed presentation/duration/template provenance and phase display names.
Older v1 drafts load without changing IDs. Phase and workspace type can be edited independently
in authoring (the existing normalized contract already permits this). Preview source indices are
derived; IDs, routeBySkill and registered teaching/session/evidence/handoff semantics remain intact.
Imported metadata is validated, markup escaped, unknown preview tokens fail closed, and studentId
is ignored in authoring preview. The student/teacher view switch is local preview presentation,
not an authentication/security boundary for distributing answer keys.

Production #100 limitations until cloud backend rollout: one saved local draft per browser origin, last-writer-wins across tabs, no cloud backup,
publication, versioning/assignment service or real audio/image upload. Presentation presets do not
claim an answer interaction engine. Incomplete drafts are not autosaved; unsaved-change warning
remains until fixed/saved. History is bounded and does not survive reload; saved content/IDs do.
Reference content is copied, never mutated. JSON exports are the separate lesson backup mechanism.

External operations: GitHub read/push/draft PR and automatic Vercel preview only. No Firebase
production call/deploy, rules/index/schema changes, student evidence, skillMap or curriculum credit
mutation, production Vercel deploy or paid AI call. Emulator tests use the demo project only.

## Post-merge production Builder smoke — PASS

Verified on 2026-09-07 at `https://crm.epkoolitus.ee/haldus-lesson-builder/`.
Vercel production is **READY** for main `1232af19599c327fdb2b6449097c3c831752bb08`:
`dpl_8hwo41hnZta4ebkLA8BJE7t75pQs`, target production, Git source. Deployment aliases
include crm.epkoolitus.ee, epkoolitus.ee and www.epkoolitus.ee. No deployment was initiated here.

Actual Chrome verification:

- Builder loaded the new visual interface; the origin initially had no saved draft.
- 60-minute lesson template created seven activities; diagnostic block template added the eighth.
- Real pointer drag moved the first activity to fifth across phases; the same eight IDs remained.
- After the autosave indicator confirmed completion, reload restored all eight IDs and content.
  A subsequent page reopen restored the reordered list with the original first ID still fifth.
- Teacher preview showed expected answer and teacher judgement controls; Student preview hid them.
- Desktop (1100px), Tablet (768px), Mobile (375px) preview frames worked; fullscreen and Next
  navigation worked. Only local authoring preview was used, without a student binding.
- Browser warning/error query returned **[]**.
- Available Vercel production error/fatal log query returned no matching entries for
  `2026-09-06T08:41:18.994Z–2026-09-07T08:41:18.994Z`. This is bounded coverage, not proof that
  all historical logs or Firebase runtime logs were inspected.

Six production responses matched current main byte-for-byte: Builder HTML/app.js, Lesson Mode
HTML, lesson-authoring-core.js, lesson-builder-ux-core.js and learning-session-store.js.
Re-ran **11/11 browser behavior tests PASS**, including forged-studentId preview with zero
persistent API/token calls. This validates the matching production code's nonpersistent boundary;
no direct Firestore before/after audit or browser network trace is claimed. No student session,
evidence, handoff, skillMap, mastery or curriculum credit was deliberately created or modified.
All smoke edits were confined to the browser-local draft `Builder post-merge smoke · local only`.

Autosave limitation confirmed: reload before the 700ms save completes may restore the previous
valid snapshot; the acceptance check waited for the saved indicator. Manual JSON import roundtrip
and malformed-file upload remain unverified in real Chrome due to the earlier extension file-access
restriction (automated coverage passes). They are retained as follow-ups, not silently marked PASS.
The genuine-lesson vocabulary_mark follow-up above remains NOT OBSERVED and non-blocking.

## Current cloud draft implementation

See [LESSON_BUILDER_CLOUD_DRAFTS_V1.md](LESSON_BUILDER_CLOUD_DRAFTS_V1.md) for schema/API/security.
New Function lessonDraftsApi owns lessonDrafts, lessonVersions and publishedLessons; direct client
read/write is denied. Revisions prevent stale saves; publication snapshots immutable versions.
Builder adds explicit cloud save, own library, reopen, duplicate, archive, read-only history and
publish. LocalStorage remains local recovery. Existing JS lessons and teaching/evidence are untouched.

Open PR intersections: #71 also touches functions/main.js; our only change there is one new export.
CI workflow is extended to run the new emulator test without changing functions/package.json,
which overlaps #71/#74. No finance/calendar behavior is included.

Verified CI run [34122978854](https://github.com/zakutailopavel-cyber/keelesepp/actions/runs/34122978854): Functions 161/161, CRM/learning 257/257, browser 13/13, existing emulator 25/25, new cloud emulator 14/14 (including parent suite): **470 PASS, 0 FAIL**. Includes explicit existing school-copy validation. Local emulator startup was blocked by missing Java; actual emulator verification ran in GitHub CI. Shared validator parity is enforced by test.
No production calls/writes/deployments made; preview uses automatic GitHub/Vercel build only.

Changed files in this workstream (18):

- `.github/workflows/financial-core-emulator.yml`, `ARCHITECTURE.md`;
- `docs/PROJECT_STATE.md`, `docs/LESSON_BUILDER_CLOUD_DRAFTS_V1.md`, `docs/ADAPTIVE_LESSON_SYSTEM.md`;
- `firestore.rules`, `functions/main.js`, `functions/lesson-drafts-api.js`;
- `functions/lesson-drafts.test.js`, `functions/lesson-drafts-emulator.integration.js`;
- `functions/lesson-contract/activity-contract-core.js`, `functions/lesson-contract/lesson-authoring-core.js`;
- `lesson-cloud-store.js`, `haldus-lesson-builder/cloud.js`, `haldus-lesson-builder/app.js`;
- `haldus-lesson-builder/index.html`, `haldus-lesson-builder/style.css`, `tests/lesson-builder/ux.test.cjs`.

[Automatic Vercel preview](https://keelesepp-git-agent-lesso-0d47d6-zakutailopavel-cybers-projects.vercel.app/haldus-lesson-builder/) is READY. Real Chrome loaded cloud controls, created a local lesson template and rendered Lesson Mode preview with no console errors/warnings. Cloud create/publish was not invoked against production; authenticated write lifecycle was verified through emulator HTTP and isolated UI tests. Full browser-to-production-cloud smoke remains gated on explicit backend deploy permission.

Firebase gate: only `lessonDraftsApi`; collections `lessonDrafts`, `lessonVersions`, `publishedLessons`; deny all direct client reads/writes; no index changes, migrations or existing teaching data writes. Exact proposed command in cloud contract doc. History represents published versions, not every save revision. Local recovery retains the existing valid-draft-only policy. Ambiguous create/duplicate responses need library inspection before manual retry; there is no automatic retry or idempotency-key mechanism in v1.

## Current workstream — Lesson Builder Interactive Templates v1

Branch `agent/lesson-builder-interactive-templates-v1` adds five ready fillable blocks and one
35-minute fillable worksheet. It reuses the deployed Interactive Lesson response contract and makes
no Firebase, API, schema or production-data change. Legacy lesson templates keep their behavior.
See [LESSON_BUILDER_INTERACTIVE_TEMPLATES_V1.md](LESSON_BUILDER_INTERACTIVE_TEMPLATES_V1.md).

## Current workstream — Worksheet Composer v1

Merged PR #107 adds `Lisa küsimuste loend`: teachers can paste
up to 30 questions and create a mixed fillable worksheet in one action. Prefixes select text,
choice or gaps response modes; stable activity and field IDs use the existing contracts. Invalid
input does not change the draft, and Undo removes the whole batch. See
[LESSON_BUILDER_WORKSHEET_COMPOSER_V1.md](LESSON_BUILDER_WORKSHEET_COMPOSER_V1.md).

## Current workstream — Image Block v1

Merged PR #109 adds an activity-level image asset with a stable ID,
HTTPS URL, required alternative text and optional caption. Builder editing, Undo/autosave,
authoring preview, immutable publication validation and the student runner use the existing
normalized activity. Unsafe URLs, duplicate asset IDs and unknown fields are rejected. Existing
activities without assets keep their behavior. No Storage upload, migration or production data is
included. See [LESSON_BUILDER_IMAGE_BLOCK_V1.md](LESSON_BUILDER_IMAGE_BLOCK_V1.md).

Final PR verification: Functions **163/163**, CRM/learning **269/269**, browser **23/23**,
existing emulator **25/25**, cloud drafts **14/14** and interactive lesson **13/13**, with GitHub
CI and automatic Vercel Preview PASS.

Vercel production is READY for main `568d42e1d1acd044895520612f01934bb4f81d0c`. With explicit
owner permission, `lessonDraftsApi` and `interactiveLessonApi` were selectively deployed; both are
ACTIVE on source hash `b11cbbe423e1e79e63ac87992839e876090a986e`. No rules, indexes,
Storage, migrations or production data were changed. Unauthenticated POST returned 401 and
production-origin preflight returned 204 for both. Fresh smoke executions completed without
runtime errors; one concurrent-update audit error was the deploy tool's duplicate update attempt,
after which the Function became ACTIVE on the intended hash.

## Historical Image Block follow-up

A genuine image activity acceptance walkthrough remains a non-blocking follow-up for the Image Block rollout.

## Current workstream — Unified Teacher Workspace v1

Last checked main on 2026-09-14: `2ef513a799cce77a8d3593aa8c56f15f7709cbaa`.
PR [#146](https://github.com/zakutailopavel-cyber/keelesepp/pull/146) is merged. Follow-up branch
`codex/restore-oppevara-primary` and draft PR
[#147](https://github.com/zakutailopavel-cyber/keelesepp/pull/147) restore the existing Õppevara application
as the primary sidebar destination after user review found the internal catalogue in the wrong position.

Goal: make `haldus.html` the single teacher workspace with one persistent menu/header/profile and no new
browser tabs in the ordinary curriculum, learning-library and worksheet-authoring flow. The daily routes are
`Minu tööpäev`, `Tunniplaan`, `Valmista tund`, `Õppevara` and `Minu õpilased`. `Õppevara` is the existing
`/haldus-exercises/` application that formerly opened in a separate tab. The duplicate `Õppeprogramm`
sidebar destination is removed; curriculum remains inside Õppevara and in student-specific flows. Existing same-origin tools
render in the CRM centre surface with duplicate child headers hidden. Curriculum and library worksheet
actions hand navigation back to the parent shell.

The student curriculum position now has a one-number control. It maps the number to an existing stable
curriculum item and reuses `students.curriculumPlan` plus `curriculumPlanUpdatedAt`; the existing activity
logger records `curriculum.position_set`. It sets the planned current lesson without fabricating completion
history. No new collection, endpoint, Function, Firestore rule, index, Storage object, publication contract
or data migration is introduced.

Changed files and full continuation details are in
[HANDOFF_UNIFIED_TEACHER_WORKSPACE_V1.md](HANDOFF_UNIFIED_TEACHER_WORKSPACE_V1.md). Open PR #144 changes only
the interactive PDF patch workflow/test and has no file overlap with this workstream. PRs #83, #78, #74,
#72 and #71 are older unrelated workstreams.

Verification: focused navigation/curriculum/worksheet suite **34/34 PASS**, `git diff --check` PASS,
GitHub `financial-core` PASS (1m26s), Vercel deployment PASS and Vercel preview-comment check PASS. Chrome
loaded the preview login and embedded learning-library route. Authenticated preview verification is blocked
because the temporary Vercel hostname is not in Firebase Authentication authorized domains; Google sign-in
failed at that boundary. No production deploy, Firebase deploy, production data write or paid external call
was made.

Known limits: embedded tools are still separate HTML runtimes; this is a navigation and visual-shell
consolidation, not a risky rewrite. The numeric position is a planning pointer rather than proof of earlier
completion. Exactly one next safe step: run the authenticated Vercel preview smoke described in the handoff.
