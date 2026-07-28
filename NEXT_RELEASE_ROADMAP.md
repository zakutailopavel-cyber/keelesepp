# KeeleSepp next release

## Release goal

The release has two coordinated tracks:

1. make the existing CRM calmer, consistent and explicit about bad data;
2. introduce Live Classroom without exposing the teacher's private workspace.

## Implemented foundation

Implemented so far:

- correct today's lesson count and make bad legacy package data explicit;
- surface historical duplicate invoice numbers without rewriting accounting history;
- remove the most visible mixed-language labels and duplicate build badges;
- make parent cards read-first and compact the Google Calendar status panel;
- add the isolated one-teacher/one-student Live Classroom foundation;
- add the public learning stage, private teacher desk, choice and short-answer tasks;
- add opt-in tab/window screen sharing with classroom-scoped signaling;
- enforce room, response and signaling access in Firestore rules.

This is intentionally a foundation, not the full release. Finance navigation, remaining
responsive cleanup, TURN-backed connectivity and richer task types stay in the ordered
follow-up slices below.

## Track A — CRM quality and workflow

### A1. Correctness and language

- Count only lessons that occur today on the dashboard.
- Never present a negative legacy package balance as a normal balance.
- Detect historical duplicate invoice numbers without rewriting old documents.
- Use Estonian consistently in the CRM.
- Keep a single unobtrusive build label.

### A2. Information architecture

- Split finance into overview, invoices, payments, tariffs, packages and attention.
- Move rare or destructive actions into secondary menus.
- Replace always-editable parent cards with summaries and an explicit edit mode.
- Make group schedule and member actions unambiguous.
- Compact the Google Calendar integration panel.

### A3. Responsive polish

- Reduce wide-table pressure and keep primary columns visible.
- Add clear empty states and quick-action templates.
- Verify teacher, student and parent mobile layouts.

## Track B — Live Classroom

### B1. Safe classroom foundation

- One classroom is tied to one teacher and one student record.
- The teacher has a private control desk.
- The student sees a separate public stage containing only published material.
- Teacher can publish instructions, multiple-choice tasks and short-answer tasks.
- Student responses are recorded append-only and visible to the teacher.
- Classroom access is enforced by Firestore rules.

### B2. Screen sharing

- Screen sharing is opt-in and uses the browser permission dialog.
- The product stage remains the default safe sharing method.
- For an external screen, the teacher is instructed to choose one tab or window,
  never the whole desktop.
- When the browser reports a whole-monitor source, the client stops it before publishing.
- WebRTC signaling is scoped to the classroom.
- A TURN service is required before screen sharing can be called production-grade
  on all networks.

### B3. Rich interaction

Implemented:

- Live participant presence with a bounded heartbeat.
- Interactive choice and short-answer tasks open in a focused stage dialog.
- The teacher sees the current response state next to the stage.

Next:

- Shared whiteboard and teacher pointer.
- Drag-and-drop, matching and fill-in-the-gap activities.
- Timers, polls and per-task reveal.
- Save the lesson scene and responses into the student's learning history.

### B4. Calls and groups

- Camera and microphone controls.
- Multi-student group rooms.
- Waiting room, hand raise and breakout activities.
- Recording only after explicit consent and a retention policy.

## Safety boundary

The student never receives remote access to the teacher's computer. The normal
lesson view is a curated stage. Browser screen capture is a separate temporary
stream controlled by the teacher and can be stopped at any moment.
