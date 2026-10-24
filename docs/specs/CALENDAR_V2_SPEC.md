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
- Warnings (never block; the teacher's red window and the room rule stay as before): the form shows them live —
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
