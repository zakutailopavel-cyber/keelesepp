# Calendar v2 — specification (draft for owner approval, 2026-09-29)

Status: **approved by the owner 2026-09-29** (with the change to section 4 below).

## Why (owner feedback 2026-09-29)

1. The calendar looks foreign next to the rest of v2 (dark gradient banner, metric tiles, heavy cards).
2. Recording the lesson topic / what was done existed in v1 but took too many steps and felt clumsy.
3. Lessons cannot be moved by drag and drop.

Context: about 240 lessons per week, several teachers, mostly weekly recurring individual lessons plus groups.

## What we build

### 1. Look: same language as Õppevara and the rest of v2
- Remove the dark banner and the four metric tiles. One light toolbar: ‹ Täna › · period title · Päev / Nädal / Kuu · teacher filter · search · "+ Lisa tund".
- White surfaces, thin borders, the same chips, buttons and typography as the new Õppevara.
- Lesson colour = teacher (soft tint + strong left edge), status shown by an icon, not a new colour:
  planned (no icon), done ✓, absent (student / teacher) ⨯, cancelled (struck through, faded).
- Teacher colour (2026-10-29, `calendarGrid.calendarTones`): 12 tones (`.tone-0…11`). Order: the viewer's own choice
  (`users/{uid}.calendarColors = { teacherKey: tone }`, „Värvid” in the toolbar, „Taasta vaikimisi”) → the
  administrator's school colour (`users/{uid}.calendarTone`, teacher page „Värv kalendris”) → the first colour no other
  teacher has, teachers taken by uid. Teachers also read the staff list for this, so defaults match the admin's view.

### 2. Week and day views with a real time grid
- Rows = time (default 08:00–21:00, scroll to the current hour), columns = days (week) or teachers (day view for admin).
- A lesson is a block whose height is its duration; free time is visible at a glance.
- Overlapping lessons (different teachers) sit side by side; with the teacher filter on, the grid shows one teacher's day.
- Current-time line. Click an empty slot → new lesson prefilled with that day and time.
- Month view stays a compact overview; phone keeps the day agenda list (no dragging on phones).

### 3. Drag and drop
- Drag a lesson to another time or day (15-minute snap). Drag the bottom edge to change the duration.
- Recurring lesson: after the drop ask once — **"Ainult see tund"** (default) or **"See ja kõik järgmised"**.
  - only this: the series skips that date (`excludedDates`) and a single lesson is created at the new time;
  - this and following: the series ends the day before and a new series starts from the new time.
- Conflict check on drop (same teacher, overlapping time) → the lesson snaps back with a message.
- **Undo** toast for 8 seconds after every move ("Tühista").
- Lessons already marked done/absent cannot be dragged (they are accounting records).
- Keyboard/accessibility fallback: the lesson panel still has date/time fields.

### 4. Topic and "what we did" in one step
- Click a lesson → a side panel (not a big modal) with: student, time, **last lesson's topic** ("Eelmine kord: …"), recording/transcript link if any.
- **"Toimus"** button opens a compact form inside the panel:
  - **Teema** — prefilled with the student's next lesson from Õppevara (same level and module order); search field over Õppevara to pick another; free text allowed.
  - **Mida tehti / märkmed** — optional, one line, grows if needed.
  - **Kodutöö** — optional: attach a worksheet from Õppevara (same search as the library) → it is assigned to the student.
  - One "Salvesta" → lesson marked done + topic + notes (+ homework assignment) in one write.
- Quick path stays: the ✓ on a lesson block marks it done with the suggested topic in one click.
- "Puudus" (student absent / teacher cancelled) from the same panel.
- The topic shows on the lesson block (second line) and in the student's history.

### 5. Groups
- Group lessons appear in the grid the same way (group name, member count); attendance per student stays in the panel.
- Group lessons can be dragged like individual ones (same only-this / all-following choice).

## Not in this step
- Google Calendar sync changes (server side stays as is).
- Student-facing calendar changes.
- Automatic topic from the lesson recording transcript (later, when recordings run).

## Data (no migration)
- `schedule`: existing fields; moves use `excludedDates`, `endDate`, new single events — already supported by the view code.
- `lessons` (done records): existing `topic`; add `notes` and optional `homeworkAssignmentId`. Rules must allow these fields for the lesson's teacher (rules deploy with the owner's word).
- Next-topic suggestion reads Õppevara order (level → module number → lesson number) and the student's last done lesson.

