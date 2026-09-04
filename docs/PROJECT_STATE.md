# KeeleSepp Project State

Last verified: 2026-09-04, Europe/Tallinn
Repository: `zakutailopavel-cyber/keelesepp`
Verified main commit: `ed6fdb3b38068b8c9187cb0259d17fef3db66291` (`Curriculum Engine v1: B1 goal and prerequisite graph (#90)`)
Active branch: `agent/teacher-home-today-v1`
Active PR: `#91 Teacher Home v1: Today learning flow` (draft while final CI/review runs)
Independent open learning/UI PR: `#83 Tighten Adaptive Lesson desktop layout`
Independent legacy CRM PR touching `haldus.html`: `#78 fix(crm): show retry state when reliability data fails to load`

## Current objective

Execute the Core Blueprint as bounded vertical slices and now connect the deterministic learning loop to the teacher's real daily workflow.

Merged learning foundation:

1. Core Blueprint — #84;
2. Learning Profile read-only MVP — #85;
3. Learning Session + append-only evidence persistence — #86;
4. Learning Profile evidence projection — #87;
5. phase-specific Lesson Mode workspaces — #88;
6. deterministic per-skill Adaptive Engine v1 — #89;
7. Curriculum Goal / prerequisite graph v1 — #90.

Current release slice: Teacher Home / Today v1.

`crm-v2`, finance and calendar mutation behavior remain outside this slice.

## Production state

### Vercel

Primary project `keelesepp` remains the only active GitHub-connected Vercel project in this development flow.

The unused project `keelesepp-crm-v2` was disconnected from GitHub on 2026-09-04 so pushes no longer create duplicate v2 builds.

The #89 web client was verified on production before #90. #90 is merged into `main`, but this state file does not claim its final production deployment until that exact main deployment is freshly verified.

### Firebase Functions

Owner selectively deployed the merged-main #89 `learningSessionApi` to production project `keelesepp-5136b` on 2026-09-04 with Node.js 22 runtime. Firebase CLI reported a successful update and `Deploy complete!`.

No Firestore/storage rules or schema migration was deployed with #89/#90.

One manual #89 smoke gate remains to be explicitly recorded: after a teacher judgement, confirm that production Teacher drawer shows persisted divergent routes such as Vocabulary Support while Grammar/Speaking remain Core/Advanced.

#91 changes `learningProfileEvidenceApi`; no production deploy is permitted from the branch.

## Release slice 8 — Teacher Home / Today v1 (#91)

### Purpose

Teacher Home answers the operational questions a teacher has before the next lesson:

- who is next today;
- what was learned recently;
- what currently needs review;
- what Curriculum Engine recommends next;
- whether there is a supported Adaptive Lesson to start/resume.

It is a read-only projection, not a new data source.

### New pure core

New `teacher-home-core.js` owns deterministic:

- signed-in teacher matching with `teacherUid` first and narrow legacy-name fallback only when UID is absent;
- cancelled-lesson filtering and chronological lesson ordering;
- lesson end-time projection;
- bounded/sanitized `routeBySkill` display state;
- latest active session and latest evidence selection;
- missing-evidence-preserving learning summary;
- supported Lesson Mode action selection;
- schedule/student/learning-context card projection.

Current action contract:

- active `est-b1-city-problem-solving-01` session -> `Jätka tundi`;
- next goal `EST_B1_CITY_SOLVE_PROBLEM` -> `Alusta tundi`;
- every other context -> `Ava õppimisprofiil`.

Teacher Home never maps an arbitrary goal into the only adaptive lesson blueprint that exists today.

### New staff surface

New route: `/haldus-teacher-home/`.

The page:

1. authenticates staff through the existing Firebase user profile;
2. respects `securityMigrations/teacherUidV1` when reading `schedule`;
3. expands recurring events with `CalendarCore.eventsForDate()`;
4. filters to the signed-in teacher;
5. joins exact `studentId` values to student records;
6. reads Live Classroom structured summaries;
7. reads Adaptive evidence/session context through `learningProfileEvidenceApi`;
8. builds the existing Learning Profile projection;
9. runs Curriculum Engine v1 where the B1 city graph applies;
10. renders time, student, review needs, next goal, active routes and safe CTAs.

A legacy schedule item without stable `studentId` remains visible but cannot open a profile/Adaptive Lesson by guessing a student from name.

The page intentionally does not modify `haldus.html` while independent PR #78 is open.

