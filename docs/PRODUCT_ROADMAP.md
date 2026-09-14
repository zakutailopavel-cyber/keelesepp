# KeeleSepp Product Roadmap

Last reconciled: 2026-09-14
Authoritative main at reconciliation: `29f7fd099705300e3d42cd639590ba22f9a0059c`

## Product outcome

KeeleSepp should let a teacher open today's lesson, prepare or reuse material in minutes, teach it, give the
student interactive work, review responses and retain evidence for the next lesson. Internal collections,
IDs and separate CRM modules must not become navigation tasks for an ordinary teacher.

## What already works

1. **Daily work:** Teacher Home shows today's lessons and the next curriculum step.
2. **Preparation:** Lesson Builder has stable activities, reusable blocks, templates, preview, cloud drafts,
   immutable publication, images, fillable responses and one bounded AI-generated activity.
3. **Delivery:** a published lesson can be assigned; the student player saves and resumes answers; staff can
   inspect the student projection without using a family account.
4. **Teaching evidence:** the accepted adaptive lesson flow persists judgements and handoff without silently
   changing `skillMap`, curriculum mastery or credit.
5. **Operations:** calendar completion persistence and historical Google sync presentation are accepted.

## Current product gaps, in priority order

### P0 — One visual workspace

Daily work, student context and lesson preparation must open in the centre of the authenticated KeeleSepp
shell. The navigation rail, page header and signed-in profile remain visible; primary work never opens a new
tab or replaces the whole application. Already opened daily and Builder surfaces retain their state when the
teacher moves between them. This is the current bounded workstream.

### P0 — One visual authoring canvas

The existing Lesson Builder becomes the only teacher-facing authoring product. Add a paged A4 canvas with a
12-column grid, drag, resize, alignment, page breaks and print preview. Reuse Worksheet Builder block types
through the Normalized Activity Contract. The same lesson content must project to the teacher canvas, the
interactive student player and printable A4/PDF without parallel content schemas.

### P0 — Teacher can prepare today's lesson quickly

Teacher Home must open a guided curriculum starter with a small number of ordinary choices. Curriculum
metadata must survive template selection. The resulting draft remains editable and requires explicit
teacher save/publication. The guided starter is implemented; its navigation is now being consolidated into
the unified workspace.

### P0 — One visible path from draft to student

After a teacher finishes a draft, the interface should clearly lead through cloud save, publish and assign,
then return to today's lesson. Existing trusted APIs remain authoritative; this is navigation and state
clarity, not a new publication model.

### P0 — Reliable student task completion

Each question needs its own visible response control, clear save/resume state, a concise assignment list and
an understandable completion action. Staff preview must match the student's projection while remaining
nonpersistent. Production defects in this path take priority over new Builder capabilities.

### P1 — Fast reuse instead of repeated authoring

Add search, filters, recent lessons, duplicate-and-retarget and curriculum-aware recommendations to the cloud
lesson library. Reuse must create a new logical draft when edited and keep published versions immutable.

### P1 — Expanded visual content quality

Improve the most-used activity layouts, media placement and mobile readability through a small set of strong
presets. Add real audio/media only behind the existing asset and authorization boundaries.

### P2 — AI assistance with explicit cost control

Expand AI only after the manual path is fast. Generate one reviewable block or a bounded draft, show the
result before insertion, meter usage and never publish or assign automatically.

### P2 — Broader curriculum and adaptive coverage

Add trusted blueprint/version bindings incrementally. A LearningSession always references immutable content;
attendance never becomes mastery and no automatic `skillMap`, mastery or curriculum credit is introduced.

## Explicitly outside the near-term critical path

- a second learning identity or mastery store;
- automatic migration of existing JS lessons;
- automatic publication or assignment;
- finance redesign inside the teaching flow;
- broad Firebase schema migration;
- collaboration, voice and generative media before the core teacher/student path is reliable.

## Delivery rule

Take one bounded high-frequency friction point at a time. Verify existing tests, preview the real UI at desktop
and tablet widths and update `docs/PROJECT_STATE.md`. Visual review is part of acceptance, not optional polish.
Merge remains an owner action. Firebase production changes require a separate gate.
