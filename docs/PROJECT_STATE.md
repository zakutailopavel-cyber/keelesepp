# KeeleSepp Project State

Last verified: 2026-09-06, Europe/Tallinn
Repository: `zakutailopavel-cyber/keelesepp`
Verified main: `6d045cfcc32d93fccb91dd5b5b639aa6701cb436` — merged #97, production teaching loop ACCEPTED
Current implementation branch: `agent/lesson-builder-activity-contract`

## Current objective

Lesson Builder v1 — Normalized Activity Contract: introduce a pure normalization boundary with pinned task IDs and an existing Lesson Mode/session/evidence vertical proof. No visual Builder UI in this slice.

The merged path is:

`real curriculum -> Teacher Home -> est-b1-school-learning-01 -> adaptive Lesson Mode -> evidence/handoff -> Learning Profile / Teacher Home`.

PR #94 switched Teacher Home to the real curriculum source. PR #95 then bound the first real school curriculum lesson (`est-b1-01:0`) to its own trusted adaptive lesson blueprint. PR #96 reconciled repository state after #95.

## Verified repository state

Current remote `main` is `6d045cfcc32d93fccb91dd5b5b639aa6701cb436`.

Merged on current `main`:

- #94 `fix(learning): use real curriculum in Teacher Home`;
- #95 `Real Curriculum Lesson Mode v1: school lesson to evidence and handoff`;
- #96 `docs: reconcile project state after PR 95 merge`;
- #97 `docs: accept real curriculum production teaching loop`.

Independent open PRs remain separate and must not be mixed into the learning rollout:

- #83 adaptive lesson desktop density — old draft;
- #78 reliability spinner retry state — old draft;
- #74 Google Calendar sync reliability — open;
- #72 Frappe/ERPNext spike — finance staging;
- #71 finance staging stabilization — open.

Current GitHub `main` is authoritative. Open PR file lists were checked: no changed-file overlap with this activity-contract slice. #83 currently changes only `adaptive-lessons/scenes.js`, which is untouched.

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

At the preceding acceptance audit, Vercel production for `6a31ecd8...` was verified **READY**. That verified deployment was `dpl_FBbT2oSExETZnA45S7u6rKEM3wYS` from the primary GitHub-connected `keelesepp` project.

Authenticated production source downloads verified both Functions against main after the
2026-09-06 recovery of a stale-source redeployment:

- `learningSessionApi`: version **6**, ACTIVE, updated `2026-09-06T08:11:42.471Z`;
- `learningProfileEvidenceApi`: version **5**, ACTIVE, updated `2026-09-06T08:11:45.569Z`;
- build: `0d26d420-7f52-4672-badb-9434ce0e7e21`;
- source hash: `c208808a2d80bfe88674c62a7f86d2a4c24e113a`.

At that audit both deployed handlers matched the then-current main byte-for-byte. This workstream does not re-deploy or claim a new production revision. That separately authorized selective deployment
is complete; it grants no permission for further Firebase deployment. No new deployment was
performed for this acceptance documentation.

## Production teaching acceptance — ACCEPTED

On 2026-09-06 the owner confirmed that the recorded results belong to a genuine Robert lesson
and accepted the main production teaching loop. Read-only production verification found:

- completed session: `kJkHMe21CzXUqpN5NgrA`;
- status: `completed`; completedAt: `2026-09-06T08:43:12.101Z`;
- curriculumLessonKey: `est-b1-01:0`; lessonBlueprintId: `est-b1-school-learning-01`;
- 14 persisted `teacher_judgement` events and 3 `summary_score` events (17 total);
- summary scores: Vocabulary **50**, Grammar **74**, Speaking **70**;
- persisted routeBySkill: vocabulary **advanced**, grammar **advanced**, speaking **advanced**;
- explicit handoff and teacher note `Väga` persisted;
- the same scored handoff is visible in Learning Profile and Robert's Teacher Home card;
- `learningSessionApi` and `learningProfileEvidenceApi` returned HTTP **200**;
- no Functions errors were found in inspected flow logs;
- the full student document, including `students.skillMap`, is unchanged against the pre-smoke snapshot;
- lesson journal and `curriculumProgressEvents` remain unchanged; no automatic mastery, credit
  or advancement to lesson 2 was created.

Earlier session `dDF13J9b4k4ME3oe01h2` is a separate completed technical attempt with one judgement
and an unscored handoff. It was not reset, overwritten or confused with the genuine scored session.
Active-session refresh/resume and navigation persistence were verified before completion.
The audit did not create synthetic judgements, evidence, handoffs or credit.

