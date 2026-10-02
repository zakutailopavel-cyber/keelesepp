# Worksheet Generator v1

## Goal

KeeleSepp generates editable Worksheet Studio documents deterministically from a curriculum lesson profile. Content generation is local and pure: no AI provider, translation service, search engine, HTTP generation endpoint, Firestore write or timestamp participates in output selection.

The full product progression is:

1. `Avasta` — notice and understand the target language in context.
2. `Harjuta` — controlled accuracy practice.
3. `Kasuta` — transfer through speaking and writing.

A teacher may also generate one `Avasta`, `Harjuta`, `Kasuta` or `Täistööleht` document for one to three selected focus IDs.

## PR 1 boundary — pure generator core

The first slice lives in `crm-v2/src/features/worksheet-generator/engine/` and exposes:

- `generateLessonBundle()`;
- `generateFocusWorksheet()`;
- deterministic seed, shuffle and sample helpers;
- lesson-kind, CEFR level, legacy-focus and vocabulary normalization;
- phase recipes and current Worksheet Studio block materialization;
- stable generator diagnostics and pre-persistence quality checks.

The reference profile is `crm-v2/src/features/worksheet-generator/fixtures/a2b1-016.generator-profile.json` for `a2b1-016 — Ajamäärused ja päevaplaan`.

Same profile + lesson + seed + generator version produces byte-equivalent output. `worksheetDoc` remains an ordinary `keelesepp.worksheet/2` document and contains no generator-only fields. Generation metadata stays on the returned `GeneratedSheet` envelope. Block defaults come from the current Worksheet Studio registry, but every generated block receives deterministic IDs and fully materialized profile content.

Blocking quality diagnostics stop future persistence. The core rejects unsupported profile versions, unknown or excessive focus selection, unknown blocks, placeholder content, missing scorable answer keys and focus coverage below 70%. Source scarcity produces explicit diagnostics instead of fabricated language.

This slice does not add a route, button, Firebase service, collection, rule, migration, assignment or deployment.

## Child-sheet persistence boundary

`lessonWorksheetsService` stores child sheets under `curriculumLessons/{lessonId}/worksheets/{worksheetId}`. Stable core IDs are `discover`, `practice` and `transfer`; focus sheets use their own IDs. The legacy root `worksheetDoc` contract stays untouched. Generated sheets begin as drafts and never overwrite manual or published work silently. Each transaction checks the loaded `worksheetDocUpdatedAt`, increments the version, writes an immutable `{lessonId}_{worksheetId}_studio_v{version}` history record, and keeps the last published snapshot when a newer draft is saved.

Firestore permits signed-in users to read these lesson materials and restricts child-sheet writes to staff. Existing `worksheetVersions` remain staff-readable/create-only and cannot be updated or deleted. The shared Worksheet Studio child route and teacher controls belong to the next UI slice.

## Teacher generation UI

The lesson material dialog links to `/library/lessons/{lessonId}/worksheets`. For a lesson with a curated generator profile the page offers `Genereeri 3 töölehte` and shows stable cards for `Avasta`, `Harjuta` and `Kasuta`. Generation saves all three as independent drafts. Re-generating existing core IDs requires explicit confirmation, creates new versions and keeps published snapshots intact. Lessons without a curated profile show `Generaator pole selle tunni jaoks veel valmis` and cannot generate generic content.

Each card opens `/library/lessons/{lessonId}/worksheets/{worksheetId}`. This route adapts `lessonWorksheetsService` to the existing Worksheet Studio instead of forking its editor, renderer or quality gate. Save and publish affect only the selected child sheet; its version history uses the child-aware immutable records.

Assignment continues to snapshot the selected published worksheet in `worksheetAssignments`. The source record will retain child-sheet identity and version for traceability; the student player continues reading the immutable assignment snapshot.

## Live teacher guidance and student profile

Generated worksheets must reuse the existing live-assignment path rather than create another session model:

- `homeworkService.subscribeWorksheetAssignment()` streams the learner's autosaved answers;
- `LiveWorksheetView` shows current answers, progress and per-field ✓/✗ marks;
- `setWorksheetLiveFocus()` writes `liveFocus.blockId`;
- `DocWorksheetPlayer` subscribes to the same assignment, highlights that block and scrolls it into view;
- `RoomWorksheetPanel` presents the same teacher/student assignment inside Live Classroom.

Teacher acceptance criteria for the integrated generator:

1. Open an active generated worksheet assignment and see answers update without reload.
2. Enter the learner's active session from Live Classroom or the assignment view.
3. Point to one task and see it highlighted for the learner.
4. See deterministic marks on completed scorable fields and add existing annotations/feedback without changing answer data.
5. Open a student's profile and see active, submitted and reviewed Worksheet Studio assignments.
6. Open an active assignment from the profile in live view and a completed assignment in review view.

`StudentProfilePage` loads the learner's existing `worksheetAssignments` through
`homeworkService.listWorksheetAssignmentsByStudentIds()`. The `Õppetöö` tab shows assigned, active, submitted and
reviewed worksheets. Active records open the shared live route; completed records open an answer preview and link to
the full assignment view. Answers and results remain on the assignment document and are not copied into `students`.

## Rollout order

1. Pure generator core and reference profile.
2. Child-sheet draft/publish/version persistence and rules. (implemented)
3. Teacher generation UI and shared Worksheet Studio route. (implemented for the reference profile)
4. Assignment source traceability, live entry points and student-profile work history. (profile history and live/review entry points implemented; source traceability remains)
5. Profile coverage expanded in data-only roadmap slices.

No unsupported lesson is presented as generatable. No production deployment is part of PR 1.
