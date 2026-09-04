# Lesson Mode phase-specific workspaces MVP

Status: release slice 4 implementation contract

## Problem

The first Lesson Mode prototype used one universal activity card for almost every pedagogical phase:

`prompt -> situation -> scene -> expected answer -> teacher judgement`.

That proved the focused shell and persistence loop, but it made fundamentally different activities look and behave the same. It also encouraged one scene to appear across unrelated tasks, including diagnostic work where visible text could leak the answer.

## Goal

Keep the Lesson Mode shell stable while changing the central workspace according to pedagogical purpose.

The reference lesson now supports these workspace types:

- `diagnostic`;
- `vocabulary`;
- `controlled_practice`;
- `scene`;
- `roleplay`;
- `transfer`;
- `assessment`;
- `summary`.

The first six visible reference-lesson families are diagnostic, vocabulary, controlled practice, roleplay, transfer and assessment. `scene` remains available for activities whose explicit visual asset genuinely supports the task.

## Workspace rules

### Diagnostic

- no universal/default scene;
- no answer-bearing visual;
- no visible answer model before the learner responds;
- teacher control may reveal the check answer after the response.

### Vocabulary

- word cards replace the generic scene;
- Support shows a smaller active set with translation/example;
- Core shows a larger active set and lets the teacher reveal one card when needed;
- Advanced uses the full active set without translation cards.

### Controlled practice

- task area and language-function/pattern area are separate;
- Support/Core may expose patterns;
- Advanced removes pattern scaffolding;
- the workspace visually supports sentence construction rather than pretending the activity is a scene.

### Roleplay

- student role and teacher role are separate cards;
- the current route determines how much conversational structure is visible;
- the workspace is designed for an exchange, not for reading a static prompt under an unrelated image.

### Transfer

- deliberately marked as a new situation;
- previous answer model is not shown;
- the learner must apply the same skill in a changed context;
- transfer is visually distinct from the preceding roleplay.

### Assessment

- clean high-focus challenge;
- no answer model before performance;
- criteria may be visible without exposing the answer;
- detailed scores remain in the final summary.

## Runtime core

New pure module: `lesson-workspace-core.js`.

Responsibilities:

- build the stable reference activity plan;
- resolve the current route variant;
- resolve workspace type from explicit blueprint metadata with migration-safe fallbacks;
- expose route-appropriate vocabulary and controlled-practice patterns;
- create roleplay and transfer view models;
- prevent the old `scenes.default` fallback from acting as a universal illustration.

The module has no Firebase dependency.

## Blueprint contract

The reference lesson now declares explicit workspace metadata:

- diagnostic -> `diagnostic`;
- stage 1 -> `vocabulary`;
- stage 2 -> `controlled_practice`;
- stage 3 -> `roleplay`, with its second Core activity as `transfer`;
- stage 4 -> `assessment`.

This is additive metadata. Stable lesson/stage/task IDs used by persisted evidence remain unchanged.

## Persistence boundary

This slice does not change Learning Session storage or evidence semantics.

Teacher judgements, vocabulary marks, progress and explicit completion still use the existing `learningSessionApi` through `learning-session-store.js`.

No new Firestore reads/writes are added. `students.skillMap` remains unchanged by Lesson Mode.

## Scene policy

Images are opt-in, not default.

`lesson-workspace-core.sceneForWorkspace()` returns an asset only for an explicit `scene` workspace and only from an exact activity/stage key. It deliberately does not fall back to `scenes.default`.

This removes the current answer-leaking bus image from diagnostic and stops it from appearing on vocabulary, grammar, roleplay and transfer just because a generic scene exists.

## Verification

Required automated checks:

- stable 14-activity reference plan;
- workspace mapping by phase;
- diagnostic/assessment answer hiding;
- route-specific vocabulary scaffolding;
- controlled-practice pattern scaffolding;
- roleplay and transfer materially different models;
- no universal scene fallback;
- browser UI contains dedicated workspace renderers;
- persistence calls remain intact;
- browser code still has no Firestore write path;
- inline Lesson Mode JavaScript parses;
- existing Functions/root/emulator suite remains green.

## Non-goals

- no drag-and-drop exercise authoring yet;
- no automatic answer checking;
- no student-facing task runner yet;
- no per-skill Adaptive Engine v1 yet;
- no automatic mastery projection;
- no curriculum goal graph;
- no production deploy in this branch.

## Known limitation

The current legacy route structure still uses Core task positions as the stable activity slots. A later Content Engine normalization slice should move every route variant under stable activity IDs so routes can safely have different activity counts without index ambiguity.

## Next safe step

After this workspace renderer is reviewed and merged, implement deterministic per-skill Adaptive Engine v1 against these stable workspace/activity boundaries. Do not combine mastery writes or curriculum-goal selection into that slice.