### Non-blocking follow-up — NOT OBSERVED

**Production vocabulary_mark interaction not yet observed in a genuine lesson; verify opportunistically during the next real lesson.**

No `vocabulary_mark` event exists in this genuine session. It is unknown whether the word-mark
operation was actually performed; data loss is not established. The current contract supports
word marks and automated tests cover them. This production interaction is **NOT OBSERVED**,
not PASS or FAIL, and the owner explicitly accepted it as a non-blocking follow-up.

The first real curriculum production teaching loop is **ACCEPTED**. This rollout no longer
blocks Lesson Builder. No Firebase or Vercel deployment is needed for this documentation update.

## Lesson Builder boundary

Lesson Builder / Content Engine normalization is no longer blocked by this rollout.

The next planned workstream is `Lesson Builder v1 — Normalized Activity Contract`: stable activity IDs first, with future-compatible fields for response modes (including voice), assets/visuals, progression rules and collaboration/debate, without implementing all feature families in one PR.

## Current implementation work — Normalized Activity Contract v1

Branch: `agent/lesson-builder-activity-contract`.
Draft PR: **#98 — Lesson Builder v1 — Normalized Activity Contract**.
Owner review/merge is pending.

Completed:

- pure `activity-contract-core.js` normalizes legacy strings and explicit `{id,prompt}` task objects;
- minimal runtime contract: schemaVersion/id/phaseId/skillIds/workspaceType/routes, inert optional
  responseMode/assets/progression/collaboration/evaluation metadata;
- explicit route task ID sets are validated and joined by identity rather than position;
- school lesson pins all existing task IDs without changing teaching material;
- workspace projection supplies existing item IDs to unchanged Learning Session/evidence code;
- Lesson Mode resumes by persisted currentActivityId first; only ID-less legacy records use index;
- a removed persisted activity ID blocks resume rather than silently selecting a different task;
- both city blueprints remain legacy strings with unchanged identities and workspace models.

Changed files:

- `activity-contract-core.js` and `activity-contract-core.test.js`;
- `.github/workflows/financial-core-emulator.yml` (new contract suite and path triggers);
- `lesson-workspace-core.js`;
- `haldus-adaptive-lesson/index.html` (script dependency and resume lookup only; no layout changes);
- `adaptive-lessons/est-b1-school-learning.js` (explicit task objects; unchanged prompts);
- `docs/NORMALIZED_ACTIVITY_CONTRACT_V1.md`;
- `docs/ADAPTIVE_LESSON_SYSTEM.md`, `docs/KEELESEPP_CORE_BLUEPRINT.md`, this state file.

Validation:

- selected adaptive/workspace/learning-session/real-curriculum suite: **70/70 passed**, including
  **9 new normalization contract tests**;
- Functions learning-session API tests: **12/12 passed** using the existing installed dependencies;
  initial isolated worktree invocation lacked firebase-admin; no package/source change was needed;
- exact workspace-model comparison with unchanged main: **123/123 equal** (41 activities × 3 routes);
- isolated JSDOM full HTML Preview navigation: school **12**, city vocabulary **15**, city problem
  solving **14** activities rendered, with no captured script errors or production API requests;
- browser UMD modules loaded in actual HTML dependency order;
- legacy `adaptive-lesson-ui.test.js`: **5/8 passed, 3 failed**, the same stale asset/layout/summary
  regex assertions reproduced against unchanged baseline code. These are not claimed as passing;
- `git diff --check` passed. No Firebase emulator or production lesson writes in this workstream.

Data/security: no changes to Functions, Firestore schemas/rules/indexes, student data, skillMap,
credits, evidence payloads or authorization. Optional capabilities are inert JSON metadata, not
executable rules or asset-loading permission. Existing answer-hiding and escaped rendering remain.

Known limitations: legacy string task identity still depends on frozen order; future editing must
pin IDs before insertion/reordering. Deleting an in-use ID needs a separate versioning policy.
No Builder UI, voice, AI, collaboration engine or publication service exists in v1. Nested optional
metadata semantics and authorization are deferred to their consuming feature boundaries.

No manual production deployment, paid API call, Firebase operation or PR merge is part of this work.
GitHub reads/push and draft PR creation are the external development operations.

## Next safe step

Review and merge the Normalized Activity Contract v1 draft PR by owner decision before starting
Lesson Builder authoring/validation UI. The production vocabulary-mark follow-up remains non-blocking.
