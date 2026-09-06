# KeeleSepp Project State

Last verified: 2026-09-06, Europe/Tallinn
Repository: `zakutailopavel-cyber/keelesepp`
Verified main: `b23dabc989be3aad1989de98f4c1234cfdc20e4a` — #98 merged; production Vercel READY; real teaching loop ACCEPTED
Current implementation branch: `agent/lesson-builder-authoring-ui-v1`

## Current objective

Lesson Builder v1 — Authoring & Validation UI: a local draft editor for normalized activities, validated JSON import/export and nonpersistent preview through the current Lesson Mode. Cloud publication and student assignment are outside this slice.

The merged path is:

`real curriculum -> Teacher Home -> est-b1-school-learning-01 -> adaptive Lesson Mode -> evidence/handoff -> Learning Profile / Teacher Home`.

PR #94 switched Teacher Home to the real curriculum source. PR #95 then bound the first real school curriculum lesson (`est-b1-01:0`) to its own trusted adaptive lesson blueprint. PR #96 reconciled repository state after #95.

## Verified repository state

Current remote `main` is `b23dabc989be3aad1989de98f4c1234cfdc20e4a`.

Merged on current `main`:

- #94 `fix(learning): use real curriculum in Teacher Home`;
- #95 `Real Curriculum Lesson Mode v1: school lesson to evidence and handoff`;
- #96 `docs: reconcile project state after PR 95 merge`;
- #97 `docs: accept real curriculum production teaching loop`;
- #98 `Lesson Builder v1 — Normalized Activity Contract` — merged, COMPLETED.

Independent open PRs remain separate and must not be mixed into the learning rollout:

- #83 adaptive lesson desktop density — old draft;
- #78 reliability spinner retry state — old draft;
- #74 Google Calendar sync reliability — open;
- #72 Frappe/ERPNext spike — finance staging;
- #71 finance staging stabilization — open.

Current GitHub `main` is authoritative. Open PR file lists were checked: no changed-file overlap with this authoring UI slice. #83 currently changes only `adaptive-lessons/scenes.js`, which is untouched.

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

Production Vercel is **READY** for main `b23dabc989be3aad1989de98f4c1234cfdc20e4a`:
`dpl_C6jfXFxJ8DMVfxCfT9Ks6MLpyepA`, primary GitHub-connected `keelesepp` project.

Post-#98 smoke on 2026-09-06:

- authenticated `crm.epkoolitus.ee/haldus-teacher-home/` loaded Robert's correct school lesson and existing handoff;
- nonstudent Lesson Mode loaded `est-b1-school-learning-01`; Next moved between activities;
- browser warning/error logs were empty for both pages;
- Vercel production error/fatal log query returned no matching entries in the inspected
  `12:36:58.432Z–13:36:58.432Z` window; this is bounded log coverage;
- production binding, blueprint, activity contract and workspace scripts matched main byte-for-byte;
- the downloaded client modules correctly resolved saved `currentActivityId=school-d-vocabulary`
  from the existing pre-smoke snapshot. This is an ID compatibility check, **not** a newly created
  or resumed live student session. Robert's accepted session is already completed.

Smoke result: **PASS within this non-mutating scope**. No new student evidence, sessions, handoffs,
Firebase operations or deployment were performed.

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

## Normalized Activity Contract v1 — COMPLETED

PR **#98 is merged** on current main and its production Vercel deployment is READY.
The contract pins school task IDs, adapts legacy strings, preserves all three routes and restores
sessions by activity ID before legacy index fallback. Missing saved IDs fail visibly. The exact
contract remains in [NORMALIZED_ACTIVITY_CONTRACT_V1.md](NORMALIZED_ACTIVITY_CONTRACT_V1.md).
The existing real curriculum teaching acceptance above remains ACCEPTED.

## Current implementation — Authoring & Validation UI v1

Branch: `agent/lesson-builder-authoring-ui-v1`.
Draft PR: [#99 — Lesson Builder v1 — Authoring & Validation UI](https://github.com/zakutailopavel-cyber/keelesepp/pull/99).
Owner merge required before production rollout.

Implemented:

- `/haldus-lesson-builder/`, linked from Teacher Home;
- new local draft or copy of the school lesson; all 12 reference IDs and route content retained;
- activity list, immutable ID, title, phaseId, skillIds and workspaceType editing;
- Support/Core/Advanced prompt, expected answer and teacher instruction;
- reorder by pinned ID; add allocates a UUID once, independent of prompt or route;
- validation through `activity-contract-core`, plus authoring bounds, required prompts and safe context metadata;
- explicit local save/restore, validated JSON import/export, errors before save/preview;
- sessionStorage snapshot preview using the current Lesson Mode workspace contract;
- preview ignores any supplied studentId, never publishes the draft or creates student evidence.

Changed files:

- `lesson-authoring-core.js`, `lesson-authoring-core.test.js`, `lesson-authoring-preview.js`;
- `haldus-lesson-builder/index.html`, `haldus-lesson-builder/app.js`, `haldus-lesson-builder/style.css`;
- `lesson-workspace-core.js`, `haldus-adaptive-lesson/index.html`, `haldus-teacher-home/index.html`;
- `vercel.json`, `.github/workflows/financial-core-emulator.yml`;
- this file, `docs/LESSON_BUILDER_AUTHORING_UI_V1.md`, `docs/NORMALIZED_ACTIVITY_CONTRACT_V1.md`,
  `docs/ADAPTIVE_LESSON_SYSTEM.md`.

Validation:

- CI-selected CRM/learning tests: **242/242 passed**, including **10 authoring tests**;
- Functions unit tests: **157/157 passed**, using existing installed dependencies; no Function source changed;
- reference preview workspace parity: **36/36 models equal** (12 activities × 3 routes);
- isolated DOM navigation of existing school/city vocabulary/city problem-solving: **12/15/14**
  activities rendered, no captured script errors or API requests;
- isolated authored preview with a supplied studentId: all 12 activities, preview judgements and
  summary exercised; **0 token requests, 0 API requests, 0 script errors**; HTML content escaped;
- actual Chrome editor: empty save rejected; school copied, title edited, activity reordered,
  saved and restored after reload; iframe Lesson Mode followed the edited order; console errors absent;
- browser JavaScript syntax checks and `git diff --check`: **PASS**; CI result will be linked in the PR.

Data/security: one draft in browser localStorage (`keelesepp.lesson-authoring.v1`), temporary preview
snapshot in same-tab sessionStorage, optional user-downloaded JSON. No Firestore objects, rules,
indexes, migrations, Functions, evidence payloads, skillMap, mastery, credit or authorization changes.
The editor is a public local authoring tool, not an authenticated cloud content service. Other users
of the same browser profile/origin can access its local draft; do not store private student data in it.
Imported markup is escaped; durations are bounded numeric values; optional future metadata stays inert.

Limitations: one saved draft per browser origin; no cloud backup, publication, assignment, draft library,
activity deletion/versioning or asset authoring. A new save replaces the prior local draft; export JSON
for separate copies. Reference vocabulary/pattern/phase context is copied but not edited in this UI.
Preview is a snapshot and must be reopened after edits. Existing Lesson Mode teaching scaffolds are
retained. Preview does not prove a cloud publication or live-session authoring flow.

No Firebase operation, production deploy, paid API call or PR merge is part of this workstream.
Automatic GitHub/Vercel preview is permitted; production only after owner merge.

## Next safe step

Owner review of the Authoring & Validation UI draft PR and its preview, then owner merge if accepted.
The genuine-lesson vocabulary-mark follow-up remains non-blocking.