## Acceptance
- A teacher marks a lesson done with the suggested topic in one click, or with another topic + note in ≤ 3 actions.
- Moving a weekly lesson for one week takes one drag + one choice, and can be undone.
- Calendar screenshots match the Õppevara look (owner judges).
- Tests: grid layout, overlap, drag (single / series split), conflict, undo, topic suggestion; Playwright smoke later.

## Owner decisions (2026-09-29)
1. Admin day view: columns per teacher.
2. Default after dragging a weekly lesson: "Ainult see tund".
3. Grid hours 08:00–21:00.
4. Topic is picked as **level → theme (module) → lesson** from Õppevara, with the next lesson pre-selected, so parents
   see what was done with their child. Left empty, the lesson shows as **"Individuaalne tund"** (e.g. the student
   needed help with school work); an optional free-text note can say what.

## „Sobivad ajad” in the calendar (owner 2026-10-24)

Goal: plan teachers' lessons with the times the students marked („Sobivad ajad”, `studentAvailability/{studentId}`,
half hours „Mon-16:00”, `preferred` = ★), without overlaps. Pure logic: `features/calendar/studentTimesModel.js`
(tests `studentTimesModel.test.js`); UI: `StudentTimesPanel.jsx`, `TimeGrid` prop `marks`, `CalendarPage.jsx`.

