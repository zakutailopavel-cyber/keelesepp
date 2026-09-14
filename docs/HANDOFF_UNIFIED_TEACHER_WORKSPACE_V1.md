# Handoff — Unified Teacher Workspace v1

## Authoritative state

- Last checked: 2026-09-14
- Main: `2ef513a799cce77a8d3593aa8c56f15f7709cbaa`
- Branch: `codex/unified-teacher-workspace-v1`
- Draft PR: [#146](https://github.com/zakutailopavel-cyber/keelesepp/pull/146)

## Bounded goal

Make the existing CRM the single teacher workspace. Keep one navigation rail, one section header and the
signed-in profile while teachers move between their day, schedule, students, curriculum, library, lesson
builder, worksheet builder, classroom and whiteboard. Do not create a new lesson system or data model.

## Implemented

- The daily navigation exposes `Minu tööpäev`, `Tunniplaan`, `Valmista tund`, `Õppeprogramm` and
  `Minu õpilased` as the primary flow.
- Same-origin tools open inside the CRM centre surface with `embedded=1`; duplicate child headers are hidden.
- Curriculum and library actions open the worksheet builder in that same surface instead of a new tab.
- A teacher can set a student's current curriculum place with one number. The selected item is stored via
  the existing `students.curriculumPlan` contract and logged as `curriculum.position_set`.
- Setting a place does not create historical completions, grades, responses or billing records.

## Files

- `haldus.html`
- `haldus-exercises/index.html`
- `haldus-worksheet/index.html`
- `live-classroom.html`
- `haldus-whiteboard/index.html`
- `haldus-skillmap/index.html`
- `ARCHITECTURE.md`
- `docs/PROJECT_STATE.md`
- `unified-teacher-workspace-v1.test.js`
- adjusted existing expectations in `curriculum-ui.test.js` and `worksheet-integration-ui.test.js`

## Data and security

- Reused write: `students/{studentId}.curriculumPlan` and `curriculumPlanUpdatedAt`.
- Reused audit collection through the existing activity logger: action `curriculum.position_set`.
- No collection, API, Function, Firestore rule, index, Storage or immutable publication change.
- Embedded navigation accepts only same-origin URLs and same-origin messages.

## Verification

- Focused curriculum/workspace suite: 29/29 PASS.
- `git diff --check`: PASS.
- Browser/Vercel verification must be added after the draft PR preview is ready.

## Known limits

- Embedded applications remain separate HTML runtimes during migration; this change unifies navigation and
  presentation but does not rewrite them into one React tree.
- The numeric curriculum place marks the planned current lesson. It deliberately does not claim that all
  earlier lessons were completed.
- Mobile height and back-navigation need a real preview smoke before review.

## Exactly one next safe step

Verify on the authenticated Vercel preview that curriculum → worksheet stays inside the CRM shell and that
setting a test student's curriculum number survives reload without creating completion records.
