# Per-skill Adaptive Engine v1

Status: release slice 6 implementation contract

## Goal

Allow one learner to receive different support levels for different skills inside the same CEFR lesson.

Example within the B1 reference lesson:

- vocabulary -> `advanced`;
- grammar -> `core`;
- speaking -> `support`.

These values are teaching-route state, not CEFR levels and not mastery scores.

## Source-of-truth boundary

`learningSessions.routeBySkill` is the persisted adaptive runtime state for the active Learning Session.

It is deliberately separate from `students.skillMap`:

- `routeBySkill` answers: **how much support should the next relevant activity provide?**
- `students.skillMap` answers: **what is the canonical current mastery projection?**

This slice does not write `students.skillMap`.

Missing `routeBySkill` evidence is not failure and is not converted to Support. A skill without an adaptive route uses the bounded `core` fallback until teacher evidence changes it.

## Deterministic transition rule

Teacher judgement is the adaptive signal:

| Judgement | Support | Core | Advanced |
| --- | --- | --- | --- |
| `needs_help` | Support | Support | Core |
| `managed` | Support | Core | Advanced |
| `too_easy` | Core | Advanced | Advanced |

A judgement moves each affected skill from **that skill's own current route**. Unrelated skills stay unchanged.

Example:

Before:

- grammar -> Support
- speaking -> Core
- vocabulary -> Advanced

A multi-skill grammar + speaking activity is judged `too_easy`.

After:

- grammar -> Core
- speaking -> Advanced
- vocabulary -> Advanced (unchanged)

## Multi-skill activity rule

An activity can map to more than one skill, for example diagnostic item `d4` maps to grammar + speaking.

The visible workspace must use the most supportive route required by its affected skills:

- Grammar Core + Speaking Support -> activity renders Support;
- Grammar Core + Speaking Advanced -> activity renders Core;
- Grammar Advanced + Speaking Advanced -> activity renders Advanced.

This avoids hiding necessary scaffolding simply because another skill is stronger.

## Navigation is not evidence

Moving to another activity or stage may change the **effective visible route** because the next activity targets different skills.

It must not mutate `routeBySkill`.

Only a meaningful teacher judgement changes adaptive skill-route state in v1.

Word-level vocabulary marks remain append-only learning evidence but do not silently alter the adaptive route. This keeps the adaptive signal explicit and avoids treating one difficult word as proof that the whole vocabulary skill needs a route change.

## Pure client engine

`adaptive-skill-engine.js` is a Firebase-independent deterministic module.

Responsibilities:

- normalize route maps and teacher judgements;
- transition one skill by one bounded step;
- transition all skills affected by an activity independently;
- select the effective route for a multi-skill activity;
- preserve unrelated skill routes;
- provide a bounded route patch for persistence.

## Trusted persistence boundary

The browser remains non-authoritative.

For `teacher_judgement`, `learningSessionApi`:

1. reads the persisted session;
2. derives affected `skillIds` from the submitted bounded activity contract;
3. computes the expected transition from persisted `routeBySkill` and the canonical judgement;
4. optionally validates the browser's `nextRouteBySkill` patch against that server-computed result;
5. persists the server-computed map in the same transaction as append-only evidence.

A cached/legacy browser that omits `nextRouteBySkill` still receives correct per-skill behavior because the Function computes the transition itself.

The browser cannot use a route patch to change an unrelated skill or skip more than one support step.

## Lesson Mode behavior

Lesson Mode now:

- restores persisted `routeBySkill` when a session resumes;
- uses `core` only as a fallback for a skill with no adaptive route yet;
- calculates the current workspace route from the current activity's skill IDs;
- applies the teacher judgement optimistically for immediate UI feedback;
- sends the deterministic per-skill patch to the trusted API;
- reconciles with the authoritative returned session;
- rolls back the local route map if persistence fails;
- exposes the current skill-route map in the teacher drawer and handoff context.

## Backward compatibility

Existing active Learning Sessions remain valid.

- Existing `routeBySkill` values are reused.
- Missing skill keys use Core until evidence changes them.
- Existing clients without `nextRouteBySkill` continue to work.
- Stable lesson/stage/activity IDs and evidence kinds do not change.
- No Firestore rules or schema migration is required.

## Verification

Required release checks:

- pure engine unit tests for independent transitions and multi-skill route selection;
- Function unit tests proving server-authoritative transition computation and bounded browser-patch validation;
- Lesson Mode UI tests proving route selection comes from `routeBySkill` and optimistic rollback remains intact;
- emulator integration proving vocabulary/grammar/speaking can diverge in one real persisted session;
- navigation does not invent a new skill route;
- vocabulary marks do not silently change `routeBySkill`;
- append-only evidence and idempotency remain intact;
- direct browser writes remain denied;
- `students.skillMap` remains byte-for-byte unchanged by the adaptive session flow.

## Non-goals

- no automatic mastery projection;
- no curriculum next-goal selection;
- no statistical or AI model deciding routes;
- no route changes from passive navigation;
- no broad migration to every curriculum lesson;
- no arbitrary different route activity counts yet;
- no production deployment in this branch.

## Release order after merge

Because this slice changes the trusted Function contract, production rollout must be explicit and ordered:

1. deploy the updated `learningSessionApi` first;
2. verify the Function is healthy and legacy-compatible;
3. deploy the web/Vercel build containing `adaptive-skill-engine.js` and the new Lesson Mode client;
4. run a real authenticated student-session smoke test.

Do not deploy either production step without owner approval.

## Next safe step

After this slice is merged and production-verified, implement the curriculum goal/prerequisite graph. Keep automatic `students.skillMap` writes out of that slice unless a separate mastery-projection contract has been reviewed and approved.
