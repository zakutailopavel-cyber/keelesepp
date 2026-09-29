# Calendar v2 — specification (draft for owner approval, 2026-09-29)

Status: **draft**. Nothing here is built yet. Code starts only after the owner approves this document.

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

## Open questions for the owner
1. Admin day view: columns per **teacher** (recommended) or one column with colours?
2. After dragging a weekly lesson, default choice "Ainult see tund" — OK?
3. Grid hours 08:00–21:00 — OK, or different?
4. Topic suggestion from Õppevara order (next lesson in the student's module) — OK?