### Active-session read gap closed

Before #91, `learningProfileEvidenceApi` joined sessions only through selected evidence rows. An active session with zero evidence could therefore exist but be invisible to a read-side consumer immediately after start.

#91 extends the trusted read projection so an authorized student's active sessions are included even before their first evidence event.

Bounded new projected session fields:

- `currentIndex`;
- `currentPhaseId`;
- `currentActivityId`;
- sanitized `routeBySkill` containing only Support/Core/Advanced values.

Evidence-linked sessions and active-session copies are deduplicated and bounded.

The browser still has no direct read access to private `learningSessions` or `learningEvidence` collections.

### Data/mastery invariants

Unchanged:

- `students.skillMap` remains canonical current mastery;
- Teacher Home does not write `students.skillMap`;
- Adaptive `routeBySkill` remains runtime support state, not mastery;
- missing evidence is unknown, never zero;
- session completion is not curriculum goal achievement;
- no automatic CEFR change;
- no schedule write;
- no Firestore rule/schema migration;
- no finance/calendar mutation;
- no crm-v2 work.

## Files in #91

New:

- `teacher-home-core.js`
- `teacher-home-core.test.js`
- `haldus-teacher-home/index.html`
- `teacher-home-ui.test.js`
- `docs/TEACHER_HOME_V1.md`

Changed:

- `functions/learning-profile-evidence-api.js`
- `functions/learning-profile-evidence-api.test.js`
- `functions/learning-profile-evidence-emulator.integration.js`
- `.github/workflows/financial-core-emulator.yml`
- this file.

## Verification target for #91

Required green gate before Ready for review:

- Functions unit tests;
- Teacher Home pure core tests;
- Teacher Home read-only UI contract tests;
- full existing CRM/accounting/calendar/learning root suite;
- browser JavaScript syntax checks;
- Firebase Auth/Firestore/Functions emulator integration;
- explicit emulator proof that an authorized zero-evidence active session is visible with sanitized `routeBySkill`;
- outsider remains denied;
- malformed cross-student session context remains excluded;
- `students.skillMap` remains unchanged.

GitHub Actions run #256 is the current executable-head gate while this document is being updated. Do not mark #91 Ready until the latest executable head completes successfully.

## Deployment boundary

#91 changes both static web code and the trusted read Function.

After owner merge and explicit production approval, rollout order must be:

1. selectively deploy merged-main `learningProfileEvidenceApi`;
2. verify historical evidence still loads and a zero-evidence active session is returned;
3. verify the normal primary `keelesepp` Vercel main deployment;
4. open `/haldus-teacher-home/` as an authenticated teacher;
5. smoke-test one real scheduled student and persisted per-skill routes;
6. keep `keelesepp-crm-v2` disconnected.

Do not deploy production from the branch.

## Known limits

- Teacher Home loads learning context only for unique students appearing on the selected teacher day; it is not a school-wide analytics projection;
- Curriculum Goal graph v1 still covers only one B1 city/services vertical slice;
- Adaptive persistence still supports only `est-b1-city-problem-solving-01`;
- not every curriculum goal has a Lesson Mode blueprint, so unsupported goals open Learning Profile;
- no automatic Adaptive-evidence -> goal-achievement projection exists;
- no automatic Adaptive-evidence -> `students.skillMap` mastery projection exists;
- main legacy CRM navigation does not yet link Teacher Home because independent PR #78 modifies `haldus.html`;
- PR #83 remains independent from this slice.

## Core roadmap

1. Core Blueprint — merged #84;
2. Learning Profile MVP — merged #85;
3. Learning Session + append-only evidence — merged #86;
4. Learning Profile evidence projection — merged #87;
5. phase-specific Lesson Mode workspaces — merged #88;
6. deterministic per-skill Adaptive Engine v1 — merged #89;
7. Curriculum Goal / prerequisite graph — merged #90;
8. Teacher Home / Today vertical flow — active #91;
9. Lesson Builder + stable activity/content normalization;
10. AI-assisted content generation after the deterministic loop is stable;
11. scale/analytics after multiple lessons share the same contracts.

## Next safe step

Finish #91 CI/self-review and move the PR to Ready for review. Owner merges it. After merge and explicit rollout approval, deploy `learningProfileEvidenceApi` first and web second, then smoke-test Teacher Home. Only after that begin Lesson Builder / stable activity-content normalization.