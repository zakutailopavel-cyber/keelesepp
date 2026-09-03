# KeeleSepp Project State

Last verified: 2026-09-03, Europe/Tallinn
Repository: `zakutailopavel-cyber/keelesepp`
Verified main commit before this work: `98de072978e1ee8f2c1853bd6df37cabf6ed16b8` (`feat(whiteboard): add materials and lesson pages (#76)`)
Active branch: `agent/adaptive-lesson-foundation`
Draft PR: `#77 Adaptive lesson foundation`

## Current objective

Build the first safe foundation for adaptive curriculum lessons so that any teacher can run a lesson with lesson-specific vocabulary, three difficulty/support routes, measurable mastery and an actionable handoff to the next teacher.

This branch intentionally does **not** deploy to production, change Firestore rules, mutate live student data, alter finance, alter calendar accounting or modify Live Classroom.

## Verified repository context

The current main branch already contains detailed curriculum data, curriculum workflow helpers, curriculum/program UI, student journey, learning library, worksheet generation, lesson completion/accounting, Live Classroom curriculum summaries and whiteboard lesson pages.

Open PRs observed before starting this branch were finance/calendar focused (`#71`, `#72`, `#74`) and did not overlap the adaptive lesson foundation files.

## Work completed on this branch

### Agent handoff rule

Added root `AGENTS.md` requiring agents to verify fresh main/open PRs, avoid autonomous merge/production changes, update `docs/PROJECT_STATE.md` after substantial work and leave one explicit next safe step.

### Adaptive lesson decision core

Added `adaptive-lesson-core.js` with pure functions for diagnostic scoring, initial route recommendation, stage route adjustment, skill-specific mastery, vocabulary evidence, progression decisions, teacher handoff and blueprint validation.

Important contract: **attendance/completion is not mastery**.

### Reference adaptive lesson

Added `adaptive-lessons/est-b1-city-problem-solving.js`.

Reference lesson characteristics:

- subject: Estonian;
- level: B1;
- category: city/services;
- duration: 60 min;
- 12 lesson-specific vocabulary items;
- short diagnostic;
- vocabulary activation;
- language/grammar stage;
- speaking transfer stage;
- exit/handoff stage;
- `support` / `core` / `advanced` route inside every stage;
- differentiated homework;
- explicit mastery policy.

The reference lesson is intentionally not injected into the generated curriculum dataset yet.

### Teacher prototype

Added `haldus-adaptive-lesson/index.html` as a read-only/local-state teacher prototype.

The prototype currently allows a teacher to:

- see the goal and lesson placement;
- score the initial diagnostic;
- receive a recommended route;
- override the recommendation manually;
- move between lesson stages;
- see route-specific teacher instructions and tasks;
- enter stage result, attempts and hint count;
- receive a recommendation to move to support/core/advanced for the next stage;
- enter only actually assessed mastery skills;
- generate a final teacher handoff locally.

The page explicitly states that the session does not save to Firestore. It is not linked into the existing Programs view yet and has not been deployed.

### Tests

Added:

- `adaptive-lesson-core.test.js` — decision-core tests;
- `adaptive-lesson-ui.test.js` — static contract checks for the teacher prototype and reference blueprint.

### Architecture documentation

Added `docs/ADAPTIVE_LESSON_SYSTEM.md` defining the pedagogical contract, route semantics, vocabulary evidence, mastery model, handoff, proposed persistence model and safe integration order.

## Files changed/added

- `AGENTS.md`
- `adaptive-lesson-core.js`
- `adaptive-lesson-core.test.js`
- `adaptive-lesson-ui.test.js`
- `adaptive-lessons/est-b1-city-problem-solving.js`
- `haldus-adaptive-lesson/index.html`
- `docs/ADAPTIVE_LESSON_SYSTEM.md`
- `docs/PROJECT_STATE.md`

## Data/schema changes

None in Firestore or production.

The branch introduces only repository-side JavaScript blueprint/decision contracts and a local-state prototype. Proposed future collections remain documentation only.

## Safety and known limitations

- No production deployment was performed.
- No Firebase/Firestore write or rules change was performed.
- No external paid API was called.
- No migration was run.
- Existing curriculum, calendar, finance and Live Classroom behavior is unchanged.
- Adaptive evidence is not persisted yet.
- The prototype uses a placeholder prototype student for local handoff output.
- Exact vocabulary evidence entry is supported by the core but is not yet exposed as teacher controls in the prototype UI.
- Route thresholds are foundation defaults and should later be configurable per lesson/category.
- The reference B1 lesson still requires teacher review before school-wide canonical use.

## Verification

- The authored `adaptive-lesson-core.js` and `adaptive-lesson-core.test.js` were executed with Node's built-in test runner: **8/8 tests passed, 0 failed**.
- Direct `git clone`/checkout from GitHub inside the execution container could not be performed because that container had no DNS/network access to `github.com`.
- Therefore the 8/8 result verifies the exact authored core/test contents, but is not claimed as a full-repository checkout or complete root test suite.
- `adaptive-lesson-ui.test.js` has been added but has **not** been executed in a real repository checkout in this session; no green claim is made for it yet.
- GitHub returned no PR workflow runs yet for the latest prototype commit at the time checked.
- Draft PR `#77` remains open against `main`; no merge was performed.

## Unfinished work

The prototype is not yet connected to an actual selected student or existing Programs view. It does not save evidence, vocabulary mastery or handoff records.

## Next safe step

Review the teacher interaction model, then connect the prototype to **one selected CRM student and one reference lesson in read-only mode**. Continue using local session state; do not add Firestore persistence until the workflow is accepted.
