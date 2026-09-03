# KeeleSepp Project State

Last verified: 2026-09-03, Europe/Tallinn
Repository: `zakutailopavel-cyber/keelesepp`
Verified main commit before this work: `98de072978e1ee8f2c1853bd6df37cabf6ed16b8` (`feat(whiteboard): add materials and lesson pages (#76)`)
Active branch: `agent/adaptive-lesson-foundation`
PR: not opened yet at the time of this state entry

## Current objective

Build the first safe foundation for adaptive curriculum lessons so that any teacher can run a lesson with lesson-specific vocabulary, three difficulty/support routes, measurable mastery and an actionable handoff to the next teacher.

This branch intentionally does **not** deploy to production, change Firestore rules, mutate live student data, alter finance, alter calendar accounting or modify Live Classroom.

## Verified repository context

The current main branch already contains:

- detailed curriculum data in `haldus-curriculum-data.js`;
- curriculum workflow helpers in `curriculum-workflow-core.js`;
- curriculum/program UI and student journey in CRM v1;
- learning library and worksheet generation;
- lesson completion/accounting flow;
- Live Classroom curriculum summary integration;
- whiteboard materials and lesson pages from main commit `98de072`.

Open PRs observed before starting this branch were finance/calendar focused (`#71`, `#72`, `#74`) and did not overlap the adaptive lesson foundation files.

## Work completed on this branch

### Agent handoff rule

Added root `AGENTS.md`.

The repository now explicitly requires agents to:

- verify current main/open PRs before work;
- avoid autonomous merge/production changes;
- update `docs/PROJECT_STATE.md` after substantial changes;
- update architecture-specific docs when contracts change;
- leave one explicit next safe step.

### Adaptive lesson decision core

Added `adaptive-lesson-core.js`.

Pure functions currently support:

- diagnostic scoring;
- initial `support` / `core` / `advanced` route recommendation;
- route changes between lesson stages;
- mastery calculation only from assessed skills;
- weak/strong skill detection;
- word-level vocabulary status;
- progression vs targeted-review decision;
- teacher handoff generation;
- adaptive blueprint validation.

Important contract: attendance/completion is not mastery.

### Automated core tests

Added `adaptive-lesson-core.test.js` covering:

- all three initial routes;
- previous mastery blending;
- stage-level route changes;
- skill-specific mastery;
- critical skill progression block despite high average;
- exact vocabulary review;
- teacher handoff;
- all-three-routes blueprint requirement.

### Reference adaptive lesson

Added `adaptive-lessons/est-b1-city-problem-solving.js`.

Reference lesson:

- subject: Estonian;
- level: B1;
- category: city/services;
- lesson: problem solving in the city;
- duration: 60 min;
- 12 lesson-specific vocabulary items;
- diagnostic;
- vocabulary stage;
- language/grammar stage;
- speaking transfer stage;
- exit/handoff stage;
- support/core/advanced route in every stage;
- differentiated homework;
- explicit mastery policy.

The reference lesson is intentionally not injected into `haldus-curriculum-data.js` yet.

### Architecture documentation

Added `docs/ADAPTIVE_LESSON_SYSTEM.md` defining:

- pedagogical contract;
- route semantics;
- vocabulary evidence model;
- mastery model;
- teacher handoff;
- safe integration order;
- proposed (not implemented) persistence model.

## Files changed/added

- `AGENTS.md`
- `adaptive-lesson-core.js`
- `adaptive-lesson-core.test.js`
- `adaptive-lessons/est-b1-city-problem-solving.js`
- `docs/ADAPTIVE_LESSON_SYSTEM.md`
- `docs/PROJECT_STATE.md`

## Data/schema changes

None in Firestore or production.

The branch introduces only an in-repository JavaScript blueprint schema and pure calculation contracts. Proposed future collections are documentation only.

## Safety and known limitations

- No production deployment was performed.
- No Firebase/Firestore write was performed.
- No external paid API was called.
- No migration was run.
- Existing curriculum lessons are unchanged.
- Existing CRM UI does not yet render/run the adaptive blueprint.
- Adaptive evidence is not yet persisted.
- Route thresholds are foundation defaults and should later be configurable per lesson/category.
- The example lesson still requires teacher review before being treated as a school-wide canonical B1 lesson.

## Verification

Automated test execution must be recorded here after the branch is checked out and tests are run. Do not mark tests green based only on code inspection.

## Unfinished work

The foundation is not yet visible to teachers inside CRM. A real teacher cannot yet launch the reference lesson from the Programs view and record evidence through the interface.

## Next safe step

Add a **read-only teacher preview/run prototype** for the single reference adaptive lesson in CRM v1, using the pure core for route recommendations and local in-session state only. Do not add Firestore persistence until the interaction model has been reviewed.
