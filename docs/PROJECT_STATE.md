# KeeleSepp Project State

Last verified: 2026-09-04, Europe/Tallinn
Repository: `zakutailopavel-cyber/keelesepp`
Verified main commit: `e2935a3d2a8e0868fcae4418eb82a63b5007b249` (`Lesson Mode: phase-specific workspaces (#88)`)
Active branch: `agent/per-skill-adaptive-engine-v1`
Active PR: `#89 Adaptive Engine v1: per-skill Lesson Mode routes` (merge-ready after green GitHub CI; no production deploy)
Independent open PR: `#83 Tighten Adaptive Lesson desktop layout`

## Current objective

Execute the Core Blueprint as bounded vertical slices.

Merged learning foundation:

1. Core Blueprint — #84;
2. Learning Profile read-only MVP — #85;
3. Learning Session + append-only evidence persistence — #86;
4. Learning Profile evidence projection — #87;
5. phase-specific Lesson Mode workspaces — #88.

Current release slice: deterministic per-skill Adaptive Engine v1 for the single B1 reference lesson.

`crm-v2`, finance, calendar and Live Classroom remain outside this slice.

## Last verified production state

Before #88/#89, owner explicitly approved and verified the #86/#87 rollout:

- Vercel production served `crm.epkoolitus.ee` from main at `cfc6fcf...`;
- Firebase Functions `learningSessionApi` and `learningProfileEvidenceApi` were selectively deployed to project `keelesepp-5136b`, region `us-central1`;
- Learning Profile loaded real student data;
- Lesson Mode opened/resumed a persisted real-student Learning Session;
- vocabulary evidence persistence was manually confirmed.

#88 is now merged into main at `e2935a3d...`, but no post-#88 production deployment is claimed in this document without a fresh deployment verification.

No production deployment has been performed from #89.

## Release slice 6 — deterministic per-skill Adaptive Engine v1

### Problem

The persisted session already had `routeBySkill`, but live Lesson Mode still behaved primarily as if there were one global route. That meant a learner could not reliably be, for example:

- Vocabulary Advanced;
- Grammar Core;
- Speaking Support;

inside the same B1 lesson.

The route state also had to remain evidence-driven: simply navigating to a new activity must not overwrite a skill route.

### New pure engine

New file: `adaptive-skill-engine.js`.

It deterministically owns:

- route/judgement normalization;
- one-step Support/Core/Advanced transitions;
- independent transitions for every skill affected by the current activity;
- preservation of unrelated skill routes;
- effective route selection for multi-skill activities;
- bounded browser route patches.

Rules:

- `needs_help`: Advanced -> Core -> Support;
- `managed`: no route change;
- `too_easy`: Support -> Core -> Advanced.

For a multi-skill task, the visible workspace uses the most supportive route required by the affected skills.

Example:

- Grammar Support + Speaking Core;
- teacher marks the grammar+speaking activity `too_easy`;
- Grammar becomes Core;
- Speaking becomes Advanced;
- the activity's effective next route is Core;
- an unrelated Vocabulary route remains unchanged.

### Lesson Mode integration

`haldus-adaptive-lesson/index.html` now:

- loads `adaptive-skill-engine.js`;
- restores persisted `routeBySkill` when the session resumes;
- treats missing skill-route state as Core fallback, not failure;
- derives the current workspace route from the current activity's evidence skill IDs;
- applies judgement optimistically to the affected skills only;
- sends `nextRouteBySkill` to the trusted API;
- reconciles with the authoritative session returned by the API;
- restores the previous route map on persistence failure;
- exposes current skill routes in the teacher drawer and handoff context.

Existing phase-specific workspaces and optimistic save feedback from #88 are preserved.

### Trusted Function behavior

`functions/learning-session-api.js` is server-authoritative for adaptive transitions.

For `teacher_judgement` it now:

1. reads persisted `routeBySkill`;
2. computes the deterministic per-skill transition from affected skills + canonical judgement;
3. optionally validates a browser `nextRouteBySkill` patch against the server result;
4. writes the server-computed route map in the same transaction as append-only evidence.

This keeps old/cached clients compatible: a client may omit `nextRouteBySkill` and the Function still computes the correct per-skill transition.

The browser cannot use the patch to modify an unrelated skill or skip multiple support steps.

### Navigation and vocabulary evidence

`progress`/navigation still updates current index/phase/activity/effective route, but no longer mutates `routeBySkill`.

