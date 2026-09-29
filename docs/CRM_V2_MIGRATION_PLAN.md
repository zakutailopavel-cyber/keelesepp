# CRM v2 migration plan (v1 → v2)

Status: plan, 2026-09-29. Owner decision of the same day is binding; everything else is a proposal until done.

## Owner decision (2026-09-29)

**Worksheet Studio is the only authoring tool.** Its visual level matches the approved hand-drawn v1 worksheets,
so no other builder is ported to v2 or developed further:

| Tool | Where | Decision |
|---|---|---|
| Worksheet Studio (`/library/worksheets/*`) | v2 | **the** builder for worksheets, exercises, homework, live lessons and the textbook |
| "Valmista tund" Lesson Builder (`haldus-lesson-builder`, cloud drafts, publish, lesson assignments) | v1 | retire: no port; stop new authoring |
| Worksheet Builder (`haldus-worksheet`) | v1 | retire |
| Exercise builder inside v1 Õppevara (`haldus-exercises`) | v1 | retire |
| "Loo materjal" worksheet blocks (`MaterialEditor`, `worksheetData`) | v2 | keep only metadata + attachments (lesson plans, files); worksheet content goes to the studio |
| "Loo harjutus" (`ExerciseEditor`, `exercises`) | v2 | retire for new content; a single exercise is a one-task studio worksheet |

Content already made with those tools is **not** lost:
- v1 `worksheetData` worksheets open converted in the studio (legacy adapter, #184);
- image/PDF worksheets move through "Üleviimine" (#186);
- existing exercises and published lesson assignments stay playable until finished (see step 3).

No data migration is needed: v1 and v2 use the same Firebase project and collections; Google Calendar sync runs
server-side (`syncScheduleToGoogle` trigger on `schedule`), so lessons created in v2 sync as before.

## What v2 already covers

Students (one child, several learning directions), parents, groups, teachers, calendar with quick attendance,
finance (invoices, payments, expenses, payroll and work time), communication (Facebook in/out), Õppevara + Worksheet
Studio, homework with structured worksheets, Live Classroom (invitations, video, presence, screen share, board,
worksheet in the room), student and parent cabinets.

## Remaining v1 functions (after the decision)

Builders are removed from the list. What is left, in priority order:

1. **Playing already issued v1 content** — published lesson assignments (e.g. the A2 assignment with 32 activities)
   and v1 exercises assigned as homework. Needed only until they are finished.
2. **"Minu tööpäev" / curriculum next step** (Teacher Home, curriculum goals, learning profile). Rebuild on the new
   base: a curriculum step points to studio worksheets; evidence comes from `score.perGoal` of worksheet assignments.
3. **Initial level test** (`tasemetest`).
4. **Student board outside the lesson** (`haldus-whiteboard`).
5. **Team tasks** (Ülesanded), **notification centre**.
6. **Admin tools**: Andmebaas, Töökindlus, Juhi abi, Tegevused (activity log viewer).

Adaptive lesson mode (`haldus-adaptive-lesson`, blueprints written by developers) is a delivery mode, not a teacher
builder. Open question for the owner: keep it as is, or rebuild adaptive routes on top of studio worksheets later.

## Steps

1. **Freeze old builders (small PR).** In v2: hide the worksheet-block part of "Loo materjal" and the "Loo harjutus"
   button (existing items stay viewable and assignable); in v1: label "Valmista tund", Worksheet Builder and the
   exercise builder "vana — kasuta Töölehe konstruktorit" with a link to v2. No data change.
2. **Role smoke (owner, ~30 min).** Administrator, teacher, parent, student log into v2 and follow the checklist in
   `docs/CRM_V2_READINESS.md` (gate 5). Instagram outbound stays a known gap.
3. **v2 becomes the default for staff.** Calendar, students, finance, Õppevara/studio, homework, Live Classroom.
   Links in the v2 menu open the remaining v1 functions (list above) until they are replaced. Students keep a link
   to their unfinished v1 lesson assignments; no new v1 assignments are created.
4. **Content move.** Convert image worksheets through "Üleviimine" by priority (the courses running now first).
   Progress is visible on that page.
5. **Replace remaining v1 functions** in the order of the list above, each as its own PR.
6. **Retire v1** after 2–3 weeks of daily work without going back to v1, and once all issued v1 assignments are
   finished or expired. v1 stays reachable read-only for one more month, then is switched off.

## Risks

- Vercel free plan hit its build limit several times on 2026-09-29: production updates may be delayed; consider a
  paid plan before v2 becomes the default.
- Photo cutting from Storage originals needs one-time bucket CORS (`storage.cors.json`).
- Live Classroom video without a TURN server may fail on strict networks.
