# KeeleSepp Project State

Last verified: 2026-09-06, Europe/Tallinn
Repository: `zakutailopavel-cyber/keelesepp`
Verified main: `6a31ecd8c86c3e729e1a24a455a42b0151fd8a77` — merged #96, project-state reconciliation after #95
Current documentation branch: `agent/reconcile-functions-rollout`

## Current objective

Close the final authenticated production acceptance gate for the first real curriculum Lesson Mode before starting Lesson Builder.

The merged path is:

`real curriculum -> Teacher Home -> est-b1-school-learning-01 -> adaptive Lesson Mode -> evidence/handoff -> Learning Profile / Teacher Home`.

PR #94 switched Teacher Home to the real curriculum source. PR #95 then bound the first real school curriculum lesson (`est-b1-01:0`) to its own trusted adaptive lesson blueprint. PR #96 reconciled repository state after #95.

## Verified repository state

Current remote `main` is `6a31ecd8c86c3e729e1a24a455a42b0151fd8a77`.

Merged on current `main`:

- #94 `fix(learning): use real curriculum in Teacher Home`;
- #95 `Real Curriculum Lesson Mode v1: school lesson to evidence and handoff`;
- #96 `docs: reconcile project state after PR 95 merge`.

Independent open PRs remain separate and must not be mixed into the learning rollout:

- #83 adaptive lesson desktop density — old draft;
- #78 reliability spinner retry state — old draft;
- #74 Google Calendar sync reliability — open;
- #72 Frappe/ERPNext spike — finance staging;
- #71 finance staging stabilization — open.

Current GitHub `main` is authoritative. This reconciliation changes documentation only.

## Real Curriculum Lesson Mode v1

The merged school slice keeps the contracts established in #95:

- exact curriculum/blueprint identity through `functions/curriculum-lesson-bindings.js`;
- stable blueprint `est-b1-school-learning-01` for curriculum lesson key `est-b1-01:0`;
- independent Vocabulary / Grammar / Speaking Support-Core-Advanced routes;
- answer-safe diagnostic and final assessment;
- roleplay and changed transfer context;
- append-only session/evidence persistence through trusted Functions;
- optional `curriculumLessonKey` on new school sessions/evidence;
- resume restores exact word marks and route state;
- blank scores remain absent rather than becoming zero;
- completion creates a handoff but does not rewrite `students.skillMap` or grant curriculum mastery/credit.

Main implementation boundaries remain:

- `functions/curriculum-lesson-bindings.js`;
- `adaptive-lessons/est-b1-school-learning.js`;
- `teacher-home-core.js` and `haldus-teacher-home/index.html`;
- `haldus-adaptive-lesson/index.html` and `lesson-workspace-core.js`;
- `learning-session-store.js` and `functions/learning-session-api.js`;
- `functions/learning-profile-evidence-api.js` and `haldus-learning-profile/index.html`;
- `real-curriculum-lesson.test.js` plus related Teacher Home/Profile/API/emulator coverage;
- `docs/REAL_CURRICULUM_LESSON_MODE_V1.md` and `docs/ADAPTIVE_LESSON_SYSTEM.md`.

## Verification

Verified from PR #95 / its reviewed head:

- CI-selected CRM/learning suite: **223/223 passed**;
- Functions unit tests: **157/157 passed**;
- Auth/Firestore/Functions emulator integration: **25/25 passed**;
- final Teacher Home/curriculum checks: **14/14 passed**;
- local browser smoke covered lesson identity, independent routes, transfer, hidden assessment answers, blank-score summary and Preview handoff behavior.

Known extended-glob noise from #95 remains unchanged: three stale `adaptive-lesson-ui.test.js` assertions reproduce on unchanged main, and one isolated-worktree test required missing `crm-v2/node_modules/jsdom`. These were not represented as passing.

## Production state

Vercel production for current `main` `6a31ecd8...` is verified **READY**. The active production deployment is `dpl_FBbT2oSExETZnA45S7u6rKEM3wYS` from the primary GitHub-connected `keelesepp` project.

The Firebase Functions rollout required by #95 is now verified from owner-provided terminal evidence.

On 2026-09-05 at approximately 23:57 Europe/Tallinn, after explicit owner authorization, the owner ran a selective Firebase deployment to project `keelesepp-5136b` using `firebase-tools@15.22.3` for exactly:

- `functions:learningSessionApi`;
- `functions:learningProfileEvidenceApi`.

Terminal output showed `Successful update operation` for both `learningSessionApi(us-central1)` and `learningProfileEvidenceApi(us-central1)`, followed by `Deploy complete!`.

No Firestore rules, Storage rules, indexes, migrations, finance, calendar, Live Classroom or unrelated Functions were part of the selective command.

The previous server-revision uncertainty is therefore closed. The remaining gate is authenticated production behavior, not deployment.

## Manual production acceptance gate

Before Lesson Builder implementation begins, run one genuine production school lesson through `Alusta tundi` with an authenticated staff account and verify the real write/read loop:

1. open Teacher Home and confirm the exact real curriculum next item `est-b1-01:0` launches `est-b1-school-learning-01`;
2. save at least one teacher judgement and relevant lesson evidence;
3. complete the lesson with an explicit handoff;
4. confirm the completed handoff is visible from Learning Profile and/or Teacher Home;
5. confirm `students.skillMap` was not silently rewritten;
6. confirm no curriculum mastery/credit or automatic advancement to lesson 2 was invented.

This smoke is intentionally a genuine teaching acceptance check. Do not create synthetic production evidence on a real student only to satisfy the gate.

## Lesson Builder boundary

Lesson Builder / Content Engine normalization remains blocked only by the authenticated production smoke above.

After that gate passes, the next planned workstream is `Lesson Builder v1 — Normalized Activity Contract`: stable activity IDs first, with future-compatible fields for response modes (including voice), assets/visuals, progression rules and collaboration/debate, without implementing all feature families in one PR.

## Current documentation work

Branch: `agent/reconcile-functions-rollout`.

Changed files:

- `docs/PROJECT_STATE.md`;
- `docs/REAL_CURRICULUM_LESSON_MODE_V1.md`.

Purpose: record the verified selective Firebase Functions rollout and remove the stale statement that the server deployment is still unresolved.

No application code, Firebase configuration, data, rules or production services are changed by this documentation branch.

## Next safe step

Run one genuine authenticated production lesson through the complete persistence/handoff path and verify the two invariants: no automatic `students.skillMap` rewrite and no invented curriculum credit. Only after that acceptance smoke passes should Lesson Builder v1 implementation begin.
