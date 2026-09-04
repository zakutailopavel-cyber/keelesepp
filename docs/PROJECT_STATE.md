# KeeleSepp Project State

Last verified: 2026-09-04, Europe/Tallinn
Repository: `zakutailopavel-cyber/keelesepp`
Verified main commit: `0bdde51307fcbc31f849778e4056fbe12203aac1` (`docs: define KeeleSepp Core Blueprint v1` / merged PR #84)
Active branch: `agent/learning-profile-mvp`
Open draft PR: `#85 Learning Profile MVP: read-only teacher snapshot`
Independent open UI draft PR: `#83 Tighten Adaptive Lesson desktop layout`

## Current objective

Execute the Core Blueprint in bounded vertical slices instead of adding unrelated teacher-facing features.

The agreed product core remains five connected engines:

1. Curriculum Engine — what to learn next;
2. Adaptive Engine — how much support/challenge is appropriate now;
3. Lesson Mode — which phase-specific teaching workspace is active now;
4. Content Engine — tasks, vocabulary, scenes, prompts and variants;
5. Learning Profile — current mastery projection plus evidence explaining it.

The engines are connected by the target `LearningSession` runtime contract documented in `docs/KEELESEPP_CORE_BLUEPRINT.md`.

`crm-v2` remains separate and is not part of this work.

## Release slice 1 — Learning Profile MVP

Draft PR #85 implements the first Core Blueprint release slice as a **read-only teacher surface**.

New files:

- `learning-profile-core.js` — pure deterministic Learning Profile read model;
- `learning-profile-core.test.js` — projection/evidence contract tests;
- `haldus-learning-profile/index.html` — teacher-facing Learning Profile;
- `learning-profile-ui.test.js` — read-only/security/UI contract tests;
- `learning-profile-routing.test.js` — Vercel route contract;
- `docs/LEARNING_PROFILE_MVP.md` — implementation boundary and manual review instructions.

Modified files:

- `staff-activity.js` — classifies the new surface as `learning-profile`;
- `staff-activity.test.js` — includes the new staff surface and area classification;
- `vercel.json` — stable `/haldus-learning-profile` routes with and without a trailing slash;
- `.github/workflows/financial-core-emulator.yml` — includes Learning Profile tests and syntax verification in repository CI;
- this project-state document.

### Data contract

`students.skillMap` remains the canonical current skill-mastery projection. The Learning Profile does not introduce another current mastery store and does not write to `skillMap`.

The current read model combines:

- current `students.skillMap` values;
- canonical skill labels from `haldus-programs.js` / `HaldusSkillCatalog`;
- structured historical `liveClassrooms.lessonSummary` evidence where available;
- teacher comments, achieved curriculum goal IDs/labels, affected skill IDs and homework from those summaries.

A completed lesson without `lessonSummary` is not promoted to evidence. Attendance remains separate from mastery.

Recently achieved goals remain historical context. They are deliberately **not** copied to `nextGoalIds`; automatic next-goal selection waits for the Curriculum Goal / prerequisite graph.

### Teacher authorization boundary

The new page adds no Firestore write operation and does not change `firestore.rules`.

Teacher reads follow the existing platform boundaries:

- student lists observe `securityMigrations/teacherUidV1.readEnforced` and use `students.teacherUid == auth.uid` when teacher-scope enforcement is active;
- non-admin Live Classroom evidence queries include both selected `studentId` and `teacherUid == auth.uid`, matching the current `liveClassrooms` read rule;
- administrators keep the broader read projection already permitted by existing rules.

This fixes an implementation risk found during review: querying Live Classroom history only by `studentId` would be valid for administrators but could be rejected for ordinary teachers by the existing rule boundary.

## Verification completed for PR #85

Targeted local Node verification was executed for the changed Learning Profile contracts:

- `node --test learning-profile-core.test.js` — **7/7 passed**;
- `node --test learning-profile-ui.test.js` — **6/6 passed**;
- `node --test learning-profile-routing.test.js` — **2/2 passed**;
- combined targeted run — **15/15 passed**, 0 failed.

The tests cover missing evidence, deterministic skill bands, summary normalization without invented scores, canonical `skillMap`, student-specific evidence ordering, attendance/mastery separation, achieved-vs-next-goal separation, no direct Firestore write path, teacher-scoped reads, shared skill labels, inline JavaScript parsing and Vercel routing.

GitHub Actions run **#195** (`Financial Core emulator`, head `b6e7b51dd8feeb6bb6dd3875d671f71b5a43e89d`) completed successfully. Its required steps all passed, including Functions unit tests, the CRM/accounting/calendar/learning/Live Classroom test bundle with the new Learning Profile tests, browser JavaScript syntax checks, and finance emulator integration tests.

The final documentation-only commit after that successful CI run changes no executable code. The full local root suite was not run separately in the tool environment; the successful GitHub workflow is the repository-wide verification for this branch.

## Manual verification still required

Before merging #85, the owner should locally verify the authenticated browser flow:

1. serve the branch using the existing local HTTP workflow;
2. open `/haldus-learning-profile/` as an administrator;
3. select a learner with `skillMap` data and confirm current strengths/attention skills render;
4. select a learner with a structured Live Classroom summary and confirm evidence renders;
5. verify teacher-scoped access with a normal teacher account if available;
6. confirm `/haldus-skillmap/` remains a separate manual editor and merely opening Learning Profile changes no data.

No production deployment is required for this review.

## Adaptive Lesson state on main

PR #82 is merged.

- `haldus-adaptive-lesson/index.html` is the focused adaptive Lesson Mode prototype;
- `adaptive-lessons/est-b1-city-problem-solving.js` is the reference B1 lesson;
- `adaptive-lessons/scenes.js` resolves stable scene metadata to Firebase Storage URLs;
- reusable lesson scenes live under `lesson-scenes/**` in Firebase Storage;
- Support/Core/Advanced teacher judgement logic remains in place;
- adaptive session/evidence data is still local-only and is not persisted to Firestore.

The owner previously verified the reference Firebase Storage scene and Lesson Mode locally.

## Independent desktop-density work

Draft PR #83 remains separate from #85. It only tightens desktop Lesson Mode density and was manually approved visually by the owner. Do not mix its UI changes into Learning Profile work.

## Vercel / production state

Vercel checks on the PR head continue to report `Deployment rate limited — retry in 24 hours` for both `keelesepp` and `keelesepp-crm-v2`. This is a deployment-quota limitation, not a test or code failure.

A production deployment containing the newest learning routes has not been verified during this slice. Do not claim `/haldus-learning-profile/` is live on `crm.epkoolitus.ee` until a new production deployment is explicitly verified after merge.

## Safety / unchanged areas

PR #85:

- adds no Firestore schema or rules change;
- adds no database migration;
- performs no production deployment;
- adds no mastery write;
- changes no finance/calendar behavior;
- changes no Live Classroom write path;
- changes no `crm-v2` code;
- makes no paid external call;
- leaves PR #83 independent.

## Core roadmap

1. Core Blueprint — merged in #84;
2. Learning Profile MVP read model — implemented in draft PR #85;
3. adaptive Learning Session + append-only evidence persistence for one reference lesson;
4. phase-specific Lesson Mode workspace renderer;
5. deterministic per-skill Adaptive Engine v1;
6. curriculum goal/prerequisite graph for the selected vertical slice;
7. Teacher Home vertical flow;
8. Lesson Builder + Content normalization;
9. AI-assisted content generation only after the core loop is stable;
10. scale/analytics after multiple lessons share the same contracts.

## Next safe step

**Manually review PR #85 in the authenticated local browser flow. If the read-only Learning Profile is correct for administrator scope and the available teacher scope, merge only #85; then begin release slice 2: adaptive Learning Session + append-only evidence persistence for the single reference lesson, without automatic mastery writes.**