- Button „Sobivad ajad” (admin and teacher) opens the panel: add students by name (several = a group: „sobib” where all
  can, hatched „sobib osadele” where only some can), or from „Planeerimata õpilased” (same list as the chip, now with
  each student's times; the chip list also has a „Sobivad ajad” button). Their half hours are shaded on the week / day
  grid in violet (★ stronger), next to the teacher's free / online / busy windows and lessons; the chosen students'
  lessons that the view does not show (another teacher or subject, a group) are a grey hatched strip on the right.
  `?times=<studentId>` (or `?times=1`) opens the panel.
- Teacher: an administrator's „Kõik õpetajad” filter; picking a student with an assigned teacher sets it when none is
  chosen. A teacher always sees their own windows and only their own students (rules unchanged).
- „Vabad tunniajad” (one student + a teacher): every full / half hour of the shown week where the whole lesson lies in
  the student's times, the teacher has no red window (yellow only for „Veebitund”), neither the teacher nor the
  student has another lesson (any teacher, groups too; „Kordub igal nädalal” = also the next 3 weeks), and an on-site
  lesson has a free room (when rooms exist). Order: ★ first, then the teacher's green time, then the time. Length =
  the student's most common lesson length (with this teacher first), else 60; format = the newest lesson's online
  flag; both can be changed. A click opens the normal „Uus tund” form prefilled (date, time, student, teacher, length,
  online, weekly) — nothing is saved before „Salvesta tund”. Past times are skipped.
- Warnings (never block; since 2026-10-24 the teacher's red window is a warning too — see below; the room rule stays): the form shows them live —
  outside / partly outside the student's times, the student's other lesson, the teacher's busy / online-only window,
  outside the teacher's green time (only when the teacher marked green time); the teacher's own parallel lessons stay
  in „Samal ajal on ka”. A drag that has a warning asks „Tõsta tund?” with the list (a weekly lesson's „Korduv tund”
  dialog lists them too); accepting a „Ei saa tulla?” request asks with `confirm`.
- A student with no saved times: „Sobivad ajad puuduvad” + „ava kaart” (`/students/<id>#sobivad-ajad`) + „kopeeri
  /ajad link” (clipboard only, nothing is sent).
- Weekdays are read at local noon and times are wall-clock minutes: a DST week does not shift anything (tested for
  2026-03-29 and 2026-10-25 and under several `TZ`).
- Limits: a teacher cannot see another teacher's lessons of the same student (schedule rules), so for a teacher the
  student clash check covers only the teacher's own lessons and groups. A lead from the public /ajad page
  (Päringud, source `availability`) is not linked to a student card when marked „Õppijaks”: its times must be entered
  on the card („Sobivad ajad” → „Märgi ajad”) to be used in the calendar.

## Administrator fixes (Oleksiy 2026-10-22…24)

### Rooms after „Tühista tund”
- A cancelled lesson (one-off: `status: 'Tühistatud'`; one date of a series: `excludedDates`; a date marked
  `occurrenceStatuses[date].status = 'Tühistatud'`) holds no room — client `roomModel.bookingFromEvent` and server
  `functions/room-booking-core.js roomBookingFor` (trigger `syncRoomBooking` → `roomBookings/{scheduleId}`).
- Cause of the remaining report: `roomBookings` were read once when the calendar opened. A teacher sees other teachers'
  lessons only through them, so a lesson cancelled elsewhere kept its room until the page was reloaded. Now the
  bookings are read again on every calendar reload (`CalendarPage` `bookingsState`, only when active rooms exist), and
  `roomConflict` ignores any booking that says cancelled or online (an old / stale one included).
- Stale server bookings: `functions/tools/room-bookings-resync.js` compares every schedule entry with its booking
  (`roomBookingResyncPlan`) and prints what it would write / remove — dry run by default; `--apply` only with the
  owner's permission (writes `roomBookings` only, logs `activityLog/room-bookings-resync-<time>` with the before values).

### A red hour is a warning, not a ban
- The teacher's red („Hõivatud”) and yellow („Ainult veebitunnid”, for an on-site lesson) windows no longer block
  (Oleksiy: „нужно предупреждение … а не запрет”). `studentTimesModel.planningWarnings` tags them `window: 'busy' |
  'online'` (a weekly lesson names the red dates of the next 4 weeks).
- New / edited lesson: the first „Salvesta” shows a red notice and the button becomes „Salvesta ikkagi”; the second
  click saves. Changing the teacher, date, time, length, weekly or online starts the question again.
- Drag: „Tõsta tund?” (or the weekly „Korduv tund” choice) lists the warning; „Tõsta ikkagi” / the choice moves it.
- Accepting „Ei saa tulla?”: the confirm lists the warning, „Tõstan tunni ikkagi?”.
- Unchanged: the room rule (a taken room cannot be booked), „Vabad tunniajad” still skips red times (it suggests).

### „Minu ajad” / „Õpetaja ajad”: the week grid
- The toolbar button opens `TeacherWeekEditor.jsx` (pure logic `teacherWeekModel.js`): Mon–Sun × half hours
  08:00–22:00, the feel of the students' poll grid. Brushes „Saadaval” (green = `free`), „Ainult veebis” (yellow =
  `online`), „Ei saa” (red = `busy`), „Kustuta”; tap or drag paints (tapping a cell of the same colour clears it),
  the weekday header fills / empties the whole day, Enter / Space on a focused cell.
- A teacher edits their own; an administrator picks the teacher in the filter (or a teacher column of the day view)
  first. `?ajad=1` opens it. Saving writes the same `teacherAvailability/{uid}` document (rules unchanged: admin any,
  staff own), so the „Sobivad ajad” overlay, the warnings and the student's „Ei saa tulla?” proposals use it as is.
- Conversion: weekly windows → cells (a cell takes the strongest window that touches it: red > yellow > green);
  cells → windows per weekday (neighbours of one colour join). Only weekdays changed in the grid are rebuilt; every
  other window — other weekdays (even with odd times like 09:15), all date windows — is kept as it was (same id). A
  rebuilt day keeps its parts before 08:00 / after 22:00. More than 200 windows is refused (the rules' limit).
- Shown with the grid: the teacher's lessons of a chosen week (a dark bar, the first cell names the lesson; a lesson in
  a red cell, or on site in a yellow one, gets a red frame and is counted); „Võrdle õpilasega” lays one of the
  teacher's students' „Sobivad ajad” over the same cells (violet frame, thicker = ★); „Ühe päeva erandid” lists the
  date windows from today on with „Eemalda”; a one-day window is still set in the calendar (cell click → „ainult see
  päev”, or „märgi kalendris lohistades”, the old painting mode with „Kordub iga nädal” off).
- Cell keys are the poll's format (`Mon-16:00`), all times wall-clock text: no DST effect (tested under several `TZ`).


## „Planeerija”: the whole weekly timetable at once (owner 2026-10-25)

Owner: „Планировщик внутри календаря, где можно внести сразу всех учеников одной кнопкой, и они распределяются …
ученик или более могут попасть на одно и то же время … зелёным — когда хочет, жёлтым — которые может, красным — которые
не может, но туда тоже можно поставить, но надо договориться с учеником.” No breaks between lessons are needed.
Pure logic `features/calendar/plannerModel.js` (tests `plannerModel.test.js`), UI `PlannerView.jsx` (tests
`PlannerView.test.jsx`), toolbar button „Planeerija” in `CalendarPage.jsx` (`?planeerija=1` opens it), `TimeGrid` props
`onDragChange`, `onDropItem`, `item.blockClass`.

- Who: an administrator (all teachers or one teacher: „Õpilased”); a teacher opens it for their own students only
  (their schedule rules show only their own lessons, so another teacher's lessons of the same student are not seen).
- Draft = one weekly pattern from a start date („Algus”, default next Monday): each weekday is its first date on or
  after the start (that is the new weekly lesson's start date). Kept in this browser (`localStorage`
  `keelesepp.planner.v1.<uid>`), nothing is written to the database before „Kinnita ajakava”.
- „Lisa kõik õpilased” (`planningRequests`): every active track (student × subject × teacher; „Paus” / „Lõpetanud”
  tracks, archived cards and cards with „Paus kuni …” are left out) without a weekly series ahead (a group lesson of the
  same teacher also counts as planned). Teacher = the track's account (found by name when only the name is stored).
  Length = the direction's most common length, else 60; online = the direction's newest lesson, else the student's,
  else on site; lessons per week = the weekly series ahead, else the most lessons in one of the last 8 weeks (1–5).
  All can be changed in „Õppesuunad plaanis”. „Ka need, kel on korduv tund (uus plaan)” (default off) also takes the
  directions with a weekly series: their series are ignored while planning and ended the day before the start at
  „Kinnita” (only when a new lesson of that direction is created, with its own tick; done lessons stay).
- „Jaota” (`distribute`, deterministic): fixed = every lesson that stays (any teacher, groups, one-off lessons) on the
  pattern dates and the next 3 weeks; rooms over 12 weeks. Hardest first (fewest good times), then more lessons a
  week, then by name. A lesson takes the cheapest good time: ★ before suitable, the teacher's green before „outside the
  green time”, a student's lessons on different days. When none is left, one backtracking step moves one or two draft
  lessons of the same teacher that are in the way to another good time of their own. Else the least bad time: in the
  student's times first, an overlap with another student of the same teacher allowed (marked „Kattub: X”), the
  student's own clash avoided. Not placed (`Aega ei leitud`): no teacher, or no „Sobivad ajad” at all (with „ava
  kaart” and „kopeeri /ajad link”). Lessons moved by hand are pinned: a new „Jaota” keeps them.
- Colours (`judgeSlot`, `dragMarks`) while dragging a draft lesson, after clicking it, or after picking an unplaced
  student: per half hour where the lesson would start — green „sobib õpilasele (★ eelistatud)” and the teacher free (or
  the teacher marked no green time); yellow „võimalik”: suitable but not ★, the teacher gives only online lessons there
  (online lesson), or outside the teacher's green time; red: the student cannot (not / partly in their times, no times),
  the teacher cannot (red window, yellow for a lesson on site), it overlaps a lesson of the teacher or the student, or
  no room is free. Red can still be chosen: the lesson is flagged „Lepi õpilasega kokku” (or „Kattub”). Draft lessons
  are dashed (green / yellow / red frame, ★ / ! / ⚠ before the name), kept lessons faded; the legend is always shown.
  Moving: drag (15-minute snap), or click the lesson and then a cell, or the Päev / Kell selects (phone list).
  Unplaced students: drag the chip onto the grid, click it then a cell, or „Paku aeg”.
- Summary: ★ eelistatud / sobib / lepi kokku / kattub / aega ei leitud (a lesson that overlaps and needs agreement
  counts as „kattub”).
- „Kinnita ajakava”: a list with a tick per draft lesson; overlapping and agree-first lessons start unticked. Each ticked
  one is created with `scheduleRepository.create` like the „Uus tund” form (weekly, date = its first date, room assigned
  again with `assignRoom`; a lesson whose room is gone is reported, not created) plus `source: 'planner'` and one
  `plannerBatchId` per click; after all lessons (administrator only — the rules) `plannerBatches/{plannerBatchId}`
  `{ createdAt, createdBy, lessonIds, studentIds, status: 'confirmed' }` is written for the schedule e-mail of
  agent/learner-emails. Nothing is sent from the calendar.
- Limits: a one-off lesson in the next 3 weeks blocks that weekly time (like „Vabad tunniajad”); „Jaota” is greedy
  with one backtracking step, not an optimum; the draft is per browser (another device starts empty).

**Learned times (owner 2026-10-26 „доделать планировщик”).** A student without „Sobivad ajad” gets the half hours of
their own individual lessons of the last 12 weeks (calendar occurrences not cancelled / missed + journal lessons):
`studentTimesModel.learnedTimes`, merged by `withLearnedTimes` (own times win). Such a time is never ★ (yellow:
„õpilane käis varem sel ajal”); any other time is „unknown” (red, agree with the student), not „cannot”. Production dry
run 2026-10-27: 50 directions → placed 7 before, 33 after; 12 new students without history and 5 without a teacher stay
unplaced.