Exact vocabulary weak/known marks remain append-only evidence but do not silently change the whole vocabulary adaptive route. Teacher judgement is the explicit route-change signal in v1.

### Data invariants

Unchanged:

- `students.skillMap` remains the canonical current mastery projection;
- #89 does not write `students.skillMap`;
- adaptive route state is not mastery;
- missing route state is not zero or failure;
- `learningSessionApi` remains the trusted writer;
- direct browser Firestore writes remain unavailable;
- teacher judgements / vocabulary marks / summary scores remain append-only evidence;
- request-id idempotency remains required;
- completed sessions reject new evidence;
- no Firestore rules/schema migration is introduced.

## Files in #89

New:

- `adaptive-skill-engine.js`
- `adaptive-skill-engine.test.js`
- `docs/PER_SKILL_ADAPTIVE_ENGINE_V1.md`

Changed:

- `haldus-adaptive-lesson/index.html`
- `learning-session-store.js`
- `learning-session-ui.test.js`
- `functions/learning-session-api.js`
- `functions/learning-session-api.test.js`
- `functions/learning-session-emulator.integration.js`
- `.github/workflows/financial-core-emulator.yml`
- `docs/ADAPTIVE_LESSON_SYSTEM.md`
- this file.

## Verification status

GitHub Actions `Financial Core emulator` run **#228** completed successfully on head `775a3b04d21ea79c41673f9160d7cc3d8657e0ef`.

All release-gate steps passed:

- Functions dependencies install;
- Functions unit tests;
- root CRM/accounting/calendar/learning suite, including the new `adaptive-skill-engine.test.js` and updated Lesson Mode UI contracts;
- browser JavaScript syntax checks, including `adaptive-skill-engine.js`;
- Auth/Firestore/Functions emulator integration.

The emulator integration specifically proved in one persisted session that:

- navigation to Speaking did not invent a Speaking route;
- a legacy judgement request without `nextRouteBySkill` still changed Vocabulary Core -> Support on the server;
- Grammar and Speaking routes could then diverge independently;
- a multi-skill judgement changed Grammar Support -> Core and Speaking Core -> Advanced in one event;
- Vocabulary remained Support and unrelated to that change;
- a vocabulary word mark did not silently change the adaptive route map;
- append-only evidence count/idempotency remained correct;
- direct browser Firestore evidence writes remained denied;
- `students.skillMap` was unchanged after session completion.

Commits after the green executable head are documentation-only and do not change runtime behavior.

Vercel preview checks on the latest branch head report **`Deployment rate limited — retry in 24 hours`** for both KeeleSepp projects. This is an account deployment-quota condition, not a failing code/build test. No Vercel production deployment is claimed.

## Deployment boundary

#89 changes both the trusted Function and the browser client. After owner merge and explicit production approval, rollout order must be:

1. selectively deploy the updated `learningSessionApi` first;
2. verify Function health/backward compatibility;
3. deploy the Vercel/web main build;
4. smoke-test one authenticated real-student session and confirm independent route changes persist.

Do not deploy production from this branch without owner approval.

## Known limits

- adaptive persistence still supports only `est-b1-city-problem-solving-01`;
- one teacher judgement currently applies the same judgement signal to every skill mapped to that activity; skill routes still transition independently from their own starting routes;
- there is no automatic mastery projection from evidence to `students.skillMap`;
- there is no curriculum next-goal/prerequisite graph yet;
- route variants cannot safely have arbitrary different activity counts until Content Engine normalization introduces stable cross-route activity identities;
- PR #83 touches the same Lesson Mode HTML for desktop density and must stay independent from #89.

## Core roadmap

1. Core Blueprint — merged #84;
2. Learning Profile MVP — merged #85;
3. Learning Session + append-only evidence — merged #86;
4. Learning Profile evidence projection — merged #87 and deployed;
5. phase-specific Lesson Mode workspaces — merged #88;
6. deterministic per-skill Adaptive Engine v1 — #89 merge-ready;
7. curriculum goal/prerequisite graph;
8. Teacher Home vertical flow;
9. Lesson Builder + stable activity/content normalization;
10. AI-assisted content generation after the deterministic loop is stable;
11. scale/analytics after multiple lessons share the same contracts.

## Next safe step

Owner merges #89. After merge and explicit rollout approval, deploy `learningSessionApi` first and web second, then smoke-test one authenticated real-student session. After production verification, begin the curriculum goal/prerequisite graph as the next bounded slice; keep automatic mastery writes out of that work.
