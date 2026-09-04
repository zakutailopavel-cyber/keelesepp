# KeeleSepp Project State

Last verified: 2026-09-04, Europe/Tallinn
Repository: `zakutailopavel-cyber/keelesepp`
Verified main commit: `858f25278f853e2262ad2d5a79ef8f7c8eb0e6bd` (`Adaptive Engine v1: per-skill Lesson Mode routes (#89)`)
Active branch: `agent/curriculum-goal-graph-v1`
Active PR: `#90 Curriculum Engine v1: B1 goal and prerequisite graph` (merge-ready after green GitHub CI; no production deploy from this branch)
Independent open PR: `#83 Tighten Adaptive Lesson desktop layout`

## Current objective

Execute the Core Blueprint as bounded vertical slices and keep the deterministic learning loop explainable before broad curriculum/AI expansion.

Merged learning foundation:

1. Core Blueprint — #84;
2. Learning Profile read-only MVP — #85;
3. Learning Session + append-only evidence persistence — #86;
4. Learning Profile evidence projection — #87;
5. phase-specific Lesson Mode workspaces — #88;
6. deterministic per-skill Adaptive Engine v1 — #89.

Current release slice: Curriculum Goal / prerequisite graph v1 for one B1 `Linn ja teenused` vertical flow.

`crm-v2`, finance, calendar and unrelated Live Classroom behavior remain outside this slice.

## Production state

### Vercel

