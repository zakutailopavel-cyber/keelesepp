# KeeleSepp Project State

Last verified: 2026-09-05, Europe/Tallinn
Repository: `zakutailopavel-cyber/keelesepp`
Verified main: `a9a7a97dca1281a801f00028b5db2bd1584cee05` — merged #95, Real Curriculum Lesson Mode v1
Current reconciliation branch: `agent/reconcile-project-state-95`

## Current objective

Close the production rollout gate for the first real curriculum Lesson Mode before starting Lesson Builder.

The merged path is:

`real curriculum -> Teacher Home -> est-b1-school-learning-01 -> adaptive Lesson Mode -> evidence/handoff -> Learning Profile / Teacher Home`.

PR #94 first switched Teacher Home to the real curriculum source. PR #95 then bound the first real school curriculum lesson (`est-b1-01:0`) to its own trusted adaptive lesson blueprint.

## Verified repository state

Merged on current `main`:

- #94 `fix(learning): use real curriculum in Teacher Home`;
- #95 `Real Curriculum Lesson Mode v1: school lesson to evidence and handoff`.

Independent open PRs remain separate and must not be mixed into the learning rollout:

- #83 adaptive lesson desktop density — old draft, currently non-mergeable against fresh main;
- #78 reliability spinner retry state — old draft, currently non-mergeable against fresh main;
- #74 Google Calendar sync reliability — open, currently non-mergeable;
- #72 Frappe/ERPNext spike — draft on the finance staging branch;
- #71 finance staging stabilization — open, currently non-mergeable.

No local working tree was used for this reconciliation; current GitHub `main` is authoritative.

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

- GitHub Actions `Financial Core emulator` run #271 completed successfully;
- CI-selected CRM/learning suite: **223/223 passed**;
- Functions unit tests: **157/157 passed**;
- Auth/Firestore/Functions emulator integration: **25/25 passed**;
- final Teacher Home/curriculum checks: **14/14 passed**;
- local browser smoke covered lesson identity, independent routes, transfer, hidden assessment answers, blank-score summary and Preview handoff behavior.

Known extended-glob noise from #95 remains unchanged: three stale `adaptive-lesson-ui.test.js` assertions reproduce on unchanged main, and one isolated-worktree test required missing `crm-v2/node_modules/jsdom`. These were not represented as passing.

## Production state

Vercel production deployment for merged main commit `a9a7a97d...` is verified **READY** (`dpl_FFNx7nyL2bh2qxMj2FnUTCnApXrs`). The #95 frontend is therefore already exposed from the primary `keelesepp` project.

The required Firebase Functions rollout for the #95 server contract is **not verified** in available evidence:

- `learningSessionApi` must contain the merged #95 trusted lesson allowlist/metadata behavior;
- `learningProfileEvidenceApi` must contain the merged #95 school handoff/read projection behavior.

Because the #95 frontend is live while those two Function revisions are not yet proven, treat this as the current production rollout risk. The old `learningSessionApi` rejects the new school lesson ID.

No Firestore/Storage rules, indexes, destructive data migrations, finance/calendar/Live Classroom changes or paid external API calls are required for this rollout.

## Manual gate

Before Lesson Builder work begins:

1. verify or selectively deploy the merged-main `learningSessionApi` to Firebase project `keelesepp-5136b`;
2. verify or selectively deploy the merged-main `learningProfileEvidenceApi` to the same project;
3. run one genuine production school lesson through `Alusta tundi`;
4. save at least one teacher judgement and relevant lesson evidence;
5. complete the lesson with an explicit handoff;
6. confirm the completed handoff is visible from Learning Profile / Teacher Home;
7. confirm no silent `students.skillMap` rewrite and no invented curriculum credit occurred.

Production mutation/deployment remains a manual owner gate. Do not infer deployment success from the Vercel frontend status.

## Lesson Builder boundary

Lesson Builder / Content Engine normalization remains blocked only by the production gate above.

After that gate passes, the next planned workstream is `Lesson Builder v1 — Normalized Activity Contract`: stable activity IDs first, with future-compatible fields for response modes (including voice), assets/visuals, progression rules and collaboration/debate, without implementing all feature families in one PR.

## Next safe step

Verify the deployed revisions of `learningSessionApi` and `learningProfileEvidenceApi`; if either is still old, obtain the owner's explicit production approval and selectively deploy only those two merged-main Functions. Then run the real production lesson persistence/handoff smoke before opening the Lesson Builder implementation PR.
