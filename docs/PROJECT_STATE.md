# KeeleSepp Project State

Last verified: 2026-09-04, Europe/Tallinn
Repository: `zakutailopavel-cyber/keelesepp`
Verified main commit: `cfc6fcf55bc3ac737c406650641a26e0f896956b` (`Learning Profile: project adaptive evidence read-only (#87)`)
Active branch: `agent/phase-specific-lesson-workspaces`
Active PR: `#88 Lesson Mode: phase-specific workspaces` (draft until final CI/review)
Independent open PR: `#83 Tighten Adaptive Lesson desktop layout`

## Current objective

Execute the Core Blueprint as bounded vertical slices.

Merged learning foundation:

1. Core Blueprint — #84;
2. Learning Profile read-only MVP — #85;
3. Learning Session + append-only evidence persistence — #86;
4. Learning Profile evidence projection — #87.

Current release slice: phase-specific Lesson Mode workspaces for the single B1 reference lesson.

`crm-v2`, finance, calendar and Live Classroom remain outside this slice.

## Production state before this branch

Owner merged #87 and explicitly approved the rollout.

Verified production rollout on 2026-09-04:

- Vercel production for `main` commit `cfc6fcf...` reached `READY` and serves `crm.epkoolitus.ee`;
- Firebase Functions `learningSessionApi` and `learningProfileEvidenceApi` were selectively deployed to project `keelesepp-5136b`, region `us-central1`;
- `https://crm.epkoolitus.ee/haldus-learning-profile/` loads real student data without the staged-rollout evidence warning;
- `https://crm.epkoolitus.ee/haldus-adaptive-lesson/?studentId=<id>` opens a persisted Learning Session for a real student and shows the authenticated student name plus saved-session status.

No Firestore or Storage rule deploy was needed for #86/#87.

## Problem confirmed in production

The persisted Lesson Mode loop works, but the live teaching UX still uses one universal activity card. Diagnostic, vocabulary, grammar practice, roleplay, transfer and assessment therefore look almost identical and the same bus scene appears where it is pedagogically irrelevant.

The production screenshot also confirmed answer leakage in diagnostic: the bus scene contains `hilineb` while the task asks the learner to produce the same target language.

This is an architectural renderer problem, not a content-copy problem.

## Release slice 4 — phase-specific Lesson Mode workspaces

New pure browser-independent core: `lesson-workspace-core.js`.

It owns:

- stable activity-plan projection for the current reference lesson;
- route-variant lookup;
- workspace-type resolution;
- route-specific vocabulary scaffolding;
- controlled-practice pattern scaffolding;
- roleplay/transfer view-model construction;
- explicit scene lookup without a universal `scenes.default` fallback.

Supported workspace contract:

- `diagnostic`;
- `vocabulary`;
- `controlled_practice`;
- `scene`;
- `roleplay`;
- `transfer`;
- `assessment`;
- `summary`.

### Reference lesson mapping

`adaptive-lessons/est-b1-city-problem-solving.js` now declares:

- diagnostic -> `diagnostic`;
- stage 1 -> `vocabulary`;
- stage 2 -> `controlled_practice`;
- stage 3 -> `roleplay`, second Core task -> `transfer`;
- stage 4 -> `assessment`.

Stable lesson/stage/task IDs remain unchanged so persisted evidence keeps its meaning.

### Lesson Mode UI

`haldus-adaptive-lesson/index.html` now has dedicated renderers:

- Diagnostic: high-focus prompt, no scene, answer model hidden until teacher control;
- Vocabulary: route-aware word-card grid rather than a scene;
- Controlled practice: task area + sentence/pattern builder view;
- Roleplay: separate student and teacher role cards with route-aware steps;
- Transfer: explicitly new-context workspace with prior answer model removed;
- Assessment: clean final challenge with criteria but no answer model before performance;
- Scene: retained as an opt-in workspace for an activity with an exact visual asset.

The old universal/default scene behavior is removed from the workspace core. Images are now a content tool rather than a permanent layout requirement.

## Persistence and data invariants

This branch does not change the Learning Session persistence boundary.

Still unchanged:

- `learningSessionApi` is the trusted writer;
- teacher judgements create append-only `teacher_judgement` evidence;
- exact word marks create append-only `vocabulary_mark` evidence;
- navigation/progress is not evidence;
- explicit summary scores create `summary_score` evidence;
- blank skill scores remain absent, not zero;
- completed sessions reject new evidence;
- `students.skillMap` is not written by this slice;
- browser Lesson Mode has no direct Firestore write path.

No Firestore rules/schema migration is introduced.

## Files in current slice

New:

- `lesson-workspace-core.js`
- `lesson-workspace-core.test.js`
- `docs/LESSON_WORKSPACES_MVP.md`

Changed:

- `adaptive-lessons/est-b1-city-problem-solving.js`
- `haldus-adaptive-lesson/index.html`
- `learning-session-ui.test.js`
- `.github/workflows/financial-core-emulator.yml`
- `docs/ADAPTIVE_LESSON_SYSTEM.md` (must record implementation state before completion)
- this file.

## Verification gate

Required before #88 can leave draft:

- `lesson-workspace-core.test.js` green;
- existing Learning Session core/UI tests green;
- root CRM/accounting/calendar/learning suite green;
- browser syntax checks green;
- existing Functions unit/emulator integrations green;
- manual browser check that at least diagnostic, vocabulary, controlled practice, roleplay, transfer and assessment are visually/functionally distinct;
- manual check that diagnostic no longer shows the answer-bearing bus scene;
- manual check that persisted judgement/vocabulary evidence still saves for a real student.

Do not claim #88 complete until final GitHub Actions is green.

## Known limits

- reference persistence still supports only `est-b1-city-problem-solving-01`;
- the legacy lesson blueprint still uses Core task positions as stable activity slots, so route variants cannot yet safely have arbitrary different activity counts;
- no drag-and-drop task authoring or automatic answer checking yet;
- no student-facing adaptive runner yet;
- no automatic mastery projection;
- no automatic curriculum next-goal graph;
- PR #83 touches the same Lesson Mode HTML for density and must not be silently merged into #88.

## Core roadmap

1. Core Blueprint — merged #84;
2. Learning Profile MVP — merged #85;
3. Learning Session + append-only evidence — merged #86;
4. Learning Profile evidence projection — merged #87 and deployed;
5. phase-specific Lesson Mode workspaces — current #88;
6. deterministic per-skill Adaptive Engine v1;
7. curriculum goal/prerequisite graph;
8. Teacher Home vertical flow;
9. Lesson Builder + stable activity/content normalization;
10. AI-assisted content generation after the core loop is stable;
11. scale/analytics after multiple lessons share the same contracts.

## Next safe step

**Finish #88 with green CI and owner visual review. After merge, implement deterministic per-skill Adaptive Engine v1 against the stable activity/workspace boundaries. Keep `students.skillMap` writes and curriculum-goal automation out of that next slice.**
