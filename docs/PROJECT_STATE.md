# KeeleSepp Project State

Last verified: 2026-09-04, Europe/Tallinn
Repository: `zakutailopavel-cyber/keelesepp`
Verified main commit: `cfc6fcf55bc3ac737c406650641a26e0f896956b` (`Learning Profile: project adaptive evidence read-only (#87)`)
Active branch: `agent/phase-specific-lesson-workspaces`
Active PR: `#88 Lesson Mode: phase-specific workspaces` (draft; final optimistic-feedback CI gate running)
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

The persisted Lesson Mode loop works, but the live teaching UX still used one universal activity card. Diagnostic, vocabulary, grammar practice, roleplay, transfer and assessment therefore looked almost identical and the same bus scene appeared where it was pedagogically irrelevant.

The production screenshot also confirmed answer leakage in diagnostic: the bus scene contained `hilineb` while the task asked the learner to produce the same target language.

This was an architectural renderer problem, not a content-copy problem.

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

### Optimistic evidence feedback

Owner browser testing confirmed that persistence worked but button selection felt slow because the visible state waited for the Firebase Function round-trip.

The final #88 interaction fix keeps the trusted API unchanged but makes feedback immediate:

- teacher judgement selection and adaptive route are applied locally before the network request;
- vocabulary weak/known selection is highlighted locally before the network request;
- header status distinguishes idle active session (`Valmis`) from a pending save (`Salvestan…`);
- on successful API confirmation the optimistic state remains and status becomes `Salvestatud`;
- on API failure the previous judgement/route or vocabulary mark is restored and the existing error is shown;
- judgement/navigation is guarded while a judgement write is pending to avoid a route/evidence race.

This is optimistic rendering only. Evidence is still acknowledged as persisted only after `learningSessionApi` confirms the request.

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
- `docs/ADAPTIVE_LESSON_SYSTEM.md`
- this file.

## Verification status

Earlier implementation gate: GitHub Actions `Financial Core emulator` run **#219** completed successfully on head `96c243a78aa9eec6b1b22a7e11bbf43de2c89af9`.

That green run covered:

- Functions unit tests;
- root CRM/accounting/calendar/learning tests including `lesson-workspace-core.test.js` and Lesson Mode UI contracts;
- browser JavaScript syntax checks including `lesson-workspace-core.js`;
- existing Auth/Firestore/Functions emulator integration suite.

Owner local browser review on 2026-09-04 confirmed:

- diagnostic has no answer-bearing bus scene;
- vocabulary uses word cards;
- controlled practice uses a separate sentence/pattern layout;
- roleplay uses separate learner/teacher role cards;
- assessment uses a separate low-scaffold final challenge;
- a real student Learning Session resumes correctly;
- vocabulary evidence saves successfully and reports `Sõnavara hinnang salvestatud.`;
- the new workspace approach works overall;
- the remaining observed UX issue was noticeable button-save latency.

That latency fix is implemented with regression tests in the latest branch head. Final GitHub Actions run **#223** is the release gate for the optimistic-feedback change and is currently in progress.

Transfer is covered deterministically by `lesson-workspace-core.test.js`: `stage-3-speaking-transfer-1` resolves to a distinct `transfer` model whose prompt/rule differ materially from roleplay. A final owner visual transfer check is useful but no longer blocks the architectural contract if the final automated gate stays green.

Vercel preview builds for recent #88 commits have been queued on the account; no latest-preview `READY` claim is made here.

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

**Wait for final #88 optimistic-feedback CI to turn green. Then mark #88 ready for review. Owner merges it. After merge, implement deterministic per-skill Adaptive Engine v1 against the stable activity/workspace boundaries. Keep `students.skillMap` writes and curriculum-goal automation out of that next slice.**