Primary project `keelesepp` is connected to GitHub and the production deployment for main commit `858f252...` (#89) is `READY`.

The unused Vercel project `keelesepp-crm-v2` was disconnected from GitHub on 2026-09-04. Its historical deployments remain, but future GitHub commits should no longer trigger duplicate crm-v2 builds. The active legacy CRM remains the only project in the current development/deployment flow.

### Firebase Functions

Owner selectively deployed the merged-main #89 `learningSessionApi` to production project `keelesepp-5136b` on 2026-09-04 using Node.js 22 runtime. Firebase CLI reported:

- `functions[learningSessionApi(us-central1)] Successful update operation.`
- `Deploy complete!`

The production Function URL remained:

`https://us-central1-keelesepp-5136b.cloudfunctions.net/learningSessionApi`

No Firestore/storage rules or schema migration was deployed as part of this rollout.

The web client for #89 is already on Vercel production. A real-student Lesson Mode smoke test has been started and the session loads/saves successfully, but the independent per-skill route divergence still needs one explicit visual confirmation in the teacher drawer before calling the full per-skill persistence loop production-verified.

No Firebase schema/rules migration is required by #90.

## Release slice 7 — Curriculum Goal graph v1 (#90)

### Purpose

Curriculum Engine answers **what should be learned next**. Adaptive Engine answers **how much support/challenge the current activity needs**.

The first Curriculum Engine slice adds stable goal identities and prerequisite/next-goal edges without creating another mastery source.

### Pure goal engine

New `curriculum-goal-core.js` owns deterministic:

- goal normalization;
- graph validation;
- duplicate/reference/self-reference checks;
- prerequisite-cycle detection;
- canonical skillMap evidence normalization;
- legacy lesson/topic mapping;
- prerequisite readiness;
- next-goal recommendation;
- human-readable Estonian recommendation explanation.

Missing skill evidence remains `unknown`, not `0`.

### First bounded graph

New `curriculum-goals/b1-city.js` defines graph `EST_B1_CITY_SERVICES_V1`:

```text
EST_B1_CITY_VOCAB
  ├─> EST_B1_CITY_EXPLAIN_PROBLEM ─┐
  └─> EST_B1_CITY_ASK_HELP ────────┤
                                    v
                         EST_B1_CITY_SOLVE_PROBLEM
                                    |
                                    v
                         EST_B1_CITY_TRANSFER
```

The graph reuses canonical existing B1 skill IDs from `HaldusSkillCatalog`, especially:

- `B1_VOCAB_TOPIC`;
- `B1_SPEAK_DESC`.

It does not create parallel mastery fields.

### Reference lesson binding

`adaptive-lessons/est-b1-city-problem-solving.js` now declares:

```js
curriculumGoalIds:['EST_B1_CITY_SOLVE_PROBLEM']
```

New Learning Sessions can therefore persist a stable curriculum target instead of relying only on title/topic strings.

The graph also keeps legacy blueprint/topic/title mapping for older records. Legacy mapping is context only and must not be interpreted as mastery.

### Goal-state boundary

The following states are deliberately separate:

- target goal — what a session teaches;
- active goal — target of an active session;
- achieved goal — explicit structured achievement evidence;
- completed session — the lesson/session ended.

A completed Adaptive Lesson does **not** automatically satisfy a curriculum prerequisite.

Current Learning Profile uses structured Live Classroom summary goal IDs as achieved-goal evidence because that existing flow explicitly records selected curriculum outcomes. Adaptive session `curriculumGoalIds` remain target/current context until a separate validated goal-achievement projection exists.

This preserves the core invariant: lesson completion is not mastery.

### Learning Profile projection

`haldus-learning-profile/index.html` now loads the bounded Curriculum Engine and B1 graph.

For supported B1 context it shows `Järgmine õppekava eesmärk` with:

- stable goal title and ID;
- ready / active / blocked state;
- deterministic explanation;
- prerequisite goal state;
- canonical critical-skill evidence from `students.skillMap`;
- exact vocabulary review evidence when useful.

The profile passes only explicit achieved goals as prerequisite evidence and active Adaptive targets as current-goal context.

An explicit B1 session/blueprint context may still be explained when the broad student profile level field differs, without silently changing the student's CEFR level.

For levels/units without a graph, the existing evidence-based fallback remains.

### Data invariants

Unchanged:

- `students.skillMap` is the canonical current mastery projection;
- #90 does not write `students.skillMap`;
- missing evidence is not failure/zero;
- Adaptive `routeBySkill` is runtime support state, not mastery;
- session completion is not goal achievement;
- no direct browser Firestore write is introduced;
- no Firestore rules/schema migration is introduced;
- no production deployment is performed from #90;
- no finance/calendar/crm-v2 behavior change is included.

## Files in #90

New:

- `curriculum-goal-core.js`
- `curriculum-goal-core.test.js`
- `curriculum-goals/b1-city.js`
- `docs/CURRICULUM_GOAL_GRAPH_V1.md`

Changed:

- `adaptive-lessons/est-b1-city-problem-solving.js`
- `learning-profile-core.js`
- `learning-profile-core.test.js`
- `haldus-learning-profile/index.html`
- `learning-profile-ui.test.js`
- `.github/workflows/financial-core-emulator.yml`
- `docs/ADAPTIVE_LESSON_SYSTEM.md`
- this file.

## Verification status for #90

GitHub Actions `Financial Core emulator` run **#246** completed successfully on executable head `cdeb1e7c79ac07ed00334fbe7074a447e454bf4d`.

All release-gate steps passed:

- Functions dependency install;
- Functions unit tests;
- full root CRM/accounting/calendar/learning test bundle, including `curriculum-goal-core.test.js` and updated Learning Profile contracts;
- browser JavaScript syntax checks for `curriculum-goal-core.js` and `curriculum-goals/b1-city.js`;
- existing Auth/Firestore/Functions emulator integration;
- cleanup/post steps.

Specific verified contracts include:

- graph validity and prerequisite-cycle rejection;
- stable reference lesson goal binding;
- deterministic entry/successor/transfer recommendation;
- missing critical-skill evidence remains unknown;
- active Adaptive target is visible even before the first evidence event;
- active target is not achieved;
- completed Adaptive session target is not achieved merely because the session ended;
- UI passes `completedGoalIds` as prerequisite evidence and `activeGoalIds` as current context;
- Learning Profile stays read-only;
- existing learning/CRM and emulator integration remain green.

The commit after executable head `cdeb1e7c...` only records this verification in documentation and does not change runtime behavior.

Vercel preview status on the executable head reports `Deployment rate limited — retry in 24 hours`. This is the current Hobby build-quota condition, not a failing code/test result. Since `keelesepp-crm-v2` is disconnected from GitHub, only the primary Vercel project now reports this preview status. No production deployment was performed from #90.

## Deployment boundary

### #89 server rollout

Completed on 2026-09-04:

1. merged-main `learningSessionApi` selectively deployed to `keelesepp-5136b`;
2. Firebase reported a successful Node.js 22 update;
3. production Lesson Mode opens/saves for the real student used in the smoke test.

Remaining manual gate: trigger a teacher judgement on one skill and visually confirm that the teacher drawer shows a divergent persisted route, for example Vocabulary Support while Grammar/Speaking remain Core.

### #90 rollout after owner merge

#90 itself is static/pure client/data logic and adds no Function/rule migration. After owner merge, normal main Vercel deployment is sufficient for the Curriculum Goal graph UI/code. Do not deploy from the agent branch.

## Known limits

- Adaptive persistence still supports only the reference lesson `est-b1-city-problem-solving-01`;
- Curriculum Goal graph v1 covers only one B1 city/services vertical slice;
- there is no automatic goal-achievement projection from Adaptive evidence yet;
- there is no automatic mastery projection from Adaptive evidence to `students.skillMap`;
- one teacher judgement currently applies the same signal to all skills mapped to an activity, though routes transition independently;
- route variants cannot safely have arbitrary different activity counts until Content Engine normalization introduces stable cross-route activity identities;
- PR #83 remains independent and touches Lesson Mode desktop density.

## Core roadmap

1. Core Blueprint — merged #84;
2. Learning Profile MVP — merged #85;
3. Learning Session + append-only evidence — merged #86;
4. Learning Profile evidence projection — merged #87;
5. phase-specific Lesson Mode workspaces — merged #88;
6. deterministic per-skill Adaptive Engine v1 — merged #89;
7. Curriculum Goal / prerequisite graph — #90 merge-ready;
8. Teacher Home / Today vertical flow;
9. Lesson Builder + stable activity/content normalization;
10. AI-assisted content generation after the deterministic loop is stable;
11. scale/analytics after multiple lessons share the same contracts.

## Next safe step

Owner merges #90 after review. After the merge, verify the normal Vercel production build and start Teacher Home / Today as the next bounded product slice. The remaining #89 manual gate is only the explicit visual confirmation of divergent persisted per-skill routes in production.