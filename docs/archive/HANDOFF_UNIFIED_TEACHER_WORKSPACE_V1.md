# Handoff — Unified Teacher Workspace v1

## Authoritative state

- Last checked: 2026-09-14
- Main: `2ef513a799cce77a8d3593aa8c56f15f7709cbaa`
- Merged implementation: [#146](https://github.com/zakutailopavel-cyber/keelesepp/pull/146)
- Current correction branch: `codex/restore-oppevara-primary`
- Current draft PR: [#147](https://github.com/zakutailopavel-cyber/keelesepp/pull/147)

## Bounded goal

Make the existing CRM the single teacher workspace. Keep one navigation rail, one section header and the
signed-in profile while teachers move between their day, schedule, students, curriculum, library, lesson
builder, worksheet builder, classroom and whiteboard. Do not create a new lesson system or data model.

## Implemented

- The daily navigation exposes `Minu tööpäev`, `Tunniplaan`, `Valmista tund`, `Õppevara` and
  `Minu õpilased` as the primary flow.
- `Õppevara` is the existing `/haldus-exercises/` application that previously opened separately. The
  duplicate `Õppeprogramm` sidebar destination was removed; curriculum remains available inside Õppevara
  and from student-specific actions.
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
- GitHub `financial-core` check: PASS (1m26s).
- Vercel deployment and preview-comment checks: PASS.
- Preview: `https://keelesepp-git-codex-unifi-ec4ce1-zakutailopavel-cybers-projects.vercel.app/haldus/`.
- Chrome loaded the preview login and embedded learning-library route. Google preview login is blocked because
  the temporary Vercel hostname is not in Firebase Authentication authorized domains, so the authenticated
  centre-workspace flow was not claimed as browser-verified. Browser logs also retain the repository's known
  in-browser Tailwind/Babel warnings; no new application exception was observed before the auth gate.

## Known limits

- Embedded applications remain separate HTML runtimes during migration; this change unifies navigation and
  presentation but does not rewrite them into one React tree.
- The numeric curriculum place marks the planned current lesson. It deliberately does not claim that all
  earlier lessons were completed.
- Authenticated desktop/mobile navigation and back-navigation need a real preview smoke before review.

## Exactly one next safe step

Verify on PR #147 that the primary `Õppevara` item opens `/haldus-exercises/` inside the CRM shell, then let
the owner merge the PR.
