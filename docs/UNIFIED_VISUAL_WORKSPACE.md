# Unified Visual Teacher Workspace

Last updated: 2026-09-14

## Product decision

KeeleSepp has one teacher-facing workspace. An ordinary teacher must not have to understand which feature
was originally implemented in `haldus.html`, Teacher Home, Lesson Builder, Worksheet Builder or a separate
HTML entry point. The left navigation, section header and signed-in profile remain visible while the centre
surface changes.

The existing Lesson Builder is the canonical authoring product. Future visual worksheet capabilities are
added to it instead of creating another teacher-facing builder.

## Interaction contract

- Primary navigation changes the centre surface without opening another browser tab or replacing the CRM shell.
- Returning to an already opened daily or Builder surface preserves its in-memory state and does not reload it.
- A curriculum preparation link keeps its stable `curriculumLessonKey` when it opens Builder inside the shell.
- Embedded screens remove duplicate brand/navigation chrome but keep task actions such as Save, Preview,
  Undo and Redo.
- Same-origin navigation back to the CRM is handed to the parent workspace. Authentication and authorization
  remain the existing Firebase boundaries.
- Mobile retains the global app header and uses a compact section header with the same hierarchy.

The first slice uses mounted same-origin embedded surfaces as a migration boundary because the current CRM is
an inline React application while Teacher Home and Builder are independent browser applications. This avoids a
risky rewrite and provides immediate in-app navigation. Each surface can later be extracted into shared
components without changing the teacher-facing route or information architecture.

## Visual contract

Every primary teacher surface must preserve:

- the dark KeeleSepp navigation rail;
- one white section header with an eyebrow, clear title and signed-in profile;
- the shared navy, pine, cream, paper and gold palette;
- Fraunces/Georgia for page hierarchy and the existing sans-serif for controls;
- consistent 8–12 px control radii, visible keyboard focus and restrained shadows;
- desktop, tablet and mobile layouts with no hidden primary action.

A change is not complete from tests alone. Review must include screenshots or live browser inspection at
desktop and tablet widths, the active navigation state, section header, profile, empty/loading/error states,
and the most important action on the first screen.

## Authoring direction

One lesson document will support three projections:

1. teacher visual canvas;
2. interactive student task;
3. printable A4/PDF worksheet.

The next authoring foundation is a paged 12-column A4 grid inside the existing Lesson Builder. Blocks keep
their immutable activity IDs while adding presentation-only position and size. Teachers drag, resize,
duplicate and align blocks. A two-thirds task plus one-third image is represented as `8/12 + 4/12`, while the
student projection may reflow the same content for smaller screens. Worksheet Builder block types are reused
through the Normalized Activity Contract; they are not copied into a third schema.

## Current bounded slice

`teacher_today` and `lesson_builder` become internal CRM destinations. Both centre surfaces stay mounted for
instant return. Teacher Home supports embedded navigation back to the parent, and Builder receives its full
curriculum query when opened from a daily lesson.

No Firebase Function, rule, index, schema, student data or production deployment is part of this slice.

## Next safe step

After owner review and merge, perform an authenticated production smoke of the unified daily/Builder
navigation, then implement the first A4 canvas proof in Lesson Builder: text block plus image block with
drag, resize, 8/12 + 4/12 layout and print preview.
